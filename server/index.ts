import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { 
  PrismaClient, 
  WorkOrderStatus, 
  Priority, 
  AssetStatus, 
  UserRole, 
  RequestStatus,
  ABCClass,
  RiskLevel,
  AuditAction,
  SubscriptionTier,
  InventoryCountStatus
} from '@prisma/client';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3010;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Safe date parser to protect Prisma from Invalid Date exceptions
function parseSafeDate(value: any): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d;
  return undefined;
}

// Standardized Unified API Response Helpers
function sendSuccess(res: Response, data: any, message?: string, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message: message || 'Operation completed successfully'
  });
}

function sendError(res: Response, error: string, details?: any, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    error,
    details: details ? (typeof details === 'object' ? details.message || JSON.stringify(details) : String(details)) : error
  });
}

// Helper to resolve fallback user dynamically so FK never breaks
async function getDynamicUserId(preferredId?: string): Promise<string> {
  if (preferredId) {
    const user = await prisma.user.findUnique({ where: { id: preferredId } });
    if (user) return user.id;
  }
  const firstUser = await prisma.user.findFirst();
  if (firstUser) return firstUser.id;

  // Create default fallback admin if DB is empty
  const defaultAdmin = await prisma.user.create({
    data: {
      id: 'USR-001',
      name: 'Omar Dabobash',
      email: 'omar@nash-cmms.internal',
      role: UserRole.ADMINISTRATOR,
      jobTitle: 'Lead Facility & Maintenance Engineer',
      hourlyRate: 45.00
    }
  });
  return defaultAdmin.id;
}

// Helper to record immutable audit log entries (HCAC/JCI ISO compliance)
async function createAuditLog(
  action: AuditAction,
  entityType: string,
  entityId: string,
  userId: string,
  details?: { assetId?: string; previousValue?: string; newValue?: string; reason?: string; ipAddress?: string }
) {
  try {
    const resolvedUserId = await getDynamicUserId(userId);
    return await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId: resolvedUserId,
        assetId: details?.assetId,
        previousValue: details?.previousValue,
        newValue: details?.newValue,
        reason: details?.reason,
        ipAddress: details?.ipAddress
      }
    });
  } catch (e) {
    console.warn('Failed to record audit log:', e);
  }
}

// -------------------------------------------------------------
// CORS Configuration & Security
// -------------------------------------------------------------
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
const configuredOrigins = allowedOriginsEnv
  ? allowedOriginsEnv.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3010'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile app, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (NODE_ENV === 'development') return callback(null, true);
    if (configuredOrigins.includes(origin) || configuredOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy: Request origin blocked by server security'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Static uploads directory for maintenance photos and receipts
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir, { maxAge: '30d' }));

// Request Logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 1. HEALTHCHECK & SYSTEM TELEMETRY
// ==========================================
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;

    return sendSuccess(res, {
      status: 'healthy',
      app: 'NASH CMMS',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        latencyMs: dbLatencyMs
      },
      memory: {
        rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      }
    }, 'System operational and healthy');
  } catch (error: any) {
    return sendError(res, 'System unhealthy: Database connectivity failure', error.message, 503);
  }
});

// ==========================================
// V2: KPI REPORTS & ANALYTICS API
// ==========================================
app.get(['/api/reports/kpi', '/api/kpi'], async (_req: Request, res: Response) => {
  try {
    // Fetch all completed work orders for MTTR calculation
    const completedWOs = await prisma.workOrder.findMany({
      where: { status: WorkOrderStatus.COMPLETED },
      include: {
        labors: true,
        partsUsed: { include: { part: true } },
        additionalCosts: true,
        asset: true
      }
    });

    const allWOs = await prisma.workOrder.findMany({
      include: { asset: true }
    });

    // --- MTTR: Mean Time To Repair ---
    let totalRepairHours = 0;
    let repairCount = 0;
    for (const wo of completedWOs) {
      const laborHours = wo.labors.reduce((sum, l) => sum + Number(l.hours), 0);
      if (laborHours > 0) {
        totalRepairHours += laborHours;
        repairCount++;
      }
    }
    const mttr = repairCount > 0 ? Math.round((totalRepairHours / repairCount) * 10) / 10 : 0;

    // --- MTBF: Mean Time Between Failures ---
    // Group failures by asset
    const assetFailures: Record<string, number> = {};
    for (const wo of allWOs) {
      if (wo.assetId && (wo.status === 'COMPLETED' || wo.status === 'IN_PROGRESS')) {
        assetFailures[wo.assetId] = (assetFailures[wo.assetId] || 0) + 1;
      }
    }

    const totalAssets = await prisma.asset.count();
    const totalFailures = Object.values(assetFailures).reduce((s, v) => s + v, 0);
    // Assume 720 operating hours/month per asset as baseline
    const operatingHoursPerMonth = 720;
    const mtbf = totalFailures > 0
      ? Math.round((totalAssets * operatingHoursPerMonth) / totalFailures)
      : operatingHoursPerMonth;

    // Top failing assets
    const topFailingAssets = Object.entries(assetFailures)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([assetId, failures]) => {
        const wo = allWOs.find(w => w.assetId === assetId);
        return { assetId, name: wo?.asset?.name || 'Unknown Asset', failures };
      });

    // --- PM Compliance ---
    const allPMs = await prisma.preventiveMaintenance.findMany();
    const now = new Date();
    let onTime = 0;
    let overdue = 0;
    for (const pm of allPMs) {
      if (new Date(pm.nextDueDate) < now) {
        overdue++;
      } else {
        onTime++;
      }
    }
    const totalPMs = allPMs.length;
    const pmCompliance = totalPMs > 0 ? Math.round((onTime / totalPMs) * 1000) / 10 : 100;

    // --- Downtime Cost ---
    let totalLaborCost = 0;
    let totalPartsCost = 0;
    let totalAdditionalCost = 0;
    for (const wo of completedWOs) {
      totalLaborCost += wo.labors.reduce((s, l) => s + Number(l.hours) * Number(l.hourlyRate), 0);
      totalPartsCost += wo.partsUsed.reduce((s, p) => s + Number(p.quantity) * Number(p.unitCost), 0);
      totalAdditionalCost += wo.additionalCosts.reduce((s, c) => s + Number(c.amount), 0);
    }
    const totalMaintenanceCost = Math.round((totalLaborCost + totalPartsCost + totalAdditionalCost) * 100) / 100;

    // --- Environmental Impact ---
    const totalWOCount = allWOs.length;
    const paperFormsSaved = totalWOCount * 3; // ~3 forms per WO (report, checklist, sign-off)
    const assetLifeExtensionPercent = pmCompliance > 80 ? 18 : (pmCompliance > 60 ? 12 : 5);
    const energySavingsPercent = pmCompliance > 80 ? 7 : (pmCompliance > 60 ? 4 : 2);

    return sendSuccess(res, {
      mttr: {
        value: mttr,
        unit: 'hours',
        trend: mttr < 4 ? 'good' : (mttr < 8 ? 'moderate' : 'needs_improvement'),
        benchmark: 4.0
      },
      mtbf: {
        value: mtbf,
        unit: 'hours',
        topFailingAssets
      },
      pmCompliance: {
        percentage: pmCompliance,
        onTime,
        overdue,
        total: totalPMs
      },
      downtimeCost: {
        laborCost: Math.round(totalLaborCost * 100) / 100,
        partsCost: Math.round(totalPartsCost * 100) / 100,
        additionalCost: Math.round(totalAdditionalCost * 100) / 100,
        total: totalMaintenanceCost,
        currency: 'USD'
      },
      workOrderStats: {
        total: allWOs.length,
        open: allWOs.filter(w => w.status === 'OPEN').length,
        inProgress: allWOs.filter(w => w.status === 'IN_PROGRESS').length,
        completed: completedWOs.length,
        onHold: allWOs.filter(w => w.status === 'ON_HOLD').length,
        cancelled: allWOs.filter(w => w.status === 'CANCELLED').length
      },
      environmentalImpact: {
        assetLifeExtensionPercent,
        paperFormsSaved,
        energySavingsPercent,
        score: Math.round(
          (assetLifeExtensionPercent * 0.4) +
          (Math.min(paperFormsSaved / 100, 10) * 0.3 * 10) +
          (energySavingsPercent * 0.3 * 10)
        )
      },
      generatedAt: new Date().toISOString()
    }, 'KPI report generated successfully');
  } catch (error: any) {
    console.error('KPI report generation failed:', error);
    return sendError(res, 'Failed to generate KPI report', error.message);
  }
});

