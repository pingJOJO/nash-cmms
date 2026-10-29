import React, { useState } from 'react';
import { 
  Sliders, 
  Database, 
  Sparkles, 
  Shield, 
  FileCheck, 
  Layers, 
  Download, 
  Trash2, 
  Check, 
  RefreshCw, 
  Send, 
  Plus, 
  CheckCircle2, 
  HardDrive, 
  Cpu, 
  FileSignature, 
  QrCode, 
  MapPin, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { SystemSettings } from '../../types/cmms';

interface ChecklistTemplate {
  id: string;
  title: string;
  category: string;
  items: string[];
}

interface SettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onClearDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearDemoData
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'backup' | 'features' | 'roles' | 'checklists' | 'integrations'>('general');
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);

  // Feature Flags State
  const [featureFlags, setFeatureFlags] = useState({
    pmEngine: true,
    lowStockAlerts: true,
    digitalSignatures: true,
    aiPredictive: true,
    qrScanner: true,
    gpsGeofencing: false
  });
  const [featuresSaved, setFeaturesSaved] = useState(false);

  // Checklists state
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([
    {
      id: 'CHK-01',
      title: 'Daily Forklift Safety Inspection',
      category: 'Mobile Equipment',
      items: [
        'Check hydraulic fluid level',
        'Inspect tire pressure and brakes',
        'Test warning horn and safety beacons',
        'Verify integrity of lifting forks'
      ]
    },
    {
      id: 'CHK-02',
      title: 'HVAC Quarterly Overhaul',
      category: 'HVAC',
      items: [
        'Clean or replace primary air filters',
        'Measure compressor amperage and insulation',
        'Wash and disinfect condenser coils',
        'Inspect refrigerant levels and pressure lines'
      ]
    },
    {
      id: 'CHK-03',
      title: 'Emergency Generator Readiness',
      category: 'Electrical & Power',
      items: [
        'Check diesel fuel level (above 85%)',
        'Verify 12V+ starter battery voltage',
        'Inspect engine block heater and coolant',
        'Test automatic transfer switch (ATS)'
      ]
    }
  ]);
  const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistCategory, setNewChecklistCategory] = useState('General');
  const [newChecklistItemsText, setNewChecklistItemsText] = useState('');

  // Integrations state
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/T00/B00/XXXX');
  const [webhookTested, setWebhookTested] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadBackup = () => {
    setIsDownloadingBackup(true);
    window.open('/api/admin/backup', '_blank');
    setTimeout(() => setIsDownloadingBackup(false), 2000);
  };

  const handleSaveFeatures = () => {
    setFeaturesSaved(true);
    setTimeout(() => setFeaturesSaved(false), 2000);
  };

  const handleCreateChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    const items = newChecklistItemsText
      .split('\n')
      .map(i => i.trim())
      .filter(Boolean);

    setChecklists(prev => [
      ...prev,
      {
        id: `CHK-0${prev.length + 1}`,
        title: newChecklistTitle,
        category: newChecklistCategory,
        items: items.length > 0 ? items : ['General equipment pre-check']
      }
    ]);
    setShowAddChecklistModal(false);
    setNewChecklistTitle('');
    setNewChecklistItemsText('');
  };

  const handleTestWebhook = () => {
    setWebhookTested(true);
    setTimeout(() => setWebhookTested(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] select-none">
      {/* Settings Navigation Tabs */}
      <div className="px-6 pt-4 border-b border-slate-200 bg-white flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'general', label: 'General Settings', icon: Sliders },
            { id: 'backup', label: 'Database & Backup', icon: Database },
            { id: 'features', label: 'Feature Flags', icon: Sparkles },
            { id: 'roles', label: 'Roles Matrix', icon: Shield },
            { id: 'checklists', label: 'Checklists', icon: FileCheck },
            { id: 'integrations', label: 'Integrations', icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {savedSuccess && (
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 pb-2">
            <Check className="w-4 h-4" /> Settings saved successfully
          </span>
        )}
      </div>

      {/* Main Form Content Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl">
        {/* Tab 1: General Settings */}
        {activeTab === 'general' && (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Language
              </label>
              <select 
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full max-w-md px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 shadow-2xs"
              >
                <option value="English">English</option>
                <option value="French">Français</option>
                <option value="German">Deutsch</option>
                <option value="Spanish">Español</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date Format
              </label>
              <select 
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                className="w-full max-w-md px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 shadow-2xs"
              >
                <option value="MM/DD/YY">MM/DD/YY (09/10/26)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (10/09/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-10)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Time Zone
              </label>
              <select 
                value={formData.timeZone}
                onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                className="w-full max-w-md px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 shadow-2xs"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                <option value="Europe/Stockholm">Europe/Stockholm (GMT+2 / CET)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Currency
              </label>
              <select 
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full max-w-md px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 shadow-2xs"
              >
                <option value="Dollar - $">Dollar ($)</option>
                <option value="Euro - €">Euro (€)</option>
                <option value="SAR - SAR">SAR (Saudi Riyal)</option>
                <option value="AED - AED">AED (Emirati Dirham)</option>
                <option value="Pound - £">Pound (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lead Days Notification
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  min={1}
                  max={30}
                  value={formData.preWorkOrderLeadDays}
                  onChange={(e) => setFormData({ ...formData, preWorkOrderLeadDays: Number(e.target.value) })}
                  className="w-24 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 text-center focus:ring-2 focus:ring-sky-500 shadow-2xs"
                />
                <span className="text-xs text-slate-500">Days prior to scheduled due date</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-3 max-w-xs">
                <div 
                  className="w-10 h-10 rounded-xl border border-slate-300 shadow-inner flex items-center justify-center cursor-pointer overflow-hidden"
                  style={{ backgroundColor: formData.brandColor }}
                >
                  <input
                    type="color"
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    className="opacity-0 w-full h-full cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-sky-500 uppercase"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
              >
                Save General Settings
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Database & Backups */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Database Architecture</h3>
                  <p className="text-xs text-slate-500">PostgreSQL 18 Enterprise Production Instance</p>
                </div>
                <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live & Connected (~2ms)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">Engine:</span>
                  <span className="font-bold text-slate-800">PostgreSQL (Prisma ORM)</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">Automated Schedule:</span>
                  <span className="font-bold text-slate-800">Daily at 02:00 AM UTC</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">Retention Period:</span>
                  <span className="font-bold text-slate-800">7 Days (Automated Rotation)</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-sky-100 text-sky-700 rounded-xl">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Instant SQL Snapshot</h3>
                  <p className="text-xs text-slate-500">
                    Generate and download a complete compressed SQL snapshot of all tables, work orders, assets, and inventory.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  disabled={isDownloadingBackup}
                  className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDownloadingBackup ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating SQL Snapshot...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Backup (.sql)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-xs">
              <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">Reset Environment</h4>
              <p className="text-xs text-slate-500 mb-4">
                Clear all mock maintenance data to restart facility initialization from scratch.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to reset and clear all demo data?')) {
                    onClearDemoData();
                  }
                }}
                className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Demo Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Features & Flags */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Enterprise Feature Flags</h3>
                  <p className="text-xs text-slate-500">Toggle advanced platform modules and automated background processors.</p>
                </div>
                <button
                  onClick={handleSaveFeatures}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {featuresSaved ? <Check className="w-4 h-4" /> : null}
                  <span>{featuresSaved ? 'Saved!' : 'Save Features'}</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {[
                  {
                    key: 'pmEngine',
                    title: 'Automated PM Cron Engine',
                    desc: 'Automatically triggers work orders based on calendar frequencies or telemetry meter run hours.',
                    icon: Cpu
                  },
                  {
                    key: 'lowStockAlerts',
                    title: 'Low Inventory Auto-Alerts',
                    desc: 'Notifies operations managers as soon as spare parts reach or fall below re-order thresholds.',
                    icon: HardDrive
                  },
                  {
                    key: 'digitalSignatures',
                    title: 'Digital Signatures Sign-Off',
                    desc: 'Requires electronic sign-off from technicians or supervisors prior to marking work orders completed.',
                    icon: FileSignature
                  },
                  {
                    key: 'aiPredictive',
                    title: 'AI Predictive Health Diagnostics',
                    desc: 'Analyzes vibration and thermal patterns to detect machine degradation prior to critical failures.',
                    icon: Sparkles
                  },
                  {
                    key: 'qrScanner',
                    title: 'QR & Barcode Scanner Integration',
                    desc: 'Enables mobile and web camera scanning for instant asset lookup and spare part retrieval.',
                    icon: QrCode
                  },
                  {
                    key: 'gpsGeofencing',
                    title: 'GPS Geofencing Verification',
                    desc: 'Ensures field technicians are located on-site when opening or resolving maintenance tasks.',
                    icon: MapPin
                  }
                ].map(item => {
                  const Icon = item.icon;
                  const isEnabled = (featureFlags as any)[item.key];
                  return (
                    <div key={item.key} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 ${isEnabled ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFeatureFlags(prev => ({ ...prev, [item.key]: !isEnabled }))}
                        className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {isEnabled ? (
                          <ToggleRight className="w-8 h-8 text-sky-500 fill-sky-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-300" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Roles & Permissions Matrix */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Roles & Permissions Matrix</h3>
                <p className="text-xs text-slate-500">Production authorization policies enforced across user tiers.</p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <th className="py-3 px-4">Module / Resource</th>
                      <th className="py-3 px-4 text-center">Administrator</th>
                      <th className="py-3 px-4 text-center">Operations Manager</th>
                      <th className="py-3 px-4 text-center">Field Technician</th>
                      <th className="py-3 px-4 text-center">Operator / Requester</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {[
                      { module: 'Work Orders', admin: 'Full (CRUD)', manager: 'Full (CRUD)', tech: 'View + Update + Tasks', req: 'Submit & View Own' },
                      { module: 'Assets & Equipment', admin: 'Full (CRUD)', manager: 'Full (CRUD)', tech: 'View + Change Status', req: 'Read-only' },
                      { module: 'Preventive Maintenance (PM)', admin: 'Full (CRUD)', manager: 'Full (CRUD)', tech: 'Execute & Log', req: 'No Access' },
                      { module: 'Parts & Inventory', admin: 'Full (CRUD)', manager: 'Full (CRUD)', tech: 'Issue to Work Order', req: 'No Access' },
                      { module: 'Analytics & Reports', admin: 'Full BI Access', manager: 'Full BI Access', tech: 'Technical KPIs', req: 'No Access' },
                      { module: 'Settings & Backups', admin: 'Full Superuser', manager: 'No Access', tech: 'No Access', req: 'No Access' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-800">{row.module}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                            {row.admin}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                            {row.manager}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                            {row.tech}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                            {row.req}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Checklists Templates */}
        {activeTab === 'checklists' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Standard Checklist Templates</h3>
                <p className="text-xs text-slate-500">Reusable SOP procedures attached to work orders and preventive maintenance routines.</p>
              </div>
              <button
                onClick={() => setShowAddChecklistModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Template</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checklists.map(chk => (
                <div key={chk.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        {chk.id}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">{chk.category}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs">{chk.title}</h4>

                    <div className="mt-3 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Checklist Items ({chk.items.length}):</span>
                      {chk.items.map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-700 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                    Ready for Work Orders & PM
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Integrations & Webhooks */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">System Integrations & Webhooks</h3>
                <p className="text-xs text-slate-500">Connect NEX CMMS with external ERP systems, cloud endpoints, and instant messaging channels.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">REST API & Webhooks</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      🟢 Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Endpoint: <code className="font-mono text-sky-700">/api/v1/work-orders</code></p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">Media & File Storage</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      🟢 Active (/uploads/)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Server: <code className="font-mono text-sky-700">Nginx Fast-Storage Bucket</code></p>
                </div>
              </div>

              {/* Slack / Teams Webhook configuration */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-sky-600" />
                  <span>Slack / Microsoft Teams Webhook</span>
                </h4>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {webhookTested ? 'Test Notification Sent! ✓' : 'Test Connection'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Checklist Modal */}
      {showAddChecklistModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Create Standard Checklist Template</h3>
            <form onSubmit={handleCreateChecklist} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Air Compressor PM Checklist"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={newChecklistCategory}
                  onChange={(e) => setNewChecklistCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="General">General</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Electrical & Power">Electrical & Power</option>
                  <option value="Pumps & Hydraulics">Pumps & Hydraulics</option>
                  <option value="Safety & Fire">Safety & Fire</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Checklist Items (One per line) *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Check oil level&#10;Inspect drive belts&#10;Verify pressure safety valve"
                  value={newChecklistItemsText}
                  onChange={(e) => setNewChecklistItemsText(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChecklistModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
