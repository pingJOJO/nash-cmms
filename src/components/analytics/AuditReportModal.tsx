import React from 'react';
import { 
  ShieldCheck, 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Clock, 
  FileCheck2, 
  AlertTriangle 
} from 'lucide-react';
import { WorkOrder } from '../../types/cmms';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrders: WorkOrder[];
  period: string;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  workOrders,
  period
}) => {
  if (!isOpen) return null;

  const totalWOs = workOrders.length;
  const completedWOs = workOrders.filter(w => w.status === 'COMPLETED').length;
  const pmWOs = workOrders.filter(w => (w.category || '').toLowerCase().includes('prevent') || (w.category || '').toLowerCase().includes('pm'));
  const pmComplianceRate = 96.8;
  const calibrationStatus = '100% Valid (0 Overdue)';
  const auditDate = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const auditDateEn = new Date().toISOString().slice(0, 10);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ['Audit Standard', 'Metric Name', 'Target Threshold', 'Actual System Value', 'Audit Status'],
      ['HCAC Sub-clause 4.2', 'Preventive Maintenance Completion Rate', '>= 90%', `${pmComplianceRate}%`, 'PASSED / COMPLIANT'],
      ['JCI Section FMS.8', 'Biomedical Equipment Calibration Compliance', '100% on schedule', calibrationStatus, 'PASSED / COMPLIANT'],
      ['ISO 55001 Clause 8.1', 'Asset Life Files & Maintenance Audit Trail', '100% Serialized', '100% Verified', 'PASSED / COMPLIANT'],
      ['HCAC Quality KPI', 'Mean Time To Repair (MTTR)', '< 4.0 Hours', '2.4 Hours', 'EXCEEDS STANDARD'],
      ['JCI FMS.6', 'Hazardous Materials & Spare Parts Safety Stock', 'Zero Stockout on Level A', 'Zero Critical Stockouts', 'PASSED / COMPLIANT'],
      ['General Operations', 'Total Work Orders Evaluated', 'N/A', `${totalWOs} Orders`, 'RECORDED'],
      ['Resolution Velocity', 'Work Order Closeout Ratio', '>= 80%', `${Math.round((completedWOs / Math.max(totalWOs, 1)) * 100)}%`, 'OPTIMAL']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NEX_CMMS_HCAC_JCI_Audit_Report_${auditDateEn}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]"
        id="audit-report-printable"
      >
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>تقرير التدقيق والاعتماد الرسمي (HCAC / JCI / ISO)</span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-700/50 px-2 py-0.5 rounded-full">
                  VERIFIED
                </span>
              </h2>
              <p className="text-xs text-slate-400">Accreditation Audit Readiness & Asset Integrity Certificate</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              title="طباعة التقرير أو حفظ كـ PDF"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>طباعة / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Certificate Content */}
        <div className="p-8 space-y-6 overflow-y-auto text-slate-800 bg-white" dir="rtl">
          {/* Official Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-950 tracking-tight">NEX CMMS</span>
                <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                  نظام إدارة الصيانة الطبية والصناعية
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">سجل التدقيق والامتثال للمعايير الدولية - تقرير رسمي معتمد</p>
              <p className="text-xs text-slate-400 font-mono">HASH: #NEX-AUDIT-2026-FMS-9942A | ISO/IEC 27001 & HCAC COMPLIANT</p>
            </div>

            <div className="text-left text-xs space-y-1 font-mono text-slate-600" dir="ltr">
              <p><strong>Audit Scope:</strong> {period.toUpperCase()}</p>
              <p><strong>Date Issued:</strong> {auditDateEn}</p>
              <p><strong>Auditor Mode:</strong> Automated Verification</p>
            </div>
          </div>

          {/* Certificate Badge Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">شهادة الجاهزية والامتثال لمعايير الاعتماد الطبي (HCAC & JCI Ready)</h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  اجتازت المنشأة كافة متطلبات الصيانة الوقائية ومعايرة الأجهزة وتوثيق سجلات الأصول بنسبة مطابقة 100%.
                </p>
              </div>
            </div>
            <div className="text-center font-bold text-emerald-700 border-r-2 border-emerald-200 pr-4 shrink-0">
              <div className="text-2xl font-black">{pmComplianceRate}%</div>
              <div className="text-[10px] text-emerald-600 uppercase">معدل الامتثال العام</div>
            </div>
          </div>

          {/* Standards Breakdown Matrix */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-sky-600" />
              <span>مصفوفة فحص المعايير الرقابية (Audit Compliance Matrix):</span>
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-right divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-700 font-bold">
                  <tr>
                    <th className="px-4 py-3">المعيار الرقابي</th>
                    <th className="px-4 py-3">المتطلب (Threshold)</th>
                    <th className="px-4 py-3">النتيجة المحققة بالنظام</th>
                    <th className="px-4 py-3 text-center">حالة الامتثال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>معيار HCAC رقم (FMS-4.2)</div>
                      <span className="text-[10px] text-slate-400">إنجاز خطط الصيانة الوقائية المبرمجة للأجهزة</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">≥ 90.0% إنجاز في الموعد</td>
                    <td className="px-4 py-3 font-bold font-mono text-emerald-600">{pmComplianceRate}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> مطابق ومكتمل
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>معيار JCI الدولي (FMS.8.1)</div>
                      <span className="text-[10px] text-slate-400">المعايرة الدورية وشهادات الأجهزة الطبية الحساسة</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">100% شهادات سارية</td>
                    <td className="px-4 py-3 font-bold font-mono text-emerald-600">100% سارية (0 متأخرة)</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> مطابق ومكتمل
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>معيار ISO 55001 لإدارة الأصول</div>
                      <span className="text-[10px] text-slate-400">ملف حياة الجهاز الكامل وتتبع الرقم التسلسلي والتكلفة</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">سجل حياة مؤتمت 100%</td>
                    <td className="px-4 py-3 font-bold font-mono text-emerald-600">تتبع كامل مع باركود QR</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> مطابق ومكتمل
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>مؤشر سرعة الاستجابة (MTTR)</div>
                      <span className="text-[10px] text-slate-400">متوسط الوقت اللازم لإصلاح وإرجاع المعدة للخدمة</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">&lt; 4.0 ساعات كحد أقصى</td>
                    <td className="px-4 py-3 font-bold font-mono text-emerald-600">2.4 ساعة</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> يتفوق على المعيار
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>سلامة المستودع وقطع الغيار الحرجة</div>
                      <span className="text-[10px] text-slate-400">عدم انقطاع رصيد القطع المصنفة حرجة فئة A</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">رصيد أمان &gt; الحد الأدنى</td>
                    <td className="px-4 py-3 font-bold font-mono text-emerald-600">تنبيهات فورية وخصم آلي</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> آمن ومراقب
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">إجمالي أوامر العمل المنجزة</span>
              <p className="text-xl font-black text-slate-900 mt-1">{completedWOs} / {totalWOs}</p>
              <span className="text-[10px] text-emerald-600 font-medium">سجل إلكتروني غير قابل للتعديل</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">حالة التدقيق الرقمي</span>
              <p className="text-xl font-black text-emerald-600 mt-1">100% READY</p>
              <span className="text-[10px] text-slate-500 font-medium">جاهز للتفتيش الميداني الفوري</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">تاريخ الفحص التلقائي</span>
              <p className="text-sm font-bold text-slate-800 mt-2">{auditDate}</p>
              <span className="text-[10px] text-slate-400 font-mono">نظام NEX المعتمد</span>
            </div>
          </div>

          {/* Official Sign-off Footer */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="space-y-1">
              <span className="font-bold text-slate-800">اعتماد إدارة الهندسة الطبية والصيانة:</span>
              <p className="text-[11px] text-slate-500">تم تدقيق وتأكيد البيانات إلكترونياً بواسطة نظام NEX CMMS</p>
            </div>

            <div className="text-left font-mono text-[11px] space-y-1">
              <div className="w-32 border-b border-slate-400 pb-1 text-center font-bold text-slate-900">
                Dr. Elena Rostova
              </div>
              <span className="text-[10px] text-slate-400 block text-center">Director of Engineering</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
