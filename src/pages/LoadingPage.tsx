import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollScanStatus, generateReports } from '../services/scanService';
import { useScan } from '../context/ScanContext';

// Premium terminal messages
const terminalLines = [
  "[INIT] Initializing security assessment engine...",
  "[SSL] Fetching certificate chain and validating TLS configuration...",
  "[SSL] Certificate validation complete — cipher suite analysis...",
  "[HEADERS] Inspecting HTTP security headers...",
  "[HEADERS] Content-Security-Policy analysis in progress...",
  "[HEADERS] HSTS, X-Frame-Options, and XSS protection evaluated...",
  "[FINGERPRINT] Analyzing server fingerprint and technology stack...",
  "[FINGERPRINT] Server identification complete",
  "[DNS] Resolving A, AAAA, and MX records...",
  "[DNS] DNS configuration analysis complete",
  "[CSP] Deep scanning Content-Security-Policy directives...",
  "[CSP] CSP policy evaluation complete",
  "[ADMIN] Scanning for exposed administrative interfaces...",
  "[ADMIN] Admin panel discovery complete",
  "[PORTS] Querying InternetDB for open ports and services...",
  "[PORTS] Port scan completed — analyzing service exposure...",
  "[VT] Checking URL reputation against VirusTotal database...",
  "[VT] Malware and phishing detection complete",
  "[XSS] Testing for reflected and stored XSS vulnerabilities...",
  "[XSS] Cross-site scripting analysis complete",
  "[SQL] Testing for SQL injection vulnerabilities...",
  "[SQL] SQL injection testing complete",
  "[TRAVERSAL] Testing directory traversal vulnerabilities...",
  "[TRAVERSAL] Directory traversal analysis complete",
  "[AI] Generating executive summary report...",
  "[AI] Generating technical assessment report...",
  "[DONE]  Security assessment completed successfully!"
];

// Terminal entry with timestamp
type TerminalEntry = {
  text: string;
  time: string;
  isComplete: boolean;
};

