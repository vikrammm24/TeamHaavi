import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useUser } from '../contexts/UserContext';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Shield, ToggleRight } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, preferences, setPreferences } = useUser();

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
      </div>
    </DashboardLayout>
  );
};

export default Settings;
