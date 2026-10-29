/**
 * NASH CMMS REST API Client
 * Centralized service to communicate with backend endpoints on /api/*
 * Handles automatic JSON parsing, error handling, standardized response unboxing, and offline resilience.
 */

import { 
  WorkOrder, 
  Asset, 
  Location, 
  Vendor, 
  Meter, 
  MaintenanceRequest, 
  SystemSettings,
  Part,
  PreventiveMaintenance,
  CommentItem,
  LaborLog,
  AdditionalCost,
  PartUsage,
  KPIData,
  VoiceProcessResponse,
  SubscriptionInfo,
  AssetLifeFile,
  AssetBOMItem,
  CalibrationRecord,
  WarehouseLocation,
  AuditLogItem
} from '../types/cmms';

const API_BASE = '/api';

export interface CreateVendorDTO {
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  vendorType?: string;
  hourlyRate?: number;
  description?: string;
}

export interface CreateMeterDTO {
  name: string;
  unit?: string;
  lastReading?: number;
  nextReadingDue?: string;
  locationName?: string;
  assetName?: string;
}

export interface CreateRequestDTO {
  title: string;
  priority?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  locationName?: string;
  assetName?: string;
  description?: string;
}

export interface CreateLocationDTO {
  name: string;
  address?: string;
  description?: string;
}

/**
 * Helper to unwrap standardized { success: boolean, data: T } or raw T responses
 */
function unwrapResponse<T>(json: any): T {
  if (json && typeof json === 'object' && 'data' in json && json.data !== undefined) {
    return json.data as T;
  }
  return json as T;
}

