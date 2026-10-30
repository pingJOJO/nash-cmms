import React, { useState } from 'react';
import { useAuth, DEMO_USERS, UserRole } from '../../context/AuthContext';
import { Shield, Wrench, FileText, ArrowRight, Lock, Mail, CheckCircle2, AlertTriangle, Eye, EyeOff, UserCheck } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, quickSwitchRole } = useAuth();
  const [email, setEmail] = useState('omar@nexcmms.online');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!password || password.trim().length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    const res = login(email, password);
    if (!res.success) {
      setError(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleSelectDemo = (role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setError('');
    quickSwitchRole(role);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/25 mb-4">
            <span className="text-white font-extrabold text-2xl tracking-wider">NASH</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            NASH CMMS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise Facility Maintenance & Asset Intelligence Platform
          </p>
        </div>

        {/* Demo Roles Quick Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quick Role Login (Select Role):
            </span>
            <span className="text-[11px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30">
              1-Click Demo
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              DEMO_USERS.find(u => u.role === 'ADMINISTRATOR')!,
              DEMO_USERS.find(u => u.role === 'MANAGER')!,
              DEMO_USERS.find(u => u.role === 'TECHNICIAN')!,
              DEMO_USERS.find(u => u.role === 'REQUESTER')!
            ].filter(Boolean).map((demo) => {
              const isSelected = email.toLowerCase() === demo.email.toLowerCase();
              return (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleSelectDemo(demo.role, demo.email)}
                  className={`flex flex-col text-left p-2.5 rounded-xl border transition-all duration-200 relative group cursor-pointer ${
                    isSelected
                      ? 'bg-sky-950/60 border-sky-500 text-white shadow-md shadow-sky-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 w-full">
                    <div className="p-1 rounded-lg bg-slate-700/50 text-sky-400">
                      {demo.role === 'ADMINISTRATOR' && <Shield className="w-3.5 h-3.5" />}
                      {demo.role === 'MANAGER' && <UserCheck className="w-3.5 h-3.5" />}
                      {demo.role === 'TECHNICIAN' && <Wrench className="w-3.5 h-3.5" />}
                      {demo.role === 'REQUESTER' && <FileText className="w-3.5 h-3.5" />}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    )}
                  </div>
                  <span className="font-semibold text-[11px] text-white truncate">
                    {demo.role === 'ADMINISTRATOR' ? 'Admin' : demo.role === 'MANAGER' ? 'Manager' : demo.role === 'TECHNICIAN' ? 'Technician' : 'Requester'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate mt-0.5">
                    {demo.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="name@company.com"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 text-sm transition-all duration-200 cursor-pointer"
          >
            <span>Sign In to System</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security and Version Footnote */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>256-bit SSL Encrypted Connection</span>
          </div>
          <span>NASH CMMS Enterprise v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
