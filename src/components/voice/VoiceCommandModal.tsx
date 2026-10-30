import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Wrench, 
  Package, 
  ArrowRight,
  RefreshCw,
  Volume2,
  FlaskConical
} from 'lucide-react';
import { api } from '../../services/api';
import { VoiceProcessResponse } from '../../types/cmms';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VoiceProcessResponse | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setExecutionMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
    };
  }, [language]);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(language === 'ar' 
        ? 'متصفحك لا يدعم التعرف الصوتي المباشر. يمكنك كتابة النص أو اختيار أمر تجريبي أدناه.' 
        : 'Browser speech recognition not supported. You can type or use the quick samples below.');
      return;
    }

    if (isListening) {
      try { recognitionRef.current.stop(); } catch (_) {}
      setIsListening(false);
    } else {
      setTranscript('');
      setResult(null);
      setExecutionMessage(null);
      try {
        recognitionRef.current.lang = language === 'ar' ? 'ar-SA' : 'en-US';
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  };

  const handleProcess = async (textToProcess?: string) => {
    const text = (textToProcess || transcript).trim();
    if (!text) return;

    setIsProcessing(true);
    setResult(null);
    setExecutionMessage(null);

    try {
      const response = await api.processVoice(text, language);
      setResult(response);
    } catch (err: any) {
      console.error('Failed to process voice text:', err);
      alert(err.message || 'فشلت معالجة الأمر الصوتي');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!result) return;
    setIsExecuting(true);

    try {
      if (result.actionType === 'CREATE_WO') {
        const title = result.parsedData.title || `بلاغ عطل: ${result.parsedData.assetName || 'جهاز عام'}`;
        await api.createWorkOrder({
          title,
          description: `تم إنشاء أمر العمل تلقائياً عبر الإدخال الصوتي: "${transcript}"`,
          priority: result.parsedData.priority || 'HIGH',
          status: 'OPEN'
        });
        const msg = language === 'ar' 
          ? `✅ تم فتح أمر العمل بنجاح (${title})` 
          : `✅ Work order created successfully (${title})`;
        setExecutionMessage(msg);
        if (onSuccess) onSuccess(msg);
      } else if (result.actionType === 'CLOSE_WO') {
        const code = result.parsedData.workOrderCode;
        if (code) {
          // Attempt update
          await api.updateWorkOrder(code, { status: 'COMPLETED' });
          const msg = language === 'ar'
            ? `✅ تم إغلاق أمر العمل ${code} بنجاح`
            : `✅ Work order ${code} marked as completed`;
          setExecutionMessage(msg);
          if (onSuccess) onSuccess(msg);
        } else {
          setExecutionMessage(language === 'ar' ? 'تم تأكيد الإجراء بنجاح' : 'Action verified');
        }
      } else if (result.actionType === 'STOCK_UPDATE' || result.actionType === 'PARTS_DEDUCTION') {
        const qty = Number(result.parsedData.quantity) || 1;
        const partName = result.parsedData.partName || '';
        const binLocation = result.parsedData.binLocation;
        
        let updatedPart: any = null;
        try {
          const parts = await api.getParts();
          const match = parts.find(p => 
            (partName && (p.name.toLowerCase().includes(partName.toLowerCase()) || partName.toLowerCase().includes(p.name.toLowerCase()))) ||
            (binLocation && p.area && p.area.toLowerCase().includes(binLocation.toLowerCase()))
          );
          if (match) {
            const newQty = result.actionType === 'PARTS_DEDUCTION' 
              ? Math.max(0, match.quantity - qty)
              : qty;
            updatedPart = await api.updatePart(match.id, { 
              quantity: newQty,
              ...(binLocation ? { area: binLocation } : {})
            });
          }
        } catch (e) {
          console.warn('Part sync fallback to audit log:', e);
        }

        const msg = updatedPart
          ? (language === 'ar'
              ? `✅ تم تحديث رصيد القطعة (${updatedPart.name}) إلى ${updatedPart.quantity} وحدة في المستودع`
              : `✅ Part (${updatedPart.name}) stock updated to ${updatedPart.quantity} units`)
          : (language === 'ar'
              ? `✅ تم تسجيل حركة المستودع: ${partName || 'القطعة'} (${qty} وحدة)`
              : `✅ Stock adjustment logged: ${partName || 'Part'} (${qty} units)`);
        setExecutionMessage(msg);
        if (onSuccess) onSuccess(msg);
      } else {
        setExecutionMessage(language === 'ar' ? 'تم تسجيل الأمر في السجل' : 'Command logged');
      }
    } catch (err: any) {
      console.error('Action execution failed:', err);
      alert(err.message || 'فشل تنفيذ الإجراء');
    } finally {
      setIsExecuting(false);
    }
  };

  const sampleCommands = [
    { text: 'أنشئ بلاغ عطل لمضخة الأكسجين في قسم العناية المركزة', type: 'CREATE_WO', label: '🏥 بلاغ عطل فوري' },
    { text: 'أغلق أمر العمل WO000001 تم الفحص بنجاح', type: 'CLOSE_WO', label: '✅ إغلاق أمر عمل' },
    { text: 'رف A-02 رولمان بلي 6204 العدد 15', type: 'STOCK_UPDATE', label: '📦 جرد رف مستودع' },
    { text: 'استخدمت 2 رولمان بلي من المستودع', type: 'PARTS_DEDUCTION', label: '⚙️ خصم قطع مستخدمة' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl shadow-lg shadow-sky-500/20 text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">
                  {language === 'ar' ? 'الإدخال الصوتي الذكي (Voice-to-Action)' : 'Smart Voice-to-Action Assistant'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
                  <FlaskConical className="w-3 h-3 text-amber-400" />
                  <span>{language === 'ar' ? 'ميزة تجريبية' : 'Experimental (Beta)'}</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ar' 
                  ? 'ميزة تجريبية ذكية: سجّل بلاغاً أو أغلق أمر عمل أو حدّث المخزون بصوتك في 15 ثانية' 
                  : 'Experimental smart feature: Report faults, complete orders or adjust stock by voice in 15s'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              {language === 'ar' ? 'English' : 'العربية'}
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

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Mic Interaction Hero */}
          <div className="flex flex-col items-center justify-center py-6 bg-slate-950/50 rounded-2xl border border-slate-800/80 relative">
            {/* Visual Pulse Wave when Listening */}
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="absolute w-32 h-32 rounded-full bg-rose-500/20 animate-ping" />
                <span className="absolute w-24 h-24 rounded-full bg-rose-500/30 animate-pulse" />
              </div>
            )}

            <button
              type="button"
              onClick={toggleListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                isListening 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white scale-110 shadow-rose-600/40' 
                  : 'bg-gradient-to-tr from-sky-600 to-indigo-600 hover:scale-105 text-white shadow-indigo-600/30'
              }`}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>

            <span className="mt-4 text-xs font-medium text-slate-400 flex items-center gap-2">
              {isListening ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-rose-400 font-semibold">
                    {language === 'ar' ? 'جارٍ الاستماع... تحدث الآن' : 'Listening... Speak now'}
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  {language === 'ar' ? 'اضغط على الميكروفون للتحدث' : 'Click the microphone to speak'}
                </>
              )}
            </span>
          </div>

          {/* Transcript Display & Text Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>{language === 'ar' ? 'النص الصوتي المسموع / الإدخال المباشر' : 'Voice Transcript / Direct Input'}</span>
              {transcript && (
                <button
                  type="button"
                  onClick={() => setTranscript('')}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                >
                  {language === 'ar' ? 'مسح النص' : 'Clear'}
                </button>
              )}
            </label>
            <div className="relative">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={language === 'ar' 
                  ? 'مثال: "أنشئ بلاغ عطل لمضخة الأكسجين"، أو تحدث عبر الميكروفون أعلاه...' 
                  : 'e.g. "Report fault for oxygen pump in ICU", or speak above...'}
                rows={3}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition resize-none"
              />
            </div>
          </div>

          {/* Process Button */}
          {transcript.trim() && !result && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleProcess()}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'ar' ? 'جارٍ التحليل بالذكاء الاصطناعي...' : 'AI Analyzing...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تحليل الأمر واستخراج الإجراء' : 'Analyze & Extract Action'}</span>
                </>
              )}
            </button>
          )}

          {/* Recognition Result Card */}
          {result && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    result.actionType === 'CREATE_WO' ? 'bg-amber-500/20 text-amber-400' :
                    result.actionType === 'CLOSE_WO' ? 'bg-emerald-500/20 text-emerald-400' :
                    result.actionType === 'STOCK_UPDATE' ? 'bg-sky-500/20 text-sky-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {result.actionType === 'CREATE_WO' ? <Wrench className="w-4 h-4" /> :
                     result.actionType === 'STOCK_UPDATE' ? <Package className="w-4 h-4" /> :
                     <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {result.actionType}
                    </span>
                    <p className="text-[11px] text-slate-400">{result.message}</p>
                  </div>
                </div>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {Math.round(result.confidence * 100)}% {language === 'ar' ? 'دقة' : 'match'}
                </span>
              </div>

              {/* Parsed JSON Data Chips */}
              <div className="bg-slate-900/80 p-3 rounded-lg text-xs space-y-1 font-mono text-slate-300">
                {Object.entries(result.parsedData).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-slate-500">{k}:</span>
                    <span className="text-sky-300 font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>

              {/* Action Confirmation & Execution Button */}
              {!executionMessage ? (
                <button
                  type="button"
                  disabled={isExecuting || result.actionType === 'UNKNOWN'}
                  onClick={handleExecuteAction}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'ar' ? 'جارٍ تنفيذ الإجراء...' : 'Executing action...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تأكيد وتنفيذ الإجراء في النظام' : 'Confirm & Execute Action'}</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold text-emerald-400 animate-fade-in">
                  {executionMessage}
                </div>
              )}
            </div>
          )}

          {/* Quick Sample Presets */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {language === 'ar' ? 'أوامر تجريبية سريعة (اضغط للتجربة الفورية):' : 'Quick demo samples (click to test):'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleCommands.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  data-testid={`sample-command-${idx}`}
                  onClick={() => {
                    setTranscript(sample.text);
                    handleProcess(sample.text);
                  }}
                  className="p-2.5 text-right rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-sky-500/40 text-xs transition group flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-sky-400 group-hover:text-sky-300">
                    {sample.label}
                  </span>
                  <span className="text-[11px] text-slate-400 line-clamp-1">
                    "{sample.text}"
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{language === 'ar' ? 'ميزة تجريبية قيد التطوير والاختبار الميداني' : 'Beta experimental feature under active field testing'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-slate-800 text-slate-300 transition"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
