import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ScanPage from './pages/ScanPage';
import LoadingPage from './pages/LoadingPage';
import ReportsPage from './pages/ReportsPage';
import ExecutiveReportPage from './pages/ExecutiveReportPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/executive-report" element={<ExecutiveReportPage />} />
      </Routes>
    </Router>
  );
}

export default App;
