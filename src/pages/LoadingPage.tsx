import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollScanStatus, generateReports } from '../services/scanService';
import { useScan } from '../context/ScanContext';

const scanStages = [
  'Initializing Scan Engine...',
  'Resolving DNS Records...',
  'Checking SSL/TLS Configuration...',
  'Analyzing Security Headers...',
  'Scanning Open Ports...',
  'Testing for Vulnerabilities...',
  'AI Processing Findings...',
  'Generating Reports...',
  'Assessment Complete',
];

const stageStatusMap: Record<string, number> = {
  pending: 0,
  scanning: 5,
  analyzing: 7,
  complete: 9,
  failed: 0,
};

export default function LoadingPage() {
  const [currentStage, setCurrentStage] = useState(0);
  const [displayedStages, setDisplayedStages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { lastScanId, setScanData } = useScan();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    if (!lastScanId) {
      setError('No scan in progress. Redirecting...');
      setTimeout(() => navigate('/scan'), 2000);
      return;
    }

    (async () => {
      try {
        console.log('[LoadingPage] Starting scan with ID:', lastScanId);
        
        const finalData = await pollScanStatus(
          lastScanId,
          (data) => {
            const stageIdx = stageStatusMap[data.status] ?? 0;
            setCurrentStage(stageIdx);
            console.log('[LoadingPage] Status update:', data.status, 'Stage:', stageIdx);
          },
          2000,
           180000
        );

        console.log('[LoadingPage] Polling complete. Final status:', finalData.status);

        // ✅ FIX: Ensure reports are generated
        if (!finalData.executiveReport) {
          console.log('[LoadingPage] No reports found. Generating...');
          try {
            const { executiveReport, technicalReport } = await generateReports(lastScanId);
            finalData.executiveReport = executiveReport;
            finalData.technicalReport = technicalReport;
            console.log('[LoadingPage] Reports generated successfully');
          } catch (reportErr) {
            console.error('[LoadingPage] Report generation failed:', reportErr);
            // Continue anyway — we have fallback data
          }
        }

        setScanData(finalData);

        // Complete the terminal animation
        for (let i = displayedStagesRef.current.length; i < scanStages.length; i++) {
          setDisplayedStages((prev) => [...prev, scanStages[i]]);
          setProgress(((i + 1) / scanStages.length) * 100);
          await new Promise((r) => setTimeout(r, 300));
        }

        console.log('[LoadingPage] Navigation to /reports in 1 second...');
        // Wait a moment, then navigate with data
        setTimeout(() => {
          navigate('/reports', { 
            state: { 
              scanId: lastScanId, 
              reportData: finalData 
            } 
          });
        }, 1000);
        
      } catch (err) {
        console.error('[LoadingPage] Error:', err);
        setError(err instanceof Error ? err.message : 'Scan failed');
        setTimeout(() => navigate('/scan'), 3000);
      }
    })();
  }, [lastScanId, navigate, setScanData]);

  const displayedStagesRef = useRef<string[]>([]);
  useEffect(() => {
    displayedStagesRef.current = displayedStages;
  }, [displayedStages]);

  useEffect(() => {
    if (currentStage <= 0) return;

    const stageCount = Math.min(currentStage, scanStages.length);
    const newStages = scanStages.slice(0, stageCount);
    setDisplayedStages(newStages);
    setProgress((stageCount / scanStages.length) * 100);
  }, [currentStage]);

  useEffect(() => {
    if (timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

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
        <div className="terminal-container mb-8">
          <div className="flex items-center mb-4 pb-3 border-b border-terminal-green/20">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-danger" />
              <div className="w-3 h-3 rounded-full bg-warning" />
              <div className="w-3 h-3 rounded-full bg-success" />
            </div>
            <span className="ml-4 text-terminal-green/70 text-sm">revel-scan-engine</span>
          </div>

          <div className="space-y-2 min-h-[280px]">
            {displayedStages.map((stage, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 terminal-line"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-terminal-green/60 mr-2">&gt;</span>
                <span
                  className={
                    index === displayedStages.length - 1 && index === scanStages.length - 1
                      ? 'text-success font-semibold'
                      : 'text-terminal-green'
                  }
                >
                  {stage}
                  {index === displayedStages.length - 1 &&
                    index === scanStages.length - 1 &&
                    ' \u2713'}
                </span>
              </div>
            ))}
            {currentStage < scanStages.length && !error && (
              <div className="flex items-center">
                <span className="text-terminal-green/60 mr-2">&gt;</span>
                <div className="w-2 h-5 bg-terminal-green animate-blink" />
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary-text text-sm font-mono">Progress</span>
            <span className="text-primary-text text-sm font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-secondary-bg rounded-full overflow-hidden border border-border">
            <div
              className="h-full bg-danger rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Time Remaining */}
        <div className="text-center">
          <span className="text-muted-text text-sm">Estimated time: </span>
          <span className="text-silver font-mono text-sm">~{timeRemaining}s remaining</span>
        </div>
      </div>
    </div>
  );
}