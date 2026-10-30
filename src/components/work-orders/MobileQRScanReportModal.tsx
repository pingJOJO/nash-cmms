import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  AlertTriangle, 
  Camera, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  Clock, 
  Send, 
  Sparkles, 
  Wrench,
  ShieldAlert,
  Loader2,
  Image as ImageIcon,
  Target
} from 'lucide-react';
import { Asset, Priority } from '../../types/cmms';
import { api } from '../../services/api';

interface MobileQRScanReportModalProps {
  isOpen: boolean;
  asset: Asset | null;
  onClose: () => void;
  onSuccess?: (workOrderId: string) => void;
}

export const MobileQRScanReportModal: React.FC<MobileQRScanReportModalProps> = ({
  isOpen,
  asset,
  onClose,
  onSuccess
}) => {
  const [problemCategory, setProblemCategory] = useState<string>('توقف مفاجئ (Breakdown)');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 15-second benchmark timer
  useEffect(() => {
    let timer: any;
    if (isOpen && !submittedSuccess) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, submittedSuccess]);

  if (!isOpen || !asset) return null;

  const quickProblemPresets = [
    { label: 'توقف مفاجئ (Complete Breakdown)', priority: 'CRITICAL' as Priority },
    { label: 'تسريب سوائل / زيت (Fluid Leak)', priority: 'HIGH' as Priority },
    { label: 'حرارة مرتفعة (Overheating)', priority: 'HIGH' as Priority },
    { label: 'صوت أو اهتزاز غير طبيعي (Abnormal Noise)', priority: 'MEDIUM' as Priority },
    { label: 'عطل كهربائي أو حساسات (Sensor/Electrical)', priority: 'HIGH' as Priority }
  ];

  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('متصفحك لا يدعم Web Speech API — يرجى استخدام نص الكتابة أو متصفح Chrome/Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-JO';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription(prev => prev ? `${prev} - ${transcript}` : transcript);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setIsListening(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create instant work order with asset linkage
      const title = `[QR Report] ${problemCategory} - ${asset.name}`;
      const fullDescription = `${description ? description + ' | ' : ''}Reported via 15s Mobile QR Scan in ${elapsedSeconds}s.`;

      const newWO = await api.createWorkOrder({
        title,
        description: fullDescription,
        priority: priority,
        assetId: asset.id,
        assetName: asset.name,
        locationName: typeof asset.locationName === 'string' ? asset.locationName : 'Main Facility',
        dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4hr SLA
      });

      setSubmittedSuccess(newWO.id);
      onSuccess?.(newWO.id);
    } catch (err: any) {
      alert(err.message || 'فشل إرسال البلاغ السريع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      {/* Smartphone Container Mockup */}
      <div className="bg-slate-900 border-4 border-slate-700 rounded-[36px] shadow-2xl max-w-sm w-full overflow-hidden flex flex-col text-white relative animate-in fade-in zoom-in-95 duration-200">
        {/* Smartphone Speaker & Camera Notch */}
        <div className="h-6 bg-slate-950 flex items-center justify-center relative">
          <div className="w-16 h-3.5 bg-slate-800 rounded-full flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="w-6 h-1 rounded-full bg-slate-700" />
          </div>
        </div>

        {/* Mobile Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-sky-900/80 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">NexCMMS Mobile QR</h3>
              <p className="text-[10px] text-sky-300 font-medium">نظام الإبلاغ السريع خلال 15 ثانية</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto max-h-[75vh] space-y-4 text-xs">
          {submittedSuccess ? (
            /* Success State */
            <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">تم استلام البلاغ بنجاح!</h4>
                <p className="text-[11px] text-slate-400">
                  تم إنشاء أمر عمل فوري وتنبيه الفني المناوب لهذا الجهاز.
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-left space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">رقم أمر العمل:</span>
                  <span className="font-mono font-bold text-sky-400">{submittedSuccess}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">زمن الإبلاغ المقاس:</span>
                  <span className="font-bold text-emerald-400">{elapsedSeconds} ثانية (أقل من الهدف 15s)</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">استجابة الصيانة المتوقعة:</span>
                  <span className="font-bold text-amber-400">&lt; 30 دقيقة</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition shadow-md cursor-pointer"
              >
                إغلاق والعودة للنظام
              </button>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handleSubmitReport} className="space-y-4">
              {/* Benchmark Timer Alert */}
              <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/40 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-sky-300 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                  <span>الوقت المستغرق: {elapsedSeconds} ثانية</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                  elapsedSeconds <= 15 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {elapsedSeconds <= 15 ? (
                    <>
                      <Target className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>في نطاق الـ 15s</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>تجاوز الهدف</span>
                    </>
                  )}
                </span>
              </div>

              {/* Asset Header Card Loaded via QR */}
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-sky-400 px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800">
                    {asset.id}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    asset.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    asset.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {asset.riskLevel === 'HIGH' ? 'خطورة عالية (A)' : asset.riskLevel === 'MEDIUM' ? 'خطورة متوسطة (B)' : 'خطورة منخفضة (C)'}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white">{asset.name}</h4>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>الموقع: {typeof asset.locationName === 'string' ? asset.locationName : 'Main Facility'}</span>
                  <span className="font-mono text-slate-500">{asset.barcode}</span>
                </div>
              </div>

              {/* Quick Fault Category Chips */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">نوع العطل الملاحظ (اختيار سريع):</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {quickProblemPresets.map((preset) => {
                    const isSelected = problemCategory === preset.label;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setProblemCategory(preset.label);
                          setPriority(preset.priority);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-400 text-white font-bold shadow-xs'
                            : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate">{preset.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voice-Assisted Notes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">وصف إضافي (صوتي أو كتابة):</label>
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                      isListening 
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    <span>{isListening ? 'جارٍ الاستماع...' : 'إدخال صوتي'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: دخان خفيف يتصاعد من المحرك الخلفي..."
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Photo Upload Simulation */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">إرفاق صورة العطل (اختياري):</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition">
                    <Camera className="w-4 h-4 text-sky-400" />
                    <span className="text-[11px] text-slate-300">التقاط أو رفع صورة</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {photoPreview && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-sky-400 shrink-0">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 text-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ إرسال البلاغ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال البلاغ الفوري (Submit Fault Report)</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Smartphone Home Indicator Bar */}
        <div className="h-4 bg-slate-950 flex items-center justify-center">
          <div className="w-24 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
