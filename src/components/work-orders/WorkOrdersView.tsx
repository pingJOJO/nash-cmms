import React, { useState } from 'react';
import { 
  Filter, 
  Search, 
  Plus, 
  MoreVertical, 
  ChevronDown, 
  Calendar as CalendarIcon, 
  Columns, 
  List, 
  Users, 
  Info, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  RotateCcw,
  Activity
} from 'lucide-react';
import { WorkOrder, WorkOrderStatus, Priority } from '../../types/cmms';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { t, isArabicLang } from '../../utils/translations';

export type WorkOrderViewMode = 'list' | 'calendar' | 'workload' | 'column';

interface WorkOrdersViewProps {
  workOrders: WorkOrder[];
  onSelectWorkOrder: (wo: WorkOrder) => void;
  onOpenCreateModal: () => void;
  language?: string;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  workOrders,
  onSelectWorkOrder,
  onOpenCreateModal,
  language
}) => {
  const isAr = isArabicLang(language);
  const [viewMode, setViewMode] = useState<WorkOrderViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');
  const [showStatusFilterMenu, setShowStatusFilterMenu] = useState(false);
  const [showPriorityFilterMenu, setShowPriorityFilterMenu] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(true);

  // Filtered work orders
  const filteredOrders = workOrders.filter(wo => {
    const matchesSearch = 
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assetName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      selectedStatusFilter === 'ALL' || wo.status === selectedStatusFilter;

    const matchesPriority = 
      selectedPriorityFilter === 'ALL' || wo.priority === selectedPriorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + rowsPerPage);

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Location', 'Asset', 'Assigned To', 'Due Date', 'Category'];
    const rows = filteredOrders.map(o => [
      `"${o.id}"`,
      `"${o.title.replace(/"/g, '""')}"`,
      `"${o.status}"`,
      `"${o.priority}"`,
      `"${o.locationName}"`,
      `"${o.assetName}"`,
      `"${o.assignedToName}"`,
      `"${o.dueDate}"`,
      `"${o.category}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nex_work_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMoreMenu(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      {/* View Switcher Bar & Main Actions */}
      <div className="px-6 pt-5 pb-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            {t.workOrders.views.list[isAr ? 'ar' : 'en']}
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            {t.workOrders.views.calendar[isAr ? 'ar' : 'en']}
          </button>
          <button
            onClick={() => setViewMode('workload')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'workload'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {t.workOrders.views.workload[isAr ? 'ar' : 'en']}
          </button>
          <button
            onClick={() => setViewMode('column')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'column'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            {t.workOrders.views.column[isAr ? 'ar' : 'en']}
          </button>
        </div>

        {/* Right: + Work Order Unified Button & Options */}
        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            title={isAr ? 'خيارات إضافية' : 'More Options'}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <div className={`absolute ${isAr ? 'left-0' : 'right-0'} top-12 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150`}>
              <button
                onClick={handleExportCSV}
                className="w-full text-start px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{t.workOrders.exportCsv[isAr ? 'ar' : 'en']}</span>
              </button>
              <button
                onClick={() => { setShowMoreMenu(false); window.print(); }}
                className="w-full text-start px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600 shrink-0" />
                <span>{t.workOrders.printReport[isAr ? 'ar' : 'en']}</span>
              </button>
              <button
                onClick={() => {
                  setSelectedStatusFilter('ALL');
                  setSelectedPriorityFilter('ALL');
                  setSearchQuery('');
                  setShowMoreMenu(false);
                }}
                className="w-full text-start px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
              >
                <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{t.workOrders.resetFilters[isAr ? 'ar' : 'en']}</span>
              </button>
            </div>
          )}

          {/* Unified Solid Primary Button (+ Work Order) - No broken split */}
          <button
            id="open-create-wo-btn"
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.workOrders.newWorkOrder[isAr ? 'ar' : 'en']}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      {showFilterBar && (
        <div className="px-6 py-2.5 flex flex-wrap items-center gap-3 animate-in fade-in duration-200">
          {/* Filter Toggle */}
          <button 
            onClick={() => {
              if (selectedStatusFilter !== 'ALL' || selectedPriorityFilter !== 'ALL') {
                setSelectedStatusFilter('ALL');
                setSelectedPriorityFilter('ALL');
              } else {
                setSelectedStatusFilter('OPEN');
              }
            }}
            title="Toggle Open Filters"
            className={`p-2.5 border rounded-xl transition-colors cursor-pointer shadow-2xs ${
              selectedStatusFilter !== 'ALL' || selectedPriorityFilter !== 'ALL'
                ? 'bg-sky-50 text-sky-600 border-sky-300'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Priority Filter Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPriorityFilterMenu(!showPriorityFilterMenu);
                setShowStatusFilterMenu(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span>{isAr ? 'الأولوية:' : 'Priority:'} {selectedPriorityFilter === 'ALL' ? (isAr ? 'الكل' : 'All') : selectedPriorityFilter}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {showPriorityFilterMenu && (
              <div className={`absolute ${isAr ? 'right-0' : 'left-0'} mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-xs`}>
                <button
                  onClick={() => { setSelectedPriorityFilter('ALL'); setShowPriorityFilterMenu(false); setCurrentPage(1); }}
                  className="w-full text-start px-3 py-1.5 hover:bg-slate-50 font-medium text-slate-700 cursor-pointer"
                >
                  {isAr ? 'جميع الأولويات' : 'All Priorities'}
                </button>
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as Priority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => { setSelectedPriorityFilter(p); setShowPriorityFilterMenu(false); setCurrentPage(1); }}
                    className="w-full text-start px-3 py-1.5 hover:bg-slate-50 font-medium text-slate-700 cursor-pointer flex items-center justify-between"
                  >
                    <span>{p}</span>
                    <PriorityBadge priority={p} language={language} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStatusFilterMenu(!showStatusFilterMenu);
                setShowPriorityFilterMenu(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full border-2 border-sky-500" />
              <span>{isAr ? 'الحالة:' : 'Status:'} {selectedStatusFilter === 'ALL' ? (isAr ? 'الكل' : 'All') : selectedStatusFilter}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {showStatusFilterMenu && (
              <div className={`absolute ${isAr ? 'right-0' : 'left-0'} mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-xs`}>
                <button
                  onClick={() => { setSelectedStatusFilter('ALL'); setShowStatusFilterMenu(false); setCurrentPage(1); }}
                  className="w-full text-start px-3 py-1.5 hover:bg-slate-50 font-medium text-slate-700 cursor-pointer"
                >
                  {isAr ? 'جميع الحالات' : 'All Statuses'}
                </button>
                {(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'] as WorkOrderStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => { setSelectedStatusFilter(s); setShowStatusFilterMenu(false); setCurrentPage(1); }}
                    className="w-full text-start px-3 py-1.5 hover:bg-slate-50 font-medium text-slate-700 cursor-pointer flex items-center justify-between"
                  >
                    <span>{s}</span>
                    <StatusBadge status={s} language={language} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Box with correct RTL icon and padding */}
          <div className="flex-1 min-w-[200px] max-w-md relative">
            <Search className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-2.5`} />
            <input
              type="text"
              placeholder={t.workOrders.searchPlaceholder[isAr ? 'ar' : 'en']}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className={`w-full ${isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs`}
            />
          </div>
        </div>
      )}

      {/* Main Viewport Content */}
      <div className="flex-1 px-6 py-2 overflow-auto">
        {viewMode === 'list' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none text-start">
                    <th className="py-3 px-4 w-24 text-start">{t.workOrders.columns.id[isAr ? 'ar' : 'en']}</th>
                    <th className="py-3 px-4 w-32 text-start">{t.workOrders.columns.status[isAr ? 'ar' : 'en']}</th>
                    <th className="py-3 px-4 min-w-[180px] text-start">{t.workOrders.columns.title[isAr ? 'ar' : 'en']}</th>
                    <th className="py-3 px-4 w-24 text-start">{t.workOrders.columns.priority[isAr ? 'ar' : 'en']}</th>
                    <th className="py-3 px-4 min-w-[220px] text-start">{t.workOrders.columns.description[isAr ? 'ar' : 'en']}</th>
                    <th className="py-3 px-4 w-32 text-start">{t.workOrders.columns.assignedTo[isAr ? 'ar' : 'en']}</th>
                    <th className="py-3 px-4 min-w-[140px] text-start">{t.workOrders.columns.locationName[isAr ? 'ar' : 'en']}</th>
                    <th className="py-3 px-4 min-w-[160px] text-start">{t.workOrders.columns.locationAddress[isAr ? 'ar' : 'en']}</th>
                    <th className="py-3 px-4 w-28 text-start">{t.workOrders.columns.category[isAr ? 'ar' : 'en']}</th>
                    <th className="py-3 px-4 w-32 text-start">{t.workOrders.columns.asset[isAr ? 'ar' : 'en']}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 text-start">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        {isAr ? 'لم يتم العثور على أوامر عمل تطابق معايير البحث.' : 'No work orders found matching your filter criteria.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map(wo => (
                      <tr 
                        key={wo.id}
                        onClick={() => onSelectWorkOrder(wo)}
                        className="hover:bg-sky-50/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-sky-600 text-start">
                          {wo.id}
                        </td>
                        <td className="py-3.5 px-4 text-start">
                          <StatusBadge status={wo.status} language={language} />
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-start">
                          {wo.title}
                        </td>
                        <td className="py-3.5 px-4 text-start">
                          <PriorityBadge priority={wo.priority} language={language} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate text-start">
                          {wo.description}
                        </td>
                        <td className="py-3.5 px-4 text-start">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center ring-1 ring-slate-300 shrink-0">
                              {wo.assignedToAvatar || 'O'}
                            </span>
                            <span className="truncate">{typeof wo.assignedToName === 'object' ? (wo.assignedToName as any)?.name : (wo.assignedToName || 'Technician')}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 text-start">
                          {wo.locationName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 truncate max-w-xs text-start">
                          {wo.locationAddress || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-start">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                            {typeof wo.category === 'object' ? (wo.category as any)?.name || 'General' : (wo.category || 'General')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-sky-600 text-start">
                          {wo.assetName}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (Bilingual & RTL Aware) */}
            <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>{isAr ? 'الصفوف بالصفحة:' : 'Rows per page:'}</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-slate-300 rounded px-2 py-1 bg-white text-xs text-slate-700 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span>
                  {filteredOrders.length === 0 ? '0-0 of 0' : `${startIndex + 1}-${Math.min(startIndex + rowsPerPage, filteredOrders.length)} ${isAr ? 'من' : 'of'} ${filteredOrders.length}`}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage <= 1}
                    title={isAr ? 'الصفحة الأولى' : 'First Page'}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isAr ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    title={isAr ? 'الصفحة السابقة' : 'Previous Page'}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                  <span className="px-2 font-bold text-slate-700">
                    {isAr ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    title={isAr ? 'الصفحة التالية' : 'Next Page'}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage >= totalPages}
                    title={isAr ? 'الصفحة الأخيرة' : 'Last Page'}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isAr ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Column View (Kanban) */}
        {viewMode === 'column' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full items-start">
            {(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'] as WorkOrderStatus[]).map(status => {
              const columnOrders = filteredOrders.filter(o => o.status === status);
              return (
                <div key={status} className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200 flex flex-col max-h-[75vh]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={status} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {columnOrders.length}
                    </span>
                  </div>

                  <div className="space-y-3 overflow-y-auto mt-3 flex-1 pr-1">
                    {columnOrders.map(wo => (
                      <div
                        key={wo.id}
                        onClick={() => onSelectWorkOrder(wo)}
                        className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 hover:border-sky-500 transition-all cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 group-hover:text-sky-600">{wo.id}</span>
                          <PriorityBadge priority={wo.priority} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600">{wo.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{wo.description}</p>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">{typeof wo.assetName === 'object' ? (wo.assetName as any)?.name : (wo.assetName || 'General Asset')}</span>
                          <span>{(typeof wo.assignedToName === 'string' ? wo.assignedToName : (wo.assignedToName as any)?.name || 'Tech').split(' ')[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Calendar View Placeholder */}
        {viewMode === 'calendar' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">September 2026 Maintenance Schedule</h3>
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-600">
                <span>Month View</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 mt-4 text-center text-xs font-bold text-slate-500">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-2 bg-slate-50 rounded-lg">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2 text-xs">
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                const matches = filteredOrders.filter(o => o.dueDate.includes(`09/${day < 10 ? '0' : ''}${day}`));
                return (
                  <div key={i} className="min-h-[90px] p-2 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-sky-50/30 transition-colors">
                    <span className="font-bold text-slate-600 block text-right">{day}</span>
                    {matches.map(m => (
                      <div 
                        key={m.id} 
                        onClick={() => onSelectWorkOrder(m)}
                        className="mt-1 p-1 bg-sky-500 text-white rounded text-[10px] truncate font-semibold cursor-pointer shadow-2xs"
                      >
                        {m.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Workload View Placeholder */}
        {viewMode === 'workload' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Technician Workload & Hours</h3>
            {['Omar Dabobash', 'Sarah Connor', 'Alex Chen'].map(tech => {
              const techOrders = filteredOrders.filter(o => o.assignedToName.includes(tech));
              return (
                <div key={tech} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{tech}</span>
                    <span className="text-slate-500">{techOrders.length} Active Jobs Assigned</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div 
                      className="bg-sky-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, techOrders.length * 35)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Info Banner (Matches Atlas) */}
      {showBanner && (
        <div className="mx-6 mb-4 p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs text-sky-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{isAr ? 'يمكنك مسح أو تعديل البيانات التجريبية من شاشة الإعدادات في أي وقت.' : 'You can delete demo data from General Settings at any time.'}</span>
          </div>
          <button 
            onClick={() => setShowBanner(false)}
            className="text-sky-600 hover:text-sky-900 p-1 rounded-lg hover:bg-sky-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
