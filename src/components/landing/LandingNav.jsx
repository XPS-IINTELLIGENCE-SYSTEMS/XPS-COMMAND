import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function LandingNav() {
  const [open, setOpen] = useState(false);
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
      <div className="hidden md:flex items-center gap-10 text-lg font-medium text-white">
        <Link to="/" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">Home</Link>
        <Link to="/platform" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">Platform</Link>
        <Link to="/solutions" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">Solutions</Link>
        <Link to="/coverage" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">Coverage</Link>
        <Link to="/about" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">About</Link>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          to="/signin"
          className="hidden md:inline-flex px-5 py-2 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-300"
        >
          Sign In
        </Link>
        <Link
          to="/payment"
          className="hidden md:inline-flex px-6 py-2.5 rounded-full text-base font-semibold text-white transition-all duration-300 hover:scale-105 sign-in-pill"
        >
          Get Started
        </Link>
        <button onClick={() => setOpen(!open)} className="md:hidden ml-1 p-1 text-white/80 hover:text-white">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 md:hidden" style={{ background: 'rgba(10,12,20,0.25)', backdropFilter: 'blur(32px) saturate(1.4)', WebkitBackdropFilter: 'blur(32px) saturate(1.4)', borderBottom: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <div className="flex flex-col px-6 py-4 gap-1">
            <Link to="/payment" onClick={() => setOpen(false)} className="text-base font-semibold text-right py-3 border-b border-white/[0.08] metallic-gold">
              Get Started
            </Link>
            <Link to="/signin" onClick={() => setOpen(false)} className="text-sm font-medium text-right py-3 border-b border-white/[0.08] text-muted-foreground">
              Sign In
            </Link>
            {[{to:"/",label:"Home"},{to:"/platform",label:"Platform"},{to:"/solutions",label:"Solutions"},{to:"/coverage",label:"Coverage"},{to:"/about",label:"About"}].map(link => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-base font-medium text-white/80 hover:text-white py-3 border-b border-white/[0.06] last:border-0 text-right">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}