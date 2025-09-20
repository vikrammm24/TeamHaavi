import React from 'react';
import {
  Siren,
  MapPin,
  Camera,
  ShieldCheck,
  Users,
  Bot,
  TrafficCone,
  Building2,
  Wifi,
  CloudSun,
  Bus,
  TramFront,
  Train,
  Car,
  Bike,
  Route,
  Fuel,
  Waves,
  Trees,
  CircleDollarSign,
} from 'lucide-react';
import Marquee from './ui/Marquee';

type IconItem = { icon: React.ReactNode; label: string };

const items: IconItem[] = [
  { icon: <Siren className="w-6 h-6 text-brand" />, label: 'Emergency' },
  { icon: <MapPin className="w-6 h-6 text-brand-2" />, label: 'Location' },
  { icon: <Camera className="w-6 h-6 text-brand" />, label: 'Cameras' },
  { icon: <ShieldCheck className="w-6 h-6 text-brand-2" />, label: 'Safety' },
  { icon: <Users className="w-6 h-6 text-brand" />, label: 'Community' },
  { icon: <Bot className="w-6 h-6 text-brand-2" />, label: 'Assistant' },
  { icon: <TrafficCone className="w-6 h-6 text-brand" />, label: 'Traffic' },
  { icon: <Building2 className="w-6 h-6 text-brand-2" />, label: 'Civic' },
  { icon: <Wifi className="w-6 h-6 text-brand" />, label: 'Connectivity' },
  { icon: <CloudSun className="w-6 h-6 text-brand-2" />, label: 'Weather' },
  { icon: <Bus className="w-6 h-6 text-brand" />, label: 'Bus' },
  { icon: <TramFront className="w-6 h-6 text-brand-2" />, label: 'Tram' },
  { icon: <Train className="w-6 h-6 text-brand" />, label: 'Train' },
  { icon: <Car className="w-6 h-6 text-brand-2" />, label: 'Car' },
  { icon: <Bike className="w-6 h-6 text-brand" />, label: 'Bike' },
  { icon: <Route className="w-6 h-6 text-brand-2" />, label: 'Routes' },
  { icon: <Fuel className="w-6 h-6 text-brand" />, label: 'Fuel' },
  { icon: <Waves className="w-6 h-6 text-brand-2" />, label: 'Water' },
  { icon: <Trees className="w-6 h-6 text-brand" />, label: 'Parks' },
  { icon: <CircleDollarSign className="w-6 h-6 text-brand-2" />, label: 'Costs' },
];

const ScrollingIcons: React.FC = () => {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
  <Marquee speedSeconds={24} pauseOnHover={false}>
          {items.map((it, idx) => (
            <div key={idx} className="marquee__item flex items-center gap-2">
              <span className="cc-bob" aria-hidden>{it.icon}</span>
              <span className="text-[0.95rem] font-semibold cc-text-theme whitespace-nowrap">{it.label}</span>
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

export default ScrollingIcons;
