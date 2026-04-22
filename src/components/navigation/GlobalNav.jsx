import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, ArrowLeft, UserCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PUBLIC_LINKS = [
  { to: "/", label: "Home" },
  { to: "/platform", label: "Platform" },
  { to: "/solutions", label: "Solutions" },
  { to: "/coverage", label: "Coverage" },
  { to: "/about", label: "About" },
  { to: "/payment", label: "Pricing" },
];

const AUTH_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/master", label: "⚡ Master Ops Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/lead-engine", label: "Lead Engine" },
  { to: "/data-bank", label: "Data Bank" },
  { to: "/field-tech", label: "Field Tech" },
  { to: "/client-portal", label: "Client Portal" },
  { to: "/admin-control", label: "Admin Control" },
  { to: "/account-settings", label: "Account Settings" },
];

export default function GlobalNav() {
  const [open, setOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthed);
  }, []);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const isHome = location.pathname === "/" || location.pathname === "/dashboard";

  return (
    <nav className="sticky top-0 z-50 flex items-center h-14 px-4 md:px-6 border-b"
      style={{
        background: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Left: Back + Home */}
      <div className="flex items-center gap-1">
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <Link
          to={isAuthed ? "/dashboard" : "/"}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          title="Home"
        >
          <Home className="w-5 h-5" />
        </Link>
      </div>

      {/* Center: Brand */}
      <Link to={isAuthed ? "/dashboard" : "/"} className="flex items-center gap-2 mx-auto">
        <img
          src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
          alt="XPS"
          className="w-7 h-7 object-contain"
        />
        <span className="text-[15px] font-extrabold metallic-gold tracking-wider hidden sm:inline">XPS INTELLIGENCE</span>
      </Link>

      {/* Right: User avatar + Hamburger */}
      <div className="flex items-center gap-1">
        {isAuthed && (
          <Link
            to="/account-settings"
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            title="Account Settings"
          >
            <UserCircle className="w-6 h-6" />
          </Link>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Dropdown menu */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full right-0 left-0 md:left-auto md:right-4 md:w-72 z-50 py-2"
            style={{
              background: "rgba(8, 10, 18, 0.97)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
            }}
          >
            {/* Auth actions */}
            <div className="px-4 pb-2 mb-2 border-b border-white/[0.08]">
              {isAuthed ? (
                <Link to="/dashboard" className="flex items-center gap-2 py-2.5 text-[15px] font-bold metallic-gold">
                  <Home className="w-4 h-4" /> Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/payment" className="block py-2.5 text-[15px] font-bold metallic-gold">
                    Get Started
                  </Link>
                  <Link to="/signin" className="block py-2 text-[14px] font-medium text-white/80 hover:text-white">
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Links — show app links for authed users, public links for visitors */}
            {isAuthed ? (
              <div className="px-4">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 px-1">App</div>
                {AUTH_LINKS.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block py-2 px-1 text-[14px] font-medium transition-colors rounded-md ${
                      location.pathname === link.to
                        ? "text-white bg-white/5"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 px-1">Navigation</div>
                {PUBLIC_LINKS.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block py-2 px-1 text-[14px] font-medium transition-colors rounded-md ${
                      location.pathname === link.to
                        ? "text-white bg-white/5"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Sign out */}
            {isAuthed && (
              <div className="px-4 mt-2 pt-2 border-t border-white/[0.08]">
                <button
                  onClick={() => base44.auth.logout()}
                  className="w-full text-left py-2 px-1 text-[14px] font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}