// ==========================================
// V2: VOICE-TO-ACTION PROCESSING API
// ==========================================
app.post('/api/voice/process', async (req: Request, res: Response) => {
  try {
    const { transcript, language = 'ar', userId } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return sendError(res, 'Missing or invalid transcript text', null, 400);
    }

    const startTime = Date.now();
    const resolvedUserId = await getDynamicUserId(userId || (req.headers['x-user-id'] as string));
    const text = transcript.trim();

    // --- Enhanced Pattern Matching Engine for Arabic & English ---
    let actionType = 'UNKNOWN';
    let parsedData: Record<string, any> = {};
    let entityId: string | null = null;

    // Pattern 1: Close Work Order
    // Matches: أغلق أمر العمل WO000001 تم الفحص بنجاح / close work order WO000001 completed / أنهيت WO000001 / أغلق أمر العمل 1
    const closeMatch = text.match(/(?:أغلق|انتهيت\s+من|أنهيت|تم\s+إنجاز|تم\s+إغلاق|إغلاق|close|complete|finish)\s+(?:أمر\s+(?:العمل|عمل)|أمر|بلاغ|تذكرة|work\s+order)?\s*(?:رقم|#)?\s*([a-zA-Z0-9_-]+)(?:\s+(.+))?/i);
    if (closeMatch && (closeMatch[1].match(/^(WO|wo|[a-zA-Z]{1,3}-?\d+|\d+)$/i) || closeMatch[0].includes('أمر') || closeMatch[0].includes('order') || closeMatch[0].includes('بلاغ'))) {
      let code = closeMatch[1].toUpperCase();
      if (/^\d+$/.test(code)) {
        code = 'WO' + code.padStart(6, '0');
      }
      actionType = 'CLOSE_WO';
      parsedData = {
        workOrderCode: code,
        actionTaken: closeMatch[2]?.trim() || (language === 'ar' ? 'تم الفحص والإنجاز بنجاح' : 'Inspected and completed successfully'),
        status: 'COMPLETED'
      };
    }

    // Pattern 2: Stock Update / Shelf Inventory Count (e.g. رف A-02 رولمان بلي 6204 العدد 15 or جرد رف A-02...)
    if (actionType === 'UNKNOWN') {
      const stockMatch = text.match(/(?:جرد\s+)?(?:رف|shelf|rack|bin)\s+([a-zA-Z0-9_-]+)\s*[,،]?\s*(.+?)\s*[,،]?\s*(?:(?:العدد|الكمية|عدد|count|qty)\s*[:=]?\s*(\d+)|(\d+)\s*(?:حبة|قطعة|وحدة|piece|pcs)?)$/i);
      if (stockMatch) {
        const qty = parseInt(stockMatch[3] || stockMatch[4], 10);
        actionType = 'STOCK_UPDATE';
        parsedData = {
          binLocation: stockMatch[1].trim(),
          partName: stockMatch[2].trim(),
          quantity: isNaN(qty) ? 1 : qty
        };
      }
    }

    // Pattern 3: Parts Deduction / Consumption (e.g. استخدمت 2 رولمان بلي من المستودع / used 2 bearings from warehouse)
    if (actionType === 'UNKNOWN') {
      const partsMatch = text.match(/(?:استخدمت|استعملت|صرفت|used|consumed)\s+(\d+)\s*(?:من|of|قطعة|وحدة)?\s*(.+?)(?:\s+من\s+(?:المستودع|مستودع|warehouse)\s*(.*))?$/i);
      if (partsMatch) {
        actionType = 'PARTS_DEDUCTION';
        parsedData = {
          quantity: parseInt(partsMatch[1], 10),
          partName: partsMatch[2]?.trim(),
          warehouse: partsMatch[3]?.trim() || (language === 'ar' ? 'المستودع الرئيسي' : 'Main Warehouse')
        };
      }
    }

    // Pattern 4: Create Work Order / Report Fault (e.g. أنشئ بلاغ عطل لمضخة الأكسجين في قسم العناية المركزة)
    if (actionType === 'UNKNOWN') {
      const createMatch = text.match(/(?:أنشئ|سجل|فتح|بلاغ|عطل|خراب|مشكلة|تسريب|توقف|ماس|حرارة|report|create|breakdown|leak)\s+(?:بلاغ\s+عطل|أمر\s+عمل|عطل|مشكلة|work\s+order)?\s*(?:في|ل|for|in)?\s*(.+)/i);
      if (createMatch) {
        const rawSubject = createMatch[1].trim();
        actionType = 'CREATE_WO';
        parsedData = {
          title: language === 'ar' ? `بلاغ عطل: ${rawSubject}` : `Fault Report: ${rawSubject}`,
          assetName: rawSubject,
          priority: 'HIGH',
          status: 'OPEN'
        };
      }
    }

    const processingMs = Date.now() - startTime;
    const confidence = actionType !== 'UNKNOWN' ? 0.95 : 0.30;

    // Log the voice command
    const voiceLog = await prisma.voiceCommandLog.create({
      data: {
        userId: resolvedUserId,
        rawTranscript: transcript,
        language,
        parsedJson: JSON.stringify(parsedData),
        actionType,
        entityId,
        confidence,
        processingMs
      }
    });

    return sendSuccess(res, {
      id: voiceLog.id,
      actionType,
      parsedData,
      confidence: Number(confidence),
      processingMs,
      requiresConfirmation: true,
      message: actionType !== 'UNKNOWN'
        ? `تم تحليل الأمر الصوتي بنجاح — ${actionType}`
        : 'لم يتم التعرف على الأمر. يرجى إعادة المحاولة بصياغة أوضح.'
    }, 'Voice command processed', 201);
  } catch (error: any) {
    console.error('Voice processing failed:', error);
    return sendError(res, 'Failed to process voice command', error.message);
  }
});

// ==========================================
// V2: SUBSCRIPTION & PACKAGE LIMITS API
// ==========================================
app.get('/api/subscription', async (_req: Request, res: Response) => {
  try {
    let subscription = await prisma.subscription.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // Auto-create a default trial subscription if none exists
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          tier: 'TRIAL',
          maxAssets: 50,
          maxUsers: 3,
          maxLocations: 1,
          featuresEnabled: ['QR', 'WORK_ORDERS', 'PM', 'PARTS_BASIC'],
          isActive: true
        }
      });
    }

    // Get current usage counts
    const [assetCount, userCount, locationCount] = await Promise.all([
      prisma.asset.count(),
      prisma.user.count(),
      prisma.location.count()
    ]);

    return sendSuccess(res, {
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        maxAssets: subscription.maxAssets,
        maxUsers: subscription.maxUsers,
        maxLocations: subscription.maxLocations,
        featuresEnabled: subscription.featuresEnabled,
        startsAt: subscription.startsAt,
        expiresAt: subscription.expiresAt,
        isActive: subscription.isActive
      },
      usage: {
        assets: { current: assetCount, max: subscription.maxAssets, percentage: Math.round((assetCount / subscription.maxAssets) * 100) },
        users: { current: userCount, max: subscription.maxUsers, percentage: Math.round((userCount / subscription.maxUsers) * 100) },
        locations: { current: locationCount, max: subscription.maxLocations, percentage: Math.round((locationCount / subscription.maxLocations) * 100) }
      },
      warnings: [
        ...(assetCount >= subscription.maxAssets * 0.9 ? [`⚠️ Asset usage at ${Math.round((assetCount / subscription.maxAssets) * 100)}% — consider upgrading`] : []),
        ...(userCount >= subscription.maxUsers * 0.9 ? [`⚠️ User limit at ${Math.round((userCount / subscription.maxUsers) * 100)}% — consider upgrading`] : []),
        ...(subscription.expiresAt && new Date(subscription.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? ['⚠️ Subscription expires within 7 days'] : [])
      ]
    }, 'Subscription status retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch subscription', error.message);
  }
});

