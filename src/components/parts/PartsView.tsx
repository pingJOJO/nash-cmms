import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  ChevronDown, 
  List, 
  LayoutGrid, 
  AlertTriangle,
  Download,
  RotateCcw,
  PlusCircle,
  MinusCircle,
  Package,
  Boxes,
  CheckCircle2
} from 'lucide-react';
import { Part, ABCClass } from '../../types/cmms';

export interface PartSet {
  id: string;
  name: string;
  category: string;
  description: string;
  items: { partName: string; quantity: number; cost: number }[];
  totalCost: number;
}

const INITIAL_SETS: PartSet[] = [
  {
    id: 'SET-001',
    name: 'Centrifugal Pump Overhaul Kit',
    category: 'Pumps',
    description: 'Contains mechanical seals, EPDM O-rings, and high-temp lubricant for pump rebuilds.',
    items: [
      { partName: 'Mechanical Seal 25mm', quantity: 1, cost: 45.00 },
      { partName: 'EPDM O-Ring Set', quantity: 4, cost: 12.00 },
      { partName: 'High-Temp Bearing Grease', quantity: 1, cost: 18.50 }
    ],
    totalCost: 75.50
  },
  {
    id: 'SET-002',
    name: 'Chiller Annual Service Pack',
    category: 'HVAC',
    description: 'Replacement MERV filters, synthetic compressor oil, and pressure safety relief valves.',
    items: [
      { partName: 'HEPA Air Filter Unit', quantity: 2, cost: 68.00 },
      { partName: 'Refrigerant Pressure Valve', quantity: 1, cost: 89.00 },
      { partName: 'Synthetic Chiller Oil 5L', quantity: 1, cost: 110.00 }
    ],
    totalCost: 267.00
  },
  {
    id: 'SET-003',
    name: 'Conveyor Belt & Pulley Kit',
    category: 'Conveyors',
    description: 'Reinforced belts, tension pulleys, and sealed ball bearings for production lines.',
    items: [
      { partName: 'V-Belt B68 Reinforced', quantity: 2, cost: 32.00 },
      { partName: 'Tension Pulley 80mm', quantity: 1, cost: 42.00 },
      { partName: 'Deep Groove Ball Bearing', quantity: 2, cost: 28.00 }
    ],
    totalCost: 102.00
  }
];

interface PartsViewProps {
  parts: Part[];
  onAddPart: (part: Part) => void;
  onAdjustQuantity?: (partId: string, delta: number) => void;
  activeTab?: 'parts' | 'sets';
  onTabChange?: (tab: 'parts' | 'sets') => void;
}

