import React from 'react';
import { useToast } from './ui/ToastProvider';

const THEMES = [
  { id: 'ocean', label: 'Ocean' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'forest', label: 'Forest' },
  { id: 'royal', label: 'Royal' },
] as const;

const ThemeSelector: React.FC = () => {
  const { show } = useToast();
  const [brand, setBrand] = React.useState<string>(() => localStorage.getItem('cc-brand') || 'ocean');

  const apply = (b: string) => {
    document.documentElement.setAttribute('data-brand', b);
    localStorage.setItem('cc-brand', b);
    setBrand(b);
    show(`Applied ${b} theme`, 'success');
  };

  return (
    <div className="grid gap-3">
      <div className="text-sm text-gray-600">Choose a color theme for the animated background and accents.</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => apply(t.id)}
            className={`group p-3 rounded-xl border bg-white/70 backdrop-blur hover:shadow-lg transition ${brand===t.id ? 'ring-2 ring-blue-400' : ''}`}
            title={t.label}
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex -space-x-1.5">
                <i className="w-4 h-4 rounded-full" style={{ background: 'var(--bg1)' }} />
                <i className="w-4 h-4 rounded-full" style={{ background: 'var(--bg2)' }} />
                <i className="w-4 h-4 rounded-full" style={{ background: 'var(--bg3)' }} />
                <i className="w-4 h-4 rounded-full" style={{ background: 'var(--bg4)' }} />
              </span>
              <span className="text-sm font-medium">{t.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
