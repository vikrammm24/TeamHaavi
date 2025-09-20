import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useUser } from '../contexts/UserContext';
import { User, Mail, Shield, Phone, Link, MessageSquare } from 'lucide-react';
import ThemeSelector from '../components/ThemeSelector';
import { openWhatsAppNow } from '../utils/sosMessaging';

const Settings: React.FC = () => {
  const { user, preferences, setPreferences } = useUser();
  const [father, setFather] = useState(preferences?.sosContacts?.father || '+918247024233');
  const [mother, setMother] = useState(preferences?.sosContacts?.mother || '');
  const [includeLive, setIncludeLive] = useState(preferences?.sosIncludeLiveLink ?? true);
  const [smsFallback, setSmsFallback] = useState(preferences?.sosSmsFallback ?? true);

  return (
    <DashboardLayout title="Settings">
      <div className="grid gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Profile</h3>
          {user ? (
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2"><User className="w-4 h-4" /> <span className="font-medium">Name:</span> {user.name}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> <span className="font-medium">Email:</span> {user.email}</div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> <span className="font-medium">Role:</span> {user.role}</div>
            </div>
          ) : (
            <div className="text-gray-500">Not signed in.</div>
          )}
        </div>

        {/* Theme */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Theme</h3>
          <ThemeSelector />
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Preferences</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Use nearby content</div>
              <div className="text-sm text-gray-500">Show nearby reports and community activity using your location.</div>
            </div>
            <button
              onClick={() => setPreferences({ useNearbyContent: !preferences.useNearbyContent })}
              className={`px-4 py-2 rounded-lg text-white ${preferences.useNearbyContent ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              {preferences.useNearbyContent ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        {/* SOS Settings */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Emergency SOS</h3>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="grid gap-1 text-sm">
                <span className="font-medium flex items-center gap-2"><Phone className="w-4 h-4"/>Father (WhatsApp)</span>
                <input value={father} onChange={(e)=>setFather(e.target.value)} placeholder="e.g. +918247024233" className="border rounded-lg px-3 py-2"/>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium flex items-center gap-2"><Phone className="w-4 h-4"/>Mother (WhatsApp)</span>
                <input value={mother} onChange={(e)=>setMother(e.target.value)} placeholder="e.g. +9198xxxxxxxx" className="border rounded-lg px-3 py-2"/>
              </label>
            </div>

            <label className="flex items-center gap-3">
              <input type="checkbox" checked={includeLive} onChange={(e)=>setIncludeLive(e.target.checked)} />
              <span className="text-sm flex items-center gap-2"><Link className="w-4 h-4"/>Include Live SOS link</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={smsFallback} onChange={(e)=>setSmsFallback(e.target.checked)} />
              <span className="text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4"/>SMS fallback if WhatsApp blocked</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setPreferences({ sosContacts: { father, mother }, sosIncludeLiveLink: includeLive, sosSmsFallback: smsFallback, sosLinkType: 'app' })}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >Save SOS Settings</button>
              <button
                onClick={() => openWhatsAppNow(father || mother, 'Test: SOS quick share from CityConnect')}
                className="px-4 py-2 rounded-lg bg-green-600 text-white"
              >Send Test</button>
            </div>

            <p className="text-xs text-gray-500">Tip: You can trigger SOS by tapping the red button, saying "help me", or shaking your phone.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
