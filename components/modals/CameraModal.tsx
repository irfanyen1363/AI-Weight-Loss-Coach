import React, { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../../types';
import * as aiService from '../../services/aiService';
import { useI18n } from '../../contexts/I18nContext';

declare const Html5Qrcode: any;

interface CameraModalProps {
  mode: 'aiAnalyzer' | 'barcode';
  onClose: () => void;
  onLog: (entry: Omit<LogEntry, 'id' | 'date'>) => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const CameraModal: React.FC<CameraModalProps> = ({ mode, onClose, onLog }) => {
  const { t, language } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; calories: number } | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let stream: MediaStream;
    if (mode === 'aiAnalyzer') {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
            console.error(err);
            setError(t('cameraModal.cameraError'));
        });
    } else { 
        const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7);
            return { width: qrboxSize, height: qrboxSize };
        };

        const html5QrcodeScanner = new Html5Qrcode("barcode-reader");
        scannerRef.current = html5QrcodeScanner;

        html5QrcodeScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: qrboxFunction },
            async (decodedText: string) => {
                scannerRef.current.stop();
                setIsLoading(true);
                try {
                    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`);
                    if (!response.ok) throw new Error(t('cameraModal.productNotFound'));
                    const data = await response.json();
                    if (data.status === 1 && data.product) {
                        const product = data.product;
                        setScanResult({
                            name: product.product_name || 'Unknown Product',
                            calories: product.nutriments['energy-kcal_100g'] || 0,
                            serving: product.serving_size || '100g'
                        });
                    } else {
                        throw new Error(t('cameraModal.productNotFound'));
                    }
                } catch (e: any) {
                    setError(e.message || t('cameraModal.fetchError'));
                }
                setIsLoading(false);
            },
            (errorMessage: string) => { /* ignore */ }
        ).catch((err: any) => {
            setError(t('cameraModal.scannerError'));
        });
    }

    return () => {
      stream?.getTracks().forEach(track => track.stop());
      if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch((err: any) => console.error("Failed to stop scanner", err));
      }
    };
  }, [mode, t]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsLoading(true);
    setError(null);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
    canvas.toBlob(async (blob) => {
        if (blob) {
            try {
                const base64 = await blobToBase64(blob);
                const analysisResult = await aiService.analyzeFoodImage(base64, blob.type, language);
                if (analysisResult) {
                    setResult(analysisResult);
                } else {
                    setError(t('cameraModal.aiError'));
                }
            } catch (err) {
                setError(t('cameraModal.analysisError'));
            }
        }
        setIsLoading(false);
    }, 'image/jpeg', 0.9);
  };

  const handleLog = () => {
    if (result) {
        onLog({ type: 'food', name: result.name, calories: result.calories });
    } else if (scanResult) {
        onLog({ type: 'food', name: `${scanResult.name} (${scanResult.serving})`, calories: scanResult.calories });
    }
  };
  
  const reset = () => {
    setResult(null);
    setScanResult(null);
    setError(null);
    if (mode === 'barcode' && scannerRef.current && !scannerRef.current.isScanning) {
       useEffect(() => {}, []);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col justify-center items-center z-50 p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-lg shadow-xl p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-3xl text-slate-400 hover:text-slate-100 z-10">&times;</button>
        <h2 className="text-xl font-bold mb-4 text-center">{mode === 'aiAnalyzer' ? t('cameraModal.aiTitle') : t('cameraModal.barcodeTitle')}</h2>
        
        {isLoading && <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center rounded-lg"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div><p className="mt-4 text-white">{t('cameraModal.analyzing')}</p></div>}
        {error && <div className="text-red-400 text-center my-4">{error}</div>}

        {!result && !scanResult ? (
             <div className="w-full aspect-square bg-slate-800 rounded-md overflow-hidden relative">
                {mode === 'aiAnalyzer' ? (
                     <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                ) : (
                    <div id="barcode-reader" className="w-full h-full"></div>
                )}
                 <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
        ) : (
            <div className="text-center p-4">
                <p className="text-lg">{t('cameraModal.detected')}</p>
                <p className="text-2xl font-bold text-emerald-400">{result?.name || scanResult?.name}</p>
                <p className="text-lg mt-2">{t('cameraModal.estimatedCalories')}</p>
                <p className="text-2xl font-bold text-emerald-400">{result?.calories || scanResult?.calories} kcal</p>
                {scanResult?.serving && <p className="text-slate-400 text-sm">{t('cameraModal.perServing', { serving: scanResult.serving })}</p>}
            </div>
        )}
        
        <div className="mt-6 flex flex-col space-y-2">
            {result || scanResult ? (
                <>
                    <button onClick={handleLog} className="w-full p-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">{t('cameraModal.logItem')}</button>
                    <button onClick={reset} className="w-full p-3 bg-slate-700 text-white rounded-md hover:bg-slate-600">{t('cameraModal.scanAgain')}</button>
                </>
            ) : mode === 'aiAnalyzer' && (
                <button onClick={handleCapture} disabled={isLoading} className="w-full p-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-slate-600">{t('cameraModal.captureAndAnalyze')}</button>
            )}
        </div>
      </div>
    </div>
  );
};