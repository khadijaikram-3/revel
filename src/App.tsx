import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import LandingPage from './pages/LandingPage';
import ScanPage from './pages/ScanPage';
import LoadingPage from './pages/LoadingPage';
import ReportsPage from './pages/ReportsPage';
import ExecutiveReportPage from './pages/ExecutiveReportPage';
import TechnicalReportPage from './pages/TechnicalReportPage';
import ScrollToTop from './components/ScrollToTop';
import { ScanProvider } from './context/ScanContext';

function App() {
  return (
    <Router>
      <SplashScreen />
      <ScanProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/executive-report" element={<ExecutiveReportPage />} />
          <Route path="/technical-report" element={<TechnicalReportPage />} />
        </Routes>
      </ScanProvider>
    </Router>
  );
}

export default App;