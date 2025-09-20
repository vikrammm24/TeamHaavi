import React from 'react';
import { ShieldCheck, Trophy, Sparkles, Globe2, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const badges = [
  { icon: Trophy, label: 'Hackathon Ready' },
  { icon: ShieldCheck, label: 'Secure by Design' },
  { icon: Sparkles, label: 'AI‑Powered' },
  { icon: Globe2, label: 'Multilingual' },
  { icon: Award, label: 'Modern UX' },
  { icon: CheckCircle2, label: 'Production‑Ready' },
];

const BadgeStrip: React.FC = () => {
  return (
    <div className="relative">
      <div className="overflow-hidden py-3">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          className="flex gap-3 w-[200%]"
        >
          {[...Array(2)].flatMap((_, i) => (
            <div key={i} className="flex gap-3 w-1/2">
              {badges.map((b, idx) => {
                const Icon = b.icon;
                return (
                  <div
                    key={`${i}-${idx}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full border bg-white/70 backdrop-blur hover:shadow transition text-xs font-medium"
                  >
                    <span className="p-1 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white shadow">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span>{b.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BadgeStrip;
