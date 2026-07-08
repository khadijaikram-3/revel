import { ShieldAlert, ScanLine } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { name: 'About', href: '/#about' },
  { name: 'Methodology', href: '/#methodology' },
  { name: 'Reports', href: '/#reports' },
  { name: 'Privacy', href: '/#privacy' },
];

export default function Navbar() {
  const location = useLocation();
  const isScanPage = location.pathname === '/scan';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-[10px] border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ShieldAlert className="w-8 h-8 text-danger" />
              <span className="font-heading font-bold text-xl text-primary-text">Revel</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-secondary-text hover:text-primary-text transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex items-center">
            <Link to={isScanPage ? '/' : '/scan'}>
              <button className="btn-primary flex items-center space-x-2">
                <ScanLine className="w-4 h-4" />
                <span>{isScanPage ? 'Home' : 'Scan Website'}</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
