import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ScanLine } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ScanPage() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleStartScan = () => {
    if (!url.trim()) return;
    navigate('/loading');
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
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleStartScan()}
                  className="w-full bg-secondary-bg border border-border rounded-lg pl-12 pr-4 py-4 text-primary-text placeholder:text-muted-text focus:outline-none focus:border-silver focus:ring-1 focus:ring-silver/50 transition-all duration-300"
                />
              </div>
              <button
                onClick={handleStartScan}
                disabled={!url.trim()}
                className="btn-primary px-8 py-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ScanLine className="w-5 h-5" />
                <span>Start Scan</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
