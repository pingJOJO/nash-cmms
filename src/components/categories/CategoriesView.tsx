import React, { useState } from 'react';
import { Plus, Pencil, X, AlertCircle } from 'lucide-react';

export type CategoryTab = 
  | 'work-orders' 
  | 'assets' 
  | 'meters' 
  | 'timers' 
  | 'costs' 
  | 'parts' 
  | 'purchase-requests';

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  tab: CategoryTab;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  // Work Orders (Exact match to user's screenshot)
  { id: 'cat-wo-1', name: 'Electrical', description: 'Power distribution, lighting, wiring, and panels', tab: 'work-orders' },
  { id: 'cat-wo-2', name: 'Mechanical', description: 'Gearboxes, bearings, drives, hydraulics, and pneumatics', tab: 'work-orders' },
  { id: 'cat-wo-3', name: 'HVAC', description: 'Air conditioning, chillers, economizers, and air handlers', tab: 'work-orders' },
  { id: 'cat-wo-4', name: 'Safety', description: 'Emergency lighting, fire deluge, eye wash, and compliance audits', tab: 'work-orders' },
  { id: 'cat-wo-5', name: 'Plumbing', description: 'Domestic water supply, drain lines, risers, and valves', tab: 'work-orders' },

  // Assets
  { id: 'cat-ast-1', name: 'HVAC Unit', description: 'Packaged rooftop units, cooling towers, and chillers', tab: 'assets' },
  { id: 'cat-ast-2', name: 'Vehicle', description: 'Service trucks, transport vans, and electric forklifts', tab: 'assets' },
  { id: 'cat-ast-3', name: 'Generator', description: 'Backup diesel and natural gas generator sets', tab: 'assets' },
  { id: 'cat-ast-4', name: 'Air Compressor', description: 'Rotary screw compressors, dryers, and receiver tanks', tab: 'assets' },
  { id: 'cat-ast-5', name: 'Heavy Machinery', description: 'Mechanical stamping presses and CNC milling centers', tab: 'assets' },

  // Meters
  { id: 'cat-mtr-1', name: 'Hours', description: 'Cumulative engine and motor run-time hours', tab: 'meters' },
  { id: 'cat-mtr-2', name: 'Mileage', description: 'Odometer distance tracking for fleet vehicles', tab: 'meters' },
  { id: 'cat-mtr-3', name: 'Cycles', description: 'Actuation counts, press strokes, and gate cycles', tab: 'meters' },

  // Timers
  { id: 'cat-tm-1', name: 'Inspection', description: 'Routine diagnostic inspection and visual assessment time', tab: 'timers' },
  { id: 'cat-tm-2', name: 'Calibration', description: 'Sensor and instrument calibration duration', tab: 'timers' },

  // Costs
  { id: 'cat-cst-1', name: 'Labor', description: 'Internal technician hourly labor charges', tab: 'costs' },
  { id: 'cat-cst-2', name: 'Parts', description: 'Direct replacement components and consumables', tab: 'costs' },
  { id: 'cat-cst-3', name: 'Subcontractor', description: 'Third-party certified service specialists', tab: 'costs' },

  // Parts
  { id: 'cat-prt-1', name: 'Filters', description: 'Air filters, oil filters, and liquid separator elements', tab: 'parts' },
  { id: 'cat-prt-2', name: 'Belts', description: 'Drive belts, timing belts, and v-belts', tab: 'parts' },
  { id: 'cat-prt-3', name: 'Electrical Components', description: 'Fuses, contactors, relays, switches, and circuit breakers', tab: 'parts' },

  // Purchase Requests
  { id: 'cat-po-1', name: 'Parts Purchase', description: 'Replenishment of inventory stock and emergency parts', tab: 'purchase-requests' },
  { id: 'cat-po-2', name: 'Vendor Service', description: 'Contracted outside engineering and overhaul service', tab: 'purchase-requests' },
];

export const CategoriesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('work-orders');
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [error, setError] = useState('');

  const currentTabCategories = categories.filter(c => c.tab === activeTab);

  const tabDefinitions: { id: CategoryTab; label: string }[] = [
    { id: 'work-orders', label: 'Work Orders' },
    { id: 'assets', label: 'Assets' },
    { id: 'meters', label: 'Meters' },
    { id: 'timers', label: 'Timers' },
    { id: 'costs', label: 'Costs' },
    { id: 'parts', label: 'Parts' },
    { id: 'purchase-requests', label: 'Purchase Requests' },
  ];

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || '');
    setError('');
    setShowModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError('Category name is required');
      return;
    }

    if (editingCategory) {
      setCategories(prev => prev.map(c => 
        c.id === editingCategory.id 
          ? { ...c, name: categoryName.trim(), description: categoryDescription.trim() }
          : c
      ));
    } else {
      const newCat: CategoryItem = {
        id: `cat-${activeTab}-${Date.now()}`,
        name: categoryName.trim(),
        description: categoryDescription.trim(),
        tab: activeTab
      };
      setCategories(prev => [...prev, newCat]);
    }

    setShowModal(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      {/* Upper Navigation Tabs & + Category Action (Matching Atlas) */}
      <div className="px-8 pt-5 pb-3 flex flex-wrap items-center justify-between gap-4">
        {/* Tab Pills Container */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
          {tabDefinitions.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* + Category Button */}
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Category
        </button>
      </div>

      {/* Main Categories Card Container */}
      <div className="flex-1 px-8 py-3 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {currentTabCategories.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No categories configured for this section yet. Click "+ Category" above to add one.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {currentTabCategories.map(cat => (
                <div 
                  key={cat.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Category Name */}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">
                      {cat.name}
                    </span>
                    {cat.description && (
                      <span className="text-xs text-slate-400 mt-0.5">
                        {cat.description}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons: Blue Edit & Light Pink/Red Delete */}
                  <div className="flex items-center gap-2.5">
                    {/* Blue Round Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      title={`Edit ${cat.name}`}
                      className="w-8 h-8 rounded-lg bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Pink/Red Round Delete Button */}
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      title={`Delete ${cat.name}`}
                      className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 border border-rose-200/80 flex items-center justify-center transition-all shadow-2xs hover:scale-105 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add new category'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingCategory 
                  ? 'Fill in the name to edit category' 
                  : 'Fill in the name to create and add a new category'}
              </p>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name Field */}
              <div>
                <input
                  type="text"
                  required
                  placeholder="Name"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-2xs"
                  autoFocus
                />
              </div>

              {/* Description Field */}
              <div>
                <textarea
                  rows={4}
                  placeholder="Description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-2xs resize-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/25 transition-all cursor-pointer"
                >
                  {editingCategory ? 'Save' : 'Add new category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
