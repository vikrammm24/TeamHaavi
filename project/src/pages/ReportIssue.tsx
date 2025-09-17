import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Camera, Send, ArrowLeft } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import axios from 'axios';
import { MapWithRealtimeLocation, useLocation } from '../components/RealtimeLocation';
import api from '../api/config';
import { addLocalIssue, SECUNDERABAD } from '../api/dataSources';
import { rtdb, auth } from '../components/firebase/firebase';
import { uploadIssueImage } from '../components/firebase/storage';
import { useGamification } from '../contexts/gamification/useGamification';
import { ref as dbRef, set as dbSet } from 'firebase/database';
import ProfessionalSuggestions from '../components/ProfessionalSuggestions';
import { pushGlobalNotification } from '../components/firebase/notifications';

const ReportIssue: React.FC = () => {
  const navigate = useNavigate();
  const { awardEvent } = useGamification();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'infrastructure',
    priority: 'medium',
    location: '',
    address: ''
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { coords } = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  interface AISuggestion { category: string; confidence: number; reason?: string }
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await resp.json();
      return (data && data.display_name) ? String(data.display_name) : '';
    } catch {
      return '';
    }
  };

  // When GPS acquires first fix, auto-fill coordinates if none present
  useEffect(() => {
    if (coords && !formData.location) {
      setFormData(prev => ({
        ...prev,
        location: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
      }));
    }
  }, [coords, formData.location]);

  // Reverse geocode address when coordinates change
  useEffect(() => {
    const parts = (formData.location || '').split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (isFinite(lat) && isFinite(lng)) {
        (async () => {
          const addr = await reverseGeocode(lat, lng);
          if (addr) {
            setFormData(prev => ({
              ...prev,
              address: prev.address && prev.address !== 'Selected on map' && prev.address !== 'Current Location (Auto-detected)'
                ? prev.address
                : addr
            }));
          }
        })();
      }
    }
  }, [formData.location]);

  const categories = [
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'environment', label: 'Environment' },
    { value: 'safety', label: 'Safety' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'red' }
  ];

  const getSuggestions = async () => {
    try {
      setIsSuggesting(true);
      setSuggestions([]);
      const res = await axios.post('/api/issue-suggest', {
        photos,
        location: formData.location,
        address: formData.address,
        description: formData.description
      });
      setSuggestions(res.data?.suggestions || []);
    } catch {
      addNotification({ type: 'error', title: 'AI Suggestion Failed', message: 'Could not fetch suggestions. Try again later.' });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const user = auth.currentUser;
    if (!user) {
      addNotification({ type: 'error', title: 'Auth Required', message: 'Please login before uploading images.' });
      return;
    }
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        // Basic size limit (10MB)
        if (file.size > 10 * 1024 * 1024) {
          addNotification({ type: 'error', title: 'File Too Large', message: `${file.name} exceeds 10MB limit.` });
          continue;
        }
        try {
          const url = await uploadIssueImage(file, user.uid);
          uploaded.push(url);
        } catch (err) {
          console.warn('Upload failed', err);
          addNotification({ type: 'error', title: 'Upload Failed', message: `Could not upload ${file.name}` });
        }
      }
      if (uploaded.length) setPhotos(prev => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Try remote first
      let issue;
      try {
        const resp = await api.post('/issues', { ...formData, photos });
        issue = resp.data;
      } catch {
        // Fallback: save locally so it appears in dashboards immediately
        const id = 'local-' + Math.random().toString(36).slice(2);
        let lat = SECUNDERABAD.lat, lng = SECUNDERABAD.lng;
        const parts = (formData.location || '').split(',');
        if (parts.length === 2) {
          const tlat = parseFloat(parts[0]);
          const tlng = parseFloat(parts[1]);
          if (isFinite(tlat) && isFinite(tlng)) { lat = tlat; lng = tlng; }
        }
        issue = {
          id,
          title: formData.title,
          description: formData.description,
          status: 'pending',
          priority: formData.priority,
          location: formData.address || 'Secunderabad',
          createdAt: new Date().toISOString(),
          photos,
          lat,
          lng,
        };
        addLocalIssue(issue);
      }
      try {
        const user = auth.currentUser;
        if (user) {
          await dbSet(dbRef(rtdb, `reports/${user.uid}/${issue.id}`), {
            title: issue.title,
            description: issue.description || formData.description,
            priority: issue.priority || formData.priority,
            status: issue.status || 'pending',
            location: issue.location || formData.address || 'Secunderabad',
            lat: issue.lat ?? (coords?.lat ?? null),
            lng: issue.lng ?? (coords?.lng ?? null),
            photos: Array.isArray(photos) ? photos : [],
            timestamp: Date.now(),
          });
        }
      } catch (e) {
        console.warn('RTDB write failed', e);
      }
      const award = awardEvent('ISSUE_REPORTED', { issueId: issue.id, category: formData.category });
      addNotification({
        type: 'success',
        title: 'Issue Reported Successfully',
        message: `Your ${formData.title} report has been submitted (ID ${issue.id}). +${award?.pointsAwarded || 0} pts!`,
      });
      // Broadcast global notification (non-blocking)
      pushGlobalNotification({
        type: 'info',
        title: 'New Issue Reported',
        message: `${formData.title} (${formData.category}) just reported.`
      }).catch(()=>{/* ignore */});
      // Bonus for FIRST_REPORT if it is the user's first entry
      if (award && award.newTotal === award.pointsAwarded) {
        const bonus = awardEvent('FIRST_REPORT', { issueId: issue.id });
        if (bonus) {
          addNotification({
            type: 'info',
            title: 'First Report Bonus',
            message: `First report bonus: +${bonus.pointsAwarded} pts!`,
          });
        }
      }
      navigate('/citizen-dashboard');
    } catch (err) {
      console.error('Issue submit failed', err);
      addNotification({ type: 'error', title: 'Submission Failed', message: 'Could not submit your issue. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    if (coords) {
      setFormData(prev => ({
        ...prev,
        location: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
        address: 'Current Location (Auto-detected)'
      }));
    } else {
      addNotification({
        type: 'error',
        title: 'Location Unavailable',
        message: 'Waiting for GPS fix. Please try again in a few seconds.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Report an Issue</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={getSuggestions}
                      disabled={isSuggesting}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                    >
                      {isSuggesting ? 'Suggesting…' : 'AI Suggest'}
                    </button>
                  </div>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, category: s.category }))}
                          className={`px-3 py-1 rounded-full text-xs border ${formData.category === s.category ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                          title={s.reason}
                        >
                          {s.category} • {(s.confidence * 100).toFixed(0)}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level *
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Provide a detailed description of the issue, including when you noticed it and any relevant context"
                  required
                />

                {/* Professional Suggestions (AI match-making) */}
                <ProfessionalSuggestions
                  title={formData.title}
                  description={formData.description}
                  category={formData.category}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter address or location description"
                      required
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-2"
                    >
                      <MapPin className="w-5 h-5" />
                      GPS
                    </button>
                  </div>
                  {formData.location && (
                    <div className="text-sm text-gray-500">
                      Coordinates: {formData.location}
                    </div>
                  )}
                  <div className="mt-3">
                    <MapWithRealtimeLocation
                      height={280}
                      selectedPosition={formData.location ? ((): [number, number] | null => {
                          const [lat, lng] = formData.location.split(',').map(s => parseFloat(s.trim()));
                          if (!isFinite(lat) || !isFinite(lng)) return null;
                          return [lat, lng];
                        })() : (coords ? [coords.lat, coords.lng] : null)}
                      onSelectPosition={(ll) => {
                        setFormData(prev => ({
                          ...prev,
                          location: `${ll[0].toFixed(6)}, ${ll[1].toFixed(6)}`,
                          address: prev.address || 'Selected on map'
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-300">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <label htmlFor="photos" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload photos
                    </span>
                    <span className="text-gray-500"> or drag and drop</span>
                    <input
                      type="file"
                      id="photos"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB each {uploading && <span className="text-blue-600 ml-2">Uploading…</span>}</p>
                </div>

                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors duration-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;