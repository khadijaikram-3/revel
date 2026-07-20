import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { startScan } from '../services/scanService';
import { validateUrl } from '../lib/urlValidation';
import { useScan } from '../context/ScanContext';
import { Globe, ScanLine, AlertCircle } from 'lucide-react';

type Status = 'idle' | 'error';

export default function ScanPage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setLastScanId } = useScan();

  const handleStartScan = async () => {
    setError(null);

    const { valid, normalizedUrl, error: validationError } = validateUrl(url);

    if (!valid || !normalizedUrl) {
      setError(validationError || 'Please enter a valid URL');
      setStatus('error');
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Start the scan and get the scanId
      const { scanId } = await startScan(normalizedUrl);
      
      // ✅ Set the scanId in context
      setLastScanId(scanId);
      
      console.log('[ScanPage] Scan started with ID:', scanId);
      
      // ✅ Navigate to loading page
      navigate('/loading');
      
    } catch (err) {
      console.error('[ScanPage] Scan failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to start security scan';
      setError(message);
      setStatus('error');
      setIsLoading(false);
    }
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
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleStartScan()}
                  disabled={isLoading}
                  className={`w-full bg-secondary-bg border rounded-lg pl-12 pr-4 py-4 text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-1 transition-all duration-300 disabled:opacity-60 ${
                    error
                      ? 'border-danger focus:border-danger focus:ring-danger/50'
                      : 'border-border focus:border-silver focus:ring-silver/50'
                  }`}
                />
              </div>
              <button
                onClick={handleStartScan}
                disabled={isLoading}
                className="btn-primary px-8 py-4 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Launching...</span>
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}