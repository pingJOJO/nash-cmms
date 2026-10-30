import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileCheck2, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Wrench, 
  Package, 
  History, 
  Plus, 
  Printer, 
  AlertTriangle,
  Loader2,
  Calendar,
  DollarSign,
  Building2,
  Barcode,
  Award
} from 'lucide-react';
import { api } from '../../services/api';
import { AssetLifeFile, CalibrationRecord, Part } from '../../types/cmms';

interface AssetLifeFileModalProps {
  isOpen: boolean;
  assetId: string;
  onClose: () => void;
}

export const AssetLifeFileModal: React.FC<AssetLifeFileModalProps> = ({
  isOpen,
  assetId,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [lifeFile, setLifeFile] = useState<AssetLifeFile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'calibrations' | 'bom' | 'history' | 'audit'>('overview');
  const [availableParts, setAvailableParts] = useState<Part[]>([]);

  // New Calibration form state
  const [showAddCalib, setShowAddCalib] = useState(false);
  const [calibDate, setCalibDate] = useState(new Date().toISOString().slice(0, 10));
  const [calibNextDue, setCalibNextDue] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [calibVendor, setCalibVendor] = useState('');
  const [calibResult, setCalibResult] = useState<'PASS' | 'FAIL' | 'CONDITIONAL'>('PASS');
  const [calibNotes, setCalibNotes] = useState('');
  const [savingCalib, setSavingCalib] = useState(false);

  // New BOM form state
  const [showAddBOM, setShowAddBOM] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [bomQty, setBomQty] = useState(1);
  const [bomNotes, setBomNotes] = useState('');
  const [savingBOM, setSavingBOM] = useState(false);

  const fetchLifeFile = async () => {
    if (!assetId) return;
    setLoading(true);
    try {
      const data = await api.getAssetLifeFile(assetId);
      setLifeFile(data);
    } catch (err) {
      console.error('Failed to load asset life file:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && assetId) {
      fetchLifeFile();
      api.getParts().then(setAvailableParts).catch(console.warn);
    }
  }, [isOpen, assetId]);

  if (!isOpen) return null;

  const handleAddCalibration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCalib(true);
    try {
      await api.createAssetCalibration(assetId, {
        calibrationDate: calibDate,
        nextDueDate: calibNextDue,
        vendor: calibVendor,
        result: calibResult,
        notes: calibNotes
      });
      setShowAddCalib(false);
      setCalibVendor('');
      setCalibNotes('');
      await fetchLifeFile();
    } catch (err: any) {
      alert(err.message || 'فشل حفظ شهادة المعايرة');
    } finally {
      setSavingCalib(false);
    }
  };

  const handleAddBOM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId) return;
    setSavingBOM(true);
    try {
      await api.addAssetBOM(assetId, selectedPartId, bomQty, bomNotes);
      setShowAddBOM(false);
      setSelectedPartId('');
      setBomNotes('');
      await fetchLifeFile();
    } catch (err: any) {
      alert(err.message || 'فشل ربط القطعة بالـ BOM');
    } finally {
      setSavingBOM(false);
    }
  };

  const handleRemoveBOM = async (partId: string) => {
    if (!confirm('هل أنت متأكد من فك ارتباط هذه القطعة عن الجهاز؟')) return;
    try {
      await api.removeAssetBOM(assetId, partId);
      await fetchLifeFile();
    } catch (err: any) {
      alert(err.message || 'فشل حذف القطعة من الـ BOM');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const asset = lifeFile?.asset;
  const metrics = lifeFile?.metrics;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in print:p-0 print:bg-white">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black"
        dir="rtl"
      >
        {/* Modal Topbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/60 print:bg-white print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20 text-white print:hidden">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white print:text-black">
                  {asset ? asset.name : 'سجل حياة الجهاز (Equipment Life File)'}
                </h2>
                {asset?.riskLevel && (
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${
                    asset.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                    asset.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      asset.riskLevel === 'HIGH' ? 'bg-rose-400' :
                      asset.riskLevel === 'MEDIUM' ? 'bg-amber-400' :
                      'bg-emerald-400'
                    }`} />
                    <span>
                      {asset.riskLevel === 'HIGH' ? 'عالي الخطورة (Class A)' :
                       asset.riskLevel === 'MEDIUM' ? 'متوسط الخطورة (Class B)' :
                       'منخفض الخطورة (Class C)'}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600">
                ملف التوثيق الطبي/الصناعي المتوافق مع معايير الاعتماد HCAC / JCI / ISO 55000
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>طباعة الملف (Audit Ready)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
            <p className="text-sm">جارٍ تجميع بيانات سجل الحياة وملفات المعايرة...</p>
          </div>
        ) : !lifeFile ? (
          <div className="p-12 text-center text-slate-400">
            لم يتم العثور على سجل الحياة لهذا الأصل
          </div>
        ) : (
          <>
            {/* KPI Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/70 border-b border-slate-800 print:bg-white print:border-b">
              {/* Metric 1: Work Orders */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-sky-400" />
                  أوامر العمل التاريخية
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white print:text-black">
                    {metrics?.totalWorkOrders || 0}
                  </span>
                  <span className="text-xs text-emerald-400">
                    ({metrics?.completedWorkOrders || 0} منجز)
                  </span>
                </div>
              </div>

              {/* Metric 2: Downtime */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  ساعات التوقف (Downtime)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-amber-400">
                    {metrics?.totalDowntimeHours || 0}
                  </span>
                  <span className="text-xs text-slate-400">ساعة عمل</span>
                </div>
              </div>

              {/* Metric 3: Maintenance Cost */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  إجمالي كلفة الصيانة
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-emerald-400">
                    ${metrics?.totalMaintenanceCost || 0}
                  </span>
                  {metrics?.costRatioOfPurchase !== null && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      Number(metrics?.costRatioOfPurchase) > 40 
                        ? 'bg-rose-500/20 text-rose-400' 
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {metrics?.costRatioOfPurchase}% من القيمة
                    </span>
                  )}
                </div>
              </div>

              {/* Metric 4: Calibration Status */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  حالة المعايرة (HCAC/JCI)
                </span>
                <div className="flex items-center gap-1.5">
                  {metrics?.isCalibrationValid === true ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      سارية (متبقي {metrics?.calibrationDueInDays} يوم)
                    </span>
                  ) : metrics?.isCalibrationValid === false ? (
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4" />
                      منتهية / تتطلب معايرة فورية
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">لا توجد شهادة مسجلة</span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 text-xs font-semibold text-slate-400 print:hidden overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                بيانات الأصل والكفالة
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('calibrations')}
                className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'calibrations'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                شهادات المعايرة ({lifeFile.calibrations.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bom')}
                className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'bom'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                <Package className="w-4 h-4" />
                قطع الغيار المتوافقة BOM ({lifeFile.bomParts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                <History className="w-4 h-4" />
                سجل أوامر العمل ({lifeFile.workOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'audit'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                سجل التدقيق Audit Trail ({lifeFile.auditLogs.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 print:p-2">
              {/* TAB 1: OVERVIEW */}
              {(activeTab === 'overview' || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
                <div className="space-y-6">
                  {/* Warning if maintenance cost exceeds 40% */}
                  {metrics?.costRatioOfPurchase !== null && Number(metrics?.costRatioOfPurchase) >= 40 && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-xs">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-sm mb-0.5">تنبيه استبدال اقتصادي: تجاوز حد الصيانة المجدية</span>
                        تكاليف صيانة هذا الأصل بلغت <strong>{metrics?.costRatioOfPurchase}%</strong> من سعر شرائه الأصلي. يوصي النظام برفع توصية للجنة المشتريات لاستبدال الجهاز بدلاً من مواصلة الإصلاح.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Specs */}
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Barcode className="w-4 h-4 text-sky-400" />
                        المواصفات والباركود
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block">الباركود الدولي:</span>
                          <span className="font-mono text-sky-400 font-semibold">{asset?.barcode}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">الرقم التسلسلي:</span>
                          <span className="font-mono text-slate-300">{asset?.serialNumber || 'غير محدد'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">الموديل (Model):</span>
                          <span className="text-slate-300 font-medium">{asset?.model || 'غير محدد'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">الشركة المصنعة:</span>
                          <span className="text-slate-300 font-medium">{asset?.manufacturer || 'غير محدد'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">الموقع الميداني:</span>
                          <span className="text-slate-300">{asset?.locationName || 'غير محدد'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">الفني المسؤول:</span>
                          <span className="text-slate-300">{asset?.primaryWorkerName || 'غير محدد'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial & Warranty */}
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        البيانات المالية والكفالة
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block">تاريخ الشراء:</span>
                          <span className="text-slate-300">
                            {asset?.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'غير مسجل'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">سعر الشراء الأولي:</span>
                          <span className="font-semibold text-emerald-400">
                            {asset?.purchasePrice ? `$${asset.purchasePrice}` : 'غير مسجل'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">انتهاء الكفالة المصنعية:</span>
                          <span className="text-slate-300">
                            {asset?.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'غير مسجل'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">تصنيف الخطورة الطبية:</span>
                          <span className="font-bold text-sky-400">{asset?.riskLevel || 'LOW'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CALIBRATIONS */}
              {activeTab === 'calibrations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">سجلات المعايرة الدورية (Calibration Logs)</h4>
                      <p className="text-xs text-slate-400">متطلب إلزامي لاعتماد المنشآت الصحية والمصانع الدوائية</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddCalib(!showAddCalib)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة شهادة معايرة</span>
                    </button>
                  </div>

                  {/* Add Calibration Form */}
                  {showAddCalib && (
                    <form onSubmit={handleAddCalibration} className="p-4 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-3 animate-fade-in">
                      <h5 className="text-xs font-bold text-emerald-400">تسجيل شهادة معايرة جديدة</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1">تاريخ المعايرة:</label>
                          <input
                            type="date"
                            value={calibDate}
                            onChange={(e) => setCalibDate(e.target.value)}
                            required
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">تاريخ الاستحقاق القادم:</label>
                          <input
                            type="date"
                            value={calibNextDue}
                            onChange={(e) => setCalibNextDue(e.target.value)}
                            required
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">الجهة المعايرة / المختبر:</label>
                          <input
                            type="text"
                            value={calibVendor}
                            onChange={(e) => setCalibVendor(e.target.value)}
                            placeholder="مثال: مختبر المعايرة المعتمد"
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1">نتيجة الفحص:</label>
                          <select
                            value={calibResult}
                            onChange={(e: any) => setCalibResult(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          >
                            <option value="PASS">ناجح (PASS) — مطابق للمواصفات</option>
                            <option value="CONDITIONAL">مشروط (CONDITIONAL) — يتطلب متابعة</option>
                            <option value="FAIL">راسب (FAIL) — إيقاف فوري عن الخدمة</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">ملاحظات الفحص:</label>
                          <input
                            type="text"
                            value={calibNotes}
                            onChange={(e) => setCalibNotes(e.target.value)}
                            placeholder="ملاحظات الشهادة ورقم الاعتماد"
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddCalib(false)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          disabled={savingCalib}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          {savingCalib && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          حفظ الشهادة
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Calibrations Table */}
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">تاريخ الفحص</th>
                          <th className="p-3">الاستحقاق القادم</th>
                          <th className="p-3">الجهة المعايرة</th>
                          <th className="p-3">النتيجة</th>
                          <th className="p-3">الملاحظات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {lifeFile.calibrations.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-500">
                              لا توجد شهادات معايرة مسجلة لهذا الجهاز حتى الآن
                            </td>
                          </tr>
                        ) : (
                          lifeFile.calibrations.map((calib) => (
                            <tr key={calib.id} className="hover:bg-slate-800/40">
                              <td className="p-3 font-mono">{new Date(calib.calibrationDate).toLocaleDateString()}</td>
                              <td className="p-3 font-mono text-sky-400">{new Date(calib.nextDueDate).toLocaleDateString()}</td>
                              <td className="p-3 font-medium text-slate-200">{calib.vendor || 'فريق المعايرة الداخلي'}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  calib.result === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' :
                                  calib.result === 'CONDITIONAL' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-rose-500/20 text-rose-400'
                                }`}>
                                  {calib.result}
                                </span>
                              </td>
                              <td className="p-3 text-slate-400">{calib.notes || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: BOM (BILL OF MATERIALS) */}
              {activeTab === 'bom' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">قائمة قطع الغيار المتوافقة (Asset BOM)</h4>
                      <p className="text-xs text-slate-400">تحديد القطع المخصصة لهذا الجهاز مع كمياتها في المستودع ومواقع الرفوف</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddBOM(!showAddBOM)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>ربط قطعة غيار جديدة</span>
                    </button>
                  </div>

                  {/* Add BOM Part Form */}
                  {showAddBOM && (
                    <form onSubmit={handleAddBOM} className="p-4 bg-slate-950 border border-sky-500/30 rounded-xl space-y-3 animate-fade-in">
                      <h5 className="text-xs font-bold text-sky-400">ربط قطعة غيار بقائمة BOM لهذا الجهاز</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="sm:col-span-2">
                          <label className="text-slate-400 block mb-1">اختر قطعة الغيار:</label>
                          <select
                            value={selectedPartId}
                            onChange={(e) => setSelectedPartId(e.target.value)}
                            required
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          >
                            <option value="">-- حدد قطعة غيار من المخزون --</option>
                            {availableParts.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.barcode}) — متوفر: {p.quantity} | رف: {p.area || 'عام'}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">الكمية المطلوبة للجهاز:</label>
                          <input
                            type="number"
                            min="1"
                            value={bomQty}
                            onChange={(e) => setBomQty(parseInt(e.target.value, 10))}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddBOM(false)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          disabled={savingBOM}
                          className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          {savingBOM && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          تأكيد الربط
                        </button>
                      </div>
                    </form>
                  )}

                  {/* BOM Table */}
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">اسم القطعة</th>
                          <th className="p-3">الباركود</th>
                          <th className="p-3">موقع الرف والمستودع</th>
                          <th className="p-3">الكمية المطلوبة</th>
                          <th className="p-3">المتوفر بالمخزن</th>
                          <th className="p-3">سعر الوحدة</th>
                          <th className="p-3">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {lifeFile.bomParts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-slate-500">
                              لا توجد قطع غيار مرتبطة بهذا الأصل حالياً. استخدم الزر أعلاه لإضافة قطع متوافقة.
                            </td>
                          </tr>
                        ) : (
                          lifeFile.bomParts.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/40">
                              <td className="p-3 font-semibold text-white">{item.partName}</td>
                              <td className="p-3 font-mono text-slate-400">{item.partBarcode}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono text-[11px]">
                                  {item.warehouseLocation}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-white">{item.quantityNeeded}</td>
                              <td className="p-3">
                                <span className={`font-semibold ${
                                  (item.inStock || 0) <= (item.minQuantity || 0)
                                    ? 'text-rose-400' 
                                    : 'text-emerald-400'
                                }`}>
                                  {item.inStock || 0} وحدة
                                </span>
                              </td>
                              <td className="p-3 text-slate-300">${item.cost || 0}</td>
                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBOM(item.partId)}
                                  className="text-rose-400 hover:text-rose-300 text-xs font-semibold"
                                >
                                  فك الارتباط
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: WORK ORDER HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white">سجل الصيانة والأعطال التاريخي</h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">رقم الأمر</th>
                          <th className="p-3">العنوان / وصف العطل</th>
                          <th className="p-3">الحالة</th>
                          <th className="p-3">الأولوية</th>
                          <th className="p-3">التاريخ</th>
                          <th className="p-3">ساعات العمل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {lifeFile.workOrders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-500">
                              لا توجد أوامر عمل مسجلة لهذا الجهاز حتى الآن
                            </td>
                          </tr>
                        ) : (
                          lifeFile.workOrders.map((wo: any) => (
                            <tr key={wo.id} className="hover:bg-slate-800/40">
                              <td className="p-3 font-mono text-sky-400 font-bold">{wo.code || wo.id}</td>
                              <td className="p-3 font-medium text-white">{wo.title}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  wo.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                                  wo.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-slate-800 text-slate-300'
                                }`}>
                                  {wo.status}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="text-[11px] font-semibold text-slate-300">{wo.priority}</span>
                              </td>
                              <td className="p-3 text-slate-400">{new Date(wo.createdAt).toLocaleDateString()}</td>
                              <td className="p-3 font-mono text-slate-300">
                                {wo.labors?.reduce((s: number, l: any) => s + Number(l.hours), 0) || 0} س
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: AUDIT LOG */}
              {activeTab === 'audit' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white">سجل التدقيق غير القابل للتعديل (Immutable Audit Trail)</h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">التوقيت</th>
                          <th className="p-3">نوع الإجراء</th>
                          <th className="p-3">المستخدم / الفني</th>
                          <th className="p-3">التفاصيل والتغيير</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {lifeFile.auditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-slate-500">
                              لا توجد سجلات تدقيق مسجلة حتى الآن
                            </td>
                          </tr>
                        ) : (
                          lifeFile.auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800/40">
                              <td className="p-3 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-bold text-[10px]">
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-3 text-slate-200">{log.user?.name || log.userId}</td>
                              <td className="p-3 text-slate-300 font-mono text-[11px]">
                                {log.newValue || log.previousValue || log.reason || '—'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 print:hidden">
          <span>نظام NexCMMS — معتمد للهندسة الطبية والمصانع الحيوية</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
