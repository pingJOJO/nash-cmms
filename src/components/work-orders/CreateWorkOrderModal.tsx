import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckSquare, 
  AlertCircle,
  Check
} from 'lucide-react';
import { WorkOrder, Priority, AssetStatus } from '../../types/cmms';

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newWO: Partial<WorkOrder>) => void;
  availableAssets?: { id: string; name: string }[];
  availableLocations?: { id: string; name: string }[];
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableAssets = [],
  availableLocations = []
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Warehouse A');
  const [assetName, setAssetName] = useState('HVAC-001');
  const [assetStatus, setAssetStatus] = useState<AssetStatus>('OPERATIONAL');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('2026-09-18T17:00');
  const [expectedStartDate, setExpectedStartDate] = useState('2026-09-12T09:00');
  const [estimatedDurationHours, setEstimatedDurationHours] = useState(2);
  const [category, setCategory] = useState('HVAC');
  const [assignedToName, setAssignedToName] = useState('Omar Dabobash');
  const [requiresSignature, setRequiresSignature] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [tasks, setTasks] = useState<{ id: string; title: string; completed: boolean }[]>([
    { id: '1', title: 'Verify safety isolation lockouts', completed: false }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, base64Data })
        });
        if (res.ok) {
          const data = await res.json();
          setImageUrl(data.url);
          setIsUploading(false);
          return;
        }
      } catch {}
      // Fallback directly to base64 Data URL for offline availability
      setImageUrl(base64Data);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), title: newTaskTitle.trim(), completed: false }]);
    setNewTaskTitle('');
  };

  const handleRemoveTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    onSubmit({
      title,
      description,
      imageUrl: imageUrl || undefined,
      locationName,
      assetName,
      assetStatus,
      priority,
      status: 'OPEN',
      dueDate,
      expectedStartDate,
      estimatedDurationHours,
      category,
      assignedToName,
      assignedToAvatar: assignedToName.charAt(0).toUpperCase(),
      requiresSignature,
      tasks
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add Work Order</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fill in the fields below to create and add a new Work Order</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="wo-create-form" onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Title Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Replace air filter in unit 4"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-xs"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide detailed instructions, safety notes, or symptoms..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-xs"
            />
          </div>

          {/* Image Upload Area (Matches Atlas CMMS styling with real file upload) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Image / Media Attachment
            </label>
            {imageUrl ? (
              <div className="relative rounded-xl border border-slate-300 p-2 bg-slate-50 flex items-center gap-3">
                <img src={imageUrl} alt="Uploaded attachment" className="w-20 h-20 object-cover rounded-lg border border-slate-200 bg-white" />
                <div className="flex-1 overflow-hidden">
                  <span className="text-xs font-bold text-slate-800 block truncate">Image attached successfully</span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Ready to save with work order</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-slate-700/30 rounded-xl p-6 bg-[#0E1726] text-center hover:border-sky-500 transition-colors cursor-pointer group">
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-slate-300 mt-2">
                  {isUploading ? 'Uploading and processing file...' : 'Click to select an image from your device, or drag & drop here'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">PNG, JPG, WEBP, PDF up to 25MB</p>
              </label>
            )}
          </div>

          {/* Location & Asset Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <select
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
              >
                {availableLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Asset
              </label>
              <select
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
              >
                {availableAssets.map(ast => (
                  <option key={ast.id} value={ast.name}>{ast.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Asset Status & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Asset Status
              </label>
              <select
                value={assetStatus}
                onChange={(e) => setAssetStatus(e.target.value as AssetStatus)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
              >
                <option value="OPERATIONAL">Operational</option>
                <option value="DOWN">Down</option>
                <option value="EMERGENCY_SHUTDOWN">Emergency Shutdown</option>
                <option value="IN_STORAGE">In Storage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as Priority[]).map(p => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      priority === p 
                        ? 'bg-sky-500 text-white border-sky-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Expected Start
              </label>
              <input
                type="datetime-local"
                value={expectedStartDate}
                onChange={(e) => setExpectedStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Est. Duration (Hrs)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedDurationHours}
                onChange={(e) => setEstimatedDurationHours(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Category & Assignee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                <option value="HVAC">HVAC</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Safety">Safety</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assigned Worker
              </label>
              <select
                value={assignedToName}
                onChange={(e) => setAssignedToName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                <option value="Omar Dabobash">Omar Dabobash (Admin)</option>
                <option value="Sarah Connor">Sarah Connor (Electrician)</option>
                <option value="Alex Chen">Alex Chen (Fleet Specialist)</option>
              </select>
            </div>
          </div>

          {/* Tasks / Checklist Builder */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Checklist / Subtasks ({tasks.length})
            </label>
            <div className="space-y-2 mb-2">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <CheckSquare className="w-4 h-4 text-sky-600" />
                    <span>{task.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(task.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add safety check or instruction..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>
          </div>

          {/* Requires Signature Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Require Customer / Manager Signature</span>
              <span className="text-[11px] text-slate-500">Must be signed digitally upon work order closeout</span>
            </div>
            <button
              type="button"
              onClick={() => setRequiresSignature(!requiresSignature)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                requiresSignature ? 'bg-sky-500' : 'bg-slate-300'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                requiresSignature ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="wo-create-form"
            className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/25 transition-all cursor-pointer"
          >
            Add Work Order
          </button>
        </div>
      </div>
    </div>
  );
};
