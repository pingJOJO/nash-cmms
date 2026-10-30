export type Language = 'Arabic' | 'English';

export function isArabicLang(lang?: string): boolean {
  if (!lang) return false;
  const l = lang.toLowerCase();
  return l === 'arabic' || l === 'ar' || l === 'العربية';
}

export const t = {
  // Routes
  routes: {
    'work-orders': { en: 'Work Orders', ar: 'أوامر العمل' },
    'preventive-maintenances': { en: 'Preventive Maintenance', ar: 'الصيانة الوقائية' },
    'statistics': { en: 'Statistics & Analytics', ar: 'الإحصائيات والتحليلات' },
    'requests': { en: 'Requests', ar: 'البلاغات والطلبات' },
    'assets': { en: 'Assets & Equipment', ar: 'الأصول والمعدات' },
    'locations': { en: 'Locations', ar: 'المواقع والمباني' },
    'parts': { en: 'Parts & Inventory', ar: 'المستودع وقطع الغيار' },
    'purchase-requests': { en: 'Purchase Requests', ar: 'طلبات الشراء' },
    'meters': { en: 'Meters', ar: 'عدادات القياس' },
    'people': { en: 'People & Teams', ar: 'فرق العمل والموظفين' },
    'vendors': { en: 'Vendors & Contractors', ar: 'الموردون والمقاولون' },
    'categories': { en: 'Categories', ar: 'التصنيفات التشغيلية' },
    'files': { en: 'Files Repository', ar: 'المستندات والملفات' },
    'settings': { en: 'System Settings', ar: 'إعدادات النظام' }
  },

  // Topbar
  topbar: {
    enterpriseLive: { en: 'Enterprise Live', ar: 'النسخة الحية' },
    roleLabel: { en: 'Role:', ar: 'الدور:' },
    roles: {
      ADMINISTRATOR: { en: 'Admin', ar: 'المشرف' },
      MANAGER: { en: 'Manager', ar: 'المدير' },
      TECHNICIAN: { en: 'Technician', ar: 'الفني' },
      REQUESTER: { en: 'Operator', ar: 'المشغل' }
    },
    voiceCommand: { en: 'Voice Action', ar: 'أمر صوتي' },
    hospitalTier: { en: 'Hospital & Factory Tier', ar: 'باقة المستشفيات والمصانع' },
    assetsPill: { en: 'Assets', ar: 'أصل' },
    notifications: { en: 'Notifications', ar: 'الإشعارات' },
    markAllRead: { en: 'Mark all as read', ar: 'تحديد الكل كمقروء' },
    logout: { en: 'Sign Out', ar: 'تسجيل الخروج' }
  },

  // Sidebar
  sidebar: {
    brandSubtitle: { en: 'Enterprise Operations', ar: 'العمليات الهندسية المتقدمة' },
    trialNotice: { en: 'Your trial ends in 15 days', ar: 'باقة تجريبية نشطة (15 يوماً)' },
    businessPlan: { en: 'You are on the Business plan', ar: 'أنت على باقة المستشفيات والمصانع' },
    upgradePlan: { en: 'Upgrade Plan', ar: 'ترقية الباقة' },
    subtabs: {
      workOrders: { en: 'Work Orders', ar: 'أوامر العمل' },
      assetsPms: { en: 'Assets & PMs', ar: 'الأصول والصيانة' },
      costTime: { en: 'Cost & Time', ar: 'التكاليف والوقت' },
      parts: { en: 'Parts', ar: 'قطع الغيار' },
      setsOfParts: { en: 'Sets Of Parts', ar: 'مجموعات القطع' }
    }
  },

  // Work Orders View
  workOrders: {
    title: { en: 'Work Orders', ar: 'أوامر العمل' },
    views: {
      list: { en: 'List View', ar: 'عرض القائمة' },
      calendar: { en: 'Calendar View', ar: 'عرض التقويم' },
      workload: { en: 'Workload View', ar: 'توزيع العمل' },
      column: { en: 'Column View', ar: 'عرض الأعمدة' }
    },
    newWorkOrder: { en: '+ Work Order', ar: '+ أمر عمل جديد' },
    searchPlaceholder: { en: 'Search work orders, assets, locations...', ar: 'بحث برقم الأمر، العنوان، الأصل، الموقع...' },
    filter: { en: 'Filter', ar: 'تصفية' },
    statusPrefix: { en: 'Status:', ar: 'الحالة:' },
    priorityPrefix: { en: 'Priority:', ar: 'الأولوية:' },
    exportCsv: { en: 'Export to CSV', ar: 'تصدير كـ CSV' },
    printReport: { en: 'Print Report (PDF)', ar: 'طباعة التقرير (PDF)' },
    resetFilters: { en: 'Reset Filters', ar: 'إعادة ضبط الفلاتر' },
    demoDataNotice: { en: 'You can delete demo data from General Settings at any time.', ar: 'يمكنك مسح أو تعديل البيانات التجريبية من شاشة الإعدادات في أي وقت.' },
    pageOf: { en: 'Page', ar: 'صفحة' },
    of: { en: 'of', ar: 'من' },
    rowsPerPage: { en: 'Rows per page', ar: 'صفوف لكل صفحة' },
    columns: {
      id: { en: 'ID', ar: 'المعرف' },
      title: { en: 'TITLE', ar: 'العنوان' },
      status: { en: 'STATUS', ar: 'الحالة' },
      priority: { en: 'PRIORITY', ar: 'الأولوية' },
      description: { en: 'DESCRIPTION', ar: 'الوصف' },
      assignedTo: { en: 'ASSIGNED TO', ar: 'المسؤول' },
      locationName: { en: 'LOCATION NAME', ar: 'اسم الموقع' },
      locationAddress: { en: 'LOCATION ADDRESS', ar: 'عنوان الموقع' },
      category: { en: 'CATEGORY', ar: 'التصنيف' },
      asset: { en: 'ASSET', ar: 'الأصل' }
    },
    statuses: {
      ALL: { en: 'All Statuses', ar: 'جميع الحالات' },
      OPEN: { en: 'Open', ar: 'مفتوح' },
      IN_PROGRESS: { en: 'In Progress', ar: 'قيد التنفيذ' },
      ON_HOLD: { en: 'On Hold', ar: 'معلق' },
      COMPLETED: { en: 'Completed', ar: 'مكتمل' }
    },
    priorities: {
      ALL: { en: 'All Priorities', ar: 'جميع الأولويات' },
      NONE: { en: 'None', ar: 'عادي' },
      LOW: { en: 'Low', ar: 'منخفض' },
      MEDIUM: { en: 'Medium', ar: 'متوسط' },
      HIGH: { en: 'High', ar: 'عالي / حرج' }
    }
  },

  // Floating Wizards
  wizards: {
    getStarted: { en: 'Get Started with NEX CMMS', ar: 'دليل البدء السريع بنظام NEX CMMS' },
    wizardBadge: { en: 'Wizard', ar: 'المساعد' },
    tasksCompleted: { en: 'tasks completed - Click to open', ar: 'مهام مكتملة - اضغط للفتح' },
    chatTitle: { en: 'AI Maintenance Assistant', ar: 'المساعد الذكي لعمليات الصيانة' },
    chatPlaceholder: { en: 'Type a question (e.g., How to export CSV?)...', ar: 'اكتب سؤالك (مثال: كيف أصدّر التقرير؟)...' }
  }
};

