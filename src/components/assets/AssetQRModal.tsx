import React, { useEffect, useState, useRef } from 'react';
import { X, QrCode, Printer, Download, ExternalLink, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import QRCode from 'qrcode';
import { Asset } from '../../types/cmms';

interface AssetQRModalProps {
  isOpen: boolean;
  asset: Asset | null;
  onClose: () => void;
  onSimulateMobileScan?: (asset: Asset) => void;
}

export const AssetQRModal: React.FC<AssetQRModalProps> = ({
  isOpen,
  asset,
  onClose,
  onSimulateMobileScan
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const reportUrl = asset ? `${window.location.origin}/report?assetId=${asset.id}` : '';

  useEffect(() => {
    if (asset) {
      QRCode.toDataURL(reportUrl, {
        width: 320,
        margin: 1.5,
        color: {
          dark: '#090D16',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      }).then(setQrDataUrl).catch(console.error);
    }
  }, [asset, reportUrl]);

  if (!isOpen || !asset) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    if (!printWindow || !printRef.current) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Tag - ${asset.name} (${asset.id})</title>
          <style>
            @page { size: 60mm 40mm; margin: 0; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0; 
              padding: 6px; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              background: #fff;
              color: #000;
            }
            .tag {
              border: 2px solid #000;
              border-radius: 6px;
              padding: 6px;
              width: 100%;
              box-sizing: border-box;
              display: flex;
              gap: 8px;
              align-items: center;
            }
            .qr { width: 90px; height: 90px; }
            .info { flex: 1; font-size: 10px; line-height: 1.25; }
            .title { font-size: 12px; font-weight: 900; margin-bottom: 2px; }
            .code { font-family: monospace; font-weight: bold; font-size: 11px; }
            .badge { display: inline-block; padding: 1px 4px; font-size: 9px; font-weight: bold; border: 1px solid #000; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="tag">
            <img src="${qrDataUrl}" class="qr" />
            <div class="info">
              <div class="title">${asset.name}</div>
              <div class="code">ID: ${asset.id}</div>
              <div>Model: ${asset.model || 'N/A'}</div>
              <div>Loc: ${typeof asset.locationName === 'string' ? asset.locationName : 'Main Facility'}</div>
              <div style="margin-top: 4px;">
                <span class="badge">NEX CMMS • SCAN TO REPORT</span>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_${asset.id}_${asset.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Industrial QR Asset Tag</h3>
              <p className="text-[11px] text-slate-500">Scan to access Life File & 15-second fault reporting</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Physical Tag Card Preview */}
        <div 
          ref={printRef}
          className="p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden"
        >
          {/* Tag Header Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-600" />

          {/* QR Image */}
          <div className="w-28 h-28 bg-white p-1.5 rounded-xl border border-slate-300 shadow-xs shrink-0 flex items-center justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`QR for ${asset.name}`} className="w-full h-full object-contain" />
            ) : (
              <div className="animate-pulse text-xs text-slate-400">Generating...</div>
            )}
          </div>

          {/* Asset Info on Sticker */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                {asset.id}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                asset.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                asset.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}>
                RISK: {asset.riskLevel || 'LOW'}
              </span>
            </div>

            <h4 className="font-extrabold text-sm text-slate-900 truncate" title={asset.name}>
              {asset.name}
            </h4>

            <div className="text-[11px] text-slate-600 space-y-0.5">
              <div className="truncate"><span className="text-slate-400 font-medium">Model:</span> {asset.model || 'Standard'}</div>
              <div className="truncate"><span className="text-slate-400 font-medium">Location:</span> {typeof asset.locationName === 'string' ? asset.locationName : 'Main Facility'}</div>
              <div className="truncate font-mono text-[10px] text-slate-500"><span className="text-slate-400 font-sans">Barcode:</span> {asset.barcode}</div>
            </div>

            <div className="pt-1 flex items-center gap-1 text-[9px] font-bold text-sky-700 uppercase tracking-wider">
              <span>NEX CMMS • VERIFIED ASSET</span>
            </div>
          </div>
        </div>

        {/* Scan Destination Link */}
        <div className="p-3 bg-slate-100/70 rounded-xl text-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Scan Destination URL:
          </span>
          <div className="flex items-center justify-between gap-2">
            <code className="font-mono text-[11px] text-slate-700 truncate">
              {reportUrl}
            </code>
            <button
              onClick={handleCopyLink}
              className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-50 rounded text-[11px] font-semibold text-slate-700 shrink-0 cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Mobile Simulation Killer Feature */}
        <div className="p-3 bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              15-Second Mobile QR Flow Simulation
            </span>
            <span className="text-[10px] bg-sky-200 text-sky-800 font-bold px-1.5 py-0.5 rounded">
              Live Demo
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            اختبر تجربة الفني أو الممرض عند مسح ملصق الجهاز بالهاتف: يتم تحميل بيانات الجهاز فورياً وفتح نموذج الإبلاغ السريع بضغطة زر واحدة.
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSimulateMobileScan?.(asset);
            }}
            className="w-full py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>محاكاة مسح الهاتف والإبلاغ السريع (15s Fault Report)</span>
          </button>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Physical Tag</span>
          </button>
        </div>
      </div>
    </div>
  );
};
