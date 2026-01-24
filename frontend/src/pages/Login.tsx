import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../context/auth.store';
import { authService } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const setError = useAuthStore((s) => s.setError);
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    college: '',
    branch: '',
    yearOfGraduation: new Date().getFullYear() + 4,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');

    try {
      if (isLogin) {
        const response: any = await authService.login({
          email: formData.email,
          password: formData.password,
        });
        setToken(response.token);
        setUser(response.user);
        navigate('/dashboard');
      } else {
        const response: any = await authService.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          college: formData.college,
          branch: formData.branch,
          yearOfGraduation: Number(formData.yearOfGraduation),
        });
        setToken(response.token);
        setUser(response.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Registration/Login Error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'An error occurred';
      setLocalError(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-navy-700/50 backdrop-blur-md rounded-lg shadow-2xl p-8 border border-cyan-500/30 hover-glow">
          <h1 className="text-4xl font-bold text-white mb-2 text-glow-cyan">Career AI</h1>
          <p className="text-gray-300 mb-8">AI-powered college success companion</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-cyan-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-navy-800/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:shadow-glow-cyan transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="college"
                    placeholder="College Name"
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-navy-800/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:shadow-glow-cyan transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="px-4 py-2 bg-navy-800/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:shadow-glow-cyan appearance-none transition-all"
                    aria-label="Select branch"
                  >
                    <option value="" className="bg-navy-800">Branch</option>
                    <option value="CS" className="bg-navy-800 text-white">Computer Science</option>
                    <option value="IT" className="bg-navy-800 text-white">Information Technology</option>
                    <option value="AIML" className="bg-navy-800 text-white">AI/ML</option>
                    <option value="ECE" className="bg-navy-800 text-white">Electronics & Communication</option>
                    <option value="EE" className="bg-navy-800 text-white">Electrical Engineering</option>
                    <option value="ME" className="bg-navy-800 text-white">Mechanical Engineering</option>
                  </select>
                  <select
                    name="yearOfGraduation"
                    value={formData.yearOfGraduation}
                    onChange={handleChange}
                    className="px-4 py-2 bg-navy-800/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:shadow-glow-cyan appearance-none transition-all"
                    aria-label="Select year of graduation"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <option key={year} value={year} className="bg-navy-800 text-white">{year}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-cyan-400" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-navy-800/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:shadow-glow-cyan transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-cyan-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-navy-800/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:shadow-glow-cyan transition-all"
                required
              />
            </div>

            {error && (
              <div className="flex gap-2 items-start p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-navy-900 font-semibold rounded-lg transition-all shadow-glow-cyan hover:shadow-glow-cyan-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setLocalError('');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
