import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Briefcase, ArrowRight, LogIn } from 'lucide-react';

interface RoleCardProps {
  role: 'citizen' | 'authority' | 'professional';
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  navigateTo: (path: string) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, title, description, icon, accent, navigateTo }) => {
  return (
    <div className={`group border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>      
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${accent} bg-gradient-to-br pointer-events-none`} />
      <div
        className="flex items-center gap-4 mb-4 cursor-pointer group/hd focus:outline-none relative z-10"
        role="button"
        tabIndex={0}
  onClick={() => navigateTo(`/login?mode=login&role=${role}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') navigateTo(`/login?mode=login&role=${role}`);
        }}
      >
        <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-white shadow ${accent} bg-gradient-to-br ring-0 group-hover/hd:ring-2 group-hover/hd:ring-white/70 transition`}> 
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="flex gap-3 mt-2 relative z-10">
        <button
          type="button"
          aria-label={`Login as ${role}`}
          onClick={()=>navigateTo(`/login?mode=login&role=${role}`)}
          className="flex-1 text-sm px-4 py-2 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          Login
        </button>
        <button
          type="button"
          aria-label={`Sign up as ${role}`}
          onClick={()=>navigateTo(`/login?mode=signup&role=${role}`)}
          className="flex-1 text-sm px-4 py-2 rounded-md text-white font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          Sign Up <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const SelectRole: React.FC = () => {
  const navigate = useNavigate();
  const route = (p: string) => navigate(p);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Choose Your Role</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">Select how you want to participate in CityConnect. Each role unlocks tailored tools and dashboards.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <RoleCard
            role="citizen"
            title="Citizen"
            description="Report issues, track resolutions, engage with your community."
            icon={<Users className="w-8 h-8" />}
            accent="from-blue-500 to-blue-600"
            navigateTo={route}
          />
          <RoleCard
            role="professional"
            title="Professional"
            description="Offer expertise, get matched to community needs, build reputation."
            icon={<Briefcase className="w-8 h-8" />}
            accent="from-purple-500 to-purple-600"
            navigateTo={route}
          />
          <RoleCard
            role="authority"
            title="Authority"
            description="Monitor city operations, validate professionals, optimize response."
            icon={<Shield className="w-8 h-8" />}
            accent="from-green-500 to-green-600"
            navigateTo={route}
          />
        </div>
        <div className="mt-10 text-center">
          <button onClick={()=>navigate('/')} className="text-sm text-blue-100 hover:text-white underline underline-offset-4">Back to Landing</button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;