// ==========================================
// 2. FILE UPLOADS API
// ==========================================
app.post('/api/upload', async (req: Request, res: Response) => {
  try {
    const { filename, base64Data } = req.body;
    if (!base64Data) {
      return sendError(res, 'No base64Data provided in request body', null, 400);
    }

    const ext = path.extname(filename || '') || '.jpg';
    const cleanBaseName = path.basename(filename || 'attachment', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `${Date.now()}_${cleanBaseName}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    console.log(`📸 Saved attachment to ${filePath} (Size: ${(buffer.length / 1024).toFixed(1)} KB)`);

    return sendSuccess(res, {
      filename: uniqueFileName,
      url: publicUrl,
      sizeBytes: buffer.length
    }, 'File uploaded successfully', 201);
  } catch (error: any) {
    console.error('Upload failed:', error);
    return sendError(res, 'Failed to process file upload', error.message, 500);
  }
});

// ==========================================
// 3. DATABASE BACKUP EXPORT API
// ==========================================
app.get('/api/admin/backup', async (_req: Request, res: Response) => {
  try {
    const [
      users,
      locations,
      categories,
      assets,
      workOrders,
      pms,
      parts,
      meters,
      requests,
      vendors,
      settings
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.location.findMany(),
      prisma.category.findMany(),
      prisma.asset.findMany(),
      prisma.workOrder.findMany({
        include: {
          tasks: true,
          labors: true,
          additionalCosts: true,
          partsUsed: true,
          comments: true
        }
      }),
      prisma.preventiveMaintenance.findMany(),
      prisma.part.findMany(),
      prisma.meter.findMany(),
      prisma.maintenanceRequest.findMany(),
      prisma.vendor.findMany(),
      prisma.systemSetting.findMany()
    ]);

    const backupPayload = {
      system: 'NASH CMMS',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      schemaEngine: 'PostgreSQL-Prisma',
      totalRecords: {
        users: users.length,
        locations: locations.length,
        categories: categories.length,
        assets: assets.length,
        workOrders: workOrders.length,
        preventiveMaintenances: pms.length,
        parts: parts.length,
        meters: meters.length,
        requests: requests.length,
        vendors: vendors.length
      },
      data: {
        users,
        locations,
        categories,
        assets,
        workOrders,
        pms,
        parts,
        meters,
        requests,
        vendors,
        settings
      }
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="nash_cmms_backup_${timestamp}.json"`);
    res.send(JSON.stringify(backupPayload, null, 2));
  } catch (error: any) {
    return sendError(res, 'Failed to generate database backup', error.message, 500);
  }
});

// ==========================================
// 4. WORK ORDERS REST API (Atomic Transactions)
// ==========================================
app.get('/api/work-orders', async (_req: Request, res: Response) => {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        tasks: { orderBy: { orderIndex: 'asc' } },
        labors: { include: { user: true } },
        additionalCosts: true,
        partsUsed: { include: { part: true } },
        comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
        location: true,
        asset: true,
        category: true,
        assignedTo: true,
        createdBy: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return sendSuccess(res, workOrders, 'Work orders retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch work orders', error.message);
  }
});

app.get('/api/work-orders/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { orderIndex: 'asc' } },
        labors: { include: { user: true } },
        additionalCosts: true,
        partsUsed: { include: { part: true } },
        comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
        location: true,
        asset: true,
        category: true,
        assignedTo: true,
        createdBy: true
      }
    });

    if (!workOrder) {
      return sendError(res, 'Work Order not found', null, 404);
    }
    return sendSuccess(res, workOrder, 'Work order retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch work order', error.message);
  }
});

app.post('/api/work-orders', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Run creation, inventory deduction, and checklist assignment in an atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Resolve Creator User dynamically
      const creatorId = await getDynamicUserId(body.createdById || (req.headers['x-user-id'] as string));

      // 2. Resolve Foreign Keys
      let locationId = body.locationId;
      if (!locationId && body.locationName) {
        const foundLoc = await tx.location.findFirst({ where: { name: body.locationName } });
        if (foundLoc) locationId = foundLoc.id;
      }

      let assetId = body.assetId;
      if (!assetId && body.assetName) {
        const foundAsset = await tx.asset.findFirst({ where: { name: body.assetName } });
        if (foundAsset) assetId = foundAsset.id;
      }

      let categoryId = body.categoryId;
      if (!categoryId && body.category) {
        const catName = typeof body.category === 'object' ? body.category.name : body.category;
        const foundCat = await tx.category.findFirst({ where: { name: catName } });
        if (foundCat) categoryId = foundCat.id;
      }

      let assignedToId = body.assignedToId;
      if (!assignedToId && body.assignedToName) {
        const foundUser = await tx.user.findFirst({ where: { name: body.assignedToName } });
        if (foundUser) assignedToId = foundUser.id;
      }

      // Generate sequential code if not provided
      const count = await tx.workOrder.count();
      const code = body.code || `WO${String(count + 1).padStart(6, '0')}`;

      // 3. Create the Work Order
      const newWO = await tx.workOrder.create({
        data: {
          code,
          title: body.title || 'Untitled Work Order',
          description: body.description || '',
          status: body.status || WorkOrderStatus.OPEN,
          priority: body.priority || Priority.MEDIUM,
          imageUrl: body.imageUrl,
          locationId: locationId || undefined,
          assetId: assetId || undefined,
          categoryId: categoryId || undefined,
          assignedToId: assignedToId || undefined,
          createdById: creatorId,
          dueDate: parseSafeDate(body.dueDate) || null,
          expectedStartDate: parseSafeDate(body.expectedStartDate) || null,
          estimatedDurationHours: body.estimatedDurationHours ? Number(body.estimatedDurationHours) : undefined,
          requiresSignature: !!body.requiresSignature
        }
      });

      // 4. Create Tasks if provided
      if (Array.isArray(body.tasks) && body.tasks.length > 0) {
        for (let i = 0; i < body.tasks.length; i++) {
          const t = body.tasks[i];
          const taskTitle = typeof t === 'string' ? t : (t.title || `Task ${i + 1}`);
          const isCompleted = typeof t === 'object' ? !!t.completed : false;
          await tx.workOrderTask.create({
            data: {
              workOrderId: newWO.id,
              title: taskTitle,
              completed: isCompleted,
              orderIndex: i
            }
          });
        }
      }

      // 5. Deduct Parts Inventory & Link WorkOrderPart records
      const partsToUse = Array.isArray(body.parts) ? body.parts : (Array.isArray(body.partsUsed) ? body.partsUsed : []);
      if (partsToUse.length > 0) {
        for (const item of partsToUse) {
          const qty = Number(item.quantity || item.quantityUsed || 1);
          let targetPart = null;

          if (item.partId) {
            targetPart = await tx.part.findUnique({ where: { id: item.partId } });
          }
          if (!targetPart && item.partName) {
            targetPart = await tx.part.findFirst({ where: { name: item.partName } });
          }

          if (targetPart) {
            // Deduct stock safely
            await tx.part.update({
              where: { id: targetPart.id },
              data: {
                quantity: {
                  decrement: qty
                }
              }
            });

            // Create work order part linkage
            await tx.workOrderPart.create({
              data: {
                workOrderId: newWO.id,
                partId: targetPart.id,
                quantity: qty,
                unitCost: item.unitCost ? Number(item.unitCost) : targetPart.cost
              }
            });
          }
        }
      }

      // Return fully hydrated work order with relations
      return await tx.workOrder.findUnique({
        where: { id: newWO.id },
        include: {
          tasks: { orderBy: { orderIndex: 'asc' } },
          labors: { include: { user: true } },
          additionalCosts: true,
          partsUsed: { include: { part: true } },
          comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
          location: true,
          asset: true,
          category: true,
          assignedTo: true,
          createdBy: true
        }
      });
    });

    return sendSuccess(res, result, 'Work order created successfully with atomic inventory sync', 201);
  } catch (error: any) {
    console.error('Failed to create work order:', error);
    return sendError(res, 'Failed to create work order', error.message, 500);
  }
});

