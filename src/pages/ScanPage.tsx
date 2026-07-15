import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ScanLine, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { startScan, getScanStatus, generateReports } from '../services/scanService';
import { validateUrl } from '../lib/urlValidation';
import { useScan } from '../context/ScanContext';
import type { ScanData } from '../types/scan';

type Status = 'idle' | 'scanning' | 'success' | 'error';

export default function ScanPage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [progressLabel, setProgressLabel] = useState('');
  const navigate = useNavigate();
  const { setScanData, setLastScanId } = useScan();

  const isScanning = status === 'scanning';

  const handleStartScan = async () => {
    setError(null);
    setSuccess(null);

    const { valid, normalizedUrl, error: validationError } = validateUrl(url);
    if (!valid || !normalizedUrl) {
      setError(validationError || 'Please enter a valid URL');
      setStatus('error');
      return;
    }

    setUrl(normalizedUrl);
    setStatus('scanning');
    setProgressLabel('Starting scan...');

    try {
      const result = await startScan(normalizedUrl);
      setLastScanId(result.scanId);
      setScanData(null);
      setSuccess('Scan started successfully. Analyzing target...');
      setProgressLabel('Scan running...');

      let finalData = await pollUntilComplete(result.scanId);
      finalData = await ensureReports(result.scanId, finalData);
      setScanData(finalData);

      setProgressLabel('Assessment complete!');
      setSuccess('Scan complete! Redirecting to results...');

      setTimeout(() => navigate('/reports'), 800);
    } catch (err) {
      console.error('[ScanPage] Scan failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to start scan';
      setError(message);
      setStatus('error');
      setProgressLabel('');
    }
  };

  const pollUntilComplete = async (scanId: string) => {
    const maxAttempts = 90;
    const intervalMs = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      setProgressLabel(`Analyzing target... (attempt ${attempt + 1})`);
      const data = await getScanStatus(scanId);

      if (data.status === 'complete') {
        return data;
      }
      if (data.status === 'failed') {
        throw new Error('Scan failed on the server');
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error('Scan timed out. Please try again.');
  };

  const ensureReports = async (scanId: string, data: ScanData): Promise<ScanData> => {
    if (data.executiveReport && data.technicalReport) return data;
    setProgressLabel('Generating AI reports...');
    try {
      const { executiveReport, technicalReport } = await generateReports(scanId);
      data.executiveReport = executiveReport;
      data.technicalReport = technicalReport;
    } catch (reportErr) {
      console.error('[ScanPage] Report generation failed:', reportErr);
    }
    return data;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Threat Intelligence Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-secondary-bg border-b border-border">
        <div className="overflow-hidden">
          <div className="flex items-center justify-center py-2 space-x-2 text-sm animate-pulse">
            <span className="text-muted-text">Threat Level:</span>
            <span className="text-warning font-semibold">Elevated</span>
            <span className="text-border">|</span>
            <span className="text-muted-text">Latest CVEs:</span>
            <span className="text-primary-text font-mono font-semibold">278,421</span>
            <span className="text-border">|</span>
            <span className="text-muted-text">OWASP Coverage:</span>
            <span className="text-success font-semibold">100%</span>
            <span className="text-border">|</span>
            <span className="text-muted-text">Engine:</span>
            <span className="text-success font-semibold">Online</span>
            <span className="text-border">|</span>
            <span className="text-muted-text">AI:</span>
            <span className="text-glow font-semibold">Operational</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary-text mb-4">
              Security Assessment
            </h1>
            <p className="text-secondary-text text-lg md:text-xl max-w-2xl mx-auto">
              Enter a URL to begin your security analysis
            </p>
          </div>

          {/* URL Input */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="glass-card p-2 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (status === 'error') setStatus('idle');
                    if (error) setError(null);
                  }}
                  placeholder="https://example.com"
                  onKeyDown={(e) => e.key === 'Enter' && !isScanning && handleStartScan()}
                  disabled={isScanning}
                  className={`w-full bg-secondary-bg border rounded-lg pl-12 pr-4 py-4 text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-1 transition-all duration-300 disabled:opacity-60 ${
                    error
                      ? 'border-danger focus:border-danger focus:ring-danger/50'
                      : 'border-border focus:border-silver focus:ring-silver/50'
                  }`}
                />
              </div>
              <button
                onClick={handleStartScan}
                disabled={isScanning}
                className="btn-primary px-8 py-4 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <ScanLine className="w-5 h-5" />
                    <span>Start Scan</span>
                  </>
                )}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 glass-card-danger p-4 flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && !error && (
              <div className="mt-4 p-4 rounded-lg border border-success/30 bg-success/10 flex items-start gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <p className="text-success text-sm">{success}</p>
              </div>
            )}

            {/* Progress indicator */}
            {isScanning && (
              <div className="mt-6 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-secondary-text text-sm font-mono">{progressLabel}</span>
                  <Loader2 className="w-4 h-4 text-danger animate-spin" />
                </div>
                <div className="h-2 bg-secondary-bg rounded-full overflow-hidden border border-border">
                  <div className="h-full bg-danger rounded-full animate-pulse-glow" style={{ width: '75%' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
