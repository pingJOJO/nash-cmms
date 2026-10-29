<![CDATA[# 🏗️ NexCMMS Master Plan v2.0
## التقرير الاستراتيجي والتقني الشامل — استجابة لتقييم Review 08
> **المشروع**: NexCMMS (nexcmms.online)  
> **قائد الفريق**: Omar Daboubash  
> **التاريخ**: أكتوبر 2026  
> **التقييم المستهدف**: 70/70 نقطة (معايير لجنة التحكيم)  
> **القطاع المستهدف الأول (Beachhead)**: المستشفيات الخاصة المتوسطة + مصانع الأغذية والأدوية في الأردن

---

# الجزء الأول: تحليل الفجوات التقنية (Technical Gap Analysis)

## 1. البنية الحالية — ما هو مبني وجاهز ✅

### A. قاعدة البيانات (Prisma Schema — 13 جدول)

| الجدول (Model) | الحقول الأساسية | الحالة |
|---|---|---|
| `User` | الاسم، البريد، الدور (4 أدوار)، المعدل بالساعة، الأفاتار | ✅ جاهز |
| `Location` | الاسم، العنوان، الوصف | ✅ جاهز |
| `Category` | الاسم، النوع (WORK_ORDER, ASSET, PART, ...) | ✅ جاهز |
| `Asset` | الاسم، الحالة (4 حالات)، الموديل، الرقم التسلسلي، الباركود، الصورة | ✅ جاهز |
| `WorkOrder` | الكود التسلسلي، العنوان، الأولوية (5 مستويات)، الحالة (5 حالات)، التاريخ | ✅ جاهز |
| `WorkOrderTask` | قائمة مهام فرعية مع ترتيب | ✅ جاهز |
| `LaborLog` | ساعات العمل، المعدل، التاريخ | ✅ جاهز |
| `AdditionalCost` | تكاليف إضافية (مقاولين، تصاريح) | ✅ جاهز |
| `Part` | الاسم، التكلفة، الكمية، الحد الأدنى، الباركود | ✅ جاهز |
| `WorkOrderPart` | ربط القطع بأوامر العمل مع خصم المخزون | ✅ جاهز |
| `PreventiveMaintenance` | الجدولة الدورية، التكرار، القاعدة (RRULE) | ✅ جاهز |
| `Meter` | عدادات التشغيل (ساعات، أميال، دورات) | ✅ جاهز |
| `Vendor` | بيانات الموردين والمقاولين | ✅ جاهز |
| `MaintenanceRequest` | طلبات الصيانة مع سير الموافقات | ✅ جاهز |
| `Comment` | التعليقات على أوامر العمل | ✅ جاهز |
| `SystemSetting` | إعدادات النظام (اللغة، العملة، المنطقة الزمنية) | ✅ جاهز |

### B. واجهات REST API — 15 نقطة نهاية

| # | Endpoint | الأفعال | الحالة |
|---|---|---|---|
| 1 | `/api/health` | GET | ✅ فحص صحة + زمن الاستجابة |
| 2 | `/api/work-orders` | GET, POST, PUT, DELETE | ✅ CRUD كامل + خصم مخزون ذري |
| 3 | `/api/assets` | GET, POST, PUT, DELETE | ✅ CRUD كامل |
| 4 | `/api/pms` | GET, POST, PUT, DELETE | ✅ CRUD كامل |
| 5 | `/api/parts` | GET, POST, PUT, DELETE | ✅ CRUD كامل |
| 6 | `/api/meters` | GET, POST, DELETE | ✅ |
| 7 | `/api/requests` | GET, POST, DELETE | ✅ |
| 8 | `/api/locations` | GET, POST, DELETE | ✅ |
| 9 | `/api/categories` | GET | ✅ |
| 10 | `/api/vendors` | GET, POST, DELETE | ✅ |
| 11 | `/api/users` | GET | ✅ |
| 12 | `/api/settings` | GET, PUT | ✅ |
| 13 | `/api/upload` | POST | ✅ رفع الصور بـ Base64 |
| 14 | `/api/admin/backup` | GET | ✅ تصدير JSON كامل |
| 15 | `/api/reports/kpi` | GET | ⚠️ مذكور في QA Skill لكن غير مبني |

### C. الواجهة الأمامية — 10 وحدات

| الوحدة | المسار | الحالة |
|---|---|---|
| أوامر العمل (WorkOrders) | `src/components/work-orders/` | ✅ عرض + إنشاء + تعديل + حذف |
| الأصول (Assets) | `src/components/assets/` | ✅ CRUD + QR |
| الصيانة الوقائية (PM) | `src/components/pm/` | ✅ |
| قطع الغيار (Parts) | `src/components/parts/` | ✅ |
| التحليلات (Analytics) | `src/components/analytics/` | ✅ لوحة بيانات |
| الإعدادات (Settings) | `src/components/settings/` | ✅ |
| الفئات (Categories) | `src/components/categories/` | ✅ |
| المصادقة (Auth) | `src/components/auth/` + `context/` | ✅ RBAC |
| التخطيط (Layout) | `src/components/layout/` | ✅ Sidebar + Topbar |
| المكونات المشتركة | `src/components/common/` | ✅ OfflineBanner + SimpleModuleView |

### D. البنية التحتية للإنتاج

| المكون | الحالة |
|---|---|
| AWS EC2 + Ubuntu 24.04 | ✅ |
| PostgreSQL (AWS RDS) | ✅ |
| Nginx Reverse Proxy + SSL | ✅ |
| PM2 Cluster Mode | ✅ |
| نسخ احتياطي يومي (Cron) | ✅ |
| نطاق nexcmms.online | ✅ |

---

## 2. تحليل الفجوات — ما ينقصنا ❌

### الفجوة 1: إدارة المستودعات والجرد السريع (Smart Inventory)

| الميزة المطلوبة | الحالة الحالية | الفجوة |
|---|---|---|
| **تصنيف ABC للقطع** (A-Critical, B-Essential, C-General) | حقل `Part` يحتوي `name, cost, quantity, minQuantity` فقط | ❌ لا يوجد حقل `criticality` أو `abcClass` في الـ Schema |
| **الموقع الهرمي** (Warehouse → Zone → Rack → Bin) | حقل `area` (نص حر) في `Part` | ❌ لا يوجد جدول `WarehouseLocation` هرمي مع QR لكل رف |
| **ربط القطع بالأصول (BOM)** | `WorkOrderPart` يربط القطع بأوامر العمل فقط | ❌ لا يوجد جدول `AssetBOM` (Bill of Materials) يربط القطع بالأصول مباشرة |
| **الجرد السريع المتتالي (Batch QR Scan)** | لا يوجد | ❌ لا يوجد جدول `InventoryCount` أو واجهة مسح متتالي |

### الفجوة 2: الإدخال الصوتي الذكي (Voice-to-Action)

| الميزة المطلوبة | الحالة الحالية | الفجوة |
|---|---|---|
| **نقطة نهاية صوتية** (`/api/voice/process`) | غير موجودة | ❌ لا يوجد API للإدخال الصوتي |
| **مكون واجهة الميكروفون** | غير موجود | ❌ لا يوجد `VoiceInputButton` component |
| **تحويل الصوت → JSON مهيكل** | غير موجود | ❌ لا يوجد تكامل مع Whisper API أو Web Speech API |

### الفجوة 3: متطلبات التدقيق (HCAC / JCI / ISO)

| الميزة المطلوبة | الحالة الحالية | الفجوة |
|---|---|---|
| **سجل حياة الجهاز** (Equipment Life File) | `Asset` يحتوي بيانات أساسية فقط | ❌ لا يوجد: `purchaseDate`, `warrantyExpiry`, `serviceContracts`, `calibrationDates` |
| **مستوى الخطورة** (Risk Level) | غير موجود | ❌ لا يوجد `riskLevel` enum (HIGH/MEDIUM/LOW) في `Asset` |
| **شهادات المعايرة** | غير موجودة | ❌ لا يوجد جدول `CalibrationRecord` |
| **سجل التدقيق غير القابل للتعديل** (Immutable Audit Trail) | غير موجود | ❌ لا يوجد جدول `AuditLog` يسجل كل تغيير |

### الفجوة 4: حدود الباقات (Package Boundaries)

| الميزة المطلوبة | الحالة الحالية | الفجوة |
|---|---|---|
| **جدول الباقات والحدود** | `SystemSetting` لا يحتوي حدود | ❌ لا يوجد جدول `Subscription` أو `PackageTier` |
| **Middleware للتحقق من السقف** | غير موجود | ❌ لا يوجد تحقق من عدد الأصول/المستخدمين قبل الإنشاء |

### الفجوة 5: خطة الذكاء الاصطناعي (AI Roadmap)

| الميزة المطلوبة | الحالة الحالية | الفجوة |
|---|---|---|
| **حساب MTBF/MTTR تلقائي** | المعادلات مكتوبة في SKILL.md لكن غير مبرمجة | ❌ لا يوجد `/api/reports/kpi` مبني فعلياً |
| **تنبيهات تكرار الأعطال** | غير موجودة | ❌ |
| **تنبيه تجاوز تكلفة الصيانة لنسبة من قيمة الأصل** | لا يوجد حقل `purchasePrice` في `Asset` | ❌ |
| **مؤشر الأثر البيئي** | غير موجود | ❌ |

---

# الجزء الثاني: التعديلات الدقيقة على قاعدة البيانات (Schema Upgrades)

## التعديلات المطلوبة على `schema.prisma`

### 1. إضافة Enums جديدة

```prisma
enum ABCClass {
  A_CRITICAL
  B_ESSENTIAL
  C_GENERAL
}

enum RiskLevel {
  HIGH
  MEDIUM
  LOW
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  STATUS_CHANGE
  STOCK_ADJUSTMENT
  CALIBRATION
  VOICE_ENTRY
}

enum SubscriptionTier {
  TRIAL
  BASIC
  HOSPITAL_FACTORY
  ENTERPRISE
}

enum InventoryCountStatus {
  IN_PROGRESS
  COMPLETED
  DISCREPANCY_FOUND
}
```

### 2. تعديل جدول `Asset` — إضافة حقول سجل الحياة والخطورة

```prisma
model Asset {
  // ... الحقول الموجودة حالياً ...
  
  // ═══ NEW: Equipment Life File (HCAC/JCI) ═══
  purchaseDate       DateTime?
  purchasePrice      Decimal?       @db.Decimal(12, 2)
  warrantyExpiry     DateTime?
  manufacturer       String?
  riskLevel          RiskLevel      @default(LOW)
  
  // ═══ NEW: العلاقات الجديدة ═══
  calibrations       CalibrationRecord[]
  bomParts           AssetBOM[]
  auditLogs          AuditLog[]       @relation("AssetAuditLogs")
}
```

### 3. تعديل جدول `Part` — إضافة تصنيف ABC وموقع المستودع

```prisma
model Part {
  // ... الحقول الموجودة حالياً ...
  
  // ═══ NEW: ABC Classification ═══
  abcClass           ABCClass       @default(C_GENERAL)
  
  // ═══ NEW: Warehouse Location (Hierarchical) ═══
  warehouseLocationId String?
  warehouseLocation   WarehouseLocation? @relation(fields: [warehouseLocationId], references: [id])
  
  // ═══ NEW: العلاقات الجديدة ═══
  assetBOMs          AssetBOM[]
  inventoryItems     InventoryCountItem[]
}
```

### 4. جداول جديدة بالكامل

```prisma
// ═══════════════════════════════════════════
// الموقع الهرمي للمستودع
// ═══════════════════════════════════════════
model WarehouseLocation {
  id          String    @id @default(cuid())
  code        String    @unique   // e.g., "A-02-04" (Zone-A / Rack-02 / Bin-04)
  label       String               // e.g., "Zone A, Rack 2, Bin 4"
  level       String               // "WAREHOUSE" | "ZONE" | "RACK" | "BIN"
  qrCode      String?   @unique   // QR payload for this location
  parentId    String?
  parent      WarehouseLocation?  @relation("LocationHierarchy", fields: [parentId], references: [id])
  children    WarehouseLocation[] @relation("LocationHierarchy")
  parts       Part[]
  createdAt   DateTime  @default(now())

  @@map("warehouse_locations")
}

// ═══════════════════════════════════════════
// ربط قطع الغيار بالأصول (BOM)
// ═══════════════════════════════════════════
model AssetBOM {
  id              String    @id @default(cuid())
  assetId         String
  asset           Asset     @relation(fields: [assetId], references: [id], onDelete: Cascade)
  partId          String
  part            Part      @relation(fields: [partId], references: [id])
  quantityNeeded  Int       @default(1)
  notes           String?
  createdAt       DateTime  @default(now())

  @@unique([assetId, partId])
  @@map("asset_bom")
}

// ═══════════════════════════════════════════
// شهادات المعايرة (Calibration Records)
// ═══════════════════════════════════════════
model CalibrationRecord {
  id              String    @id @default(cuid())
  assetId         String
  asset           Asset     @relation(fields: [assetId], references: [id], onDelete: Cascade)
  calibrationDate DateTime
  nextDueDate     DateTime
  performedById   String?
  performedBy     User?     @relation("CalibratedBy", fields: [performedById], references: [id])
  certificateUrl  String?   // رابط ملف الشهادة المرفوعة
  vendor          String?   // الجهة المعايرة
  result          String?   // "PASS" | "FAIL" | "CONDITIONAL"
  notes           String?
  createdAt       DateTime  @default(now())

  @@map("calibration_records")
}

// ═══════════════════════════════════════════
// سجل التدقيق غير القابل للتعديل (Immutable Audit Trail)
// ═══════════════════════════════════════════
model AuditLog {
  id            String      @id @default(cuid())
  action        AuditAction
  entityType    String      // "WorkOrder" | "Asset" | "Part" | "PM" | "Calibration"
  entityId      String
  userId        String
  user          User        @relation("AuditLogUser", fields: [userId], references: [id])
  assetId       String?
  asset         Asset?      @relation("AssetAuditLogs", fields: [assetId], references: [id])
  previousValue String?     @db.Text
  newValue      String?     @db.Text
  reason        String?
  ipAddress     String?
  timestamp     DateTime    @default(now())

  @@index([entityType, entityId])
  @@index([userId])
  @@index([timestamp])
  @@map("audit_logs")
}

// ═══════════════════════════════════════════
// الباقات والاشتراكات (Subscription Tiers)
// ═══════════════════════════════════════════
model Subscription {
  id              String           @id @default(cuid())
  tier            SubscriptionTier @default(TRIAL)
  maxAssets       Int              @default(50)
  maxUsers        Int              @default(3)
  maxLocations    Int              @default(1)
  featuresEnabled String[]         // e.g., ["QR", "PM", "VOICE", "AUDIT", "BOM"]
  startsAt        DateTime         @default(now())
  expiresAt       DateTime?
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@map("subscriptions")
}

// ═══════════════════════════════════════════
// جلسة الجرد السريع (Inventory Count Session)
// ═══════════════════════════════════════════
model InventoryCount {
  id            String               @id @default(cuid())
  title         String               // "جرد المستودع A — أكتوبر 2026"
  status        InventoryCountStatus @default(IN_PROGRESS)
  conductedById String
  conductedBy   User                 @relation("InventoryCountUser", fields: [conductedById], references: [id])
  startedAt     DateTime             @default(now())
  completedAt   DateTime?
  items         InventoryCountItem[]
  
  @@map("inventory_counts")
}

model InventoryCountItem {
  id              String         @id @default(cuid())
  inventoryCountId String
  inventoryCount  InventoryCount @relation(fields: [inventoryCountId], references: [id], onDelete: Cascade)
  partId          String
  part            Part           @relation(fields: [partId], references: [id])
  systemQuantity  Int            // الكمية في النظام
  actualQuantity  Int            // الكمية الفعلية المجروده
  discrepancy     Int            @default(0) // الفرق
  scannedAt       DateTime       @default(now())

  @@map("inventory_count_items")
}

// ═══════════════════════════════════════════
// سجل الإدخال الصوتي (Voice Command Log)
// ═══════════════════════════════════════════
model VoiceCommandLog {
  id             String    @id @default(cuid())
  userId         String
  user           User      @relation("VoiceCommands", fields: [userId], references: [id])
  rawTranscript  String    @db.Text  // النص الخام من التحويل
  language       String    @default("ar") // "ar" | "en"
  parsedJson     String    @db.Text  // الـ JSON المهيكل الناتج
  actionType     String    // "CREATE_WO" | "CLOSE_WO" | "STOCK_UPDATE" | "INVENTORY_COUNT"
  entityId       String?   // ID الكيان الذي تم إنشاؤه/تعديله
  confidence     Decimal?  @db.Decimal(3, 2) // 0.00 - 1.00
  processingMs   Int?      // زمن المعالجة بالمللي ثانية
  createdAt      DateTime  @default(now())

  @@map("voice_command_logs")
}
```

### 5. تعديل جدول `User` — إضافة العلاقات الجديدة

```prisma
model User {
  // ... الحقول الموجودة حالياً ...
  
  // ═══ NEW Relations ═══
  calibrations       CalibrationRecord[]  @relation("CalibratedBy")
  auditLogs          AuditLog[]           @relation("AuditLogUser")
  inventoryCounts    InventoryCount[]     @relation("InventoryCountUser")
  voiceCommands      VoiceCommandLog[]    @relation("VoiceCommands")
}
```

---

# الجزء الثالث: خطة التنفيذ البرمجي (Implementation Roadmap)

## المرحلة 1: مكاسب سريعة قبل العرض التقديمي (Quick Wins — 1-2 أسبوع)

> **الهدف**: ميزات قابلة للعرض أمام لجنة التحكيم فوراً

### 1.1 تفعيل API تقارير KPI (`/api/reports/kpi`)
**الأولوية**: 🔴 حرج — مذكور في الـ QA Skill كنقطة تحقق ومطلوب للعرض

```typescript
// GET /api/reports/kpi — Expected Response
{
  "mttr": {
    "value": 3.2,
    "unit": "hours",
    "trend": "improving",
    "benchmark": 4.0
  },
  "mtbf": {
    "value": 720,
    "unit": "hours",
    "topFailingAssets": [
      { "assetId": "AST-003", "name": "Chiller Unit #1", "failures": 5 }
    ]
  },
  "pmCompliance": {
    "percentage": 87.5,
    "onTime": 21,
    "total": 24,
    "overdue": 3
  },
  "downtimeCost": {
    "totalThisMonth": 4500,
    "currency": "JOD"
  },
  "environmentalImpact": {
    "assetLifeExtensionPercent": 18,
    "paperFormsSaved": 1240,
    "energySavingsPercent": 7
  }
}
```

### 1.2 إضافة حقول ABC Classification و Risk Level
- إضافة `abcClass` في `Part` و `riskLevel` في `Asset` إلى الـ Schema
- تعديل واجهة الأصول وقطع الغيار لعرض شارات الألوان

### 1.3 مكون الإدخال الصوتي (Voice Input — MVP)
- استخدام `Web Speech API` المدمج في المتصفح (مجاني، بدون API خارجي)
- مكون `VoiceInputButton` بسيط يظهر في كل الشاشات
- تحويل النص إلى JSON عبر قواعد Regex بسيطة (بدون LLM في المرحلة الأولى)
- دعم: "أنشئ بلاغ عطل لـ [اسم الجهاز]" و "أغلق أمر عمل [رقم]"

### 1.4 صفحة سجل حياة الجهاز (Asset Life File View)
- عرض موحد لكل جهاز يشمل:
  - بيانات الشراء والكفالة
  - سجل الأعطال (Work Orders التاريخية)
  - شهادات المعايرة
  - جدول الصيانة الوقائية
  - قطع الغيار المتوافقة (BOM)
- يطابق متطلبات HCAC/JCI مباشرة

### 1.5 Middleware حدود الباقة (Rate Limiter)
- تحقق عند إنشاء أصل جديد: `if (currentAssets >= subscription.maxAssets) → 403`
- عرض تحذير في الواجهة عند الاقتراب من الحد (90%)

---

## المرحلة 2: بناء أساسي بعد العرض (Core Build — 2-4 أسابيع)

### 2.1 نظام الموقع الهرمي للمستودع
- جدول `WarehouseLocation` مع 4 مستويات (Warehouse → Zone → Rack → Bin)
- واجهة شجرية (Tree View) لإدارة المواقع
- توليد QR Code لكل رف تلقائياً
- ربط كل قطعة غيار بموقعها الدقيق

### 2.2 نظام BOM (Bill of Materials)
- جدول `AssetBOM` لربط القطع المتوافقة بكل أصل
- عند مسح QR لأي جهاز → عرض "قطع الغيار المتوافقة" مع:
  - الكمية المتوفرة حالياً
  - رقم الرف والمستودع
  - تنبيه إذا كانت الكمية أقل من الحد الأدنى

### 2.3 الجرد السريع المتتالي (Batch QR Scanning)
- واجهة مسح متتالي: مسح رف → مسح القطع داخله → تأكيد الكميات
- جدول `InventoryCount` + `InventoryCountItem` لتسجيل الفروقات
- تقرير فروقات الجرد (Discrepancy Report)

### 2.4 سجل التدقيق غير القابل للتعديل (Audit Trail)
- `AuditLog` يسجل كل عملية (من، متى، ماذا، القيمة القديمة والجديدة)
- Middleware تلقائي يلتقط كل تغيير دون تدخل المبرمج
- واجهة عرض سجل التدقيق مع فلترة حسب الجهاز أو المستخدم أو الفترة الزمنية

### 2.5 شهادات المعايرة (Calibration Management)
- جدول `CalibrationRecord` مع رفع ملف الشهادة (PDF)
- تنبيه تلقائي قبل موعد المعايرة التالية بـ 14 يوم
- تصدير تقرير حالة المعايرة لكل الأجهزة (Calibration Status Report)

---

## المرحلة 3: الذكاء الاصطناعي (AI Roadmap — R&D)

### المرحلة 3A: المساعد الذكي للإدخال (شهر 1-3) — قابل للعرض
- **Voice-to-Structured Data**: تحسين تحويل الصوت بدمج Whisper API
- **الجرد الصوتي**: "رف A4، رولمان بلي 6204، العدد 15" → تحديث فوري
- **البحث الذكي في الكتالوجات**: رفع PDF → استخلاص بيانات الأعطال بـ RAG

### المرحلة 3B: التحليل الإحصائي (شهر 3-6) — يتطلب بيانات
- حساب MTBF/MTTR تلقائي من سجل الأعطال
- **تنبيه الهدر**: "الجهاز X استهلك صيانة تتجاوز 40% من سعره → يوصى باستبداله"
- التنبؤ بنفاد المخزون حسب الموسم (Seasonal Forecasting)

### المرحلة 3C: الصيانة التنبؤية (شهر 12+) — يتطلب IoT
- نماذج ML على السجل التاريخي للتنبؤ بالعطل القادم
- ربط مستقبلي مع حساسات IoT (حرارة، اهتزاز)
- هذه المرحلة R&D بحتة ولن تُعرض كميزة حالية

---

# الجزء الرابع: واجهات API الجديدة المطلوبة

## نقاط النهاية الجديدة

| # | Endpoint | Method | الوصف |
|---|---|---|---|
| 1 | `/api/reports/kpi` | GET | حساب MTBF, MTTR, PM Compliance, Environmental Impact |
| 2 | `/api/voice/process` | POST | استقبال نص صوتي → تحليله → تنفيذ الإجراء |
| 3 | `/api/assets/:id/life-file` | GET | سجل حياة كامل للجهاز (Life File) |
| 4 | `/api/assets/:id/bom` | GET, POST, DELETE | Bill of Materials للجهاز |
| 5 | `/api/assets/:id/calibrations` | GET, POST | شهادات المعايرة |
| 6 | `/api/warehouse-locations` | GET, POST, PUT, DELETE | إدارة مواقع المستودع الهرمية |
| 7 | `/api/inventory-counts` | GET, POST | جلسات الجرد السريع |
| 8 | `/api/inventory-counts/:id/items` | POST, PUT | عناصر الجرد (المسح المتتالي) |
| 9 | `/api/audit-logs` | GET | سجل التدقيق (للقراءة فقط — Immutable) |
| 10 | `/api/subscription` | GET | حالة الباقة الحالية والحدود |

---

# الجزء الخامس: نموذج العمل التجاري المحدث (Business Model Canvas v2.0)

## 1. الشريحة المستهدفة الأولى (Beachhead Market)

### المشتري الأول (Primary Buyer):
- **المؤسسة**: المستشفيات الخاصة المتوسطة في عمّان (50-150 سريراً)
- **القسم المستهدف**: قسم الهندسة الطبية الحيوية (Biomedical Engineering)
- **صانع القرار (Budget Owner)**: المدير العام أو المدير المالي
- **المستخدم اليومي (Champion)**: مدير الهندسة الطبية + فنيو الصيانة
- **أمثلة واقعية**: مستشفى الإسراء، مستشفى الاستقلال، مستشفى الأمير حمزة

### المشتري الثاني (Secondary Buyer):
- **المؤسسة**: مصانع الأغذية والتغليف المتوسطة (سحاب، الموقر، الزرقاء)
- **القسم**: قسم الصيانة الميكانيكية + المستودعات
- **صانع القرار**: مدير المصنع أو مدير العمليات
- **أمثلة واقعية**: مصانع منطقة سحاب الصناعية

---

## 2. القيمة المقترحة (Value Propositions) — مصاغة بشروط دقيقة

| # | القيمة | الشرط المحدد | الدليل |
|---|---|---|---|
| 1 | **إبلاغ صوتي وبالـ QR خلال 15 ثانية** | مقاسة في بيئة اختبار: مسح QR للجهاز + تسجيل صوتي للعطل دون كتابة | فيديو عرض توضيحي (Demo) |
| 2 | **سجلات جاهزة للتدقيق (Audit-Ready Records)** | ملف حياة كامل لكل جهاز يطابق بنود متطلبات HCAC (توثيق التواريخ، الفنيين، شهادات المعايرة) | نموذج تقرير Life File مصدّر |
| 3 | **جرد ومستودعات ذكية** | فرز ABC + ربط BOM + مسح متتالي يختصر وقت الجرد 70% مقارنة بالعد اليدوي | مقارنة زمنية موثقة |
| 4 | **تأهيل خلال 48 ساعة** | مشروط بتوفير: قائمة أجهزة Excel + تعاون مدير الصيانة + قسم واحد فقط | اتفاقية بدء التجربة (Pilot Charter) |

> ⚠️ **ملاحظة مهمة**: لا نعد بضمان نجاح التدقيق 100%. نقول: "النظام يوفر السجلات والتقارير المطلوبة لتسهيل عمليات التدقيق وفق معايير HCAC/JCI/ISO".

---

## 3. هيكل التسعير الجديد (Revenue Streams) — باقات هجينة محدودة

### جدول الباقات:

| الباقة | السعر الشهري | الأصول | المستخدمون | المواقع | الميزات |
|---|---|---|---|---|---|
| **التجربة (Trial)** | مجاني (30 يوم) | 50 | 3 | 1 | QR + أوامر عمل + صيانة وقائية |
| **الأساسية (Basic)** | $59/شهر | 150 | 5 | 1 | + مستودعات + تقارير أساسية |
| **المستشفيات والمصانع** | $179/شهر | 600 | 20 | 3 | + إدخال صوتي + BOM + تدقيق + معايرة |
| **المؤسسات (Enterprise)** | مخصص | غير محدود | غير محدود | غير محدود | + سيرفر مخصص + API + SLA |

**إضافات**:
- كل 100 أصل إضافي في باقة المستشفيات: +$20/شهرياً
- رسوم التأسيس (One-Time — إلزامية بعد التجربة): $250 - $500
  - تشمل: جرد ميداني أولي + استيراد بيانات Excel + طباعة ملصقات QR صناعية

---

## 4. تصميم التجربة المبدئية (Structured Pilot → Paid)

### شروط بدء التجربة (Pilot Charter):

```
═══════════════════════════════════════════════════════
          وثيقة تجربة NexCMMS المبدئية
═══════════════════════════════════════════════════════

المؤسسة:        ________________________
القسم المستهدف:  ________________________ (مثال: قسم العناية المركزة ICU)
عدد الأجهزة:     حتى 50 جهازاً
المدة:           30 يوماً
البطل الداخلي:   ________________________ (مدير الصيانة/الهندسة الطبية)
مالك الميزانية:  ________________________ (المدير العام/المالي)

المقدم مجاناً:
 ☑ استخدام النظام لقسم واحد
 ☑ 50 ملصق QR صناعي مطبوع
 ☑ جلسة تدريب واحدة (ساعة)
 ☑ دعم فني خلال التجربة

ليس مشمولاً في التجربة (يُفعَّل مع العقد المدفوع):
 ☐ استيراد بيانات أجهزة كامل المستشفى
 ☐ ميزة الإدخال الصوتي
 ☐ تقارير الامتثال والتدقيق
 ☐ نظام المستودعات والجرد

مؤشرات النجاح (KPIs المتفق عليها):
 • إنجاز >85% من الصيانة المجدولة خلال الشهر
 • تقليل وقت تسجيل البلاغ إلى <20 ثانية
 • استخدام فعلي من >80% من الفنيين المسجلين

خط الأساس الحالي (Baseline — يُملأ قبل البدء):
 • الوقت الحالي لتسجيل بلاغ عطل: ___ دقيقة
 • نسبة إنجاز الصيانة المجدولة الحالية: ___%
 • عدد الأعطال غير المخططة الشهر الماضي: ___

اجتماع مراجعة القرار:
 • الموعد: اليوم 25 من التجربة
 • الحضور: البطل الداخلي + مالك الميزانية + فريق NexCMMS
 • القرار: التحويل للعقد المدفوع أو إنهاء التجربة

التوقيع:
فريق NexCMMS: ____________    التاريخ: ____________
المؤسسة:      ____________    التاريخ: ____________
═══════════════════════════════════════════════════════
```

---

## 5. اقتصاديات الوحدة (Unit Economics) — باقة $179

| البند | التكلفة |
|---|---|
| **تكلفة التهيئة لمرة واحدة (Onboarding)** | |
| ساعات عمل الفريق (8 ساعات × $15/ساعة) | $120 |
| 50 ملصق QR صناعي | $25 |
| **إجمالي التهيئة** | **$145** (مغطى من رسوم التأسيس $250-500) |
| | |
| **التكلفة الشهرية المتغيرة** | |
| AWS RDS + EC2 (حصة العميل) | ~$8 |
| Whisper API / Voice Processing | ~$4 |
| دعم فني + Customer Success (ساعتان/شهر) | ~$25 |
| **إجمالي التكلفة الشهرية** | **~$37** |
| | |
| **الإيرادات الشهرية** | **$179** |
| **هامش الربح التشغيلي** | **$142 (79.3%)** |
| **فترة استرداد تكلفة التهيئة** | شهر واحد |

---

## 6. المشهد التنافسي والحماية (Competition & Defensibility)

### المنافسون الحقيقيون في الأردن:

| المنافس | النوع | التكلفة | نقطة الضعف |
|---|---|---|---|
| **الورق + Excel + WhatsApp** | البديل اليومي الأكثر شيوعاً | "مجاني" ظاهرياً | لا سجلات رقمية، يفشل في التدقيق، ضياع المعلومات |
| **برامج المحاسبة المحلية** (الأمين، كويكبكس) | محاسبة + مستودع بسيط | 1,000-3,000 دينار/مرة | لا صيانة وقائية، لا QR، لا سجلات تدقيق |
| **SAP PM / IBM Maximo** | ERP عالمي | $25,000-100,000+ تأسيس | معقد جداً، الفنيون يكرهونه، يحتاج فريق IT مخصص |
| **حكيم (Hakeem)** | نظام حكومي | غير متاح تجارياً | للقطاع الحكومي فقط، لا يغطي الصيانة بعمق |

### عناصر الحماية (Moat) لـ NexCMMS:

| العنصر | الوصف | صعوبة التقليد |
|---|---|---|
| **الإدخال الصوتي بالعربية** | دعم اللهجة الأردنية + الإنجليزية الميدانية | 🟡 متوسطة (يحتاج بيانات تدريب) |
| **تكلفة التحول العالية (Switching Cost)** | بعد بناء السجل التاريخي + ملصقات QR + تعلم الفريق | 🔴 عالية جداً |
| **التوافق مع HCAC** | سجلات مخصصة لمتطلبات الاعتماد الأردنية | 🟡 متوسطة |
| **سعر تنافسي جداً** | $179 مقابل $25,000+ للبدائل المعقدة | 🟢 سهلة (لكن بدون جودة المنتج لا قيمة لها) |

---

## 7. الأثر البيئي (Environmental Impact) — 10 درجات

| المحور | الأثر القابل للقياس | الدليل |
|---|---|---|
| **إطالة عمر الأصول** | الصيانة الوقائية المنتظمة تزيد العمر 15-25% → تقليل النفايات الإلكترونية والصناعية | مقارنة MTBF قبل وبعد التفعيل |
| **كفاءة الطاقة** | الأجهزة المعايرة والمصانة تستهلك كهرباء أقل 5-10% | تقارير معايرة + قراءات عدادات الطاقة |
| **تحول رقمي بلا ورق** | إلغاء ~1,200 نموذج ورقي سنوياً لكل منشأة | مؤشر `paperFormsSaved` في KPI Dashboard |
| **تقليل المخزون الراكد** | فرز ABC يقلل المشتريات غير الضرورية ~20% | تقارير حركة المخزون |

> **المقياس في النظام**: مؤشر الأثر البيئي يُحسب تلقائياً من:
> ```
> Environmental Score = (avgAssetLifeExtension% × 0.4) 
>                     + (paperFormsSaved × 0.3) 
>                     + (energySavings% × 0.3)
> ```

---

## 8. الشراكات (Key Partners)

| الشريك | النوع | الحالة |
|---|---|---|
| **AWS** | مزود البنية التحتية السحابية | ✅ فعال (EC2 + RDS) |
| **مورد ملصقات QR صناعية** | مورد مواد | 🟡 مطلوب اتفاقية |
| **استشاريو جودة HCAC/ISO** | شريك مرجعي | 🟡 مطلوب |
| **جمعية المهندسين الأردنيين** | قناة تسويق | 🟡 مطلوب |

---

# الجزء السادس: الإجابات النموذجية على أسئلة لجنة التحكيم (10 أسئلة)

### س1: أي مؤسسة وقسم ستخدمون أولاً، ومن يملك ميزانية الشراء؟
> **ج**: نستهدف قسم الهندسة الطبية الحيوية في المستشفيات الخاصة المتوسطة (50-150 سريراً) في عمّان. صانع القرار هو المدير العام بالتنسيق مع مدير الهندسة الطبية. الميزانية تأتي من بند الصيانة والمعدات السنوي. البديل الثاني: مصانع الأغذية المتوسطة حيث مدير المصنع هو مالك الميزانية.

### س2: ما الميزات التي يمكنكم عرضها اليوم، وما هو المخطط؟
> **ج**: **متوفر الآن**: إدارة كاملة لأوامر العمل والصيانة الوقائية، QR للأصول، مستودع قطع الغيار مع تنبيهات الحد الأدنى، لوحة تحليلات، نسخ احتياطي، RBAC، وواجهة ثنائية اللغة. **قيد الإنشاء (أسابيع)**: الإدخال الصوتي، سجل حياة الجهاز، حدود الباقات. **خارطة طريق مستقبلية**: الذكاء الاصطناعي التنبؤي (يتطلب 12 شهراً من البيانات).

### س3: تحت أي شروط تم اختبار ادعاء الـ 15 ثانية والـ 48 ساعة؟
> **ج**: **15 ثانية**: تم قياسها في بيئة اختبار داخلية: مسح QR للجهاز + تسجيل صوتي للعطل دون كتابة يدوية. الشرط: هاتف بكاميرا + اتصال إنترنت مستقر. **48 ساعة تأهيل**: مشروطة بتوفير قائمة أجهزة جاهزة بصيغة Excel + تعاون مدير الصيانة + قسم واحد فقط (50 جهازاً كحد أقصى).

### س4: ما الوظائف المحددة التي تدعم إعداد التدقيق؟
> **ج**: النظام يوفر: (1) ملف حياة كامل لكل جهاز (تاريخ الشراء، الكفالة، سجل الأعطال، شهادات المعايرة)، (2) سجل تدقيق غير قابل للتعديل (من، متى، ماذا)، (3) تصنيف خطورة الأجهزة. هذه السجلات تسهّل استيفاء متطلبات HCAC/JCI لكننا لا نعد بضمان نجاح التدقيق — فالنجاح يعتمد على عوامل أخرى خارج نطاق النظام.

### س5: كم يكلف تأهيل ودعم عميل واحد بسعر $59 أو $179؟
> **ج**: باقة $179: تكلفة التأهيل لمرة واحدة ~$145 (8 ساعات عمل + 50 ملصق QR)، مغطاة بالكامل من رسوم التأسيس ($250-500). التكلفة الشهرية المتغيرة ~$37 (استضافة $8 + صوتيات $4 + دعم فني $25). هامش الربح التشغيلي 79.3%. باقة $59: تكلفة شهرية ~$20، هامش ربح ~66%.

### س6: لماذا كانت باقة المستشفيات غير محدودة الأصول، وكيف تتغير التكلفة مع الحجم؟
> **ج**: أدركنا أن "غير محدود" غير مستدام. الآن: باقة المستشفيات تشمل حتى 600 أصل، وكل 100 أصل إضافي بـ $20/شهرياً. هذا يحمي هامش ربحنا عند التعامل مع مستشفيات ضخمة (1000+ جهاز) حيث تزداد تكلفة الاستضافة والدعم.

### س7: ما المجاني تحديداً في التجربة، وأي خدمات تأسيس مدفوعة؟
> **ج**: **مجاني**: استخدام النظام لـ 50 جهازاً في قسم واحد + 50 ملصق QR + جلسة تدريب واحدة. **مدفوع (يبدأ مع العقد)**: رسوم تأسيس $250-500 تشمل استيراد بيانات كامل المؤسسة + جرد ميداني + ملصقات إضافية + الإدخال الصوتي + تقارير الامتثال.

### س8: ما نتائج التجربة وموعد المراجعة المتفق عليه مع مالك الميزانية؟
> **ج**: يتم توقيع وثيقة تجربة (Pilot Charter) تحدد: خط الأساس الحالي (وقت تسجيل البلاغ، نسبة إنجاز الصيانة)، مؤشرات النجاح (>85% إنجاز، <20 ثانية تسجيل)، واجتماع مراجعة قرار في اليوم 25 يحضره البطل الداخلي ومالك الميزانية.

### س9: أي الشركاء ملتزمون فعلياً وأيهم مجرد موردين محتملين؟
> **ج**: **ملتزم**: AWS (البنية التحتية فعّالة حالياً). **مورد مطلوب**: مورد ملصقات QR صناعية (عرض أسعار قيد التفاوض). **مطلوب**: استشاريو HCAC/ISO كشركاء إحالة (محادثات أولية). لا ندّعي وجود شراكات موقعة لم تتم بعد.

### س10: ما الذي يقنع العميل بالتجديد، وما دليل الأثر البيئي؟
> **ج**: **التجديد**: (1) تكلفة التحول العالية بعد بناء السجل التاريخي والملصقات، (2) تحسن مقاس في نسبة إنجاز الصيانة، (3) اعتماد الفنيين على الإدخال الصوتي. **الأثر البيئي**: يُقاس عبر 3 محاور رقمية في النظام: عدد النماذج الورقية الملغاة (مؤشر `paperFormsSaved`)، نسبة إطالة عمر الأصول (مقارنة MTBF)، وكفاءة الطاقة (قراءات العدادات). نعرض خط الأساس مقابل القيمة بعد 6 أشهر.

---

# الجزء السابع: ملخص العرض التقديمي (4 دقائق)

## الهيكل المقترح للعرض:

| الدقيقة | المحتوى | الملاحظة |
|---|---|---|
| **0:00 - 0:30** | **المشكلة**: فني في مستشفى أردنية يبلّغ عن عطل جهاز تعقيم عبر WhatsApp → يضيع البلاغ → يفشل التدقيق | قصة واقعية |
| **0:30 - 1:30** | **الحل**: عرض حي (Live Demo) لسير العمل: مسح QR → بلاغ صوتي → أمر عمل تلقائي → خصم قطع → إغلاق | شاشة واحدة فقط |
| **1:30 - 2:30** | **نموذج العمل**: باقة $179 شاملة، هامش 79%، تجربة محددة 30 يوم بوثيقة Pilot Charter | رقم واحد فقط لا تسرد كل الباقات |
| **2:30 - 3:15** | **الجر (Traction)**: منصة مباشرة على nexcmms.online، نتائج التجربة المتوقعة، خطة AI مرحلية | فصل الحالي عن المستقبلي |
| **3:15 - 3:45** | **الفريق + الأثر البيئي**: خبرة هندسة سحابية، إطالة عمر المعدات، تحول رقمي بلا ورق | ربط بيئي مقاس |
| **3:45 - 4:00** | **الخطوة التالية**: تشغيل أول تجربة مبدئية في مستشفى بعمّان خلال 30 يوم | طلب واضح |

---

# الجزء الثامن: مصفوفة الأولويات (Priority Matrix)

| # | المهمة | الأثر على التقييم | الجهد | الأولوية |
|---|---|---|---|---|
| 1 | بناء `/api/reports/kpi` | 🔴 عالي (Technology Sophistication) | 🟢 منخفض (4-6 ساعات) | **P0 — فوري** |
| 2 | إضافة `riskLevel` + `abcClass` للـ Schema | 🔴 عالي (HCAC Readiness) | 🟢 منخفض (2 ساعات) | **P0 — فوري** |
| 3 | مكون `VoiceInputButton` (Web Speech API) | 🔴 عالي (Killer Feature للعرض) | 🟡 متوسط (8-12 ساعة) | **P0 — فوري** |
| 4 | صفحة Asset Life File | 🔴 عالي (Audit Readiness) | 🟡 متوسط (6-8 ساعات) | **P1 — قبل العرض** |
| 5 | Middleware حدود الباقة | 🟡 متوسط (Business Model) | 🟢 منخفض (3-4 ساعات) | **P1 — قبل العرض** |
| 6 | جدول `AuditLog` + Middleware تسجيل | 🟡 متوسط (ISO Compliance) | 🟡 متوسط (8 ساعات) | **P2 — بعد العرض** |
| 7 | `WarehouseLocation` الهرمي | 🟡 متوسط | 🟠 عالي (16-20 ساعة) | **P2 — بعد العرض** |
| 8 | `AssetBOM` + واجهة BOM | 🟡 متوسط | 🟡 متوسط (12 ساعة) | **P2 — بعد العرض** |
| 9 | الجرد المتتالي (Batch Scan) | 🟢 منخفض حالياً | 🟠 عالي (16 ساعة) | **P3 — مرحلة 2** |
| 10 | AI/ML Predictive Maintenance | 🟢 R&D | 🔴 عالي جداً | **P4 — مستقبلي** |

---

> **الوثيقة محدثة بتاريخ**: أكتوبر 2026  
> **الإصدار**: 2.0  
> **مُعد بواسطة**: فريق NexCMMS  
> **المرجع**: Review 08 Assessment + Technical Codebase Gap Analysis
]]>