export const PartsView: React.FC<PartsViewProps> = ({ 
  parts, 
  onAddPart, 
  onAdjustQuantity,
  activeTab: controlledActiveTab,
  onTabChange
}) => {
  const [localActiveTab, setLocalActiveTab] = useState<'parts' | 'sets'>('parts');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : localActiveTab;
  const setActiveTab = (tab: 'parts' | 'sets') => {
    setLocalActiveTab(tab);
    onTabChange?.(tab);
  };
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [search, setSearch] = useState('');
  const [abcFilter, setAbcFilter] = useState<'ALL' | 'A_CRITICAL' | 'B_ESSENTIAL' | 'C_GENERAL'>('ALL');
  const [showMenu, setShowMenu] = useState(false);
  const [partSets, setPartSets] = useState<PartSet[]>(INITIAL_SETS);
  const [issuedSetId, setIssuedSetId] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [cost, setCost] = useState(19.99);
  const [quantity, setQuantity] = useState(10);
  const [minQuantity, setMinQuantity] = useState(5);
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('Filters');
  const [abcClass, setAbcClass] = useState<ABCClass>('C_GENERAL');
  const [description, setDescription] = useState('');

  const filteredParts = parts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase());
    const matchesAbc = abcFilter === 'ALL' || p.abcClass === abcFilter;
    return matchesSearch && matchesAbc;
  });

  const filteredSets = partSets.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPart({
      id: `PRT-${Date.now().toString().slice(-4)}`,
      name,
      cost: Number(cost),
      quantity: Number(quantity),
      minQuantity: Number(minQuantity),
      barcode: barcode || `BC-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      abcClass,
      description,
      assignedTo: 'Omar Dabobash',
      createdAt: '09/10/26 08:14'
    });
    setShowModal(false);
    setName('');
    setDescription('');
    setBarcode('');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Cost', 'Quantity', 'Min Quantity', 'Barcode', 'Category', 'Description'];
    const rows = filteredParts.map(p => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      p.cost,
      p.quantity,
      p.minQuantity,
      `"${p.barcode}"`,
      `"${p.category}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventory_Parts_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  const handleIssueSet = (setId: string) => {
    setIssuedSetId(setId);
    setTimeout(() => {
      setIssuedSetId(null);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      {/* Upper Module Tabs */}
      <div className="px-6 pt-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('parts')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'parts'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Individual Parts</span>
          </button>
          <button
            onClick={() => setActiveTab('sets')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sets'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Sets of Parts</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-sky-700 font-bold">
              {partSets.length}
            </span>
          </button>
        </div>

        <div className="pb-2">
          <div className="inline-flex rounded-xl shadow-md shadow-sky-500/20">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white text-xs font-bold rounded-l-xl transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Part</span>
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

      {/* Sub-nav & Search */}
      <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        {activeTab === 'parts' && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'card' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
          </div>
        )}

        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'parts' ? 'Search parts by name, barcode, category...' : 'Search part sets...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-2xs"
          />
        </div>

        {/* ABC Classification Filter Chips */}
        {activeTab === 'parts' && (
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setAbcFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${abcFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ABC
            </button>
            <button
              onClick={() => setAbcFilter('A_CRITICAL')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${abcFilter === 'A_CRITICAL' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-purple-600'}`}
            >
              Class A (Critical)
            </button>
            <button
              onClick={() => setAbcFilter('B_ESSENTIAL')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${abcFilter === 'B_ESSENTIAL' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-600'}`}
            >
              Class B
            </button>
            <button
              onClick={() => setAbcFilter('C_GENERAL')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${abcFilter === 'C_GENERAL' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Class C
            </button>
          </div>
        )}

        {/* Action menu */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            title="Inventory Options"
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
                <span>Export Inventory (CSV)</span>
              </button>
              <button
                onClick={() => {
                  setSearch('');
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium border-t border-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear Search</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-6 py-2 overflow-auto">
        {activeTab === 'parts' ? (
          viewMode === 'list' ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 min-w-[170px]">Name</th>
                      <th className="py-3.5 px-4 w-28">Cost</th>
                      <th className="py-3.5 px-4 w-36">Quantity</th>
                      <th className="py-3.5 px-4 w-28">ABC Class</th>
                      <th className="py-3.5 px-4 w-32">Location / Bin</th>
                      <th className="py-3.5 px-4 w-32">Barcode</th>
                      <th className="py-3.5 px-4 w-32">Category</th>
                      <th className="py-3.5 px-4 min-w-[180px]">Description</th>
                      <th className="py-3.5 px-4 w-32">Assigned To</th>
                      <th className="py-3.5 px-4 w-28">Date Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredParts.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-400">
                          No matching spare parts found.
                        </td>
                      </tr>
                    ) : (
                      filteredParts.map(part => (
                        <tr key={part.id} className="hover:bg-sky-50/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{part.name}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">${part.cost.toFixed(2)}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {/* Decrement Button */}
                              <button
                                onClick={() => onAdjustQuantity && onAdjustQuantity(part.id, -1)}
                                className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Decrease quantity -1"
                              >
                                <MinusCircle className="w-4 h-4" />
                              </button>

                              <span className={`font-bold min-w-[20px] text-center ${part.quantity <= part.minQuantity ? 'text-amber-600' : 'text-slate-800'}`}>
                                {part.quantity}
                              </span>

                              {/* Increment Button */}
                              <button
                                onClick={() => onAdjustQuantity && onAdjustQuantity(part.id, 1)}
                                className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                title="Increase quantity +1"
                              >
                                <PlusCircle className="w-4 h-4" />
                              </button>

                              {part.quantity <= part.minQuantity && (
                                <span title="Warning: Low stock threshold reached" className="text-amber-500 ml-1">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              part.abcClass === 'A_CRITICAL' ? 'bg-purple-100 text-purple-700 border border-purple-300' :
                              part.abcClass === 'B_ESSENTIAL' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                              'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}>
                              {part.abcClass === 'A_CRITICAL' ? '🔴 Class A' :
                               part.abcClass === 'B_ESSENTIAL' ? '🟡 Class B' :
                               '🟢 Class C'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-sky-700 font-semibold">
                            {part.warehouseLocation?.code || part.area || '—'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">{part.barcode}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                              {part.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{part.description}</td>
                          <td className="py-3.5 px-4 text-slate-700">{part.assignedTo || '—'}</td>
                          <td className="py-3.5 px-4 text-slate-400">{part.createdAt}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredParts.map(part => (
                <div key={part.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 font-mono">{part.barcode}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-700">
                      {part.category}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{part.name}</h4>
                  <p className="text-xs text-slate-500">{part.description}</p>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">UNIT COST</span>
                      <span className="font-bold text-slate-900">${part.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAdjustQuantity && onAdjustQuantity(part.id, -1)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                      <span className={`font-bold ${part.quantity <= part.minQuantity ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {part.quantity} in stock
                      </span>
                      <button
                        onClick={() => onAdjustQuantity && onAdjustQuantity(part.id, 1)}
                        className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Sets of Parts Tab */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSets.map(set => (
              <div key={set.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-sky-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                      {set.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{set.category}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{set.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{set.description}</p>

                  {/* Components List */}
                  <div className="mt-3.5 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Set Components:
                    </span>
                    {set.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-700">
                        <span className="font-medium">• {item.partName}</span>
                        <span className="text-slate-500 font-mono">x{item.quantity} (${item.cost.toFixed(2)})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Estimated Set Price</span>
                    <span className="text-base font-black text-slate-900">${set.totalCost.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => handleIssueSet(set.id)}
                    disabled={issuedSetId === set.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      issuedSetId === set.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
                    }`}
                  >
                    {issuedSetId === set.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Issued to Work Order!</span>
                      </>
                    ) : (
                      <>
                        <Package className="w-3.5 h-3.5" />
                        <span>Issue Set</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Part Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add Inventory Part</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Part Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Gasket 1/2 in"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min. Alert</label>
                  <input
                    type="number"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(parseInt(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Barcode</label>
                  <input
                    type="text"
                    placeholder="e.g. BC-9941"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ABC Criticality Classification</label>
                <select
                  value={abcClass}
                  onChange={(e: any) => setAbcClass(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                >
                  <option value="A_CRITICAL">Class A — Critical / عالي الأهمية وحرج</option>
                  <option value="B_ESSENTIAL">Class B — Essential / أساسي</option>
                  <option value="C_GENERAL">Class C — General / استهلاكي عام</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Part specifications, compatibility notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
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
                  Save Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
