import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  User as UserIcon, 
  ChevronDown, 
  Building, 
  ShieldCheck, 
  ExternalLink,
  CheckCircle2,
  X,
  LogOut,
  Sparkles,
  Wrench,
  Shield,
  FileText,
  Mic,
  Globe
} from 'lucide-react';
import { NavRoute } from './Sidebar';
import { useAuth, DEMO_USERS, UserRole } from '../../context/AuthContext';
import { VoiceCommandModal } from '../voice/VoiceCommandModal';
import { api } from '../../services/api';
import { SubscriptionInfo } from '../../types/cmms';

interface TopbarProps {
  currentRoute: NavRoute;
  collapsed: boolean;
  onToggleCollapse: () => void;
  language?: string;
  onToggleLanguage?: (lang: string) => void;
}

const ROUTE_TITLES: Record<NavRoute, string> = {
  'work-orders': 'Work Orders',
  'preventive-maintenances': 'Preventive Maintenance',
  'statistics': 'Statistics & Analytics',
  'requests': 'Requests',
  'assets': 'Assets Inventory',
  'locations': 'Locations',
  'parts': 'Parts & Inventory',
  'purchase-requests': 'Purchase Requests',
  'meters': 'Meters',
  'people': 'People & Teams',
  'vendors': 'Vendors & Contractors',
  'categories': 'Categories',
  'files': 'Files Repository',
  'settings': 'Settings'
};

export const Topbar: React.FC<TopbarProps> = ({
  currentRoute,
  collapsed,
  onToggleCollapse,
  language = 'Arabic',
  onToggleLanguage
}) => {
  const { currentUser, logout, quickSwitchRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    api.getSubscription().then(setSubscription).catch(console.warn);
  }, []);
  const [unreadNotifications, setUnreadNotifications] = useState([
    {
      id: 'N1',
      title: 'High Priority Work Order',
      desc: 'WO000001 (Fix leaking pipe) status updated to In Progress',
      time: '10m ago',
      unread: true
    },
    {
      id: 'N2',
      title: 'Preventive Maintenance Due',
      desc: 'Quarterly HVAC Comprehensive Inspection scheduled for this week',
      time: '1h ago',
      unread: true
    },
    {
      id: 'N3',
      title: 'Low Stock Alert',
      desc: 'Part PRT-008 (Hydraulic Seal Kit) quantity below minimum threshold (1 left)',
      time: '3h ago',
      unread: false
    }
  ]);

  const markAllRead = () => {
    setUnreadNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const roleBadgeColor = {
    ADMINISTRATOR: 'bg-purple-100 text-purple-700 border-purple-200',
    MANAGER: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    TECHNICIAN: 'bg-sky-100 text-sky-700 border-sky-200',
    REQUESTER: 'bg-amber-100 text-amber-700 border-amber-200'
  }[currentUser?.role || 'ADMINISTRATOR'];

  const roleNameLabel = {
    ADMINISTRATOR: 'System Administrator',
    MANAGER: 'Operations Manager',
    TECHNICIAN: 'Field Technician',
    REQUESTER: 'Plant Operator / Requester'
  }[currentUser?.role || 'ADMINISTRATOR'];

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 shrink-0 select-none">
      {/* Left section: Collapse button & View Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span>{ROUTE_TITLES[currentRoute] || 'NEX CMMS'}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-600 border border-sky-100">
            Enterprise Live
          </span>
        </h1>
      </div>

      {/* Right section: Quick Role Switcher, Notifications, and Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Role Switcher for stakeholders & testers */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Role:
          </span>
          <button
            onClick={() => quickSwitchRole('ADMINISTRATOR')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              currentUser?.role === 'ADMINISTRATOR'
                ? 'bg-white text-purple-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛡️ Admin
          </button>
          <button
            onClick={() => quickSwitchRole('TECHNICIAN')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              currentUser?.role === 'TECHNICIAN'
                ? 'bg-white text-sky-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔧 Technician
          </button>
          <button
            onClick={() => quickSwitchRole('REQUESTER')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              currentUser?.role === 'REQUESTER'
                ? 'bg-white text-amber-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Operator
          </button>
        </div>

        {/* V2: Subscription Tier & Usage Pill */}
        {subscription && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-800 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bold">
              {subscription.subscription.tier === 'HOSPITAL_FACTORY' 
                ? 'باقة المستشفيات والمصانع' 
                : subscription.subscription.tier}
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
              {subscription.usage.assets.current} / {subscription.usage.assets.max} أصل
            </span>
          </div>
        )}

        {/* V2: Voice-to-Action Assistant Quick Trigger */}
        <button
          type="button"
          onClick={() => setShowVoiceModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all cursor-pointer"
          title="الإدخال الصوتي الذكي (Voice-to-Action)"
        >
          <Mic className="w-3.5 h-3.5 text-white animate-pulse" />
          <span className="hidden sm:inline">أمر صوتي</span>
        </button>

        {/* Bilingual AR/EN Switcher */}
        <button
          type="button"
          onClick={() => {
            const isAr = language === 'Arabic' || language === 'ar' || language === 'العربية';
            onToggleLanguage?.(isAr ? 'English' : 'Arabic');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
          title="تبديل اللغة (Toggle Arabic / English)"
        >
          <Globe className="w-3.5 h-3.5 text-sky-600" />
          <span>{(language === 'Arabic' || language === 'ar' || language === 'العربية') ? 'English' : 'العربية'}</span>
        </button>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications.some(n => n.unread) && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="font-semibold text-sm text-slate-900">Notifications</span>
                <button 
                  onClick={markAllRead}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {unreadNotifications.map(item => (
                  <div key={item.id} className={`px-4 py-3 hover:bg-slate-50 transition-colors ${item.unread ? 'bg-sky-50/40' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">{item.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {currentUser?.avatar || 'U'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                {currentUser?.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                {currentUser?.jobTitle || 'Technician'}
              </span>
            </div>
            <span className={`hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${roleBadgeColor}`}>
              {currentUser?.role || 'USER'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Menu Modal / Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${roleBadgeColor}`}>
                    <ShieldCheck className="w-3 h-3" />
                    {roleNameLabel}
                  </span>
                  <span className="text-[11px] text-slate-500">Hourly: ${currentUser?.hourlyRate || 0}/h</span>
                </div>
              </div>

              {/* Role Switcher in dropdown */}
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Switch Demo Account:
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {DEMO_USERS.slice(0, 3).map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => {
                        quickSwitchRole(demo.role);
                        setShowUserMenu(false);
                      }}
                      className={`px-2 py-1 text-[11px] rounded font-medium text-center border transition-all cursor-pointer ${
                        currentUser?.id === demo.id
                          ? 'bg-sky-50 border-sky-400 text-sky-800 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {demo.role === 'ADMINISTRATOR' ? 'Admin' : demo.role === 'TECHNICIAN' ? 'Tech' : 'Operator'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceCommandModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSuccess={(msg) => {
          // Add to unread notifications
          setUnreadNotifications(prev => [
            { id: `VOICE-${Date.now()}`, title: 'إجراء صوتي منفذ', desc: msg, time: 'الآن', unread: true },
            ...prev
          ]);
        }}
      />
    </header>
  );
};
