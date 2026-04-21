import { Link } from "react-router-dom";

const NAV_LINKS = ["Features", "Solutions", "Resources", "Events", "Business", "Pricing"];

export default function AgentZeroNav({ onSignIn }) {
  return (
    <nav className="sticky top-0 z-40 w-full bg-[#f3f3f3]">
      <div className="mx-auto max-w-[1080px] w-full flex items-center justify-between py-3 px-6">
        {/* Logo */}
        <Link to="/agent-zero" className="flex items-center gap-1.5">
          <svg width="22" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
            <path d="M12 6 L12 18 M8 10 L12 6 L16 10" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="text-[17px] font-semibold text-[#1a1a1a] tracking-tight"
            style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
          >
            agent zero
          </span>
        </Link>

        {/* Center links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <button
              key={link}
              className="text-[14px] text-[#666] hover:text-[#1a1a1a] transition-colors"
              style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
            >
              {link}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="px-4 py-[6px] rounded-full bg-[#1a1a1a] text-white text-[13px] font-medium hover:bg-[#333] transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Banner */}
      <div className="w-full bg-[#f3f3f3] border-t border-[#e5e5e5] py-2 text-center">
        <span className="text-[13px] text-[#666]">
          Agent Zero — XPS Intelligence autonomous AI platform
        </span>
        <span className="text-[13px] text-[#666] ml-1">→</span>
      </div>
    </nav>
  );
}