app.put('/api/work-orders/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current work order state by ID or Code (case-insensitive)
      const current = await tx.workOrder.findFirst({
        where: {
          OR: [
            { id },
            { code: id },
            { id: id.toUpperCase() },
            { code: id.toUpperCase() }
          ]
        },
        include: { partsUsed: true }
      });

      if (!current) {
        throw new Error(`Work order with ID/Code ${id} not found`);
      }

      const isMarkingCompleted = body.status === WorkOrderStatus.COMPLETED && current.status !== WorkOrderStatus.COMPLETED;

      // 2. If transitioning to COMPLETED, ensure parts stock is deducted atomically
      if (isMarkingCompleted && current.partsUsed.length > 0) {
        for (const item of current.partsUsed) {
          await tx.part.update({
            where: { id: item.partId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          });
        }
      }

      // 3. Update the work order
      let resolvedAssignedId = body.assignedToId;
      if (!resolvedAssignedId && body.assignedToName) {
        const foundUser = await tx.user.findFirst({
          where: {
            OR: [
              { name: { contains: body.assignedToName.split(' ')[0], mode: 'insensitive' } },
              { email: { contains: 'tech', mode: 'insensitive' } }
            ]
          }
        });
        if (foundUser) resolvedAssignedId = foundUser.id;
      }

      const parsedDueDate = parseSafeDate(body.dueDate);
      const parsedStartDate = parseSafeDate(body.expectedStartDate);

      const updateData: any = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.priority !== undefined) updateData.priority = body.priority;
      if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
      if (body.locationId !== undefined) updateData.locationId = body.locationId;
      if (body.assetId !== undefined) updateData.assetId = body.assetId;
      if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
      if (resolvedAssignedId !== undefined) updateData.assignedToId = resolvedAssignedId;
      if (parsedDueDate !== undefined) updateData.dueDate = parsedDueDate;
      if (parsedStartDate !== undefined) updateData.expectedStartDate = parsedStartDate;
      if (body.estimatedDurationHours !== undefined) updateData.estimatedDurationHours = Number(body.estimatedDurationHours);
      if (body.requiresSignature !== undefined) updateData.requiresSignature = body.requiresSignature;

      const updated = await tx.workOrder.update({
        where: { id: current.id },
        data: updateData,
        include: {
          tasks: { orderBy: { orderIndex: 'asc' } },
          labors: { include: { user: true } },
          additionalCosts: true,
          partsUsed: { include: { part: true } },
          comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
          location: true,
          asset: true,
          category: true,
          assignedTo: true,
          createdBy: true
        }
      });

      return updated;
    });

    // Record audit log if status changed
    if (body.status) {
      await createAuditLog(
        AuditAction.STATUS_CHANGE,
        'WorkOrder',
        id,
        (req.headers['x-user-id'] as string) || 'USR-001',
        {
          assetId: result.assetId || undefined,
          newValue: body.status,
          reason: `Work order status updated to ${body.status}`
        }
      );
    }

    return sendSuccess(res, result, `Work order ${id} updated successfully`);
  } catch (error: any) {
    return sendError(res, 'Failed to update work order', error.message);
  }
});

app.delete('/api/work-orders/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const wo = await prisma.workOrder.findFirst({
      where: {
        OR: [
          { id },
          { code: id },
          { id: id.toUpperCase() },
          { code: id.toUpperCase() }
        ]
      }
    });
    if (!wo) {
      return sendError(res, `Work order ${id} not found`, null, 404);
    }
    await prisma.workOrder.delete({ where: { id: wo.id } });
    return sendSuccess(res, { id: wo.id }, `Work order ${id} deleted successfully`);
  } catch (error: any) {
    return sendError(res, 'Failed to delete work order', error.message);
  }
});

// ==========================================
// 5. ASSETS REST API (Full CRUD)
// ==========================================
app.get('/api/assets', async (_req: Request, res: Response) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        location: true,
        category: true,
        primaryWorker: true,
        workOrders: { take: 5, orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
    const mapped = assets.map(a => ({
      ...a,
      category: a.category?.name || 'General',
      locationName: a.location?.name || 'Main Plant',
      primaryWorker: a.primaryWorker?.name || 'Technician'
    }));
    return sendSuccess(res, mapped, 'Assets retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch assets', error.message);
  }
});

app.get('/api/assets/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        location: true,
        category: true,
        primaryWorker: true,
        workOrders: { take: 10, orderBy: { createdAt: 'desc' } },
        pms: true,
        meters: true
      }
    });
    if (!asset) return sendError(res, 'Asset not found', null, 404);
    return sendSuccess(res, asset, 'Asset retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch asset', error.message);
  }
});

app.post('/api/assets', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Subscription Limit Verification (Tier Enforcement)
    const subscription = await prisma.subscription.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    if (subscription) {
      const currentAssetCount = await prisma.asset.count();
      if (currentAssetCount >= subscription.maxAssets) {
        return sendError(
          res,
          `Subscription limit reached: Current tier allows up to ${subscription.maxAssets} assets. Please upgrade to add more assets.`,
          { currentCount: currentAssetCount, maxLimit: subscription.maxAssets, tier: subscription.tier },
          403
        );
      }
    }

    const count = await prisma.asset.count();
    const id = body.id || `AST-${String(count + 1).padStart(3, '0')}`;

    // Resolve locationId if locationName provided
    let locationId = body.locationId;
    if (!locationId && body.locationName) {
      const found = await prisma.location.findFirst({ where: { name: body.locationName } });
      if (found) locationId = found.id;
    }

    // Resolve categoryId if category name provided
    let categoryId = body.categoryId;
    if (!categoryId && body.category) {
      const found = await prisma.category.findFirst({ where: { name: body.category } });
      if (found) categoryId = found.id;
    }

    const newAsset = await prisma.asset.create({
      data: {
        id,
        name: body.name,
        status: body.status || AssetStatus.OPERATIONAL,
        model: body.model,
        serialNumber: body.serialNumber,
        barcode: body.barcode || `BC-${Date.now().toString().slice(-5)}`,
        area: body.area,
        description: body.description,
        locationId,
        categoryId,
        primaryWorkerId: body.primaryWorkerId,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
        purchasePrice: body.purchasePrice !== undefined ? Number(body.purchasePrice) : undefined,
        warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : undefined,
        manufacturer: body.manufacturer,
        riskLevel: (body.riskLevel as RiskLevel) || RiskLevel.LOW
      },
      include: { location: true, category: true, primaryWorker: true }
    });

    await createAuditLog(AuditAction.CREATE, 'Asset', newAsset.id, body.primaryWorkerId || 'USR-001', {
      assetId: newAsset.id,
      newValue: `Created asset ${newAsset.name} [${newAsset.barcode}]`
    });

    return sendSuccess(res, newAsset, 'Asset created successfully', 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create asset', error.message);
  }
});

