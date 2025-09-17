import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, ArrowLeft } from 'lucide-react';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useMemo(() => {
    const p = new URLSearchParams(location.search);
    const r = p.get('role');
    return r === 'citizen' || r === 'authority' || r === 'professional' ? r : null;
  }, [location.search]);
  // Redirect this legacy page to unified /login?mode=signup so email/password signup works everywhere (web + mobile)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('mode', 'signup');
    if (role) params.set('role', role);
    navigate({ pathname: '/login', search: params.toString() }, { replace: true });
  }, [navigate, role]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Placeholder: in a real app, call your signup API here
      await new Promise(res => setTimeout(res, 800));
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* optional floating particles - minimal */}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border"
      >
        <button onClick={() => navigate(-1)} className="mb-4 text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create your account</h1>
        </div>
        {role && (
          <div className="mb-4 text-sm bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-2">
            Role selected: <strong className="capitalize">{role}</strong>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white">
              <UserPlus className="w-4 h-4 text-gray-400" />
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={onChange}
                placeholder="e.g. Rahul Verma"
                className="w-full outline-none bg-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                className="w-full outline-none bg-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="Create a password"
                className="w-full outline-none bg-transparent"
                minLength={6}
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Sign Up'}
          </motion.button>
        </form>

        <div className="text-sm text-gray-600 mt-4 text-center">
          Already have an account?{' '}
          <Link className="text-blue-600 hover:underline" to={role ? `/login?role=${role}` : '/login'}>Log in</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