export default function LoadingPage() {
  const [displayedStages, setDisplayedStages] = useState<TerminalEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const navigate = useNavigate();
  const { lastScanId, setScanData } = useScan();
  const hasStarted = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new lines appear
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedStages]);

  // Helper to format timestamp
  const getTimestamp = () => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Main scan effect - FIXED
  useEffect(() => {
    // ✅ Don't start if already started
    if (hasStarted.current) return;

    // ✅ Wait for scanId to be available
    if (!lastScanId) {
      console.log('[LoadingPage] Waiting for scanId...');
      return;
    }

    // ✅ Now we have scanId, start the process
    hasStarted.current = true;
    console.log('[LoadingPage] Starting polling with scanId:', lastScanId);

    (async () => {
      try {
        console.log('[LoadingPage] Starting scan with ID:', lastScanId);
        
        const finalData = await pollScanStatus(
          lastScanId,
          (data) => {
            console.log('[LoadingPage] Status update:', data.status);
            // Progress based on status
            if (data.status === 'scanning') {
              setProgress(20);
            } else if (data.status === 'analyzing') {
              setProgress(70);
            } else if (data.status === 'complete') {
              setProgress(100);
            }
          },
          2000,
          180000
        );

        console.log('[LoadingPage] Polling complete. Final status:', finalData.status);

        // Ensure reports are generated
        if (!finalData.executiveReport) {
          console.log('[LoadingPage] No reports found. Generating...');
          try {
            const { executiveReport, technicalReport } = await generateReports(lastScanId);
            finalData.executiveReport = executiveReport;
            finalData.technicalReport = technicalReport;
            console.log('[LoadingPage] Reports generated successfully');
          } catch (reportErr) {
            console.error('[LoadingPage] Report generation failed:', reportErr);
          }
        }

        setScanData(finalData);

        // Clear the animation interval if it's running
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Complete the terminal animation with remaining lines
        const remainingLines = terminalLines.slice(displayedStages.length);
        for (const line of remainingLines) {
          const isLast = line === terminalLines[terminalLines.length - 1];
          setDisplayedStages((prev) => [
            ...prev,
            {
              text: line,
              time: getTimestamp(),
              isComplete: isLast
            }
          ]);
          setProgress((prev) => Math.min(prev + (100 / terminalLines.length), 100));
          await new Promise((r) => setTimeout(r, 300));
        }

        setIsComplete(true);
        setProgress(100);
        setTimeRemaining(0);

        // Show completion message
        console.log('[LoadingPage] ✅ Assessment completed!');
        setShowDashboard(true);

        // Navigate to reports after showing dashboard message
        setTimeout(() => {
          navigate('/reports', { 
            state: { 
              scanId: lastScanId, 
              reportData: finalData 
            } 
          });
        }, 1800);
        
      } catch (err) {
        console.error('[LoadingPage] Error:', err);
        setError(err instanceof Error ? err.message : 'Scan failed');
        setTimeout(() => navigate('/scan'), 3000);
      }
    })();
  }, [lastScanId, navigate, setScanData]); // ✅ Only depends on lastScanId

  // Terminal animation effect
  useEffect(() => {
    if (error || isComplete) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (displayedStages.length >= terminalLines.length) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setDisplayedStages(prev => {
        if (prev.length >= terminalLines.length) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return prev;
        }

        const nextIndex = prev.length;
        const isLast = nextIndex === terminalLines.length - 1;
        const newEntry: TerminalEntry = {
          text: terminalLines[nextIndex],
          time: getTimestamp(),
          isComplete: isLast
        };

        setProgress((prevProgress) => {
          const newProgress = ((nextIndex + 1) / terminalLines.length) * 100;
          return Math.min(newProgress, 85);
        });

        return [...prev, newEntry];
      });
    }, 600);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [error, isComplete, displayedStages.length]);

  // Intelligent time remaining
  useEffect(() => {
    if (isComplete || error) {
      setTimeRemaining(0);
      return;
    }
    
    if (timeRemaining <= 3) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 3) return 3;
        if (prev <= 10) return prev - 0.5;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isComplete, error]);

  // Get color based on stage content
  const getStageColor = (text: string) => {
    if (text.includes('DONE') || text.includes('✅')) return 'text-success';
    if (text.includes('ERROR')) return 'text-danger';
    if (text.includes('Generating') || text.includes('[AI]')) return 'text-purple-400';
    if (text.includes('Testing') || text.includes('[XSS]') || text.includes('[SQL]')) return 'text-cyan-400';
    if (text.includes('Checking') || text.includes('[INIT]')) return 'text-white';
    if (text.includes('Complete') || text.includes('complete')) return 'text-success';
    return 'text-terminal-green';
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        {error && (
          <div className="glass-card-danger p-6 mb-6 text-center">
            <p className="text-danger font-medium">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img
              src="/revel_logo.jpeg"
              alt="Revel"
              className="h-10 w-auto rounded-sm transition-all duration-300"
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLImageElement).style.boxShadow =
                  '0 0 15px rgba(192, 192, 192, 0.3)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLImageElement).style.boxShadow = 'none')
              }
            />
            <span className="font-orbitron font-bold text-2xl tracking-wide">
              <span className="text-danger">R</span>
              <span className="text-primary-text">evel</span>
            </span>
          </div>
          <span className="badge-enterprise">Enterprise Scan</span>
        </div>

        {/* Terminal Container */}
        <div className="terminal-container mb-8 max-h-[400px] overflow-y-auto">
          <div className="flex items-center mb-4 pb-3 border-b border-terminal-green/20 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-danger" />
              <div className="w-3 h-3 rounded-full bg-warning" />
              <div className="w-3 h-3 rounded-full bg-success" />
            </div>
            <span className="ml-4 text-terminal-green/70 text-sm font-mono">
              REVEL CORE ENGINE v1.0
            </span>
            {isComplete && (
              <span className="ml-auto text-success text-xs font-mono animate-pulse">
                ● ONLINE
              </span>
            )}
          </div>

          <div className="space-y-2 min-h-[280px] font-mono text-sm">
            {displayedStages.map((entry, index) => (
              <div
                key={index}
                className="flex items-start space-x-2 terminal-line"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start">
                  <span className="text-terminal-green/40 mr-3 whitespace-nowrap">
                    [{entry.time}]
                  </span>
                  <span className={getStageColor(entry.text)}>
                    {entry.text}
                    {entry.isComplete && ' ✓'}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Completion message */}
            {showDashboard && (
              <div className="flex items-center space-x-2 text-success animate-pulse">
                <span className="text-terminal-green/40 mr-3">
                  [{getTimestamp()}]
                </span>
                <span> Assessment completed. Launching dashboard...</span>
              </div>
            )}
            
            {/* Terminal cursor */}
            {displayedStages.length < terminalLines.length && !error && !isComplete && (
              <div className="flex items-center">
                <span className="text-terminal-green/60 mr-2">&gt;</span>
                <span className="text-terminal-green animate-blink">█</span>
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary-text text-sm font-mono">Scan Progress</span>
            <span className="text-primary-text text-sm font-mono">
              {isComplete ? '100%' : `${Math.round(progress)}%`}
            </span>
          </div>
          <div className="h-2 bg-secondary-bg rounded-full overflow-hidden border border-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isComplete ? 'bg-success' : 'bg-danger'
              }`}
              style={{ width: `${isComplete ? 100 : progress}%` }}
            />
          </div>
        </div>

        {/* Time Remaining */}
        <div className="text-center">
          <span className="text-muted-text text-sm">Estimated time: </span>
          <span className="text-silver font-mono text-sm">
            {isComplete ? (
              '✅ Complete'
            ) : error ? (
              '❌ Failed'
            ) : (
              `~${Math.ceil(timeRemaining)}s remaining`
            )}
          </span>
        </div>
      </div>
    </div>
  );
}