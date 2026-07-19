import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ScanLine } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { startScan } from '../services/scanService';
import { useScan } from '../context/ScanContext';

export default function ScanPage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setScanData, setLastScanId } = useScan();

  const handleStartScan = async () => {
    if (!url.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const result = await startScan(url.trim());
      setLastScanId(result.scanId);
      setScanData(null);
      navigate('/loading');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Threat Intelligence Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-secondary-bg border-b border-border">
        <div className="overflow-hidden">
          <div className="flex items-center justify-center py-2.5 space-x-3 text-sm animate-pulse">
            <span className="text-muted-text">Threat Level:</span>
            <span className="text-warning font-semibold tracking-wide">Elevated</span>
            <span className="text-border">|</span>
            <span className="text-muted-text">Latest CVEs:</span>
            <span className="text-primary-text font-mono font-semibold">278,421</span>
            <span className="text-border">|</span>
            <span className="text-muted-text">OWASP Coverage:</span>
            <span className="text-success font-semibold tracking-wide">100%</span>
            <span className="text-border">|</span>
            <span className="text-muted-text">Engine:</span>
            <span className="text-success font-semibold tracking-wide">Online</span>
            <span className="text-border">|</span>
            <span className="text-muted-text">AI:</span>
            <span className="text-glow font-semibold tracking-wide">Operational</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-36 pb-24 md:pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-danger/10 border border-danger/30">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <span className="text-danger text-xs font-mono font-semibold tracking-widest uppercase">Ready to Scan</span>
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-primary-text mb-5 leading-[1.1] tracking-tight">
              Security Assessment
            </h1>
            <p className="text-secondary-text text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Enter a URL to begin your security analysis
            </p>
          </div>

          {/* URL Input */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="glass-card p-2.5 flex flex-col sm:flex-row gap-3 rounded-xl">
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleStartScan()}
                  className="w-full bg-secondary-bg border border-border rounded-lg pl-12 pr-4 py-4 text-primary-text placeholder:text-muted-text focus:outline-none focus:border-silver focus:ring-2 focus:ring-silver/30 transition-all duration-300"
                />
              </div>
              <button
                onClick={handleStartScan}
                disabled={!url.trim() || loading}
                className="btn-primary px-8 py-4 h-[58px] flex items-center justify-center space-x-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-danger/30 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ScanLine className="w-5 h-5" />
                <span>{loading ? 'Starting...' : 'Start Scan'}</span>
              </button>
            </div>

            {error && (
              <div className="mt-5 glass-card-danger p-4 md:p-5 text-center rounded-xl flex items-center justify-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-danger shrink-0" />
                <p className="text-danger text-sm leading-relaxed">{error}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}