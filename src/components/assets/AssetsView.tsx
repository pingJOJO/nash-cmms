import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  RotateCw, 
  MoreVertical, 
  ChevronDown, 
  FileCheck2, 
  ShieldAlert,
  QrCode,
  Printer,
  Edit3,
  Trash2,
  Smartphone,
  Check,
  AlertTriangle,
  Sparkles,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Asset, AssetStatus, RiskLevel } from '../../types/cmms';
import { AssetStatusBadge } from '../common/Badge';
import { AssetLifeFileModal } from './AssetLifeFileModal';
import { AssetQRModal } from './AssetQRModal';
import { MobileQRScanReportModal } from '../work-orders/MobileQRScanReportModal';

interface AssetsViewProps {
  assets: Asset[];
  onAddAsset: (asset: Asset) => void;
  onUpdateAsset?: (id: string, updates: Partial<Asset>) => void;
  onDeleteAsset?: (id: string) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({ 
  assets, 
  onAddAsset, 
  onUpdateAsset,
  onDeleteAsset 
}) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [lifeFileAssetId, setLifeFileAssetId] = useState<string | null>(null);
  const [qrModalAsset, setQrModalAsset] = useState<Asset | null>(null);
  const [mobileScanAsset, setMobileScanAsset] = useState<Asset | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // New Asset Form State
  const [name, setName] = useState('');
  const [status, setStatus] = useState<AssetStatus>('OPERATIONAL');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
  const [locationName, setLocationName] = useState('Main Hospital Wing');
  const [model, setModel] = useState('');
  const [barcode, setBarcode] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(12500);
  const [purchaseDate, setPurchaseDate] = useState('2024-01-15');
  const [warrantyExpiry, setWarrantyExpiry] = useState('2027-01-15');
  const [category, setCategory] = useState('Medical Equipment');
  const [description, setDescription] = useState('');

