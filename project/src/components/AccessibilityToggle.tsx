import React, { useState } from 'react';
import { Eye, Type } from 'lucide-react';

const AccessibilityToggle: React.FC = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  // Apply accessibility styles to document body
  React.useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast);
    document.body.classList.toggle('font-large', fontSize === 'large');
    return () => {
      document.body.classList.remove('high-contrast');
      document.body.classList.remove('font-large');
    };
  }, [highContrast, fontSize]);

  return (
    <div className="bg-yellow-50 rounded-xl shadow-lg p-4 mb-6 flex flex-col md:flex-row items-center gap-4">
      <div className="flex items-center gap-2">
        <Eye className="w-5 h-5 text-yellow-700" />
        <span className="font-semibold text-yellow-800">Accessibility</span>
      </div>
      <div className="flex gap-4 items-center">
        <button
          onClick={() => setHighContrast(h => !h)}
          className={`px-4 py-2 rounded font-medium border ${highContrast ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'} transition`}
        >
          {highContrast ? 'Disable High Contrast' : 'Enable High Contrast'}
        </button>
        <button
          onClick={() => setFontSize(f => f === 'normal' ? 'large' : 'normal')}
          className={`px-4 py-2 rounded font-medium border ${fontSize === 'large' ? 'bg-yellow-700 text-white border-yellow-700' : 'bg-white text-black border-gray-300'} transition`}
        >
          <Type className="inline w-4 h-4 mr-1" />
          {fontSize === 'large' ? 'Normal Font' : 'Large Font'}
        </button>
      </div>
    </div>
  );
};

export default AccessibilityToggle;
