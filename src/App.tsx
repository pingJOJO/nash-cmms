import React, { useState, useEffect } from 'react';
import { 
  WorkOrder, 
  Asset, 
  PreventiveMaintenance, 
  Part, 
  SystemSettings, 
  WorkOrderStatus,
  Location,
  MaintenanceRequest,
  Meter,
  UserMember,
  Vendor
} from './types/cmms';
import { 
  INITIAL_WORK_ORDERS, 
  INITIAL_ASSETS, 
  INITIAL_PMS, 
  INITIAL_PARTS, 
  INITIAL_LOCATIONS,
  INITIAL_REQUESTS,
  INITIAL_METERS,
  INITIAL_USERS,
  INITIAL_VENDORS,
  INITIAL_SETTINGS 
} from './data/mockData';
import { Sidebar, NavRoute, AnalyticsSubTab, PartsSubTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { WorkOrdersView } from './components/work-orders/WorkOrdersView';
import { WorkOrderDetailDrawer } from './components/work-orders/WorkOrderDetailDrawer';
import { CreateWorkOrderModal } from './components/work-orders/CreateWorkOrderModal';
import { AssetsView } from './components/assets/AssetsView';
import { PreventiveMaintenanceView } from './components/pm/PreventiveMaintenanceView';
import { PartsView } from './components/parts/PartsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { CategoriesView } from './components/categories/CategoriesView';
import { SimpleModuleView } from './components/common/SimpleModuleView';
import { OfflineBanner } from './components/common/OfflineBanner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { api } from './services/api';
import { MessageSquare, Sparkles, X, Send, Bot, Check, UploadCloud, FileSpreadsheet, CalendarClock } from 'lucide-react';

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated, currentUser, can } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('work-orders');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<AnalyticsSubTab>('work-orders');
  const [partsSubTab, setPartsSubTab] = useState<PartsSubTab>('parts');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Core Data States with LocalStorage Offline Resilience
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    try {
      const saved = localStorage.getItem('nex_work_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_WORK_ORDERS;
  });

  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [pms, setPms] = useState<PreventiveMaintenance[]>(INITIAL_PMS);
  const [parts, setParts] = useState<Part[]>(INITIAL_PARTS);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);

  // Secondary Modules States
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [requests, setRequests] = useState<MaintenanceRequest[]>(INITIAL_REQUESTS);
  const [meters, setMeters] = useState<Meter[]>(INITIAL_METERS);
  const [people, setPeople] = useState<UserMember[]>(INITIAL_USERS);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);

  const [purchaseRequests, setPurchaseRequests] = useState([
    {
      id: 'PO-8812',
      vendor: 'Grainger Industrial Supplies',
      total: '$1,450.00',
      status: 'APPROVED',
      requestedBy: 'Omar Dabobash',
      date: '09/08/26',
      items: 'Chiller compressor oil, high-temp gaskets & O-rings'
    },
    {
      id: 'PO-8813',
      vendor: 'Siemens Automation Parts',
      total: '$3,200.00',
      status: 'PENDING',
      requestedBy: 'Sarah Connor',
      date: '09/10/26',
      items: 'S7-1200 PLC replacement CPU & 24V power supply'
    },
    {
      id: 'PO-8814',
      vendor: 'Carrier Commercial HVAC',
      total: '$780.00',
      status: 'RECEIVED',
      requestedBy: 'Omar Dabobash',
      date: '09/02/26',
      items: 'Pleated MERV-13 air filters (case of 24)'
    }
  ]);

  const [files, setFiles] = useState([
    {
      id: 'FIL-01',
      name: 'Liebert-CRAC-01-Operations-Manual.pdf',
      size: '14.2 MB',
      uploadedBy: 'Omar Dabobash',
      createdAt: '08/15/26',
      category: 'Equipment Manual'
    },
    {
      id: 'FIL-02',
      name: 'Generator-GEN-001-Electrical-Schematic.dwg',
      size: '6.8 MB',
      uploadedBy: 'Sarah Connor',
      createdAt: '08/22/26',
      category: 'Wiring Diagram'
    },
    {
      id: 'FIL-03',
      name: 'OSHA-Safety-Compliance-Audit-2026.pdf',
      size: '2.4 MB',
      uploadedBy: 'David Miller',
      createdAt: '09/01/26',
      category: 'Safety & Compliance'
    },
    {
      id: 'FIL-04',
      name: 'Centrifugal-Pump-Exploded-View.png',
      size: '3.1 MB',
      uploadedBy: 'Marcus Vance',
      createdAt: '09/05/26',
      category: 'Technical Drawing'
    }
  ]);

  // Modal States
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showFloatingWidget, setShowFloatingWidget] = useState(true);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  const [onboardingTasks, setOnboardingTasks] = useState([
    { id: 1, title: 'Explore Work Orders & Maintenance Pipeline', completed: true, route: 'work-orders' as NavRoute, description: 'Track open and in-progress field maintenance tasks.' },
    { id: 2, title: 'Review Critical Equipment & Assets', completed: true, route: 'assets' as NavRoute, description: 'View generators, HVAC, boilers, and operational specs.' },
    { id: 3, title: 'Inspect Preventive Maintenance (PM) Schedules', completed: true, route: 'preventive-maintenances' as NavRoute, description: 'Monitor routine inspections and compliance metrics.' },
    { id: 4, title: 'Analyze Performance KPIs & Export CSV', completed: false, route: 'statistics' as NavRoute, description: 'Evaluate MTTR, total maintenance spend, and export data.' },
    { id: 5, title: 'System Security & Database Backups', completed: false, route: 'settings' as NavRoute, description: 'Verify PostgreSQL snapshots and role permissions.' }
  ]);

  // Universal Add Modal for Secondary Modules
  const [activeAddModal, setActiveAddModal] = useState<
    null | 'location' | 'request' | 'meter' | 'person' | 'vendor' | 'purchase' | 'file'
  >(null);

  // Secondary module creation form states
  const [newLoc, setNewLoc] = useState({ name: '', address: '', description: '' });
  const [newReq, setNewReq] = useState({ title: '', priority: 'MEDIUM', locationName: 'Warehouse A', assetName: 'HVAC-001', description: '' });
  const [newMtr, setNewMtr] = useState({ name: '', unit: 'Hours', lastReading: 0, locationName: 'Production Floor', assetName: 'GEN-001' });
  const [newPerson, setNewPerson] = useState({ name: '', email: '', phone: '', jobTitle: 'Technician', role: 'Technician', hourlyRate: 45 });
  const [newVendor, setNewVendor] = useState({ companyName: '', contactName: '', email: '', phone: '', vendorType: 'Contractor', hourlyRate: 85 });
  const [newPO, setNewPO] = useState({ vendor: '', total: '$500.00', items: '' });
  const [newFile, setNewFile] = useState({ name: '', category: 'Equipment Manual' });

  // Chat conversation state
  const [chatMessages, setChatMessages] = useState<{ sender: 'bot' | 'user'; text: string; time: string }[]>([
    {
      sender: 'bot',
      text: 'Welcome to NEX CMMS Assistant! How can I assist you today with work orders, preventive maintenance, or asset telemetry?',
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Persist work orders to local storage for offline continuity
  useEffect(() => {
    try {
      localStorage.setItem('nex_work_orders', JSON.stringify(workOrders));
    } catch {}
  }, [workOrders]);

  // Sync with live backend REST API on mount
  useEffect(() => {
    let isMounted = true;
    async function syncBackend() {
      try {
        const [wos, asts, locs, vends, mtrs, reqs, prts, pmList] = await Promise.allSettled([
          api.getWorkOrders(),
          api.getAssets(),
          api.getLocations(),
          api.getVendors(),
          api.getMeters(),
          api.getRequests(),
          api.getParts(),
          api.getPMs()
        ]);
        if (!isMounted) return;
        if (wos.status === 'fulfilled' && wos.value.length > 0) setWorkOrders(wos.value);
        if (asts.status === 'fulfilled' && asts.value.length > 0) setAssets(asts.value);
        if (locs.status === 'fulfilled' && locs.value.length > 0) setLocations(locs.value);
        if (vends.status === 'fulfilled' && vends.value.length > 0) setVendors(vends.value);
        if (mtrs.status === 'fulfilled' && mtrs.value.length > 0) setMeters(mtrs.value);
        if (reqs.status === 'fulfilled' && reqs.value.length > 0) setRequests(reqs.value);
        if (prts.status === 'fulfilled' && prts.value.length > 0) setParts(prts.value);
        if (pmList.status === 'fulfilled' && pmList.value.length > 0) setPms(pmList.value);
      } catch (err) {
        console.warn('[NEX CMMS] Backend sync fallback to local storage:', err);
      }
    }
    syncBackend();
    return () => { isMounted = false; };
  }, []);

  // Auto-route restriction if user lacks permission
  useEffect(() => {
    if (currentRoute === 'settings' && !can('SETTINGS')) {
      setCurrentRoute('work-orders');
    }
  }, [currentRoute, currentUser]);

  const handleSendChat = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery || chatInput).trim();
    if (!query) return;

    const userMessage = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let botReply = "I understand your request. You can manage this from the navigation sidebar or use the quick actions in Work Orders and Statistics.";
    const lower = query.toLowerCase();
    if (lower.includes('work order') || lower.includes('create') || lower.includes('order')) {
      botReply = "To create a Work Order, click the '+ Work Order' button in the sidebar or top bar. Fill in the title, assign a technician, set priority and due date, then click Save.";
    } else if (lower.includes('csv') || lower.includes('report') || lower.includes('export')) {
      botReply = "To export reports to CSV, navigate to 'Statistics' in the sidebar, select your preferred time period (30 Days, Quarter, Year, or All), and click 'Export Report (CSV)' at the top.";
    } else if (lower.includes('pm') || lower.includes('preventive')) {
      botReply = "Preventive Maintenance schedules are located in the 'Preventive Maintenance' tab. You can click 'Trigger Now' on any schedule to generate an immediate work order.";
    } else if (lower.includes('backup') || lower.includes('database')) {
      botReply = "Instant database snapshots can be generated under 'Settings' -> 'Database & Backups'. You can download a complete JSON snapshot of all tables with one click.";
    } else if (lower.includes('asset') || lower.includes('equipment')) {
      botReply = "Assets can be managed under 'Assets Inventory'. You can track operational statuses, assign primary technicians, review barcode IDs, and link PM schedules.";
    }

    setChatMessages(prev => [
      ...prev,
      userMessage,
      {
        sender: 'bot' as const,
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    if (!customQuery) setChatInput('');
  };

  // Handlers for Work Orders
  const handleCreateWorkOrder = (newWO: Partial<WorkOrder>) => {
    const nextIdNum = workOrders.length + 1;
    const paddedId = `WO${String(nextIdNum).padStart(6, '0')}`;
    const createdOrder: WorkOrder = {
      id: paddedId,
      title: newWO.title || 'Untitled Work Order',
      description: newWO.description || '',
      status: newWO.status || 'OPEN',
      priority: newWO.priority || 'MEDIUM',
      locationName: newWO.locationName || 'Warehouse A',
      locationAddress: 'Main Site',
      assetName: newWO.assetName || 'HVAC-001',
      assetStatus: newWO.assetStatus || 'OPERATIONAL',
      dueDate: newWO.dueDate || '2026-09-20 17:00',
      expectedStartDate: newWO.expectedStartDate,
      estimatedDurationHours: newWO.estimatedDurationHours || 1,
      category: newWO.category || 'General',
      assignedToId: currentUser?.id || 'USR-001',
      assignedToName: newWO.assignedToName || currentUser?.name || 'Omar Dabobash',
      assignedToAvatar: (newWO.assignedToName || currentUser?.name || 'O').charAt(0).toUpperCase(),
      createdById: currentUser?.id || 'USR-001',
      createdByName: currentUser?.name || 'Omar Dabobash',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      requiresSignature: !!newWO.requiresSignature,
      tasks: newWO.tasks || [],
      labors: [],
      additionalCosts: [],
      parts: [],
      comments: []
    };

    setWorkOrders(prev => [createdOrder, ...prev]);
    api.createWorkOrder(createdOrder).catch(err => console.warn('API create WO fallback:', err));
  };

  const handleUpdateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders(prev => prev.map(w => {
      if (w.id === id) {
        const updated = { ...w, ...updates, updatedAt: 'Just now' };
        if (selectedWorkOrder?.id === id) setSelectedWorkOrder(updated);
        return updated;
      }
      return w;
    }));
    api.updateWorkOrder(id, updates).catch(err => console.warn('API update WO fallback:', err));
  };

  const handleUpdateStatus = (id: string, newStatus: WorkOrderStatus) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === id) {
        return { ...wo, status: newStatus, updatedAt: 'Just now' };
      }
      return wo;
    }));
    if (selectedWorkOrder && selectedWorkOrder.id === id) {
      setSelectedWorkOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
    api.updateWorkOrder(id, { status: newStatus }).catch(err => console.warn('API update status fallback:', err));
  };

  const handleDeleteWorkOrder = (id: string) => {
    if (!can('DELETE')) {
      alert('Permission Denied: You do not have permission to delete work orders. This operation is restricted to Administrators.');
      return;
    }
    setWorkOrders(prev => prev.filter(wo => wo.id !== id));
    if (selectedWorkOrder && selectedWorkOrder.id === id) {
      setSelectedWorkOrder(null);
    }
    api.deleteWorkOrder(id).catch(err => console.warn('API delete WO fallback:', err));
  };

  const handleDeleteLocation = (id: string) => {
    if (!confirm('Are you sure you want to delete this facility location?')) return;
    setLocations(prev => prev.filter(l => l.id !== id && l.name !== id));
    api.deleteLocation(id).catch(console.warn);
  };

  const handleDeleteVendor = (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    setVendors(prev => prev.filter(v => v.id !== id && v.companyName !== id));
    api.deleteVendor(id).catch(console.warn);
  };

  const handleDeleteMeter = (id: string) => {
    if (!confirm('Are you sure you want to delete this telemetry meter sensor?')) return;
    setMeters(prev => prev.filter(m => m.id !== id && m.name !== id));
    api.deleteMeter(id).catch(console.warn);
  };

  const handleDeleteRequest = (id: string) => {
    if (!confirm('Are you sure you want to delete this maintenance request?')) return;
    setRequests(prev => prev.filter(r => r.id !== id && r.title !== id));
    api.deleteRequest(id).catch(console.warn);
  };

  const handleDeletePerson = (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    setPeople(prev => prev.filter(p => p.id !== id && p.name !== id));
  };

  const handleDeletePO = (id: string) => {
    if (!confirm('Are you sure you want to delete this purchase order?')) return;
    setPurchaseRequests(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteFile = (id: string) => {
    if (!confirm('Are you sure you want to delete this document file?')) return;
    setFiles(prev => prev.filter(f => f.id !== id && f.name !== id));
  };

  const handleAddTask = (workOrderId: string, title: string) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === workOrderId) {
        const newTask = {
          id: `T${Date.now()}`,
          title,
          completed: false
        };
        const updated = { ...wo, tasks: [...wo.tasks, newTask] };
        if (selectedWorkOrder?.id === workOrderId) setSelectedWorkOrder(updated);
        return updated;
      }
      return wo;
    }));
  };

  const handleAddLabor = (id: string, labor: { workerName: string; hours: number; hourlyRate: number; description: string }) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === id) {
        const updated = {
          ...wo,
          labors: [...wo.labors, { id: `L${Date.now()}`, date: 'Today', ...labor }]
        };
        if (selectedWorkOrder?.id === id) setSelectedWorkOrder(updated);
        return updated;
      }
      return wo;
    }));
  };

  const handleAddCost = (id: string, cost: { description: string; amount: number; category: string }) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === id) {
        const updated = {
          ...wo,
          additionalCosts: [...wo.additionalCosts, { id: `AC${Date.now()}`, date: 'Today', ...cost }]
        };
        if (selectedWorkOrder?.id === id) setSelectedWorkOrder(updated);
        return updated;
      }
      return wo;
    }));
  };

  const handleAddPartUsage = (id: string, part: { partName: string; quantity: number; unitCost: number }) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === id) {
        const updated = {
          ...wo,
          parts: [...wo.parts, { id: `P${Date.now()}`, partId: 'P-MANUAL', ...part }]
        };
        if (selectedWorkOrder?.id === id) setSelectedWorkOrder(updated);
        return updated;
      }
      return wo;
    }));
  };

  const handleToggleTask = (workOrderId: string, taskId: string) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === workOrderId) {
        const updated = {
          ...wo,
          tasks: wo.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
        if (selectedWorkOrder?.id === workOrderId) setSelectedWorkOrder(updated);
        return updated;
      }
      return wo;
    }));
  };

  const handleAddComment = (workOrderId: string, text: string) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === workOrderId) {
        const updated = {
          ...wo,
          comments: [
            ...wo.comments,
            {
              id: `C${Date.now()}`,
              authorName: currentUser?.name || 'Omar Dabobash',
              text,
              createdAt: 'Just now'
            }
          ]
        };
        if (selectedWorkOrder?.id === workOrderId) setSelectedWorkOrder(updated);
        return updated;
      }
      return wo;
    }));
  };

  // Asset handlers
  const handleAddAsset = (newAsset: Asset) => {
    setAssets(prev => [newAsset, ...prev]);
    api.createAsset(newAsset).catch(err => console.warn('API create asset fallback:', err));
  };

  const handleUpdateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    api.updateAsset(id, updates).catch(err => console.warn('API update asset fallback:', err));
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    api.deleteAsset(id).catch(err => console.warn('API delete asset fallback:', err));
  };

  // PM Handlers
  const handleAddPM = (newPm: PreventiveMaintenance) => {
    setPms(prev => [newPm, ...prev]);
    api.createPM(newPm).catch(err => console.warn('API create PM fallback:', err));
  };

  // PM Trigger to immediate Work Order
  const handleTriggerPM = (pm: PreventiveMaintenance) => {
    const nextIdNum = workOrders.length + 1;
    const paddedId = `WO${String(nextIdNum).padStart(6, '0')}`;
    const generatedWO: WorkOrder = {
      id: paddedId,
      title: pm.workOrderTitle || `Preventive Maintenance: ${pm.name}`,
      description: `Automatically generated from preventive maintenance schedule [${pm.name}] (${pm.frequency}).`,
      status: 'OPEN',
      priority: pm.priority,
      locationName: pm.locationName || 'Warehouse A',
      locationAddress: 'Plant Facility',
      assetName: pm.name,
      assetStatus: 'OPERATIONAL',
      dueDate: '2026-09-25 17:00',
      estimatedDurationHours: 2.0,
      category: pm.category || 'PM',
      assignedToId: currentUser?.id || 'USR-001',
      assignedToName: pm.worker || currentUser?.name || 'Omar Dabobash',
      assignedToAvatar: (pm.worker || 'O').charAt(0).toUpperCase(),
      createdById: currentUser?.id || 'USR-001',
      createdByName: 'NEX Automated Trigger',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      requiresSignature: true,
      tasks: [
        { id: `T${Date.now()}-1`, title: `Initial safety inspection and pre-check for ${pm.name}`, completed: false },
        { id: `T${Date.now()}-2`, title: 'Execute standard manufacturer PM maintenance checklist', completed: false },
        { id: `T${Date.now()}-3`, title: 'Record sensor readings and restore machine to operational status', completed: false }
      ],
      labors: [],
      additionalCosts: [],
      parts: [],
      comments: []
    };

    setWorkOrders(prev => [generatedWO, ...prev]);
    api.createWorkOrder(generatedWO).catch(err => console.warn('API create PM WO fallback:', err));
  };

  // Parts Handlers
  const handleAddPart = (newPart: Part) => {
    setParts(prev => [newPart, ...prev]);
    api.createPart(newPart).catch(err => console.warn('API create part fallback:', err));
  };

  // Parts Stock adjustments
  const handleAdjustPartQuantity = (partId: string, delta: number) => {
    setParts(prev => prev.map(p => {
      if (p.id === partId) {
        const newQty = Math.max(0, p.quantity + delta);
        api.updatePart(partId, { quantity: newQty }).catch(err => console.warn('API update part fallback:', err));
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  // Demo data reset
  const handleClearDemoData = () => {
    setWorkOrders([]);
    setAssets([]);
    setPms([]);
    setParts([]);
    setSelectedWorkOrder(null);
    localStorage.removeItem('nex_work_orders');
  };

  // If not logged in, show enterprise Login View
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const isRtl = settings.language === 'Arabic' || settings.language === 'ar' || settings.language === 'العربية';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        analyticsSubTab={analyticsSubTab}
        onSelectAnalyticsSubTab={setAnalyticsSubTab}
        partsSubTab={partsSubTab}
        onSelectPartsSubTab={setPartsSubTab}
        workOrderCount={workOrders.filter(w => w.status !== 'COMPLETED').length}
        requestCount={requests.length}
        collapsed={sidebarCollapsed}
        language={settings.language}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Offline-First Banner Indicator */}
        <OfflineBanner />

        {/* Topbar Header */}
        <Topbar
          currentRoute={currentRoute}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          language={settings.language}
          onToggleLanguage={(newLang) => {
            setSettings(prev => ({ ...prev, language: newLang }));
            document.documentElement.dir = (newLang === 'Arabic' || newLang === 'ar' || newLang === 'العربية') ? 'rtl' : 'ltr';
          }}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {currentRoute === 'work-orders' && (
            <WorkOrdersView
              workOrders={workOrders}
              onSelectWorkOrder={setSelectedWorkOrder}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              language={settings.language}
            />
          )}

          {currentRoute === 'assets' && (
            <AssetsView
              assets={assets}
              onAddAsset={handleAddAsset}
              onUpdateAsset={handleUpdateAsset}
              onDeleteAsset={handleDeleteAsset}
            />
          )}

          {currentRoute === 'preventive-maintenances' && (
            <PreventiveMaintenanceView
              pms={pms}
              onAddPM={handleAddPM}
              onTriggerNow={handleTriggerPM}
            />
          )}

          {currentRoute === 'parts' && (
            <PartsView
              parts={parts}
              activeTab={partsSubTab}
              onTabChange={setPartsSubTab}
              onAddPart={handleAddPart}
              onAdjustQuantity={handleAdjustPartQuantity}
            />
          )}

          {currentRoute === 'statistics' && (
            <AnalyticsView 
              workOrders={workOrders} 
              activeSubTab={analyticsSubTab}
              onSubTabChange={setAnalyticsSubTab}
            />
          )}

          {currentRoute === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={setSettings}
              onClearDemoData={handleClearDemoData}
            />
          )}

          {currentRoute === 'categories' && (
            <CategoriesView />
          )}

          {currentRoute === 'locations' && (
            <SimpleModuleView
              title="Locations & Facilities"
              description="Manage physical facilities, buildings, rooms, and GPS geographic sites."
              data={locations}
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'address', label: 'Address' },
                { key: 'description', label: 'Description' },
                { key: 'createdBy', label: 'Created By' },
                { key: 'createdAt', label: 'Date Created' }
              ]}
              actionLabel="Add Location"
              onAddClick={() => setActiveAddModal('location')}
              onDeleteClick={(row) => handleDeleteLocation(row.id || row.name)}
            />
          )}

          {currentRoute === 'requests' && (
            <SimpleModuleView
              title="Maintenance Requests"
              description="Submitted requests from plant operators pending triage, approval, and WO conversion."
              data={requests}
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'priority', label: 'Priority' },
                { key: 'status', label: 'Status' },
                { key: 'locationName', label: 'Location' },
                { key: 'assetName', label: 'Asset' },
                { key: 'createdBy', label: 'Created By' },
                { key: 'createdAt', label: 'Date' }
              ]}
              actionLabel="Submit Request"
              onAddClick={() => setActiveAddModal('request')}
              onDeleteClick={(row) => handleDeleteRequest(row.id || row.title)}
            />
          )}

          {currentRoute === 'meters' && (
            <SimpleModuleView
              title="Meters & Telemetry"
              description="Running hours, electrical consumption, water flow, and vibration sensors."
              data={meters}
              columns={[
                { key: 'name', label: 'Meter Name' },
                { key: 'nextReadingDue', label: 'Next Due' },
                { key: 'unit', label: 'Unit' },
                { key: 'lastReading', label: 'Last Reading' },
                { key: 'locationName', label: 'Location' },
                { key: 'assetName', label: 'Asset' }
              ]}
              actionLabel="Add Meter"
              onAddClick={() => setActiveAddModal('meter')}
              onDeleteClick={(row) => handleDeleteMeter(row.id || row.name)}
            />
          )}

          {currentRoute === 'people' && (
            <SimpleModuleView
              title="People & Technicians"
              description="Internal maintenance crew, shift workers, and facility engineering staff."
              data={people}
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email Address' },
                { key: 'phone', label: 'Phone' },
                { key: 'jobTitle', label: 'Job Title' },
                { key: 'role', label: 'System Role' },
                { key: 'hourlyRate', label: 'Hourly Rate ($)' }
              ]}
              actionLabel="Invite Member"
              onAddClick={() => setActiveAddModal('person')}
              onDeleteClick={(row) => handleDeletePerson(row.id || row.name)}
            />
          )}

          {currentRoute === 'vendors' && (
            <SimpleModuleView
              title="Vendors & Contractors"
              description="Contracted service companies, equipment manufacturers, and spare parts suppliers."
              data={vendors}
              columns={[
                { key: 'companyName', label: 'Company' },
                { key: 'contactName', label: 'Contact Person' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'vendorType', label: 'Type' },
                { key: 'hourlyRate', label: 'Rate ($/hr)' }
              ]}
              actionLabel="Add Vendor"
              onAddClick={() => setActiveAddModal('vendor')}
              onDeleteClick={(row) => handleDeleteVendor(row.id || row.companyName)}
            />
          )}

          {currentRoute === 'purchase-requests' && (
            <SimpleModuleView
              title="Purchase Orders (PO)"
              description="Procurement requests for replacement machinery parts, tools, and contractor services."
              data={purchaseRequests}
              columns={[
                { key: 'id', label: 'PO #' },
                { key: 'vendor', label: 'Vendor' },
                { key: 'total', label: 'Total Amount' },
                { key: 'status', label: 'Approval Status' },
                { key: 'requestedBy', label: 'Requested By' },
                { key: 'date', label: 'Date' }
              ]}
              actionLabel="Create Purchase Order"
              onAddClick={() => setActiveAddModal('purchase')}
              onDeleteClick={(row) => handleDeletePO(row.id)}
            />
          )}

          {currentRoute === 'files' && (
            <SimpleModuleView
              title="Files & Media Repository"
              description="Central repository of equipment O&M manuals, circuit schematics, compliance audits, and warranties."
              data={files}
              columns={[
                { key: 'name', label: 'File Name' },
                { key: 'category', label: 'Category' },
                { key: 'size', label: 'Size' },
                { key: 'uploadedBy', label: 'Uploaded By' },
                { key: 'createdAt', label: 'Upload Date' }
              ]}
              actionLabel="Upload File"
              onAddClick={() => setActiveAddModal('file')}
              onDeleteClick={(row) => handleDeleteFile(row.id || row.name)}
            />
          )}
        </main>
      </div>

      {/* Slide-over Detail Drawer */}
      <WorkOrderDetailDrawer
        workOrder={selectedWorkOrder}
        onClose={() => setSelectedWorkOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDeleteWorkOrder}
        onAddLabor={handleAddLabor}
        onAddCost={handleAddCost}
        onAddPart={handleAddPartUsage}
        onToggleTask={handleToggleTask}
        onAddTask={handleAddTask}
        onAddComment={handleAddComment}
        onUpdateWorkOrder={handleUpdateWorkOrder}
      />

      {/* Create Work Order Modal */}
      <CreateWorkOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWorkOrder}
        availableAssets={assets.map(a => ({ id: a.id, name: a.name }))}
        availableLocations={locations.map(l => ({ id: l.id, name: l.name }))}
      />

      {/* Universal Add Modal for Secondary Modules */}
      {activeAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {activeAddModal === 'location' && 'Add Location / Facility'}
                {activeAddModal === 'request' && 'Submit Maintenance Request'}
                {activeAddModal === 'meter' && 'Add Telemetry / Meter Sensor'}
                {activeAddModal === 'person' && 'Invite Team Member'}
                {activeAddModal === 'vendor' && 'Add Vendor / Contractor'}
                {activeAddModal === 'purchase' && 'Create Purchase Order (PO)'}
                {activeAddModal === 'file' && 'Upload Document / O&M Manual'}
              </h3>
              <button onClick={() => setActiveAddModal(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form 1: Location */}
            {activeAddModal === 'location' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newLoc.name.trim()) return;
                setLocations(prev => [
                  {
                    id: `LOC-${String(prev.length + 1).padStart(3, '0')}`,
                    name: newLoc.name,
                    address: newLoc.address || 'Plant Main Site',
                    description: newLoc.description || 'Facility site',
                    createdBy: currentUser?.name || 'Admin',
                    createdAt: 'Today'
                  },
                  ...prev
                ]);
                setActiveAddModal(null);
                setNewLoc({ name: '', address: '', description: '' });
              }} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Facility Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chemical Storage Vault Room B"
                    value={newLoc.name}
                    onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Address / Building Zone</label>
                  <input
                    type="text"
                    placeholder="e.g. Plant 2, North Wing, Zone 4"
                    value={newLoc.address}
                    onChange={(e) => setNewLoc({ ...newLoc, address: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Physical layout details..."
                    value={newLoc.description}
                    onChange={(e) => setNewLoc({ ...newLoc, description: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveAddModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold cursor-pointer shadow-xs">Save Location</button>
                </div>
              </form>
            )}

            {/* Form 2: Request */}
            {activeAddModal === 'request' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newReq.title.trim()) return;
                setRequests(prev => [
                  {
                    id: `REQ-${Date.now().toString().slice(-4)}`,
                    title: newReq.title,
                    priority: newReq.priority as any,
                    status: 'PENDING',
                    locationName: newReq.locationName,
                    assetName: newReq.assetName,
                    description: newReq.description,
                    createdBy: currentUser?.name || 'Plant Operator',
                    createdAt: 'Today'
                  },
                  ...prev
                ]);
                setActiveAddModal(null);
                setNewReq({ title: '', priority: 'MEDIUM', locationName: 'Warehouse A', assetName: 'HVAC-001', description: '' });
              }} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Issue / Request Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Water leak under coolant valve"
                    value={newReq.title}
                    onChange={(e) => setNewReq({ ...newReq, title: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                    <select
                      value={newReq.priority}
                      onChange={(e) => setNewReq({ ...newReq, priority: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Location</label>
                    <select
                      value={newReq.locationName}
                      onChange={(e) => setNewReq({ ...newReq, locationName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                    >
                      {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Detailed Symptoms</label>
                  <textarea
                    rows={2}
                    placeholder="Describe equipment behavior, noises, leaks..."
                    value={newReq.description}
                    onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveAddModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold cursor-pointer shadow-xs">Submit Request</button>
                </div>
              </form>
            )}

            {/* Form 3: Meter */}
            {activeAddModal === 'meter' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newMtr.name.trim()) return;
                setMeters(prev => [
                  {
                    id: `MTR-0${prev.length + 1}`,
                    name: newMtr.name,
                    unit: newMtr.unit,
                    lastReading: Number(newMtr.lastReading),
                    nextReadingDue: '10/01/26',
                    locationName: newMtr.locationName,
                    assetName: newMtr.assetName,
                    createdBy: currentUser?.name || 'Admin',
                    createdAt: 'Today'
                  },
                  ...prev
                ]);
                setActiveAddModal(null);
                setNewMtr({ name: '', unit: 'Hours', lastReading: 0, locationName: 'Production Floor', assetName: 'GEN-001' });
              }} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Meter / Gauge Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Backup Generator Run Hours"
                    value={newMtr.name}
                    onChange={(e) => setNewMtr({ ...newMtr, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Measurement Unit</label>
                    <input
                      type="text"
                      placeholder="e.g. Hours, kWh, Gallons"
                      value={newMtr.unit}
                      onChange={(e) => setNewMtr({ ...newMtr, unit: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Initial Reading</label>
                    <input
                      type="number"
                      value={newMtr.lastReading}
                      onChange={(e) => setNewMtr({ ...newMtr, lastReading: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveAddModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold cursor-pointer shadow-xs">Add Meter</button>
                </div>
              </form>
            )}

            {/* Form 4: Person */}
            {activeAddModal === 'person' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newPerson.name.trim()) return;
                setPeople(prev => [
                  {
                    id: `USR-00${prev.length + 1}`,
                    name: newPerson.name,
                    email: newPerson.email || 'tech@nexcmms.online',
                    phone: newPerson.phone || '+1 555-000-0000',
                    jobTitle: newPerson.jobTitle,
                    role: newPerson.role as "Administrator" | "Technician" | "Requester" | "Manager",
                    hourlyRate: Number(newPerson.hourlyRate),
                    scheduled: true,
                    lastLogin: 'Never'
                  },
                  ...prev
                ]);
                setActiveAddModal(null);
                setNewPerson({ name: '', email: '', phone: '', jobTitle: 'Technician', role: 'Technician', hourlyRate: 45 });
              }} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sami Al-Mansoor"
                    value={newPerson.name}
                    onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="user@enterprise.com"
                      value={newPerson.email}
                      onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Hourly Billing Rate ($)</label>
                    <input
                      type="number"
                      value={newPerson.hourlyRate}
                      onChange={(e) => setNewPerson({ ...newPerson, hourlyRate: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Electrical Tech"
                      value={newPerson.jobTitle}
                      onChange={(e) => setNewPerson({ ...newPerson, jobTitle: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">System Role</label>
                    <select
                      value={newPerson.role}
                      onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="Technician">Technician</option>
                      <option value="Manager">Manager</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveAddModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold cursor-pointer shadow-xs">Invite Member</button>
                </div>
              </form>
            )}

            {/* Form 5: Vendor */}
            {activeAddModal === 'vendor' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newVendor.companyName.trim()) return;
                setVendors(prev => [
                  {
                    id: `VND-0${prev.length + 1}`,
                    companyName: newVendor.companyName,
                    contactName: newVendor.contactName || 'Support Agent',
                    email: newVendor.email || 'sales@vendor.com',
                    phone: newVendor.phone || '+1 800-555-0000',
                    vendorType: newVendor.vendorType,
                    hourlyRate: Number(newVendor.hourlyRate),
                    website: `https://${newVendor.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                    description: 'Certified service vendor and contractor'
                  },
                  ...prev
                ]);
                setActiveAddModal(null);
                setNewVendor({ companyName: '', contactName: '', email: '', phone: '', vendorType: 'Contractor', hourlyRate: 85 });
              }} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Industrial Solutions"
                    value={newVendor.companyName}
                    onChange={(e) => setNewVendor({ ...newVendor, companyName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={newVendor.contactName}
                      onChange={(e) => setNewVendor({ ...newVendor, contactName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Type</label>
                    <select
                      value={newVendor.vendorType}
                      onChange={(e) => setNewVendor({ ...newVendor, vendorType: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="Contractor">Contractor</option>
                      <option value="Supplier">Spare Parts Supplier</option>
                      <option value="Manufacturer">OEM Manufacturer</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email</label>
                    <input
                      type="email"
                      value={newVendor.email}
                      onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Hourly Rate ($)</label>
                    <input
                      type="number"
                      value={newVendor.hourlyRate}
                      onChange={(e) => setNewVendor({ ...newVendor, hourlyRate: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveAddModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold cursor-pointer shadow-xs">Save Vendor</button>
                </div>
              </form>
            )}

            {/* Form 6: Purchase Order */}
            {activeAddModal === 'purchase' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newPO.vendor.trim()) return;
                setPurchaseRequests(prev => [
                  {
                    id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
                    vendor: newPO.vendor,
                    total: newPO.total,
                    status: 'PENDING',
                    requestedBy: currentUser?.name || 'Omar Dabobash',
                    date: 'Today',
                    items: newPO.items || 'Spare components'
                  },
                  ...prev
                ]);
                setActiveAddModal(null);
                setNewPO({ vendor: '', total: '$500.00', items: '' });
              }} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vendor / Supplier *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grainger Industrial Supplies"
                    value={newPO.vendor}
                    onChange={(e) => setNewPO({ ...newPO, vendor: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Estimated Amount ($)</label>
                  <input
                    type="text"
                    placeholder="$1,250.00"
                    value={newPO.total}
                    onChange={(e) => setNewPO({ ...newPO, total: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Line Items / Description</label>
                  <textarea
                    rows={2}
                    placeholder="List of part numbers and required quantities..."
                    value={newPO.items}
                    onChange={(e) => setNewPO({ ...newPO, items: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveAddModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold cursor-pointer shadow-xs">Submit PO</button>
                </div>
              </form>
            )}

            {/* Form 7: File Upload */}
            {activeAddModal === 'file' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newFile.name.trim()) return;
                setFiles(prev => [
                  {
                    id: `FIL-0${prev.length + 1}`,
                    name: newFile.name.endsWith('.pdf') ? newFile.name : `${newFile.name}.pdf`,
                    size: '4.8 MB',
                    uploadedBy: currentUser?.name || 'Omar Dabobash',
                    createdAt: 'Today',
                    category: newFile.category
                  },
                  ...prev
                ]);
                setActiveAddModal(null);
                setNewFile({ name: '', category: 'Equipment Manual' });
              }} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Document / Manual Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Boiler-01-Manufacturer-Manual.pdf"
                    value={newFile.name}
                    onChange={(e) => setNewFile({ ...newFile, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newFile.category}
                    onChange={(e) => setNewFile({ ...newFile, category: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Equipment Manual">Equipment Manual</option>
                    <option value="Wiring Diagram">Wiring Diagram / CAD</option>
                    <option value="Safety & Compliance">Safety & Compliance</option>
                    <option value="Warranty & Purchase">Warranty Document</option>
                  </select>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                  <UploadCloud className="w-8 h-8 text-sky-500 mx-auto mb-1" />
                  <span className="text-xs text-slate-600 font-bold block">Ready for Instant Upload & Secure Storage</span>
                  <span className="text-[11px] text-slate-400">PDF, DWG, PNG, JPG up to 50MB</span>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveAddModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold cursor-pointer shadow-xs">Save to Repository</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Onboarding Widget */}
      {showFloatingWidget && (
        <div 
          onClick={() => setShowOnboardingModal(true)}
          className={`fixed bottom-6 ${isRtl ? 'left-20' : 'right-20'} z-40 bg-white rounded-2xl p-4 shadow-xl border border-slate-200 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 cursor-pointer hover:border-sky-300 hover:shadow-2xl transition-all select-none`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
            N
          </div>
          <div className={`text-start ${isRtl ? 'pl-2' : 'pr-2'}`}>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>{isRtl ? 'دليل البدء بنظام NEX CMMS' : 'Get Started with NEX CMMS'}</span>
              <span className="text-[9px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-semibold">
                {isRtl ? 'المساعد' : 'Wizard'}
              </span>
            </h4>
            <p className="text-[10px] text-slate-500">
              {isRtl 
                ? `${onboardingTasks.filter(t => t.completed).length} من ${onboardingTasks.length} مهام مكتملة • اضغط للفتح`
                : `${onboardingTasks.filter(t => t.completed).length} of ${onboardingTasks.length} tasks completed • Click to open`}
            </p>
            <div className="w-36 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div 
                className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(onboardingTasks.filter(t => t.completed).length / onboardingTasks.length) * 100}%` }}
              />
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowFloatingWidget(false);
            }}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            title={isRtl ? 'إغلاق المساعد' : 'Dismiss widget'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive Setup & Onboarding Wizard Modal */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-600 text-white rounded-xl shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">NEX CMMS Implementation Wizard</h3>
                  <p className="text-xs text-slate-500">Complete setup tasks to unlock full enterprise capabilities</p>
                </div>
              </div>
              <button 
                onClick={() => setShowOnboardingModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-sky-950">Setup Progress</span>
                <span className="font-bold text-sky-700">
                  {Math.round((onboardingTasks.filter(t => t.completed).length / onboardingTasks.length) * 100)}% Completed
                </span>
              </div>
              <div className="w-full bg-sky-200/60 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-sky-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(onboardingTasks.filter(t => t.completed).length / onboardingTasks.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step list */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {onboardingTasks.map(task => (
                <div 
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    task.completed ? 'bg-slate-50/70 border-slate-200' : 'bg-white border-sky-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => {
                        setOnboardingTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                      }}
                      className={`w-5 h-5 mt-0.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        task.completed ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 hover:border-sky-500'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <div>
                      <h4 className={`text-xs font-bold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentRoute(task.route);
                      setShowOnboardingModal(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <span className="text-[11px] text-slate-400">All modules active & synchronized</span>
              <button
                onClick={() => setShowOnboardingModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Wizard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Support Bubble */}
      <button 
        onClick={() => setShowChatModal(prev => !prev)}
        className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-40 w-12 h-12 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/30 flex items-center justify-center transition-all hover:scale-105 cursor-pointer`}
        title={isRtl ? 'الدعم الفني والمساعد الذكي' : 'Live Support & AI Maintenance Assistant'}
      >
        <MessageSquare className="w-5 h-5" />
        <span className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} w-4 h-4 rounded-full bg-emerald-500 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white`}>
          <Check className="w-2.5 h-2.5" />
        </span>
      </button>

      {/* Interactive AI Support Assistant Modal */}
      {showChatModal && (
        <div className={`fixed bottom-20 ${isRtl ? 'left-6' : 'right-6'} z-50 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200`}>
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">{isRtl ? 'مساعد NEX CMMS الذكي' : 'NEX CMMS Assistant (AI Support)'}</h4>
                <span className="text-[10px] text-sky-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isRtl ? 'متصل وجاهز للمساعدة' : 'Online & ready to assist'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowChatModal(false)}
              className="text-white/80 hover:text-white p-1 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="p-4 flex-1 max-h-80 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Quick suggestions chips */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSendChat(undefined, isRtl ? 'كيف أقوم بإنشاء أمر عمل جديد؟' : 'How do I create a Work Order?')}
              className="text-[10px] bg-white border border-slate-200 hover:border-sky-300 text-slate-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {isRtl ? '+ إنشاء أمر عمل' : '+ Create Work Order'}
            </button>
            <button
              onClick={() => handleSendChat(undefined, isRtl ? 'كيف أصدّر التقارير بصيغة CSV؟' : 'How do I export CSV reports?')}
              className="text-[10px] bg-white border border-slate-200 hover:border-sky-300 text-slate-600 px-2 py-1 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3 h-3 text-sky-600" />
              <span>{isRtl ? 'تصدير كـ CSV' : 'Export CSV'}</span>
            </button>
            <button
              onClick={() => handleSendChat(undefined, isRtl ? 'كيف أشغل الصيانة الوقائية الفورية؟' : 'How to trigger Preventive Maintenance?')}
              className="text-[10px] bg-white border border-slate-200 hover:border-sky-300 text-slate-600 px-2 py-1 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <CalendarClock className="w-3 h-3 text-amber-500" />
              <span>{isRtl ? 'الصيانة الوقائية' : 'PM Schedules'}</span>
            </button>
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChat} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder={isRtl ? 'اكتب استفسارك هنا (مثال: كيف أصدّر التقرير؟)...' : 'Type your maintenance inquiry here...'}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-100 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
              title={isRtl ? 'إرسال' : 'Send'}
            >
              <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