  // Edit Asset Form State
  const [editName, setEditName] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editRiskLevel, setEditRiskLevel] = useState<RiskLevel>('LOW');

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
    const headers = ['ID', 'Name', 'Status', 'Risk Level', 'Location', 'Model', 'Barcode', 'Category', 'Purchase Price'];
    const rows = filteredAssets.map(a => [
      `"${a.id}"`,
      `"${(a.name || '').replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.riskLevel || 'LOW'}"`,
      `"${getLocationName(a)}"`,
      `"${a.model || ''}"`,
      `"${a.barcode}"`,
      `"${getCategoryName(a.category)}"`,
      `"${a.purchasePrice || 0}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `NexCMMS_Assets_${new Date().toISOString().slice(0, 10)}.csv`;
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
      riskLevel,
      locationName,
      model: model || 'N/A',
      barcode: barcode || `BC-${Math.floor(10000 + Math.random() * 90000)}`,
      category,
      description,
      purchasePrice,
      purchaseDate,
      warrantyExpiry,
      primaryWorker: 'Omar Dabobash',
      createdAt: new Date().toISOString()
    });

    setShowModal(false);
    setName('');
    setModel('');
    setBarcode('');
    setDescription('');
  };

  const handleSaveEdit = () => {
    if (!selectedAsset || !onUpdateAsset) return;
    onUpdateAsset(selectedAsset.id, {
      name: editName,
      model: editModel,
      locationName: editLocation,
      riskLevel: editRiskLevel
    });
    setSelectedAsset(prev => prev ? {
      ...prev,
      name: editName,
      model: editModel,
      locationName: editLocation,
      riskLevel: editRiskLevel
    } : null);
    setIsEditing(false);
  };

  const handleDelete = (asset: Asset) => {
    if (confirm(`هل أنت متأكد من حذف أو أرشفة الأصل: "${asset.name}" (${asset.id})؟`)) {
      onDeleteAsset?.(asset.id);
      setSelectedAsset(null);
    }
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
            <div className="absolute right-24 top-12 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 flex items-center gap-2 cursor-pointer"
              >
                📥 Export Assets to CSV
              </button>
            </div>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="flex-1 px-6 py-2 overflow-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-20">ID</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Name</th>
                  <th className="py-3.5 px-4 w-28">Status</th>
                  <th className="py-3.5 px-4 w-28">Risk Level</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Location</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Model</th>
                  <th className="py-3.5 px-4 w-24">Barcode</th>
                  <th className="py-3.5 px-4 w-28">QR Tag</th>
                  <th className="py-3.5 px-4 w-36">Equipment Life File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAssets.map(asset => (
                  <tr 
                    key={asset.id} 
                    onClick={() => {
                      setSelectedAsset(asset);
                      setIsEditing(false);
                    }}
                    className="hover:bg-sky-50/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-400">{asset.id}</td>
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
                        {asset.riskLevel === 'HIGH' ? '🔴 HIGH' :
                         asset.riskLevel === 'MEDIUM' ? '🟡 MED' :
                         '🟢 LOW'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{getLocationName(asset)}</td>
                    <td className="py-3.5 px-4 text-slate-600">{asset.model || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{asset.barcode}</td>
                    
                    {/* QR Action Button */}
                    <td className="py-3.5 px-4" onClick={(e) => { e.stopPropagation(); setQrModalAsset(asset); }}>
                      <button 
                        type="button"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[11px] font-bold transition shadow-2xs cursor-pointer"
                        title="Generate & Print QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5 text-sky-600" />
                        <span>QR Tag</span>
                      </button>
                    </td>

                    {/* Life File Action Button */}
                    <td className="py-3.5 px-4" onClick={(e) => { e.stopPropagation(); setLifeFileAssetId(asset.id); }}>
                      <button 
                        type="button"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold transition shadow-2xs cursor-pointer"
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

      {/* Add Asset Modal with HCAC/JCI Life Fields */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Equipment / Industrial Asset</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Asset Name (اسم المعدة) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AUTOCLAVE-01 (جهاز تعقيم بخاري)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status (الحالة)</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AssetStatus)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="OPERATIONAL">Operational (يعمل بكفاءة)</option>
                    <option value="DOWN">Down (متوقف عن العمل)</option>
                    <option value="EMERGENCY_SHUTDOWN">Emergency Shutdown (إيقاف طارئ)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Risk Level (مستوى الخطورة)</label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    <option value="HIGH">🔴 High Risk (حرج - Class A)</option>
                    <option value="MEDIUM">🟡 Medium Risk (متوسط - Class B)</option>
                    <option value="LOW">🟢 Low Risk (منخفض - Class C)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Location (الموقع/القسم)</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. ICU Wing / خط الإنتاج 1"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Model / Manufacturer</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Tuttnauer 3870E"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Serial Number (الرقم التسلسلي)</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="SN-XXXXX"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Barcode</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="BC-XXXXX"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* HCAC Life File Financial & Compliance Fields */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 block">
                  بيانات سجل الحياة والتدقيق (HCAC / JCI Audit Readiness):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">سعر الشراء (Purchase Price - USD)</label>
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">تاريخ الشراء (Purchase Date)</label>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">انتهاء الكفالة (Warranty Expiry)</label>
                    <input
                      type="date"
                      value={warrantyExpiry}
                      onChange={(e) => setWarrantyExpiry(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description & Notes (ملاحظات)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="المواصفات الفنية أو شروط المعايرة..."
                  className="w-full p-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-bold cursor-pointer shadow-md shadow-sky-500/20"
                >
                  Save & Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Detail & Actions Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">{selectedAsset.id}</span>
                <AssetStatusBadge status={selectedAsset.status} />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedAsset.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                  selectedAsset.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                  'bg-emerald-100 text-emerald-700 border border-emerald-300'
                }`}>
                  {selectedAsset.riskLevel || 'LOW'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isEditing ? (
              /* Inline Edit Mode */
              <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Asset Name</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Model</label>
                    <input 
                      type="text" 
                      value={editModel} 
                      onChange={e => setEditModel(e.target.value)} 
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs" 
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Risk Level</label>
                    <select
                      value={editRiskLevel}
                      onChange={e => setEditRiskLevel(e.target.value as RiskLevel)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      <option value="HIGH">HIGH (Class A)</option>
                      <option value="MEDIUM">MEDIUM (Class B)</option>
                      <option value="LOW">LOW (Class C)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location</label>
                  <input 
                    type="text" 
                    value={editLocation} 
                    onChange={e => setEditLocation(e.target.value)} 
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs" 
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveEdit} 
                    className="px-3 py-1.5 bg-sky-600 text-white rounded-lg font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedAsset.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedAsset.description || 'No description provided.'}</p>
              </div>
            )}

            {!isEditing && (
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
              </div>
            )}

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

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setLifeFileAssetId(selectedAsset.id);
                  setSelectedAsset(null);
                }}
                className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>سجل الحياة (Life File)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQrModalAsset(selectedAsset);
                  setSelectedAsset(null);
                }}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-sky-400" />
                <span>طباعة ملصق الـ QR</span>
              </button>
            </div>

            {/* Edit and Delete Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditName(selectedAsset.name);
                    setEditModel(selectedAsset.model || '');
                    setEditLocation(getLocationName(selectedAsset));
                    setEditRiskLevel(selectedAsset.riskLevel || 'LOW');
                    setIsEditing(true);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل الأصل</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(selectedAsset)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>أرشفة / حذف</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
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

      {/* Industrial QR Tag Modal */}
      {qrModalAsset && (
        <AssetQRModal
          isOpen={!!qrModalAsset}
          asset={qrModalAsset}
          onClose={() => setQrModalAsset(null)}
          onSimulateMobileScan={(asset) => setMobileScanAsset(asset)}
        />
      )}

      {/* 15-Second Mobile QR Scan Simulation */}
      {mobileScanAsset && (
        <MobileQRScanReportModal
          isOpen={!!mobileScanAsset}
          asset={mobileScanAsset}
          onClose={() => setMobileScanAsset(null)}
          onSuccess={(woId) => {
            console.log('Mobile QR WO generated:', woId);
          }}
        />
      )}
    </div>
  );
};
