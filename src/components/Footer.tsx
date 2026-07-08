import { ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 bg-secondary-bg border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldAlert className="w-6 h-6 text-silver" />
              <span className="font-heading font-bold text-xl text-primary-text">Revel</span>
            </div>
            <p className="text-secondary-text text-sm">Reveal the Risk. Close the Hole.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="/#about" className="text-secondary-text hover:text-silver transition-colors">
              About
            </a>
            <a href="/#methodology" className="text-secondary-text hover:text-silver transition-colors">
              Methodology
            </a>
            <a href="#" className="text-secondary-text hover:text-silver transition-colors">
              Documentation
            </a>
            <a href="/#privacy" className="text-secondary-text hover:text-silver transition-colors">
              Privacy
            </a>
            <a href="#" className="text-secondary-text hover:text-silver transition-colors">
              Contact
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-muted-text text-sm">
            &copy; 2026 Revel. All rights reserved.
          </p>
          <p className="text-muted-text text-xs">
            Developed for DYLP Vibe Coding Hackathon 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