app.put('/api/assets/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const previous = await prisma.asset.findUnique({ where: { id } });

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        name: body.name,
        status: body.status,
        model: body.model,
        serialNumber: body.serialNumber,
        barcode: body.barcode,
        area: body.area,
        description: body.description,
        locationId: body.locationId,
        categoryId: body.categoryId,
        primaryWorkerId: body.primaryWorkerId,
        imageUrl: body.imageUrl,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
        purchasePrice: body.purchasePrice !== undefined ? Number(body.purchasePrice) : undefined,
        warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : undefined,
        manufacturer: body.manufacturer,
        riskLevel: body.riskLevel ? (body.riskLevel as RiskLevel) : undefined
      },
      include: { location: true, category: true, primaryWorker: true }
    });

    await createAuditLog(AuditAction.UPDATE, 'Asset', id, body.primaryWorkerId || 'USR-001', {
      assetId: id,
      previousValue: previous ? JSON.stringify(previous) : undefined,
      newValue: JSON.stringify(updated)
    });

    return sendSuccess(res, updated, `Asset ${id} updated successfully`);
  } catch (error: any) {
    return sendError(res, 'Failed to update asset', error.message);
  }
});

app.delete('/api/assets/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.asset.delete({ where: { id } });
    await createAuditLog(AuditAction.DELETE, 'Asset', id, 'USR-001', {
      assetId: id,
      previousValue: `Deleted asset ${id}`
    });
    return sendSuccess(res, { id }, `Asset ${id} deleted successfully`);
  } catch (error: any) {
    return sendError(res, 'Failed to delete asset', error.message);
  }
});

// ==========================================
// V2: ASSET LIFE FILE (HCAC / JCI / ISO Compliance Dossier)
// ==========================================
app.get('/api/assets/:id/life-file', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        location: true,
        category: true,
        primaryWorker: true,
        workOrders: {
          include: {
            labors: { include: { user: true } },
            partsUsed: { include: { part: true } },
            additionalCosts: true,
            assignedTo: true
          },
          orderBy: { createdAt: 'desc' }
        },
        pms: {
          include: { assignedTo: true, location: true },
          orderBy: { nextDueDate: 'asc' }
        },
        calibrations: {
          include: { performedBy: true },
          orderBy: { calibrationDate: 'desc' }
        },
        bomParts: {
          include: { part: { include: { warehouseLocation: true } } }
        },
        meters: true,
        auditLogs: {
          include: { user: true },
          orderBy: { timestamp: 'desc' },
          take: 25
        }
      }
    });

    if (!asset) return sendError(res, 'Asset not found', null, 404);

    const totalWOs = asset.workOrders.length;
    const completedWOs = asset.workOrders.filter(w => w.status === WorkOrderStatus.COMPLETED);
    let totalLaborHours = 0;
    let totalCost = 0;

    for (const wo of asset.workOrders) {
      const laborCost = wo.labors.reduce((s, l) => s + (Number(l.hours) * Number(l.hourlyRate)), 0);
      const laborHours = wo.labors.reduce((s, l) => s + Number(l.hours), 0);
      const partsCost = wo.partsUsed.reduce((s, p) => s + (Number(p.quantity) * Number(p.unitCost)), 0);
      const addCost = wo.additionalCosts.reduce((s, c) => s + Number(c.amount), 0);
      totalLaborHours += laborHours;
      totalCost += (laborCost + partsCost + addCost);
    }

    const latestCalibration = asset.calibrations[0] || null;
    const isCalibrationValid = latestCalibration
      ? new Date(latestCalibration.nextDueDate) > new Date() && latestCalibration.result !== 'FAIL'
      : null;

    const lifeFile = {
      asset: {
        id: asset.id,
        name: asset.name,
        status: asset.status,
        model: asset.model,
        serialNumber: asset.serialNumber,
        barcode: asset.barcode,
        manufacturer: asset.manufacturer,
        purchaseDate: asset.purchaseDate,
        purchasePrice: asset.purchasePrice,
        warrantyExpiry: asset.warrantyExpiry,
        riskLevel: asset.riskLevel,
        locationName: asset.location?.name,
        categoryName: asset.category?.name,
        primaryWorkerName: asset.primaryWorker?.name,
        imageUrl: asset.imageUrl,
        createdAt: asset.createdAt
      },
      metrics: {
        totalWorkOrders: totalWOs,
        completedWorkOrders: completedWOs.length,
        totalDowntimeHours: totalLaborHours,
        totalMaintenanceCost: Math.round(totalCost * 100) / 100,
        costRatioOfPurchase: asset.purchasePrice && Number(asset.purchasePrice) > 0
          ? Math.round((totalCost / Number(asset.purchasePrice)) * 1000) / 10
          : null,
        isCalibrationValid,
        calibrationDueInDays: latestCalibration
          ? Math.round((new Date(latestCalibration.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null
      },
      workOrders: asset.workOrders,
      pms: asset.pms,
      calibrations: asset.calibrations,
      bomParts: asset.bomParts.map(b => ({
        id: b.id,
        partId: b.partId,
        partName: b.part.name,
        partBarcode: b.part.barcode,
        quantityNeeded: b.quantityNeeded,
        inStock: b.part.quantity,
        minQuantity: b.part.minQuantity,
        cost: b.part.cost,
        warehouseLocation: b.part.warehouseLocation?.code || b.part.area || 'General Rack',
        notes: b.notes
      })),
      auditLogs: asset.auditLogs,
      meters: asset.meters
    };

    return sendSuccess(res, lifeFile, 'Asset life file retrieved successfully');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch asset life file', error.message);
  }
});

// ==========================================
// V2: BILL OF MATERIALS (BOM) API
// ==========================================
app.get('/api/assets/:id/bom', async (req: Request, res: Response) => {
  try {
    const assetId = req.params.id as string;
    const boms = await prisma.assetBOM.findMany({
      where: { assetId },
      include: {
        part: { include: { warehouseLocation: true } }
      }
    });
    return sendSuccess(res, boms, 'Asset BOM retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch asset BOM', error.message);
  }
});

app.post('/api/assets/:id/bom', async (req: Request, res: Response) => {
  try {
    const assetId = req.params.id as string;
    const { partId, quantityNeeded = 1, notes } = req.body;
    if (!partId) return sendError(res, 'partId is required', null, 400);

    const bom = await prisma.assetBOM.upsert({
      where: { assetId_partId: { assetId, partId } },
      update: { quantityNeeded: Number(quantityNeeded), notes },
      create: { assetId, partId, quantityNeeded: Number(quantityNeeded), notes },
      include: { part: true }
    });

    return sendSuccess(res, bom, 'Part added to BOM', 201);
  } catch (error: any) {
    return sendError(res, 'Failed to save BOM part', error.message);
  }
});

