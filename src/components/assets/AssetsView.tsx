import React, { useState } from 'react';
import { Search, Plus, RotateCw, MoreVertical, ChevronDown, FileCheck2, ShieldAlert } from 'lucide-react';
import { Asset, AssetStatus, RiskLevel } from '../../types/cmms';
import { AssetStatusBadge } from '../common/Badge';
import { AssetLifeFileModal } from './AssetLifeFileModal';

interface AssetsViewProps {
  assets: Asset[];
  onAddAsset: (asset: Asset) => void;
  onUpdateAsset?: (id: string, updates: Partial<Asset>) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({ assets, onAddAsset, onUpdateAsset }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [lifeFileAssetId, setLifeFileAssetId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<AssetStatus>('OPERATIONAL');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
  const [locationName, setLocationName] = useState('Warehouse A');
  const [model, setModel] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('HVAC Unit');
  const [description, setDescription] = useState('');

  const getCategoryName = (cat: any): string => {
    if (!cat) return 'General';
    if (typeof cat === 'object') return cat.name || 'General';
    return String(cat);
  };

  const getLocationName = (asset: any): string => {
    if (asset.locationName && typeof asset.locationName === 'string') return asset.locationName;
    if (asset.location && typeof asset.location === 'object') return asset.location.name || 'Main Plant';
    return typeof asset.locationName === 'object' ? asset.locationName.name || 'Main Plant' : 'Main Plant';
  };

  const getWorkerName = (asset: any): string => {
    if (asset.primaryWorker && typeof asset.primaryWorker === 'string') return asset.primaryWorker;
    if (asset.primaryWorker && typeof asset.primaryWorker === 'object') return asset.primaryWorker.name || 'Technician';
    return 'Technician';
  };

  const filteredAssets = assets.filter(a =>
    (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
    getCategoryName(a.category).toLowerCase().includes(search.toLowerCase()) ||
    getLocationName(a).toLowerCase().includes(search.toLowerCase()) ||
    (a.barcode || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Status', 'Location', 'Area', 'Model', 'Barcode', 'Category', 'Worker'];
    const rows = filteredAssets.map(a => [
      `"${a.id}"`,
      `"${(a.name || '').replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${getLocationName(a)}"`,
      `"${a.area || ''}"`,
      `"${a.model || ''}"`,
      `"${a.barcode}"`,
      `"${getCategoryName(a.category)}"`,
      `"${getWorkerName(a)}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `nex_assets_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMoreMenu(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddAsset({
      id: `AST-${Date.now().toString().slice(-4)}`,
      name,
      status,
      locationName,
      model: model || 'N/A',
      barcode: barcode || `BC-${Math.floor(10000 + Math.random() * 90000)}`,
      category,
      description,
      primaryWorker: 'Omar Dabobash',
      createdAt: '09/10/26'
    });
    setShowModal(false);
    setName('');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      {/* Search & Actions Bar */}
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search assets by name, barcode, location, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 relative">
          <button 
            onClick={handleRefresh}
            title="Refresh Assets"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>
          <button 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            title="More Options"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-24 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 flex items-center gap-2 cursor-pointer"
              >
                📥 Export Assets to CSV
              </button>
            </div>
          )}

          <div className="inline-flex rounded-xl shadow-md shadow-sky-500/20">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white text-xs font-bold rounded-l-xl transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Asset
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-2 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-r-xl border-l border-sky-400/30 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="flex-1 px-6 py-2 overflow-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-24">ID</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Name</th>
                  <th className="py-3.5 px-4 w-32">Status</th>
                  <th className="py-3.5 px-4 w-28">Risk Level</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Location</th>
                  <th className="py-3.5 px-4 w-28">Area</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Model</th>
                  <th className="py-3.5 px-4 w-28">Barcode</th>
                  <th className="py-3.5 px-4 w-28">Category</th>
                  <th className="py-3.5 px-4 w-36">Equipment Life File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAssets.map(asset => (
                  <tr 
                    key={asset.id} 
                    onClick={() => setSelectedAsset(asset)}
                    className="hover:bg-sky-50/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-400">{asset.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{asset.name}</td>
                    <td className="py-3.5 px-4">
                      <AssetStatusBadge status={asset.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        asset.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                        asset.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                        'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      }`}>
                        {asset.riskLevel === 'HIGH' ? '🔴 HIGH (A)' :
                         asset.riskLevel === 'MEDIUM' ? '🟡 MED (B)' :
                         '🟢 LOW (C)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{getLocationName(asset)}</td>
                    <td className="py-3.5 px-4 text-slate-500">{asset.area || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{asset.model || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{asset.barcode}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {getCategoryName(asset.category)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => { e.stopPropagation(); setLifeFileAssetId(asset.id); }}>
                      <button 
                        type="button"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold transition shadow-xs cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>سجل الحياة (HCAC)</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add New Asset</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COMPRESSOR-02"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AssetStatus)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="OPERATIONAL">Operational</option>
                    <option value="DOWN">Down</option>
                    <option value="EMERGENCY_SHUTDOWN">Emergency Shutdown</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Location</label>
                  <select
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Warehouse A">Warehouse A</option>
                    <option value="Main Building">Main Building</option>
                    <option value="Production Floor">Production Floor</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Manufacturer / Model"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Barcode</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="BC-XXXXX"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
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
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
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
                  Create Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Detail & Status Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">{selectedAsset.id}</span>
                <AssetStatusBadge status={selectedAsset.status} />
              </div>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">{selectedAsset.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedAsset.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Location</span>
                <span className="font-bold text-slate-800">{getLocationName(selectedAsset)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Area</span>
                <span className="font-bold text-slate-800">{selectedAsset.area || 'Main Area'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Model</span>
                <span className="font-bold text-slate-800">{selectedAsset.model || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Barcode</span>
                <span className="font-mono font-bold text-sky-700">{selectedAsset.barcode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Category</span>
                <span className="font-bold text-slate-800">{getCategoryName(selectedAsset.category)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Primary Worker</span>
                <span className="font-bold text-slate-800">{getWorkerName(selectedAsset)}</span>
              </div>
            </div>

            {/* Quick Status Changer */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block">Update Operational Status:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['OPERATIONAL', 'DOWN', 'MAINTENANCE'] as AssetStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      if (onUpdateAsset) {
                        onUpdateAsset(selectedAsset.id, { status: st });
                      }
                      setSelectedAsset(prev => prev ? { ...prev, status: st } : null);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedAsset.status === st
                        ? st === 'OPERATIONAL' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-400 shadow-xs'
                          : st === 'DOWN'
                          ? 'bg-rose-50 text-rose-700 border-rose-400 shadow-xs'
                          : 'bg-amber-50 text-amber-700 border-amber-400 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Life File Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const id = selectedAsset.id;
                  setSelectedAsset(null);
                  setLifeFileAssetId(id);
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>فتح سجل حياة الجهاز المعتمد (Equipment Life File — HCAC/JCI)</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Life File Dossier Modal */}
      {lifeFileAssetId && (
        <AssetLifeFileModal
          isOpen={!!lifeFileAssetId}
          assetId={lifeFileAssetId}
          onClose={() => setLifeFileAssetId(null)}
        />
      )}
    </div>
  );
};