export const api = {
  // --- Health Check ---
  async getHealth(): Promise<{ status: string; database?: string; timestamp?: string }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error(`Health HTTP ${res.status}`);
      const json = await res.json();
      return unwrapResponse(json);
    } catch (err) {
      console.warn('[API] Healthcheck failed:', err);
      return { status: 'offline' };
    }
  },

  // --- Work Orders ---
  async getWorkOrders(): Promise<WorkOrder[]> {
    const res = await fetch(`${API_BASE}/work-orders`);
    if (!res.ok) throw new Error(`Failed to fetch work orders: HTTP ${res.status}`);
    const rawData = await res.json();
    const data = unwrapResponse<any[]>(rawData);

    if (!Array.isArray(data)) return [];

    return data.map((wo: any): WorkOrder => ({
      id: wo.code || wo.id,
      title: wo.title || 'Untitled',
      description: wo.description || '',
      status: wo.status || 'OPEN',
      priority: wo.priority || 'MEDIUM',
      locationId: wo.locationId || (wo.location?.id),
      locationName: wo.location?.name || wo.locationName || 'Main Facility',
      locationAddress: wo.location?.address || 'Site A',
      assetId: wo.assetId || (wo.asset?.id),
      assetName: wo.asset?.name || wo.assetName || 'General Equipment',
      assetStatus: wo.asset?.status || 'OPERATIONAL',
      dueDate: wo.dueDate ? new Date(wo.dueDate).toISOString().slice(0, 16).replace('T', ' ') : '2026-09-20 17:00',
      expectedStartDate: wo.expectedStartDate ? new Date(wo.expectedStartDate).toISOString().slice(0, 16).replace('T', ' ') : undefined,
      estimatedDurationHours: Number(wo.estimatedDurationHours || 1),
      category: typeof wo.category === 'object' && wo.category ? wo.category.name : (wo.category || 'General'),
      assignedToId: wo.assignedToId || 'USR-001',
      assignedToName: wo.assignedTo?.name || wo.assignedToName || 'Omar Dabobash',
      assignedToAvatar: (wo.assignedTo?.name || wo.assignedToName || 'O').charAt(0).toUpperCase(),
      createdById: wo.createdById || 'USR-001',
      createdByName: wo.createdBy?.name || wo.createdByName || 'Omar Dabobash',
      createdAt: wo.createdAt ? new Date(wo.createdAt).toLocaleDateString() : 'Just now',
      updatedAt: wo.updatedAt ? new Date(wo.updatedAt).toLocaleDateString() : 'Just now',
      imageUrl: wo.imageUrl,
      requiresSignature: !!wo.requiresSignature,
      tasks: Array.isArray(wo.tasks) ? wo.tasks : [],
      labors: (Array.isArray(wo.labors) ? wo.labors : []).map((l: any): LaborLog => ({
        id: l.id,
        workerName: l.user?.name || l.workerName || 'Technician',
        hours: Number(l.hours || 1),
        hourlyRate: Number(l.hourlyRate || 35),
        description: l.description || 'Labor performed',
        date: l.loggedAt ? new Date(l.loggedAt).toLocaleDateString() : 'Today'
      })),
      additionalCosts: (Array.isArray(wo.additionalCosts) ? wo.additionalCosts : []).map((c: any): AdditionalCost => ({
        id: c.id,
        description: c.description || 'Expense',
        amount: Number(c.amount || 0),
        category: c.category || 'Supplies',
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Today'
      })),
      parts: (Array.isArray(wo.partsUsed) ? wo.partsUsed : (Array.isArray(wo.parts) ? wo.parts : [])).map((p: any): PartUsage => ({
        id: p.id,
        partId: p.partId || (p.part?.id) || 'P-001',
        partName: p.part?.name || p.partName || 'Spare Part',
        quantity: Number(p.quantityUsed || p.quantity || 1),
        unitCost: Number(p.part?.unitCost || p.unitCost || 0)
      })),
      comments: (Array.isArray(wo.comments) ? wo.comments : []).map((c: any): CommentItem => ({
        id: c.id,
        authorName: c.authorName || c.user?.name || 'User',
        authorAvatar: (c.authorAvatar || c.user?.name || 'U').charAt(0).toUpperCase(),
        text: c.text || '',
        createdAt: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'
      }))
    }));
  },

  async createWorkOrder(wo: Partial<WorkOrder>): Promise<WorkOrder> {
    const payload = {
      code: wo.id,
      title: wo.title,
      description: wo.description,
      status: wo.status,
      priority: wo.priority,
      locationId: wo.locationId,
      locationName: wo.locationName,
      assetId: wo.assetId,
      assetName: wo.assetName,
      dueDate: wo.dueDate,
      expectedStartDate: wo.expectedStartDate,
      estimatedDurationHours: wo.estimatedDurationHours,
      requiresSignature: wo.requiresSignature,
      imageUrl: wo.imageUrl,
      createdById: wo.createdById,
      assignedToId: wo.assignedToId,
      parts: wo.parts || []
    };
    const res = await fetch(`${API_BASE}/work-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to create work order: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<WorkOrder>(json);
  },

  async updateWorkOrder(id: string, updates: Partial<WorkOrder>): Promise<WorkOrder> {
    const res = await fetch(`${API_BASE}/work-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`Failed to update work order ${id}: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<WorkOrder>(json);
  },

  async deleteWorkOrder(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/work-orders/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Failed to delete work order ${id}: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<{ success: boolean; id: string }>(json);
  },

  // --- Assets ---
  async getAssets(): Promise<Asset[]> {
    const res = await fetch(`${API_BASE}/assets`);
    if (!res.ok) throw new Error(`Failed to fetch assets: HTTP ${res.status}`);
    const rawData = await res.json();
    const data = unwrapResponse<any[]>(rawData);

    if (!Array.isArray(data)) return [];

    return data.map((a: any): Asset => ({
      id: a.id,
      name: a.name,
      status: a.status || 'OPERATIONAL',
      locationName: typeof a.location === 'object' && a.location ? a.location.name : (typeof a.locationName === 'string' ? a.locationName : 'Main Plant'),
      area: a.area || '—',
      model: a.model || '—',
      barcode: a.barcode || '',
      category: typeof a.category === 'object' && a.category ? a.category.name : (typeof a.category === 'string' ? a.category : 'General'),
      description: a.description || 'Facility equipment',
      primaryWorker: typeof a.primaryWorker === 'object' && a.primaryWorker ? a.primaryWorker.name : (typeof a.primaryWorker === 'string' ? a.primaryWorker : 'Technician'),
      imageUrl: a.imageUrl,
      createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Active'
    }));
  },

  async createAsset(asset: Partial<Asset>): Promise<Asset> {
    const res = await fetch(`${API_BASE}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset)
    });
    if (!res.ok) throw new Error(`Failed to create asset: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<Asset>(json);
  },

  async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
    const res = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`Failed to update asset ${id}: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<Asset>(json);
  },

  async deleteAsset(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Failed to delete asset ${id}: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<{ success: boolean; id: string }>(json);
  },

  // --- Locations ---
  async getLocations(): Promise<Location[]> {
    const res = await fetch(`${API_BASE}/locations`);
    if (!res.ok) throw new Error(`Failed to fetch locations: HTTP ${res.status}`);
    const rawData = await res.json();
    const data = unwrapResponse<any[]>(rawData);

    if (!Array.isArray(data)) return [];

    return data.map((l: any): Location => ({
      id: l.id,
      name: l.name,
      address: l.address || 'Facility Address',
      description: l.description || 'Facility Location',
      createdBy: typeof l.createdBy === 'object' && l.createdBy ? l.createdBy.name : (typeof l.createdBy === 'string' ? l.createdBy : 'Admin'),
      createdAt: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Active'
    }));
  },

  async createLocation(loc: CreateLocationDTO): Promise<Location> {
    const res = await fetch(`${API_BASE}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loc)
    });
    if (!res.ok) throw new Error(`Failed to create location: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<Location>(json);
  },

  async deleteLocation(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/locations/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete location: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<{ success: boolean; id: string }>(json);
  },

  // --- Vendors ---
  async getVendors(): Promise<Vendor[]> {
    const res = await fetch(`${API_BASE}/vendors`);
    if (!res.ok) throw new Error(`Failed to fetch vendors: HTTP ${res.status}`);
    const rawData = await res.json();
    const data = unwrapResponse<any[]>(rawData);

    if (!Array.isArray(data)) return [];

    return data.map((v: any): Vendor => ({
      id: v.id,
      companyName: v.companyName,
      contactName: v.contactName || 'Primary Contact',
      email: v.email || 'contact@vendor.com',
      phone: v.phone || '+1 800-555-0199',
      website: v.website || 'https://vendor.com',
      vendorType: v.vendorType || 'Supplier',
      hourlyRate: Number(v.hourlyRate || 75),
      description: v.description || 'Service Partner'
    }));
  },

  async createVendor(vendor: CreateVendorDTO): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor)
    });
    if (!res.ok) throw new Error(`Failed to create vendor: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<Vendor>(json);
  },

  async deleteVendor(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/vendors/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete vendor: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<{ success: boolean; id: string }>(json);
  },

  // --- Meters ---
  async getMeters(): Promise<Meter[]> {
    const res = await fetch(`${API_BASE}/meters`);
    if (!res.ok) throw new Error(`Failed to fetch meters: HTTP ${res.status}`);
    const rawData = await res.json();
    const data = unwrapResponse<any[]>(rawData);

    if (!Array.isArray(data)) return [];

    return data.map((m: any): Meter => ({
      id: m.id,
      name: m.name,
      nextReadingDue: m.nextReadingDue || 'Weekly',
      unit: m.unit || 'Hours',
      lastReading: Number(m.lastReading || 0),
      locationName: typeof m.location === 'object' && m.location ? m.location.name : (typeof m.locationName === 'string' ? m.locationName : 'Main Plant'),
      assetName: typeof m.asset === 'object' && m.asset ? m.asset.name : (typeof m.assetName === 'string' ? m.assetName : 'Equipment'),
      createdBy: typeof m.createdBy === 'object' && m.createdBy ? m.createdBy.name : (typeof m.createdBy === 'string' ? m.createdBy : 'System'),
      createdAt: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent'
    }));
  },

  async createMeter(meter: CreateMeterDTO): Promise<Meter> {
    const res = await fetch(`${API_BASE}/meters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meter)
    });
    if (!res.ok) throw new Error(`Failed to create meter: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<Meter>(json);
  },

  async deleteMeter(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/meters/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete meter: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<{ success: boolean; id: string }>(json);
  },

  // --- Requests ---
  async getRequests(): Promise<MaintenanceRequest[]> {
    const res = await fetch(`${API_BASE}/requests`);
    if (!res.ok) throw new Error(`Failed to fetch requests: HTTP ${res.status}`);
    const rawData = await res.json();
    const data = unwrapResponse<any[]>(rawData);

    if (!Array.isArray(data)) return [];

    return data.map((r: any): MaintenanceRequest => ({
      id: r.id,
      title: r.title,
      priority: r.priority || 'MEDIUM',
      status: r.status || 'PENDING',
      locationName: typeof r.location === 'object' && r.location ? r.location.name : (typeof r.locationName === 'string' ? r.locationName : 'Facility'),
      assetName: typeof r.asset === 'object' && r.asset ? r.asset.name : (typeof r.assetName === 'string' ? r.assetName : 'General Asset'),
      createdBy: typeof r.createdBy === 'object' && r.createdBy ? r.createdBy.name : (typeof r.createdBy === 'string' ? r.createdBy : 'Staff'),
      createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Today',
      description: r.description || ''
    }));
  },

  async createRequest(req: CreateRequestDTO): Promise<MaintenanceRequest> {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) throw new Error(`Failed to create request: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<MaintenanceRequest>(json);
  },

  async deleteRequest(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/requests/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete request: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<{ success: boolean; id: string }>(json);
  },

  // --- Parts ---
  async getParts(): Promise<Part[]> {
    const res = await fetch(`${API_BASE}/parts`);
    if (!res.ok) throw new Error(`Failed to fetch parts: HTTP ${res.status}`);
    const rawData = await res.json();
    const data = unwrapResponse<any[]>(rawData);

    if (!Array.isArray(data)) return [];

    return data.map((p: any): Part => ({
      id: p.id,
      name: p.name,
      cost: Number(p.unitCost || p.cost || 0),
      quantity: Number(p.quantityOnHand || p.quantity || 0),
      minQuantity: Number(p.minQuantity || p.reorderPoint || 0),
      barcode: p.barcode || p.partNumber || '',
      area: p.area || 'Warehouse',
      category: typeof p.category === 'object' && p.category ? p.category.name : (p.category || 'General'),
      description: p.description || '',
      assignedTo: p.assignedTo || 'Unassigned',
      createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Active'
    }));
  },

  async createPart(part: Partial<Part>): Promise<Part> {
    const res = await fetch(`${API_BASE}/parts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(part)
    });
    if (!res.ok) throw new Error(`Failed to create part: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<Part>(json);
  },

  async updatePart(id: string, updates: Partial<Part>): Promise<Part> {
    const res = await fetch(`${API_BASE}/parts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`Failed to update part ${id}: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<Part>(json);
  },

  async deletePart(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/parts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete part: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<{ success: boolean; id: string }>(json);
  },

  // --- Preventive Maintenance (PMs) ---
  async getPMs(): Promise<PreventiveMaintenance[]> {
    const res = await fetch(`${API_BASE}/pms`);
    if (!res.ok) throw new Error(`Failed to fetch PMs: HTTP ${res.status}`);
    const rawData = await res.json();
    const data = unwrapResponse<any[]>(rawData);

    if (!Array.isArray(data)) return [];

    return data.map((pm: any): PreventiveMaintenance => ({
      id: pm.id,
      name: pm.name || pm.title,
      workOrderTitle: pm.workOrderTitle || pm.title,
      priority: pm.priority || 'MEDIUM',
      description: pm.description || '',
      frequency: pm.frequency || 'Monthly',
      nextWorkOrder: pm.nextDueDate ? new Date(pm.nextDueDate).toLocaleDateString() : (pm.nextWorkOrder || 'Due Soon'),
      worker: pm.assignedTo?.name || pm.worker || 'Technician',
      assignedTo: pm.assignedTo?.name || pm.assignedTo || 'Technician',
      locationName: pm.location?.name || pm.locationName || 'Main Plant',
      category: pm.category?.name || pm.category || 'General'
    }));
  },

  async createPM(pm: Partial<PreventiveMaintenance>): Promise<PreventiveMaintenance> {
    const res = await fetch(`${API_BASE}/pms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pm)
    });
    if (!res.ok) throw new Error(`Failed to create PM: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<PreventiveMaintenance>(json);
  },

  async updatePM(id: string, updates: Partial<PreventiveMaintenance>): Promise<PreventiveMaintenance> {
    const res = await fetch(`${API_BASE}/pms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`Failed to update PM ${id}: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<PreventiveMaintenance>(json);
  },

  async deletePM(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/pms/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete PM: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<{ success: boolean; id: string }>(json);
  },

  // --- Settings ---
  async getSettings(): Promise<SystemSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error(`Failed to fetch settings: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<SystemSettings>(json);
  },

  async updateSettings(settings: SystemSettings): Promise<SystemSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error(`Failed to update settings: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<SystemSettings>(json);
  },

  // --- V2: KPI Reports & Analytics ---
  async getKPI(): Promise<KPIData> {
    const res = await fetch(`${API_BASE}/reports/kpi`);
    if (!res.ok) throw new Error(`Failed to fetch KPI report: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<KPIData>(json);
  },

  // --- V2: Voice-to-Action Processing ---
  async processVoice(transcript: string, language = 'ar'): Promise<VoiceProcessResponse> {
    const res = await fetch(`${API_BASE}/voice/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, language })
    });
    if (!res.ok) throw new Error(`Failed to process voice: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<VoiceProcessResponse>(json);
  },

  // --- V2: Subscription & Quota Limits ---
  async getSubscription(): Promise<SubscriptionInfo> {
    const res = await fetch(`${API_BASE}/subscription`);
    if (!res.ok) throw new Error(`Failed to fetch subscription: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<SubscriptionInfo>(json);
  },

  // --- V2: Asset Life File & Compliance ---
  async getAssetLifeFile(id: string): Promise<AssetLifeFile> {
    const res = await fetch(`${API_BASE}/assets/${id}/life-file`);
    if (!res.ok) throw new Error(`Failed to fetch asset life file: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<AssetLifeFile>(json);
  },

  // --- V2: Bill of Materials (BOM) ---
  async getAssetBOM(assetId: string): Promise<AssetBOMItem[]> {
    const res = await fetch(`${API_BASE}/assets/${assetId}/bom`);
    if (!res.ok) throw new Error(`Failed to fetch BOM: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<AssetBOMItem[]>(json);
  },

  async addAssetBOM(assetId: string, partId: string, quantityNeeded = 1, notes?: string): Promise<AssetBOMItem> {
    const res = await fetch(`${API_BASE}/assets/${assetId}/bom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partId, quantityNeeded, notes })
    });
    if (!res.ok) throw new Error(`Failed to add BOM item: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<AssetBOMItem>(json);
  },

  async removeAssetBOM(assetId: string, partId: string): Promise<{ assetId: string; partId: string }> {
    const res = await fetch(`${API_BASE}/assets/${assetId}/bom/${partId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Failed to remove BOM item: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<{ assetId: string; partId: string }>(json);
  },

  // --- V2: Calibration Records ---
  async getAssetCalibrations(assetId: string): Promise<CalibrationRecord[]> {
    const res = await fetch(`${API_BASE}/assets/${assetId}/calibrations`);
    if (!res.ok) throw new Error(`Failed to fetch calibrations: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<CalibrationRecord[]>(json);
  },

  async createAssetCalibration(assetId: string, data: Partial<CalibrationRecord>): Promise<CalibrationRecord> {
    const res = await fetch(`${API_BASE}/assets/${assetId}/calibrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to create calibration: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<CalibrationRecord>(json);
  },

  // --- V2: Warehouse Locations ---
  async getWarehouseLocations(): Promise<WarehouseLocation[]> {
    const res = await fetch(`${API_BASE}/warehouse-locations`);
    if (!res.ok) throw new Error(`Failed to fetch warehouse locations: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<WarehouseLocation[]>(json);
  },

  async createWarehouseLocation(data: Partial<WarehouseLocation>): Promise<WarehouseLocation> {
    const res = await fetch(`${API_BASE}/warehouse-locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to create warehouse location: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<WarehouseLocation>(json);
  },

  // --- V2: Inventory Counts ---
  async getInventoryCounts(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/inventory-counts`);
    if (!res.ok) throw new Error(`Failed to fetch inventory counts: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<any[]>(json);
  },

  async createInventoryCount(title?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/inventory-counts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error(`Failed to create inventory count: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<any>(json);
  },

  async getInventoryCount(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/inventory-counts/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch inventory count details: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<any>(json);
  },

  async addInventoryCountItem(countId: string, partId: string, actualQuantity: number): Promise<any> {
    const res = await fetch(`${API_BASE}/inventory-counts/${countId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partId, actualQuantity })
    });
    if (!res.ok) throw new Error(`Failed to add inventory count item: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<any>(json);
  },

  // --- V2: Audit Logs ---
  async getAuditLogs(params?: { entityType?: string; entityId?: string; assetId?: string }): Promise<AuditLogItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.entityType) searchParams.append('entityType', params.entityType);
    if (params?.entityId) searchParams.append('entityId', params.entityId);
    if (params?.assetId) searchParams.append('assetId', params.assetId);

    const res = await fetch(`${API_BASE}/audit-logs?${searchParams.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch audit logs: HTTP ${res.status}`);
    const json = await res.json();
    return unwrapResponse<AuditLogItem[]>(json);
  }
};
