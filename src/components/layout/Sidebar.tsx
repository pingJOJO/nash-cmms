import React, { useState } from 'react';
import { 
  ClipboardList, 
  CalendarClock, 
  BarChart3, 
  Inbox, 
  Box, 
  MapPin, 
  Boxes, 
  FileText, 
  Gauge, 
  Users, 
  Building2, 
  Tags, 
  FolderArchive, 
  Settings, 
  Upload, 
  HelpCircle, 
  Calendar, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Check,
  X,
  Clock,
  Zap,
  Database
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { t, isArabicLang } from '../../utils/translations';

export type NavRoute = 
  | 'work-orders'
  | 'preventive-maintenances'
  | 'statistics'
  | 'requests'
  | 'assets'
  | 'locations'
  | 'parts'
  | 'purchase-requests'
  | 'meters'
  | 'people'
  | 'vendors'
  | 'categories'
  | 'files'
  | 'settings';

export type AnalyticsSubTab = 'work-orders' | 'assets-pms' | 'cost-time';
export type PartsSubTab = 'parts' | 'sets';

interface SidebarProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  analyticsSubTab?: AnalyticsSubTab;
  onSelectAnalyticsSubTab?: (tab: AnalyticsSubTab) => void;
  partsSubTab?: PartsSubTab;
  onSelectPartsSubTab?: (tab: PartsSubTab) => void;
  workOrderCount: number;
  requestCount: number;
  collapsed: boolean;
  language?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  analyticsSubTab = 'work-orders',
  onSelectAnalyticsSubTab,
  partsSubTab = 'parts',
  onSelectPartsSubTab,
  workOrderCount,
  requestCount,
  collapsed,
  language
}) => {
  const isAr = isArabicLang(language);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    statistics: true,
    parts: true,
    people: false,
    vendors: false
  });

  const { currentUser, logout, can } = useAuth();

  const toggleSubmenu = (key: string) => {
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'professional' | 'enterprise'>('enterprise');
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  return (
    <>
      <aside 
        className={`h-screen flex flex-col bg-[#090D16] ${isAr ? 'border-l' : 'border-r'} border-[#1E293B] text-slate-300 transition-all duration-300 select-none z-30 sticky top-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 gap-3 border-b border-[#172033] bg-[#070A12]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
            <span className="text-white font-black text-xl tracking-tighter">N</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base tracking-wider">NEX</span>
                <span className="text-sky-400 text-xs font-semibold px-1.5 py-0.5 bg-sky-950/80 rounded border border-sky-800/50">CMMS</span>
              </div>
              <span className="text-[11px] text-slate-400 truncate">
                {t.sidebar.brandSubtitle[isAr ? 'ar' : 'en']}
              </span>
            </div>
          )}
        </div>

        {/* Trial / Business Plan Banner */}
        {!collapsed && (
          <div className="m-3 p-3.5 rounded-xl bg-gradient-to-br from-sky-500/15 via-teal-500/10 to-indigo-500/15 border border-sky-500/30 text-white relative overflow-hidden">
            <div className="text-xs font-semibold text-sky-200">
              {t.sidebar.trialNotice[isAr ? 'ar' : 'en']}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {t.sidebar.businessPlan[isAr ? 'ar' : 'en']}
            </div>
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="mt-2.5 w-full py-1.5 px-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.sidebar.upgradePlan[isAr ? 'ar' : 'en']}
            </button>
          </div>
        )}

        {/* Main Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-2 py-1.5 space-y-0.5 text-xs font-medium pb-8 select-none">
          {/* Work Orders */}
          <button
            onClick={() => onNavigate('work-orders')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'work-orders'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
            }`}
            title={t.routes['work-orders'][isAr ? 'ar' : 'en']}
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-start truncate">{t.routes['work-orders'][isAr ? 'ar' : 'en']}</span>}
            {!collapsed && workOrderCount > 0 && (
              <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
                currentRoute === 'work-orders' ? 'bg-sky-950 text-white' : 'bg-sky-500 text-white'
              }`}>
                {workOrderCount}
              </span>
            )}
          </button>

          {/* Preventive Maintenance */}
          <button
            onClick={() => onNavigate('preventive-maintenances')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'preventive-maintenances'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
            }`}
            title={t.routes['preventive-maintenances'][isAr ? 'ar' : 'en']}
          >
            <CalendarClock className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-start truncate">{t.routes['preventive-maintenances'][isAr ? 'ar' : 'en']}</span>}
          </button>

          {/* Statistics & Sub-branches */}
          <div>
            <div
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                currentRoute === 'statistics'
                  ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                  : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
              }`}
            >
              <button
                onClick={() => {
                  onNavigate('statistics');
                  if (!collapsed) setExpandedMenus(prev => ({ ...prev, statistics: true }));
                }}
                className="flex items-center gap-3 flex-1 text-start cursor-pointer"
                title={t.routes['statistics'][isAr ? 'ar' : 'en']}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="flex-1 text-start truncate">{t.routes['statistics'][isAr ? 'ar' : 'en']}</span>}
              </button>
              {!collapsed && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSubmenu('statistics');
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/50 cursor-pointer"
                  title={expandedMenus.statistics ? 'Collapse sub-menu' : 'Expand sub-menu'}
                >
                  {expandedMenus.statistics ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
            {!collapsed && expandedMenus.statistics && (
              <div className={`${isAr ? 'mr-7 pr-3 border-r' : 'ml-7 pl-3 border-l'} border-slate-700/60 my-1 space-y-1`}>
                <button 
                  onClick={() => {
                    onNavigate('statistics');
                    onSelectAnalyticsSubTab?.('work-orders');
                  }}
                  className={`w-full text-start py-1.5 px-2.5 text-xs rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                    currentRoute === 'statistics' && analyticsSubTab === 'work-orders'
                      ? 'bg-sky-500/25 text-sky-300 font-bold border-l-2 border-sky-400'
                      : 'text-slate-400 hover:text-white hover:bg-[#151D2E]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                  {t.sidebar.subtabs.workOrders[isAr ? 'ar' : 'en']}
                </button>
                <button 
                  onClick={() => {
                    onNavigate('statistics');
                    onSelectAnalyticsSubTab?.('assets-pms');
                  }}
                  className={`w-full text-start py-1.5 px-2.5 text-xs rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                    currentRoute === 'statistics' && analyticsSubTab === 'assets-pms'
                      ? 'bg-sky-500/25 text-sky-300 font-bold border-l-2 border-sky-400'
                      : 'text-slate-400 hover:text-white hover:bg-[#151D2E]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                  {t.sidebar.subtabs.assetsPms[isAr ? 'ar' : 'en']}
                </button>
                <button 
                  onClick={() => {
                    onNavigate('statistics');
                    onSelectAnalyticsSubTab?.('cost-time');
                  }}
                  className={`w-full text-start py-1.5 px-2.5 text-xs rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                    currentRoute === 'statistics' && analyticsSubTab === 'cost-time'
                      ? 'bg-sky-500/25 text-sky-300 font-bold border-l-2 border-sky-400'
                      : 'text-slate-400 hover:text-white hover:bg-[#151D2E]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                  {t.sidebar.subtabs.costTime[isAr ? 'ar' : 'en']}
                </button>
              </div>
            )}
          </div>

          {/* Requests */}
          <button
            onClick={() => onNavigate('requests')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'requests'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
            }`}
            title={t.routes['requests'][isAr ? 'ar' : 'en']}
          >
            <Inbox className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-start truncate">{t.routes['requests'][isAr ? 'ar' : 'en']}</span>}
            {!collapsed && requestCount > 0 && (
              <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
                currentRoute === 'requests' ? 'bg-sky-950 text-white' : 'bg-sky-500 text-white'
              }`}>
                {requestCount}
              </span>
            )}
          </button>

          {/* Assets */}
          <button
            onClick={() => onNavigate('assets')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'assets'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
            }`}
            title={t.routes['assets'][isAr ? 'ar' : 'en']}
          >
            <Box className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-start truncate">{t.routes['assets'][isAr ? 'ar' : 'en']}</span>}
          </button>

          {/* Locations */}
          <button
            onClick={() => onNavigate('locations')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'locations'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
            }`}
            title={t.routes['locations'][isAr ? 'ar' : 'en']}
          >
            <MapPin className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-start truncate">{t.routes['locations'][isAr ? 'ar' : 'en']}</span>}
          </button>

          {/* Parts / Inventory & Sub-branches */}
          <div>
            <div
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                currentRoute === 'parts'
                  ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                  : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
              }`}
            >
              <button
                onClick={() => {
                  onNavigate('parts');
                  onSelectPartsSubTab?.('parts');
                  if (!collapsed) setExpandedMenus(prev => ({ ...prev, parts: true }));
                }}
                className="flex items-center gap-3 flex-1 text-start cursor-pointer"
                title={t.routes['parts'][isAr ? 'ar' : 'en']}
              >
                <Boxes className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="flex-1 text-start truncate">{t.routes['parts'][isAr ? 'ar' : 'en']}</span>}
              </button>
              {!collapsed && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSubmenu('parts');
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/50 cursor-pointer"
                  title={expandedMenus.parts ? 'Collapse sub-menu' : 'Expand sub-menu'}
                >
                  {expandedMenus.parts ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
            {!collapsed && expandedMenus.parts && (
              <div className={`${isAr ? 'mr-7 pr-3 border-r' : 'ml-7 pl-3 border-l'} border-slate-700/60 my-1 space-y-1`}>
                <button 
                  onClick={() => {
                    onNavigate('parts');
                    onSelectPartsSubTab?.('parts');
                  }}
                  className={`w-full text-start py-1.5 px-2.5 text-xs rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                    currentRoute === 'parts' && partsSubTab === 'parts'
                      ? 'bg-sky-500/25 text-sky-300 font-bold border-l-2 border-sky-400'
                      : 'text-slate-400 hover:text-white hover:bg-[#151D2E]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                  {t.sidebar.subtabs.parts[isAr ? 'ar' : 'en']}
                </button>
                <button 
                  onClick={() => {
                    onNavigate('parts');
                    onSelectPartsSubTab?.('sets');
                  }}
                  className={`w-full text-start py-1.5 px-2.5 text-xs rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                    currentRoute === 'parts' && partsSubTab === 'sets'
                      ? 'bg-sky-500/25 text-sky-300 font-bold border-l-2 border-sky-400'
                      : 'text-slate-400 hover:text-white hover:bg-[#151D2E]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                  {t.sidebar.subtabs.setsOfParts[isAr ? 'ar' : 'en']}
                </button>
              </div>
            )}
          </div>

          {/* Purchase Requests */}
          <button
            onClick={() => onNavigate('purchase-requests')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'purchase-requests'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
            }`}
            title={t.routes['purchase-requests'][isAr ? 'ar' : 'en']}
          >
            <FileText className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-start truncate">{t.routes['purchase-requests'][isAr ? 'ar' : 'en']}</span>}
          </button>

          {/* Meters */}
          <button
            onClick={() => onNavigate('meters')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'meters'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
            }`}
            title={t.routes['meters'][isAr ? 'ar' : 'en']}
          >
            <Gauge className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-start truncate">{t.routes['meters'][isAr ? 'ar' : 'en']}</span>}
          </button>

          {/* People & Teams */}
          <button
            onClick={() => onNavigate('people')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'people'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
            }`}
            title={t.routes['people'][isAr ? 'ar' : 'en']}
          >
            <Users className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-start truncate">{t.routes['people'][isAr ? 'ar' : 'en']}</span>}
          </button>

          {/* Vendors & Contractors */}
          <button
            onClick={() => onNavigate('vendors')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'vendors'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
            }`}
            title={t.routes['vendors'][isAr ? 'ar' : 'en']}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-start truncate">{t.routes['vendors'][isAr ? 'ar' : 'en']}</span>}
          </button>

          {/* Categories */}
          <button
            onClick={() => onNavigate('categories')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'categories'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
            }`}
            title={t.routes['categories'][isAr ? 'ar' : 'en']}
          >
            <Tags className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-start truncate">{t.routes['categories'][isAr ? 'ar' : 'en']}</span>}
          </button>

          {/* Files */}
          <button
            onClick={() => onNavigate('files')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'files'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
            }`}
            title={t.routes['files'][isAr ? 'ar' : 'en']}
          >
            <FolderArchive className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-start truncate">{t.routes['files'][isAr ? 'ar' : 'en']}</span>}
          </button>

          {/* System Settings (Direct in Navigation List) */}
          {can('SETTINGS') && (
            <button
              onClick={() => onNavigate('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                currentRoute === 'settings'
                  ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-[#151D2E] hover:text-white'
              }`}
              title={t.routes['settings'][isAr ? 'ar' : 'en']}
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="flex-1 text-start truncate">{t.routes['settings'][isAr ? 'ar' : 'en']}</span>}
            </button>
          )}
        </nav>

        {/* Bottom Utility Bar */}
        <div className="p-3 border-t border-[#172033] bg-[#070A12] flex items-center justify-around">
          <button 
            onClick={() => window.open('/api/admin/backup', '_blank')}
            title="Export Data & Automated Backup"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#151D2E] transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowHelpModal(true)}
            title="Help & User Documentation"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#151D2E] transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onNavigate('work-orders')}
            title="Calendar & Work Schedules"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#151D2E] transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
          </button>
          {can('SETTINGS') && (
            <button 
              onClick={() => onNavigate('settings')}
              title="System Settings"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                currentRoute === 'settings' ? 'text-sky-400 bg-sky-950/60' : 'text-slate-400 hover:text-white hover:bg-[#151D2E]'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={logout}
            title="Log Out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#151D2E] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Help & Documentation Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Help & User Guide - NEX CMMS</h3>
                  <p className="text-xs text-slate-500">Enterprise Computerized Maintenance Management & Operations</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Work Order Management</span>
                </h4>
                <p>Create work orders, assign responsible technicians, set delivery dates, track progression stages, and document labor hours, spare parts, and contractor expenses.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Preventive Maintenance & Telemetry</span>
                </h4>
                <p>Automate recurring preventive maintenance schedules based on time (weekly/monthly/annual) or meter runtime hours to prevent unexpected breakdowns.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Offline-First Architecture</span>
                </h4>
                <p>Ensures smooth execution in low-connectivity sites. All checklists and work order updates are saved locally and synced automatically once online.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Automated Secure Backups</span>
                </h4>
                <p>The database is protected with automated daily encrypted backups on the server. You can also export instant SQL snapshots at any time via the bottom toolbar or Settings.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-600 text-white rounded-xl shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">NEX CMMS Enterprise Licensing</h3>
                  <p className="text-xs text-slate-500">Choose the optimal tier for your maintenance operations</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowUpgradeModal(false); setUpgradeSuccess(false); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit mx-auto text-xs font-semibold">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  billingPeriod === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingPeriod === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">20% OFF</span>
              </button>
            </div>

            {/* Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Standard */}
              <div 
                onClick={() => setSelectedPlan('standard')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPlan === 'standard' ? 'border-sky-500 bg-sky-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">Standard</span>
                  <div className="text-lg font-black text-slate-900">
                    {billingPeriod === 'annual' ? '$39' : '$49'}
                    <span className="text-[11px] font-normal text-slate-500">/mo</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Up to 5 Technicians</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Work Orders & Assets</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Basic PM Schedules</li>
                  </ul>
                </div>
              </div>

              {/* Professional */}
              <div 
                onClick={() => setSelectedPlan('professional')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                  selectedPlan === 'professional' ? 'border-sky-500 bg-sky-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-600 text-white uppercase tracking-wider">
                  Popular
                </span>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900">Professional</span>
                  <div className="text-lg font-black text-slate-900">
                    {billingPeriod === 'annual' ? '$119' : '$149'}
                    <span className="text-[11px] font-normal text-slate-500">/mo</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Up to 20 Technicians</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Parts & Inventory Barcodes</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Automated Telemetry & Meters</li>
                  </ul>
                </div>
              </div>

              {/* Enterprise */}
              <div 
                onClick={() => setSelectedPlan('enterprise')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                  selectedPlan === 'enterprise' ? 'border-sky-500 bg-sky-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                  Current
                </span>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-sky-950">Enterprise Live</span>
                  <div className="text-lg font-black text-slate-900">
                    {billingPeriod === 'annual' ? '$319' : '$399'}
                    <span className="text-[11px] font-normal text-slate-500">/mo</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Unlimited Users & RBAC</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Dedicated AWS EC2 + RDS</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Custom SSL & 24/7 SLA</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Success Feedback or Action CTA */}
            {upgradeSuccess ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you! Your enterprise subscription for <strong>{selectedPlan.toUpperCase()}</strong> has been submitted. Our operations team will process the billing activation for your instance.</span>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <span>Active Domain: <strong>nexcmms.online</strong> • Secured with Let's Encrypt SSL</span>
                <span className="text-slate-400 font-mono text-[11px]">AWS EC2 eu-north-1</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-2 flex justify-end items-center gap-2 border-t border-slate-100">
              <button
                onClick={() => { setShowUpgradeModal(false); setUpgradeSuccess(false); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => setUpgradeSuccess(true)}
                className="px-5 py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Confirm Plan Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

