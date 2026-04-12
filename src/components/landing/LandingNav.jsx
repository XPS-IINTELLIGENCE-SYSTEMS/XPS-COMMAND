import { Link } from "react-router-dom";

export default function LandingNav() {
  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border/50">
      <Link to="/signin" className="flex items-center gap-4 transition-all duration-300 hover:scale-105">
        <img
          src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
          alt="XPS"
          className="w-12 h-12 object-contain"
        />
        <div>
          <div className="text-base font-bold metallic-gold tracking-wider">XPS Xpress</div>
          <div className="text-[10px] text-muted-foreground tracking-widest uppercase">Xtreme Polishing Systems</div>
        </div>
      </Link>
      <div className="hidden md:flex items-center gap-10 text-base font-medium text-white">
        <Link to="/" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">Home</Link>
        <Link to="/platform" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">Platform</Link>
        <Link to="/solutions" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">Solutions</Link>
        <Link to="/coverage" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">Coverage</Link>
        <Link to="/about" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">About</Link>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <Link to="/signin" className="text-xs md:text-base font-medium text-white hover:text-white transition-all duration-300 hover:scale-110">
          Sign In
        </Link>
        <Link
          to="/signin"
          className="px-2.5 py-1 md:px-4 md:py-2 rounded md:rounded-lg metallic-gold-bg text-background text-[11px] md:text-sm font-semibold md:font-bold hover:brightness-110 transition-all duration-300 hover:scale-105"
        >
          Learn More
        </Link>
      </div>
    </nav>
  );
}