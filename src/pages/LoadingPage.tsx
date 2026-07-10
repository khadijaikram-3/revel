import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function LoadingPage() {
  const [currentStage, setCurrentStage] = useState(0);
  const [displayedStages, setDisplayedStages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const navigate = useNavigate();

  useEffect(() => {
    const stageInterval = setInterval(() => {
      if (currentStage < scanStages.length) {
        const stageText = scanStages[currentStage];
        setDisplayedStages((prev) => [...prev, stageText]);
        setProgress(((currentStage + 1) / scanStages.length) * 100);

        if (currentStage === scanStages.length - 1) {
          setTimeout(() => {
            navigate('/reports');
          }, 1500);
        } else {
          setCurrentStage((prev) => prev + 1);
        }
      }
    }, 2500);

    return () => clearInterval(stageInterval);
  }, [currentStage, navigate]);

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
            {currentStage < scanStages.length && (
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
