import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/platform", label: "Platform" },
  { to: "/solutions", label: "Solutions" },
  { to: "/coverage", label: "Coverage" },
  { to: "/about", label: "About" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthed);
  }, []);

  return (
    <nav className="relative flex items-center justify-between px-4 md:px-12 py-3 md:py-4 border-b border-border/50">
      <Link to="/" className="flex items-center gap-2 md:gap-4 transition-all duration-300 hover:scale-105 min-w-0">
        <img
          src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
          alt="XPS"
          className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
        />
        <div>
          <div className="text-sm md:text-lg font-bold metallic-gold tracking-wider leading-tight">XPS Intelligence</div>
          <div className="hidden md:block text-xs text-muted-foreground tracking-widest uppercase">Xtreme Polishing Systems</div>
        </div>
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-10 text-lg font-medium text-white">
        {NAV_LINKS.map(link => (
          <Link key={link.to} to={link.to} className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">
            {link.label}
          </Link>
        ))}
      </div>

      {/* Hamburger only — no separate dashboard button */}
      <button onClick={() => setOpen(!open)} className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Dropdown menu — works on both mobile and desktop */}
      {open && (
        <div className="absolute top-full right-0 left-0 md:left-auto md:right-4 md:w-64 z-50" style={{ background: 'rgba(10,12,20,0.92)', backdropFilter: 'blur(32px) saturate(1.4)', WebkitBackdropFilter: 'blur(32px) saturate(1.4)', borderBottom: '1px solid rgba(255,255,255,0.1)', borderRadius: '0 0 12px 12px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <div className="flex flex-col px-6 py-4 gap-1">
            {/* Auth actions */}
            {isAuthed ? (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="text-base font-semibold text-right py-3 border-b border-white/[0.08] metallic-gold">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/payment" onClick={() => setOpen(false)} className="text-base font-semibold text-right py-3 border-b border-white/[0.08] metallic-gold">
                  Sign Up
                </Link>
                <Link to="/signin" onClick={() => setOpen(false)} className="text-sm font-medium text-right py-3 border-b border-white/[0.08] text-white/90 hover:text-white">
                  Sign In
                </Link>
              </>
            )}

            {/* Nav links (mobile) */}
            <div className="md:hidden">
              {NAV_LINKS.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-base font-medium text-white/80 hover:text-white py-3 border-b border-white/[0.06] last:border-0 text-right block">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}