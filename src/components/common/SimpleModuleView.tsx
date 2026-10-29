import React, { useState } from 'react';
import { Plus, MoreVertical, ChevronDown, Search, Download, Trash2, Edit2 } from 'lucide-react';

export interface ColumnConfig {
  key: string;
  label: string;
}

interface SimpleModuleViewProps {
  title: string;
  subtitle?: string;
  description?: string;
  buttonLabel?: string;
  actionLabel?: string;
  columns: (string | ColumnConfig)[];
  rows?: Record<string, any>[];
  data?: Record<string, any>[];
  onAddClick?: () => void;
  onEditClick?: (row: any) => void;
  onDeleteClick?: (row: any) => void;
}

export const SimpleModuleView: React.FC<SimpleModuleViewProps> = ({
  title,
  subtitle,
  description,
  buttonLabel,
  actionLabel,
  columns,
  rows,
  data,
  onAddClick,
  onEditClick,
  onDeleteClick
}) => {
  const [search, setSearch] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const displaySubtitle = subtitle || description || '';
  const displayButtonLabel = buttonLabel || actionLabel || 'Add Item';
  const tableRows = rows || data || [];

  const normalizedColumns: ColumnConfig[] = columns.map(col => {
    if (typeof col === 'string') {
      return { key: col, label: col };
    }
    return col;
  });

  const getDisplayValue = (val: any): string => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'object') {
      return val.name || val.title || val.label || val.id || '—';
    }
    return String(val);
  };

  const filteredRows = tableRows.filter(row => {
    if (!search.trim()) return true;
    return Object.values(row).some(val => 
      getDisplayValue(val).toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleExport = () => {
    const headers = normalizedColumns.map(c => c.label);
    const csvRows = filteredRows.map(row => 
      normalizedColumns.map(c => `"${getDisplayValue(row[c.key]).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{displaySubtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${title}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl cursor-pointer"
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={handleExport}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-sky-600" />
                  Export to CSV
                </button>
              </div>
            )}
          </div>

          <div className="inline-flex rounded-xl shadow-md shadow-sky-500/20">
            <button
              onClick={onAddClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white text-xs font-bold rounded-l-xl transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {displayButtonLabel}
            </button>
            <button
              onClick={onAddClick}
              className="px-2 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-r-xl border-l border-sky-400/30 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {normalizedColumns.map(col => (
                    <th key={col.key} className="py-3 px-4">{col.label}</th>
                  ))}
                  {(onEditClick || onDeleteClick) && (
                    <th className="py-3 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={normalizedColumns.length + ((onEditClick || onDeleteClick) ? 1 : 0)} className="py-8 text-center text-slate-400">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-sky-50/40 transition-colors">
                      {normalizedColumns.map(col => (
                        <td key={col.key} className="py-3.5 px-4 font-medium">
                          {getDisplayValue(row[col.key])}
                        </td>
                      ))}
                      {(onEditClick || onDeleteClick) && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onEditClick && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditClick(row);
                                }}
                                title="Edit Record"
                                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDeleteClick && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteClick(row);
                                }}
                                title="Delete Record"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

