import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ScanPage from './pages/ScanPage';
import LoadingPage from './pages/LoadingPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
