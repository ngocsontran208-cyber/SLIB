import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@slib/api-client';
import { BookOpen, KeyRound, Loader2, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/auth/login', { username, password });
      window.location.href = '/'; 
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError('Sai tên đăng nhập hoặc mật khẩu!');
      } else {
        setError('Có lỗi xảy ra khi kết nối máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* Background Decorators */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-400/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-[420px] p-6 z-10">
        <div className="glass-card p-10 rounded-[2rem]">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/30 mb-6 transform rotate-[-5deg] hover:rotate-0 transition-transform duration-300">
              <BookOpen size={32} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Staff Portal
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
              University Library System
            </p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-900 dark:text-white transition-all backdrop-blur-sm placeholder:text-slate-400"
                placeholder="Enter your username..."
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-900 dark:text-white transition-all backdrop-blur-sm placeholder:text-slate-400"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 overflow-hidden flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>{t('login', 'Sign In')}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
