import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  ChevronDown, 
  Zap, 
  Download, 
  RotateCcw, 
  Check, 
  Filter,
  Calendar,
  Layers,
  CheckSquare,
  Square,
  Clock,
  User,
  MapPin,
  ClipboardCheck,
  X,
  Sparkles
} from 'lucide-react';
import { PreventiveMaintenance, Priority } from '../../types/cmms';
import { PriorityBadge } from '../common/Badge';

interface PMViewProps {
  pms: PreventiveMaintenance[];
  onAddPM: (pm: PreventiveMaintenance) => void;
  onTriggerNow?: (pm: PreventiveMaintenance) => void;
}

export const PreventiveMaintenanceView: React.FC<PMViewProps> = ({ pms, onAddPM, onTriggerNow }) => {
  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'ALL'>('ALL');
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [triggeredId, setTriggeredId] = useState<string | null>(null);

  // Detail & Checklist Modal State
  const [selectedPM, setSelectedPM] = useState<PreventiveMaintenance | null>(null);
  const [pmChecklist, setPmChecklist] = useState<Array<{ id: string; text: string; done: boolean }>>([]);
  const [checklistSaved, setChecklistSaved] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [workOrderTitle, setWorkOrderTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [frequency, setFrequency] = useState('Monthly');
  const [locationName, setLocationName] = useState('Warehouse A');
  const [category, setCategory] = useState('HVAC');

  const filteredPMs = pms.filter(pm => {
    const matchesSearch = 
      pm.name.toLowerCase().includes(search.toLowerCase()) ||
      pm.workOrderTitle.toLowerCase().includes(search.toLowerCase()) ||
      pm.locationName.toLowerCase().includes(search.toLowerCase()) ||
      pm.category.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = selectedPriority === 'ALL' || pm.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const handleOpenDetail = (pm: PreventiveMaintenance) => {
    setSelectedPM(pm);
    setChecklistSaved(false);
    // Initialize standard checklist for this PM schedule
    setPmChecklist([
      { id: '1', text: `فحص السلامة العام وإيقاف التشغيل الآمن لـ ${pm.name}`, done: true },
      { id: '2', text: 'فحص التوصيلات الكهربائية وقراءات الفولتية والأمبيرية', done: false },
      { id: '3', text: 'تشحيم المحامل والمحركات وتنظيف فلاتر الهواء/الزيت', done: false },
      { id: '4', text: 'معايرة الحساسات والتأكد من توافق القراءات مع المعايير القياسية', done: false },
      { id: '5', text: 'إعادة التشغيل التجريبي وتسجيل قراءات عداد التشغيل في النظام', done: false }
    ]);
  };

  const handleToggleChecklistItem = (id: string) => {
    setPmChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
    setChecklistSaved(false);
  };

  const handleSaveChecklist = () => {
    setChecklistSaved(true);
    setTimeout(() => setChecklistSaved(false), 3000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPM({
      id: `PM${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      workOrderTitle: workOrderTitle || name,
      priority,
      description: `Automated scheduled trigger: ${frequency}`,
      frequency,
      nextWorkOrder: '10/15/26',
      worker: 'Omar Dabobash',
      assignedTo: 'Omar Dabobash',
      locationName,
      category
    });
    setShowModal(false);
    setName('');
    setWorkOrderTitle('');
  };

  const handleTrigger = (pm: PreventiveMaintenance) => {
    setTriggeredId(pm.id);
    if (onTriggerNow) {
      onTriggerNow(pm);
    }
    setTimeout(() => {
      setTriggeredId(null);
    }, 2500);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Work Order Title', 'Priority', 'Frequency', 'Next Date', 'Worker', 'Location', 'Category'];
    const rows = filteredPMs.map(p => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.workOrderTitle.replace(/"/g, '""')}"`,
      `"${p.priority}"`,
      `"${p.frequency}"`,
      `"${p.nextWorkOrder}"`,
      `"${p.worker}"`,
      `"${p.locationName}"`,
      `"${p.category}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PM_Schedules_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      {/* Search & Actions Bar */}
      <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Interactive Priority Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPriorityMenu(!showPriorityMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-sky-600" />
              <span>Priority: {selectedPriority === 'ALL' ? 'All' : selectedPriority}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showPriorityMenu && (
              <div className="absolute left-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in slide-in-from-top-1 text-xs">
                {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPriority(p);
                      setShowPriorityMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 ${
                      selectedPriority === p ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{p === 'ALL' ? 'All Priorities' : p}</span>
                    {selectedPriority === p && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search preventive maintenance schedules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Options Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              title="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in text-xs">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-sky-600" />
                  <span>Export to CSV</span>
                </button>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedPriority('ALL');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium border-t border-slate-100"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset Filters</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create PM Trigger</span>
          </button>
        </div>
      </div>

      {/* PM Table */}
      <div className="flex-1 px-6 py-2 overflow-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-20">ID</th>
                  <th className="py-3.5 px-4 min-w-[170px]">Name</th>
                  <th className="py-3.5 px-4 min-w-[190px]">Work Order Title</th>
                  <th className="py-3.5 px-4 w-24">Priority</th>
                  <th className="py-3.5 px-4 w-28">Frequency</th>
                  <th className="py-3.5 px-4 w-32">Next Scheduled</th>
                  <th className="py-3.5 px-4 w-32">Worker</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Location</th>
                  <th className="py-3.5 px-4 w-24">Category</th>
                  <th className="py-3.5 px-4 w-32 text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredPMs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No preventive maintenance schedules match current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPMs.map(pm => (
                    <tr 
                      key={pm.id} 
                      onClick={() => handleOpenDetail(pm)}
                      className="hover:bg-sky-50/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-400 font-mono">{pm.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{pm.name}</td>
                      <td className="py-3.5 px-4 font-semibold text-sky-700">{pm.workOrderTitle}</td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={pm.priority} />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {pm.frequency}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pm.nextWorkOrder}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{pm.worker}</td>
                      <td className="py-3.5 px-4 text-slate-700">{pm.locationName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {pm.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleTrigger(pm)}
                          disabled={triggeredId === pm.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                            triggeredId === pm.id
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                          title="Generate immediate work order from this schedule"
                        >
                          {triggeredId === pm.id ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Triggered!</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                              <span>Run Now</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PM Detail & Interactive Checklist Modal */}
      {selectedPM && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">{selectedPM.id}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedPM.frequency}
                </span>
                <PriorityBadge priority={selectedPM.priority} />
              </div>
              <button
                onClick={() => setSelectedPM(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{selectedPM.name}</h3>
              <p className="text-xs text-sky-700 font-semibold">{selectedPM.workOrderTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Next Due: <strong>{selectedPM.nextWorkOrder}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned: <strong>{selectedPM.worker}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Location: <strong>{selectedPM.locationName}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Category: <strong>{selectedPM.category}</strong></span>
              </div>
            </div>

            {/* Interactive Checklist Section */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                  <span>قائمة مهام الصيانة الوقائية (Inspection Checklist):</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {pmChecklist.filter(i => i.done).length} / {pmChecklist.length} مكتمل
                </span>
              </div>

              <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                {pmChecklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 hover:border-sky-300 transition cursor-pointer"
                  >
                    {item.done ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-xs ${item.done ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {checklistSaved && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تم حفظ حالة مهام الصيانة الوقائية بنجاح!</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleTrigger(selectedPM)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Run Now (إصدار أمر عمل فوري)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveChecklist}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  حفظ التقرير (Save)
                </button>
                <button
                  onClick={() => setSelectedPM(null)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add PM Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Create Maintenance Trigger</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Trigger Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Chiller Inspection"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Generated Work Order Title</label>
                <input
                  type="text"
                  placeholder="e.g. Execute 500-hour comprehensive inspection"
                  value={workOrderTitle}
                  onChange={(e) => setWorkOrderTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Daily">Daily (يومي)</option>
                    <option value="Weekly">Weekly (أسبوعي)</option>
                    <option value="Bi-Weekly">Bi-Weekly (كل أسبوعين)</option>
                    <option value="Monthly">Monthly (شهري)</option>
                    <option value="Quarterly">Quarterly (ربع سنوي)</option>
                    <option value="Annually">Annually (سنوي)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Location</label>
                  <select
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Warehouse A">Warehouse A</option>
                    <option value="Main Building">Main Building</option>
                    <option value="Production Floor">Production Floor</option>
                    <option value="Boiler Room">Boiler Room</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold cursor-pointer shadow-xs"
                >
                  Create Trigger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