app.delete('/api/assets/:id/bom/:partId', async (req: Request, res: Response) => {
  try {
    const { id: assetId, partId } = req.params as { id: string; partId: string };
    await prisma.assetBOM.delete({
      where: { assetId_partId: { assetId, partId } }
    });
    return sendSuccess(res, { assetId, partId }, 'Part removed from BOM');
  } catch (error: any) {
    return sendError(res, 'Failed to remove part from BOM', error.message);
  }
});

// ==========================================
// V2: CALIBRATION RECORDS API
// ==========================================
app.get('/api/assets/:id/calibrations', async (req: Request, res: Response) => {
  try {
    const assetId = req.params.id as string;
    const calibrations = await prisma.calibrationRecord.findMany({
      where: { assetId },
      include: { performedBy: true },
      orderBy: { calibrationDate: 'desc' }
    });
    return sendSuccess(res, calibrations, 'Calibrations retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch calibrations', error.message);
  }
});

app.post('/api/assets/:id/calibrations', async (req: Request, res: Response) => {
  try {
    const assetId = req.params.id as string;
    const body = req.body;
    const performedById = await getDynamicUserId(body.performedById);

    const calibration = await prisma.calibrationRecord.create({
      data: {
        assetId,
        calibrationDate: new Date(body.calibrationDate || Date.now()),
        nextDueDate: new Date(body.nextDueDate || Date.now() + 365 * 24 * 60 * 60 * 1000),
        performedById,
        certificateUrl: body.certificateUrl,
        vendor: body.vendor,
        result: body.result || 'PASS',
        notes: body.notes
      },
      include: { performedBy: true }
    });

    await createAuditLog(AuditAction.CALIBRATION, 'Asset', assetId, performedById, {
      assetId,
      newValue: `Calibration recorded: ${calibration.result} by ${calibration.vendor || 'Internal QA'}`
    });

    return sendSuccess(res, calibration, 'Calibration record added', 201);
  } catch (error: any) {
    return sendError(res, 'Failed to add calibration record', error.message);
  }
});

// ==========================================
// 6. PREVENTIVE MAINTENANCE API (Full CRUD)
// ==========================================
app.get(['/api/pms', '/api/preventive-maintenances'], async (_req: Request, res: Response) => {
  try {
    const pms = await prisma.preventiveMaintenance.findMany({
      include: {
        asset: true,
        location: true,
        assignedTo: true
      },
      orderBy: { nextDueDate: 'asc' }
    });
    return sendSuccess(res, pms, 'Preventive maintenance schedules retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch PM schedules', error.message);
  }
});

app.get('/api/pms/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const pm = await prisma.preventiveMaintenance.findUnique({
      where: { id },
      include: { asset: true, location: true, assignedTo: true }
    });
    if (!pm) return sendError(res, 'PM schedule not found', null, 404);
    return sendSuccess(res, pm, 'PM schedule retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch PM schedule', error.message);
  }
});

app.post('/api/pms', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const count = await prisma.preventiveMaintenance.count();
    const id = body.id || `PM${String(count + 1).padStart(4, '0')}`;

    // Resolve foreign keys
    let assetId = body.assetId;
    if (!assetId && body.assetName) {
      const ast = await prisma.asset.findFirst({ where: { name: body.assetName } });
      if (ast) assetId = ast.id;
    }

    let locationId = body.locationId;
    if (!locationId && body.locationName) {
      const loc = await prisma.location.findFirst({ where: { name: body.locationName } });
      if (loc) locationId = loc.id;
    }

    let assignedToId = body.assignedToId;
    if (!assignedToId && (body.worker || body.assignedTo)) {
      const usr = await prisma.user.findFirst({ where: { name: body.worker || body.assignedTo } });
      if (usr) assignedToId = usr.id;
    }

    const nextDueDate = body.nextDueDate ? new Date(body.nextDueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const newPm = await prisma.preventiveMaintenance.create({
      data: {
        id,
        name: body.name || body.workOrderTitle || 'Preventive Maintenance',
        workOrderTitle: body.workOrderTitle || body.name || 'Preventive Maintenance Task',
        priority: body.priority || Priority.MEDIUM,
        description: body.description || '',
        frequency: body.frequency || 'Monthly',
        scheduleRule: body.scheduleRule,
        nextDueDate,
        assetId,
        locationId,
        assignedToId
      },
      include: { asset: true, location: true, assignedTo: true }
    });

    return sendSuccess(res, newPm, 'PM schedule created successfully', 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create PM schedule', error.message);
  }
});

app.put('/api/pms/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const updated = await prisma.preventiveMaintenance.update({
      where: { id },
      data: {
        name: body.name,
        workOrderTitle: body.workOrderTitle,
        priority: body.priority,
        description: body.description,
        frequency: body.frequency,
        scheduleRule: body.scheduleRule,
        nextDueDate: body.nextDueDate ? new Date(body.nextDueDate) : undefined,
        assetId: body.assetId,
        locationId: body.locationId,
        assignedToId: body.assignedToId
      },
      include: { asset: true, location: true, assignedTo: true }
    });

    return sendSuccess(res, updated, `PM schedule ${id} updated successfully`);
  } catch (error: any) {
    return sendError(res, 'Failed to update PM schedule', error.message);
  }
});

app.delete('/api/pms/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.preventiveMaintenance.delete({ where: { id } });
    return sendSuccess(res, { id }, `PM schedule ${id} deleted successfully`);
  } catch (error: any) {
    return sendError(res, 'Failed to delete PM schedule', error.message);
  }
});

// ==========================================
// 7. PARTS INVENTORY REST API (Full CRUD)
// ==========================================
app.get('/api/parts', async (_req: Request, res: Response) => {
  try {
    const parts = await prisma.part.findMany({
      include: { category: true, assignedTo: true, warehouseLocation: true },
      orderBy: { name: 'asc' }
    });
    return sendSuccess(res, parts, 'Parts inventory retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch parts', error.message);
  }
});

app.get('/api/parts/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const part = await prisma.part.findUnique({
      where: { id },
      include: { category: true, assignedTo: true, warehouseLocation: true, workOrders: true, assetBOMs: true }
    });
    if (!part) return sendError(res, 'Part not found', null, 404);
    return sendSuccess(res, part, 'Part retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch part', error.message);
  }
});

app.post('/api/parts', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const count = await prisma.part.count();
    const id = body.id || `PRT-${String(count + 1).padStart(3, '0')}`;

    let categoryId = body.categoryId;
    if (!categoryId && body.category) {
      const cat = await prisma.category.findFirst({ where: { name: body.category } });
      if (cat) categoryId = cat.id;
    }

    const newPart = await prisma.part.create({
      data: {
        id,
        name: body.name,
        cost: body.cost !== undefined ? Number(body.cost) : 0,
        quantity: body.quantity !== undefined ? Number(body.quantity) : 0,
        minQuantity: body.minQuantity !== undefined ? Number(body.minQuantity) : 0,
        barcode: body.barcode || `PART-${Date.now().toString().slice(-4)}`,
        area: body.area,
        description: body.description,
        categoryId,
        assignedToId: body.assignedToId,
        abcClass: (body.abcClass as ABCClass) || ABCClass.C_GENERAL,
        warehouseLocationId: body.warehouseLocationId
      },
      include: { category: true, assignedTo: true, warehouseLocation: true }
    });

    await createAuditLog(AuditAction.CREATE, 'Part', newPart.id, body.assignedToId || 'USR-001', {
      newValue: `Created spare part ${newPart.name} (${newPart.barcode}) in class ${newPart.abcClass}`
    });

    return sendSuccess(res, newPart, 'Part created successfully', 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create part', error.message);
  }
});

