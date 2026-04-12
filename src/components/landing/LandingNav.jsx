import { Link } from "react-router-dom";

export default function LandingNav() {
  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border/50">
      <Link to="/signin" className="flex items-center gap-3 transition-all duration-300 hover:scale-105">
        <img
          src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
          alt="XPS"
          className="w-8 h-8 object-contain"
        />
        <div>
          <div className="text-sm font-bold metallic-gold tracking-wider">XPS Xpress</div>
          <div className="text-[9px] text-muted-foreground tracking-widest uppercase">Xtreme Polishing Systems</div>
        </div>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm text-foreground">
        <Link to="/" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">Home</Link>
        <Link to="/platform" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">Platform</Link>
        <Link to="/solutions" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">Solutions</Link>
        <Link to="/coverage" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">Coverage</Link>
        <Link to="/about" className="hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-110">About</Link>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/signin" className="text-sm text-foreground hover:text-foreground transition-all duration-300 hover:scale-110">
          Sign In
        </Link>
        <Link
          to="/signin"
          className="px-4 py-2 rounded-lg metallic-gold-bg text-background text-sm font-semibold hover:brightness-110 transition-all duration-300 hover:scale-105"
        >
          Learn More
        </Link>
      </div>
    </nav>
  );
}