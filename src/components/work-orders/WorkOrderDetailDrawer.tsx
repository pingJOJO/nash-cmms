import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Edit3, 
  MoreVertical, 
  Play, 
  Pause, 
  Plus, 
  Clock, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  Circle, 
  Send, 
  Paperclip,
  Check
} from 'lucide-react';
import { WorkOrder, WorkOrderStatus, Priority } from '../../types/cmms';
import { PriorityBadge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

interface WorkOrderDetailDrawerProps {
  workOrder: WorkOrder | null;
  isOpen?: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: WorkOrderStatus) => void;
  onDelete: (id: string) => void;
  onAddLabor: (id: string, labor: { workerName: string; hours: number; hourlyRate: number; description: string }) => void;
  onAddCost: (id: string, cost: { description: string; amount: number; category: string }) => void;
  onAddPart: (id: string, part: { partName: string; quantity: number; unitCost: number }) => void;
  onToggleTask: (workOrderId: string, taskId: string) => void;
  onAddTask?: (workOrderId: string, taskTitle: string) => void;
  onAddComment: (workOrderId: string, commentText: string) => void;
  onUpdateWorkOrder?: (id: string, updates: Partial<WorkOrder>) => void;
}

export const WorkOrderDetailDrawer: React.FC<WorkOrderDetailDrawerProps> = ({
  workOrder,
  isOpen,
  onClose,
  onUpdateStatus,
  onDelete,
  onAddLabor,
  onAddCost,
  onAddPart,
  onToggleTask,
  onAddTask,
  onAddComment,
  onUpdateWorkOrder
}) => {
  const { can } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('MEDIUM');
  const [editDueDate, setEditDueDate] = useState('');

  // Add Task state
  const [newTaskText, setNewTaskText] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Sub-dialog states
  const [showAddLabor, setShowAddLabor] = useState(false);
  const [laborHours, setLaborHours] = useState(1);
  const [laborDesc, setLaborDesc] = useState('');

  const [showAddCost, setShowAddCost] = useState(false);
  const [costAmount, setCostAmount] = useState(50);
  const [costDesc, setCostDesc] = useState('');

  const [showAddPart, setShowAddPart] = useState(false);
  const [partName, setPartName] = useState('Air Filter (MERV-13)');
  const [partQty, setPartQty] = useState(1);
  const [partCost, setPartCost] = useState(15.99);

  const [newComment, setNewComment] = useState('');

  // Initialize edit fields when work order opens or changes
  useEffect(() => {
    if (workOrder) {
      setEditTitle(workOrder.title);
      setEditDesc(workOrder.description);
      setEditPriority(workOrder.priority);
      setEditDueDate(workOrder.dueDate);
      setIsEditing(false);
    }
  }, [workOrder?.id]);

  // Active Timer logic
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else if (!isTimerRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  if (isOpen === false || !workOrder) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleLaborSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLabor(workOrder.id, {
      workerName: 'Omar Dabobash',
      hours: Number(laborHours),
      hourlyRate: 45,
      description: laborDesc || 'Maintenance labor execution'
    });
    setShowAddLabor(false);
    setLaborDesc('');
  };

  const handleCostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCost(workOrder.id, {
      description: costDesc || 'Incidental expense',
      amount: Number(costAmount),
      category: 'Supplies'
    });
    setShowAddCost(false);
    setCostDesc('');
  };

  const handlePartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPart(workOrder.id, {
      partName,
      quantity: Number(partQty),
      unitCost: Number(partCost)
    });
    setShowAddPart(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(workOrder.id, newComment.trim());
    setNewComment('');
  };

  return (
    <div 
      className="fixed inset-0 z-[70] overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <PriorityBadge priority={workOrder.priority} />
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                title={isEditing ? 'Cancel Edit' : 'Edit Work Order'}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isEditing ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                }`}
              >
                <Edit3 className="w-4 h-4" />
              </button>
              {can('DELETE') && (
                <button 
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${workOrder.title}?`)) {
                      onDelete(workOrder.id);
                      onClose();
                    }
                  }}
                  title="Delete Work Order"
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={onClose}
                title="Close Drawer"
                className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/70 cursor-pointer transition-colors bg-white shadow-2xs border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="mt-3 p-4 bg-white rounded-xl border border-sky-200 shadow-xs space-y-3">
              <div className="text-xs font-bold text-sky-800">Edit Work Order Details:</div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Description</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Due Date</label>
                  <input
                    type="text"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateWorkOrder) {
                      onUpdateWorkOrder(workOrder.id, {
                        title: editTitle,
                        description: editDesc,
                        priority: editPriority,
                        dueDate: editDueDate
                      });
                    }
                    setIsEditing(false);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mt-3">{workOrder.title}</h2>
              <p className="text-xs text-slate-500 mt-1">{workOrder.description}</p>
            </>
          )}

          {/* Tab Selection */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'comments'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Comments ({workOrder.comments.length})
            </button>
          </div>
        </div>

        {/* Action Bar (Status Selector & Live Timer) */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={workOrder.status}
              onChange={(e) => onUpdateStatus(workOrder.id, e.target.value as WorkOrderStatus)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer focus:outline-none ${
                workOrder.status === 'IN_PROGRESS' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : workOrder.status === 'ON_HOLD'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : workOrder.status === 'COMPLETED'
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-sky-50 text-sky-800 border-sky-300'
              }`}
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Run Timer Button */}
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              isTimerRunning 
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-white text-sky-700 border-sky-300 hover:bg-sky-50'
            }`}
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-sky-600" />}
            <span>{isTimerRunning ? 'Stop Timer' : 'Run Timer'} - {formatTimer(timerSeconds)}</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'details' ? (
            <>
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">ID</span>
                  <span className="font-bold text-slate-800">{workOrder.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Category</span>
                  <span className="font-bold text-slate-800">{workOrder.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Location</span>
                  <span className="font-bold text-sky-600 hover:underline cursor-pointer">{workOrder.locationName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Asset</span>
                  <span className="font-bold text-sky-600 hover:underline cursor-pointer">{workOrder.assetName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Date Created</span>
                  <span className="text-slate-700">{workOrder.createdAt}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Created By</span>
                  <span className="text-slate-700">{workOrder.createdByName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Assigned To</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {workOrder.assignedToAvatar || 'O'}
                    </span>
                    <span className="font-bold text-slate-800">{workOrder.assignedToName}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Due Date</span>
                  <span className="font-bold text-rose-600">{workOrder.dueDate}</span>
                </div>
              </div>

              {/* Photo & Media Attachment Preview / Uploader */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                 <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                     <Paperclip className="w-3.5 h-3.5 text-sky-600" />
                     Attachments & Fault Photo:
                   </span>
                   <label className="text-[11px] font-bold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 transition-colors cursor-pointer flex items-center gap-1">
                     <span>{isUploadingPhoto ? 'Uploading...' : workOrder.imageUrl ? 'Change Photo' : '+ Upload Photo'}</span>
                     <input
                       type="file"
                       accept="image/*"
                       className="hidden"
                       onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (!file) return;
                         setIsUploadingPhoto(true);
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
                               onUpdateWorkOrder?.(workOrder.id, { imageUrl: data.url });
                               setIsUploadingPhoto(false);
                               return;
                             }
                           } catch {}
                           onUpdateWorkOrder?.(workOrder.id, { imageUrl: base64Data });
                           setIsUploadingPhoto(false);
                         };
                         reader.readAsDataURL(file);
                       }}
                     />
                   </label>
                 </div>

                 {workOrder.imageUrl ? (
                   <div className="space-y-1.5">
                     <img 
                       src={workOrder.imageUrl} 
                       alt="Work Order Attachment" 
                       className="w-full max-h-56 object-contain rounded-lg border border-slate-200 bg-white" 
                     />
                     <div className="text-right">
                       <a 
                         href={workOrder.imageUrl} 
                         target="_blank" 
                         rel="noreferrer" 
                         className="text-[11px] text-sky-600 hover:underline font-semibold"
                       >
                         View Full Size ↗
                       </a>
                     </div>
                   </div>
                 ) : (
                   <p className="text-[11px] text-slate-400 italic">No photos attached yet. Click "+ Upload Photo" to attach equipment condition or receipt.</p>
                 )}
               </div>

               {/* Checklist / Tasks Section */}
               <div className="space-y-3 pb-6 border-b border-slate-100">
                 <div className="flex items-center justify-between">
                   <h3 className="text-sm font-bold text-slate-900">Checklist & Procedures</h3>
                   <span className="text-xs text-slate-400 font-medium">
                     {workOrder.tasks.filter(t => t.completed).length}/{workOrder.tasks.length} Done
                   </span>
                 </div>
                 <div className="space-y-2">
                   {workOrder.tasks.map(t => (
                     <div 
                       key={t.id}
                       onClick={() => onToggleTask(workOrder.id, t.id)}
                       className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                     >
                       {t.completed ? (
                         <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                       ) : (
                         <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                       )}
                       <span className={`text-xs ${t.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                         {t.title}
                       </span>
                     </div>
                   ))}
                 </div>

                 {/* Add Task Input Form */}
                 <form
                   onSubmit={(e) => {
                     e.preventDefault();
                     if (!newTaskText.trim()) return;
                     if (onAddTask) {
                       onAddTask(workOrder.id, newTaskText.trim());
                     } else if (onUpdateWorkOrder) {
                       onUpdateWorkOrder(workOrder.id, {
                         tasks: [...workOrder.tasks, { id: `T${Date.now()}`, title: newTaskText.trim(), completed: false }]
                       });
                     }
                     setNewTaskText('');
                   }}
                   className="flex items-center gap-2 pt-2"
                 >
                   <input
                     type="text"
                     placeholder="Add new checklist procedure or inspection step..."
                     value={newTaskText}
                     onChange={(e) => setNewTaskText(e.target.value)}
                     className="flex-1 p-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                   />
                   <button
                     type="submit"
                     className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                   >
                     <Plus className="w-3.5 h-3.5" />
                     <span>Add</span>
                   </button>
                 </form>
               </div>

              {/* Labors Section */}
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Labors</h3>
                    <p className="text-[11px] text-slate-400">Technician hours logged against this work order.</p>
                  </div>
                  <button
                    onClick={() => setShowAddLabor(true)}
                    className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Time
                  </button>
                </div>

                {showAddLabor && (
                  <form onSubmit={handleLaborSubmit} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-600">Hours</label>
                        <input
                          type="number"
                          step="0.25"
                          min="0.25"
                          value={laborHours}
                          onChange={(e) => setLaborHours(parseFloat(e.target.value))}
                          className="w-full mt-1 p-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600">Rate</label>
                        <input
                          type="text"
                          disabled
                          value="$45.00/hr"
                          className="w-full mt-1 p-1.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600">Description</label>
                      <input
                        type="text"
                        placeholder="Work performed..."
                        value={laborDesc}
                        onChange={(e) => setLaborDesc(e.target.value)}
                        className="w-full mt-1 p-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddLabor(false)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-3 py-1 bg-sky-600 text-white rounded font-bold hover:bg-sky-700 cursor-pointer"
                      >
                        Save Time
                      </button>
                    </div>
                  </form>
                )}

                {workOrder.labors.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No labor costs added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {workOrder.labors.map(l => (
                      <div key={l.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{l.workerName}</div>
                          <div className="text-slate-500 text-[11px]">{l.description} ({l.date})</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sky-700">{l.hours} hrs</div>
                          <div className="text-slate-400 text-[11px]">${(l.hours * l.hourlyRate).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Costs Section */}
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Additional Costs</h3>
                    <p className="text-[11px] text-slate-400">External contractor or emergency fees.</p>
                  </div>
                  <button
                    onClick={() => setShowAddCost(true)}
                    className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Cost
                  </button>
                </div>

                {showAddCost && (
                  <form onSubmit={handleCostSubmit} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-600">Amount ($)</label>
                        <input
                          type="number"
                          step="1"
                          value={costAmount}
                          onChange={(e) => setCostAmount(parseFloat(e.target.value))}
                          className="w-full mt-1 p-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600">Category</label>
                        <input
                          type="text"
                          defaultValue="Contractor / Tool Rental"
                          className="w-full mt-1 p-1.5 bg-white border border-slate-300 rounded-lg text-slate-700"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Scaffolding rental..."
                        value={costDesc}
                        onChange={(e) => setCostDesc(e.target.value)}
                        className="w-full mt-1 p-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddCost(false)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-3 py-1 bg-sky-600 text-white rounded font-bold hover:bg-sky-700 cursor-pointer"
                      >
                        Save Cost
                      </button>
                    </div>
                  </form>
                )}

                {workOrder.additionalCosts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No additional costs added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {workOrder.additionalCosts.map(c => (
                      <div key={c.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{c.description}</div>
                          <div className="text-slate-500 text-[11px]">{c.category} • {c.date}</div>
                        </div>
                        <div className="font-bold text-slate-900">${c.amount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Parts Used Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Parts & Materials</h3>
                    <p className="text-[11px] text-slate-400">Inventory items allocated to this job.</p>
                  </div>
                  <button
                    onClick={() => setShowAddPart(true)}
                    className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Parts
                  </button>
                </div>

                {showAddPart && (
                  <form onSubmit={handlePartSubmit} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-600">Part</label>
                      <select
                        value={partName}
                        onChange={(e) => {
                          setPartName(e.target.value);
                          if (e.target.value.includes('Filter')) setPartCost(15.99);
                          else if (e.target.value.includes('Belt')) setPartCost(25.50);
                          else setPartCost(2.99);
                        }}
                        className="w-full mt-1 p-1.5 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Air Filter (MERV-13)">Air Filter (MERV-13) - $15.99</option>
                        <option value="V-Belt (Industrial B-Section)">V-Belt (Industrial B-Section) - $25.50</option>
                        <option value="Fuse 2A (Fast-Blow)">Fuse 2A (Fast-Blow) - $2.99</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-600">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={partQty}
                          onChange={(e) => setPartQty(parseInt(e.target.value))}
                          className="w-full mt-1 p-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600">Unit Cost ($)</label>
                        <input
                          type="number"
                          value={partCost}
                          onChange={(e) => setPartCost(parseFloat(e.target.value))}
                          className="w-full mt-1 p-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddPart(false)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-3 py-1 bg-sky-600 text-white rounded font-bold hover:bg-sky-700 cursor-pointer"
                      >
                        Add to Job
                      </button>
                    </div>
                  </form>
                )}

                {workOrder.parts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No parts added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {workOrder.parts.map(p => (
                      <div key={p.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{p.partName}</div>
                          <div className="text-slate-500 text-[11px]">Qty: {p.quantity} × ${p.unitCost.toFixed(2)}</div>
                        </div>
                        <div className="font-bold text-sky-700">
                          ${(p.quantity * p.unitCost).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Comments Tab */
            <div className="flex flex-col h-full space-y-4">
              <div className="flex-1 space-y-3 overflow-y-auto">
                {workOrder.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-8">No comments recorded yet. Start the conversation below.</p>
                ) : (
                  workOrder.comments.map(c => (
                    <div key={c.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{c.authorName}</span>
                        <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleCommentSubmit} className="pt-3 border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type an update or comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 shadow-xs"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