app.put('/api/parts/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const previous = await prisma.part.findUnique({ where: { id } });

    const updated = await prisma.part.update({
      where: { id },
      data: {
        name: body.name,
        cost: body.cost !== undefined ? Number(body.cost) : undefined,
        quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
        minQuantity: body.minQuantity !== undefined ? Number(body.minQuantity) : undefined,
        barcode: body.barcode,
        area: body.area,
        description: body.description,
        categoryId: body.categoryId,
        assignedToId: body.assignedToId,
        abcClass: body.abcClass ? (body.abcClass as ABCClass) : undefined,
        warehouseLocationId: body.warehouseLocationId
      },
      include: { category: true, assignedTo: true, warehouseLocation: true }
    });

    await createAuditLog(AuditAction.UPDATE, 'Part', id, body.assignedToId || 'USR-001', {
      previousValue: previous ? JSON.stringify(previous) : undefined,
      newValue: JSON.stringify(updated)
    });

    return sendSuccess(res, updated, `Part ${id} updated successfully`);
  } catch (error: any) {
    return sendError(res, 'Failed to update part', error.message);
  }
});

app.delete('/api/parts/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.part.delete({ where: { id } });
    await createAuditLog(AuditAction.DELETE, 'Part', id, 'USR-001', {
      previousValue: `Deleted part ${id}`
    });
    return sendSuccess(res, { id }, `Part ${id} deleted successfully`);
  } catch (error: any) {
    return sendError(res, 'Failed to delete part', error.message);
  }
});

// ==========================================
// V2: WAREHOUSE LOCATIONS API (Hierarchical Storage)
// ==========================================
app.get('/api/warehouse-locations', async (_req: Request, res: Response) => {
  try {
    const locations = await prisma.warehouseLocation.findMany({
      include: {
        children: { include: { children: true } },
        parts: true,
        parent: true
      },
      orderBy: { code: 'asc' }
    });
    return sendSuccess(res, locations, 'Warehouse locations retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch warehouse locations', error.message);
  }
});

app.post('/api/warehouse-locations', async (req: Request, res: Response) => {
  try {
    const { code, label, level, parentId, colorCode } = req.body;
    if (!code || !label || !level) {
      return sendError(res, 'code, label, and level are required', null, 400);
    }

    const qrCode = `LOC:${code}`;
    const newLoc = await prisma.warehouseLocation.create({
      data: {
        code,
        label,
        level,
        qrCode,
        colorCode,
        parentId
      }
    });

    return sendSuccess(res, newLoc, 'Warehouse location created', 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create warehouse location', error.message);
  }
});

app.put('/api/warehouse-locations/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const body = req.body;
    const updated = await prisma.warehouseLocation.update({
      where: { id },
      data: {
        label: body.label,
        level: body.level,
        colorCode: body.colorCode,
        parentId: body.parentId
      }
    });
    return sendSuccess(res, updated, 'Warehouse location updated');
  } catch (error: any) {
    return sendError(res, 'Failed to update warehouse location', error.message);
  }
});

app.delete('/api/warehouse-locations/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.warehouseLocation.delete({ where: { id } });
    return sendSuccess(res, { id }, 'Warehouse location deleted');
  } catch (error: any) {
    return sendError(res, 'Failed to delete warehouse location', error.message);
  }
});

// ==========================================
// V2: RAPID BATCH INVENTORY COUNT API
// ==========================================
app.get('/api/inventory-counts', async (_req: Request, res: Response) => {
  try {
    const counts = await prisma.inventoryCount.findMany({
      include: {
        conductedBy: true,
        items: { include: { part: true } }
      },
      orderBy: { startedAt: 'desc' }
    });
    return sendSuccess(res, counts, 'Inventory counts retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch inventory counts', error.message);
  }
});

app.post('/api/inventory-counts', async (req: Request, res: Response) => {
  try {
    const { title, conductedById } = req.body;
    const resolvedUserId = await getDynamicUserId(conductedById);

    const count = await prisma.inventoryCount.create({
      data: {
        title: title || `Jard Session — ${new Date().toLocaleDateString()}`,
        conductedById: resolvedUserId,
        status: InventoryCountStatus.IN_PROGRESS
      },
      include: { conductedBy: true }
    });

    return sendSuccess(res, count, 'Inventory count session started', 201);
  } catch (error: any) {
    return sendError(res, 'Failed to start inventory count', error.message);
  }
});

app.get('/api/inventory-counts/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const count = await prisma.inventoryCount.findUnique({
      where: { id },
      include: {
        conductedBy: true,
        items: {
          include: { part: { include: { warehouseLocation: true } } },
          orderBy: { scannedAt: 'desc' }
        }
      }
    });
    if (!count) return sendError(res, 'Inventory count session not found', null, 404);
    return sendSuccess(res, count, 'Inventory count details retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch inventory count', error.message);
  }
});

app.post('/api/inventory-counts/:id/items', async (req: Request, res: Response) => {
  try {
    const inventoryCountId = req.params.id as string;
    const { partId, actualQuantity } = req.body;

    const part = await prisma.part.findUnique({ where: { id: partId } });
    if (!part) return sendError(res, 'Part not found', null, 404);

    const systemQuantity = part.quantity;
    const actual = Number(actualQuantity);
    const discrepancy = actual - systemQuantity;

    const item = await prisma.inventoryCountItem.create({
      data: {
        inventoryCountId,
        partId,
        systemQuantity,
        actualQuantity: actual,
        discrepancy
      },
      include: { part: true }
    });

    if (discrepancy !== 0) {
      await prisma.inventoryCount.update({
        where: { id: inventoryCountId },
        data: { status: InventoryCountStatus.DISCREPANCY_FOUND }
      });
    }

    return sendSuccess(res, item, 'Inventory item recorded', 201);
  } catch (error: any) {
    return sendError(res, 'Failed to record inventory item', error.message);
  }
});

// ==========================================
// V2: IMMUTABLE AUDIT LOGS API (HCAC/JCI/ISO Readiness)
// ==========================================
app.get('/api/audit-logs', async (req: Request, res: Response) => {
  try {
    const entityType = req.query.entityType as string | undefined;
    const entityId = req.query.entityId as string | undefined;
    const assetId = req.query.assetId as string | undefined;

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (assetId) where.assetId = assetId;

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: true, asset: true },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    return sendSuccess(res, logs, 'Audit logs retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch audit logs', error.message);
  }
});

// ==========================================
// 8. LOCATIONS, CATEGORIES, USERS, VENDORS, METERS, REQUESTS, SETTINGS
// ==========================================
app.get('/api/locations', async (_req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({
      include: { assets: true, workOrders: true, createdBy: true },
      orderBy: { name: 'asc' }
    });
    return sendSuccess(res, locations, 'Locations retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch locations', error.message);
  }
});

app.post('/api/locations', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const creatorId = await getDynamicUserId(body.createdById);
    const count = await prisma.location.count();
    const id = body.id || `LOC-${String(count + 1).padStart(3, '0')}`;

    const newLocation = await prisma.location.create({
      data: {
        id,
        name: body.name,
        address: body.address,
        description: body.description,
        createdById: creatorId
      },
      include: { createdBy: true }
    });
    return sendSuccess(res, newLocation, 'Location created successfully', 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create location', error.message);
  }
});

app.delete('/api/locations/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.location.delete({ where: { id } });
    return sendSuccess(res, { id }, `Location ${id} deleted successfully`);
  } catch (error: any) {
    return sendError(res, 'Failed to delete location', error.message);
  }
});

