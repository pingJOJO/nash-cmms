export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export type Priority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AssetStatus = 'OPERATIONAL' | 'DOWN' | 'EMERGENCY_SHUTDOWN' | 'IN_STORAGE';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
}

export interface LaborLog {
  id: string;
  workerName: string;
  hours: number;
  hourlyRate: number;
  date: string;
  description?: string;
}

export interface AdditionalCost {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface PartUsage {
  id: string;
  partId: string;
  partName: string;
  quantity: number;
  unitCost: number;
}

export interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export interface WorkOrder {
  id: string; // e.g. "WO000001"
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: Priority;
  imageUrl?: string;
  locationId?: string;
  locationName: string;
  locationAddress?: string;
  assetId?: string;
  assetName: string;
  assetStatus?: AssetStatus;
  dueDate: string;
  expectedStartDate?: string;
  estimatedDurationHours?: number;
  category: string;
  assignedToId?: string;
  assignedToName: string;
  assignedToAvatar?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  requiresSignature: boolean;
  tasks: TaskItem[];
  labors: LaborLog[];
  additionalCosts: AdditionalCost[];
  parts: PartUsage[];
  comments: CommentItem[];
}

export type ABCClass = 'A_CRITICAL' | 'B_ESSENTIAL' | 'C_GENERAL';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type SubscriptionTier = 'TRIAL' | 'BASIC' | 'HOSPITAL_FACTORY' | 'ENTERPRISE';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'STOCK_ADJUSTMENT' | 'CALIBRATION' | 'VOICE_ENTRY';

export interface WarehouseLocation {
  id: string;
  code: string;
  label: string;
  level: 'WAREHOUSE' | 'ZONE' | 'RACK' | 'BIN';
  qrCode?: string;
  colorCode?: string;
  parentId?: string;
  parent?: WarehouseLocation;
  children?: WarehouseLocation[];
}

export interface Asset {
  id: string;
  name: string;
  status: AssetStatus;
  locationName: string;
  locationId?: string;
  area?: string;
  model?: string;
  serialNumber?: string;
  barcode: string;
  category: string;
  categoryId?: string;
  description: string;
  primaryWorker: string;
  primaryWorkerId?: string;
  imageUrl?: string;
  createdAt: string;

  // V2 Life File & Compliance
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  manufacturer?: string;
  riskLevel?: RiskLevel;
}

export interface PreventiveMaintenance {
  id: string;
  name: string;
  workOrderTitle: string;
  priority: Priority;
  description: string;
  frequency: string; // e.g. "Quarterly", "Weekly"
  nextWorkOrder: string;
  worker: string;
  assignedTo: string;
  locationName: string;
  category: string;
}

export interface Part {
  id: string;
  name: string;
  cost: number;
  quantity: number;
  minQuantity: number;
  barcode: string;
  area?: string;
  category: string;
  description: string;
  assignedTo?: string;
  createdAt: string;

  // V2 Smart Inventory
  abcClass?: ABCClass;
  warehouseLocationId?: string;
  warehouseLocation?: WarehouseLocation;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  priority: Priority;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONVERTED';
  locationName: string;
  assetName: string;
  createdBy: string;
  createdAt: string;
  description: string;
}

export interface Meter {
  id: string;
  name: string;
  nextReadingDue: string;
  unit: string;
  lastReading: number;
  locationName: string;
  assetName: string;
  createdBy: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  vendorType: string;
  hourlyRate: number;
  description: string;
}

export interface UserMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Administrator' | 'Technician' | 'Requester' | 'Manager';
  jobTitle: string;
  hourlyRate: number;
  scheduled: boolean;
  lastLogin: string;
}

export interface SystemSettings {
  language: string;
  dateFormat: string;
  timeZone: string;
  currency: string;
  preWorkOrderLeadDays: number;
  csvSeparator: string;
  brandColor: string;
}

// ═══════════════════════════════════════════
// V2 Models & Interfaces
// ═══════════════════════════════════════════

export interface AssetBOMItem {
  id: string;
  assetId: string;
  partId: string;
  partName: string;
  partBarcode?: string;
  quantityNeeded: number;
  inStock?: number;
  minQuantity?: number;
  cost?: number;
  warehouseLocation?: string;
  notes?: string;
}

export interface CalibrationRecord {
  id: string;
  assetId: string;
  calibrationDate: string;
  nextDueDate: string;
  performedById?: string;
  performedByName?: string;
  certificateUrl?: string;
  vendor?: string;
  result: 'PASS' | 'FAIL' | 'CONDITIONAL';
  notes?: string;
  createdAt?: string;
}

export interface AuditLogItem {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId: string;
  user?: { id: string; name: string };
  assetId?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface AssetLifeFile {
  asset: Asset & {
    categoryName?: string;
    primaryWorkerName?: string;
  };
  metrics: {
    totalWorkOrders: number;
    completedWorkOrders: number;
    totalDowntimeHours: number;
    totalMaintenanceCost: number;
    costRatioOfPurchase: number | null;
    isCalibrationValid: boolean | null;
    calibrationDueInDays: number | null;
  };
  workOrders: any[];
  pms: any[];
  calibrations: CalibrationRecord[];
  bomParts: AssetBOMItem[];
  auditLogs: AuditLogItem[];
  meters: any[];
}

export interface SubscriptionInfo {
  subscription: {
    id: string;
    tier: SubscriptionTier;
    maxAssets: number;
    maxUsers: number;
    maxLocations: number;
    featuresEnabled: string[];
    startsAt: string;
    expiresAt?: string;
    isActive: boolean;
  };
  usage: {
    assets: { current: number; max: number; percentage: number };
    users: { current: number; max: number; percentage: number };
    locations: { current: number; max: number; percentage: number };
  };
  warnings: string[];
}

export interface KPIData {
  mttr: {
    value: number;
    unit: string;
    trend: 'good' | 'moderate' | 'needs_improvement';
    benchmark: number;
  };
  mtbf: {
    value: number;
    unit: string;
    topFailingAssets: Array<{ assetId: string; name: string; failures: number }>;
  };
  pmCompliance: {
    percentage: number;
    onTime: number;
    overdue: number;
    total: number;
  };
  downtimeCost: {
    laborCost: number;
    partsCost: number;
    additionalCost: number;
    total: number;
    currency: string;
  };
  workOrderStats: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    onHold: number;
    cancelled: number;
  };
  environmentalImpact: {
    assetLifeExtensionPercent: number;
    paperFormsSaved: number;
    energySavingsPercent: number;
    score: number;
  };
  generatedAt: string;
}

export interface VoiceProcessResponse {
  id: string;
  actionType: 'CREATE_WO' | 'CLOSE_WO' | 'STOCK_UPDATE' | 'PARTS_DEDUCTION' | 'UNKNOWN';
  parsedData: Record<string, any>;
  confidence: number;
  processingMs: number;
  requiresConfirmation: boolean;
  message: string;
}