app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return sendSuccess(res, categories, 'Categories retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch categories', error.message);
  }
});

app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { name: 'asc' } });
    return sendSuccess(res, users, 'Users retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch users', error.message);
  }
});

app.get('/api/vendors', async (_req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({ orderBy: { companyName: 'asc' } });
    return sendSuccess(res, vendors, 'Vendors retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch vendors', error.message);
  }
});

app.post('/api/vendors', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const count = await prisma.vendor.count();
    const id = body.id || `VND-${String(count + 1).padStart(2, '0')}`;

    const newVendor = await prisma.vendor.create({
      data: {
        id,
        companyName: body.companyName,
        contactName: body.contactName,
        email: body.email,
        phone: body.phone,
        website: body.website,
        vendorType: body.vendorType,
        hourlyRate: body.hourlyRate ? Number(body.hourlyRate) : 0,
        description: body.description
      }
    });
    return sendSuccess(res, newVendor, 'Vendor created successfully', 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create vendor', error.message);
  }
});

app.delete('/api/vendors/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.vendor.delete({ where: { id } });
    return sendSuccess(res, { id }, `Vendor ${id} deleted successfully`);
  } catch (error: any) {
    return sendError(res, 'Failed to delete vendor', error.message);
  }
});

app.get('/api/meters', async (_req: Request, res: Response) => {
  try {
    const meters = await prisma.meter.findMany({
      include: { asset: true, location: true, createdBy: true },
      orderBy: { name: 'asc' }
    });
    const mapped = meters.map(m => ({
      ...m,
      locationName: m.location?.name || 'Main Plant',
      assetName: m.asset?.name || 'Equipment',
      createdBy: m.createdBy?.name || 'System'
    }));
    return sendSuccess(res, mapped, 'Meters retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch meters', error.message);
  }
});

app.post('/api/meters', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const creatorId = await getDynamicUserId(body.createdById);
    const count = await prisma.meter.count();
    const id = body.id || `MTR-${String(count + 1).padStart(2, '0')}`;

    let assetId = body.assetId;
    if (!assetId && body.assetName) {
      const ast = await prisma.asset.findFirst({ where: { name: body.assetName } });
      if (ast) assetId = ast.id;
    }

    let locationId = body.locationId;
    if (!locationId && body.locationName) {
      const loc = await prisma.location.findFirst({ where: { name: body.locationName } });
      if (loc) locationId = loc.id;
    }

    const newMeter = await prisma.meter.create({
      data: {
        id,
        name: body.name,
        unit: body.unit || 'Hours',
        lastReading: body.lastReading ? Number(body.lastReading) : 0,
        assetId,
        locationId,
        createdById: creatorId
      },
      include: { asset: true, location: true, createdBy: true }
    });
    return sendSuccess(res, newMeter, 'Meter created successfully', 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create meter', error.message);
  }
});

app.delete('/api/meters/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.meter.delete({ where: { id } });
    return sendSuccess(res, { id }, `Meter ${id} deleted successfully`);
  } catch (error: any) {
    return sendError(res, 'Failed to delete meter', error.message);
  }
});

app.get('/api/requests', async (_req: Request, res: Response) => {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      include: { asset: true, location: true, createdBy: true },
      orderBy: { createdAt: 'desc' }
    });
    const mapped = requests.map(r => ({
      ...r,
      locationName: r.location?.name || 'Facility',
      assetName: r.asset?.name || 'General Asset',
      createdBy: r.createdBy?.name || 'Staff'
    }));
    return sendSuccess(res, mapped, 'Maintenance requests retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch maintenance requests', error.message);
  }
});

app.post('/api/requests', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const creatorId = await getDynamicUserId(body.createdById);
    const count = await prisma.maintenanceRequest.count();
    const id = body.id || `REQ-${String(count + 101)}`;

    let assetId = body.assetId;
    if (!assetId && body.assetName) {
      const ast = await prisma.asset.findFirst({ where: { name: body.assetName } });
      if (ast) assetId = ast.id;
    }

    let locationId = body.locationId;
    if (!locationId && body.locationName) {
      const loc = await prisma.location.findFirst({ where: { name: body.locationName } });
      if (loc) locationId = loc.id;
    }

    const newRequest = await prisma.maintenanceRequest.create({
      data: {
        id,
        title: body.title,
        description: body.description || '',
        priority: body.priority || Priority.MEDIUM,
        status: body.status || RequestStatus.PENDING,
        locationId,
        assetId,
        createdById: creatorId
      },
      include: { asset: true, location: true, createdBy: true }
    });
    return sendSuccess(res, newRequest, 'Request submitted successfully', 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create request', error.message);
  }
});

app.delete('/api/requests/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.maintenanceRequest.delete({ where: { id } });
    return sendSuccess(res, { id }, `Request ${id} deleted successfully`);
  } catch (error: any) {
    return sendError(res, 'Failed to delete request', error.message);
  }
});

app.get('/api/settings', async (_req: Request, res: Response) => {
  try {
    let settings = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.systemSetting.create({ data: { id: 'default' } });
    }
    return sendSuccess(res, settings, 'Settings retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch settings', error.message);
  }
});

app.put('/api/settings', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const updated = await prisma.systemSetting.upsert({
      where: { id: 'default' },
      update: {
        language: body.language,
        dateFormat: body.dateFormat,
        timeZone: body.timeZone,
        currency: body.currency,
        preWorkOrderLeadDays: body.preWorkOrderLeadDays !== undefined ? Number(body.preWorkOrderLeadDays) : undefined,
        csvSeparator: body.csvSeparator,
        brandColor: body.brandColor
      },
      create: {
        id: 'default',
        language: body.language || 'English',
        dateFormat: body.dateFormat || 'MM/DD/YY',
        timeZone: body.timeZone || 'Etc/GMT+9',
        currency: body.currency || 'Dollar - $',
        preWorkOrderLeadDays: body.preWorkOrderLeadDays !== undefined ? Number(body.preWorkOrderLeadDays) : 1,
        csvSeparator: body.csvSeparator || ',',
        brandColor: body.brandColor || '#0ea5e9'
      }
    });
    return sendSuccess(res, updated, 'Settings updated successfully');
  } catch (error: any) {
    return sendError(res, 'Failed to update settings', error.message);
  }
});

// ==========================================
// 9. PRODUCTION STATIC ASSET SERVING & SPA ROUTING
// ==========================================
const possibleDistPaths = [
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../../dist'),
  path.resolve(process.cwd(), 'dist')
];

const distPath = possibleDistPaths.find(p => fs.existsSync(p));

if (distPath) {
  console.log(`📦 Serving static production bundle from: ${distPath}`);
  app.use(express.static(distPath, { maxAge: '1d', etag: true }));

  // Fallback to index.html for Single Page Application routing (non-API routes)
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
    }
  });
} else {
  console.log('ℹ️  No dist directory found. Running in API-only mode (start Vite for frontend).');
  app.get('/', (_req: Request, res: Response) => {
    res.send('<h1>NASH CMMS API Server Running</h1><p>Vite dev server is expected on http://localhost:5173</p>');
  });
}

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  return sendError(res, 'Internal Server Error', err?.message || err, 500);
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`
  =============================================================
   🚀 NASH CMMS Production Server is Live!
   📡 Listening on: http://0.0.0.0:${PORT}
   🌍 Environment:  ${NODE_ENV}
   🩺 Healthcheck:  http://localhost:${PORT}/api/health
  =============================================================
  `);
});

// Graceful Shutdown
const handleShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('🔌 HTTP server closed.');
    await prisma.$disconnect();
    console.log('🗄️  Prisma client disconnected. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
