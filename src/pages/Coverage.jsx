import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNav from "../components/landing/LandingNav";

const regions = [
  { name: "Southeast", locations: 14, cities: "Miami, Atlanta, Charlotte, Tampa, Orlando, Nashville" },
  { name: "Northeast", locations: 10, cities: "New York, Boston, Philadelphia, Hartford, Newark" },
  { name: "Midwest", locations: 9, cities: "Chicago, Detroit, Columbus, Indianapolis, Milwaukee" },
  { name: "Southwest", locations: 8, cities: "Dallas, Houston, Phoenix, San Antonio, Austin" },
  { name: "West Coast", locations: 11, cities: "Los Angeles, San Francisco, Seattle, Portland, San Diego" },
  { name: "Mountain", locations: 5, cities: "Denver, Salt Lake City, Las Vegas, Albuquerque" },
  { name: "Pacific Northwest", locations: 3, cities: "Seattle, Portland, Boise" },
];

const highlights = [
  { value: "60+", label: "ACTIVE LOCATIONS" },
  { value: "32", label: "STATES COVERED" },
  { value: "200+", label: "XTREME TEAM" },
  { value: "24/7", label: "AI COVERAGE" },
];

export default function Coverage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />

      <div className="flex flex-col items-center text-center px-6 pt-14 md:pt-24 pb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-none max-w-4xl transition-all duration-500 hover:scale-105" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-gold-slow-shimmer">NATIONWIDE</span>
          <br />
          <span className="text-foreground">COVERAGE</span>
        </h1>
        <p className="mt-6 text-sm md:text-base text-foreground max-w-2xl leading-relaxed transition-all duration-500 hover:scale-[1.02]">
          60+ locations across the United States — each backed by AI-powered intelligence, local market expertise, and the XPS quality standard.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 px-6 pb-12">
        {highlights.map((s) => (
          <div key={s.label} className="text-center transition-all duration-500 hover:scale-110 cursor-default">
            <div className="text-2xl md:text-3xl font-bold metallic-gold">{s.value}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Regions grid */}
      <div className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {regions.map((r) => (
          <div key={r.name} className="bg-card border border-border rounded-2xl p-6 transition-all duration-500 hover:scale-105 cursor-default">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 metallic-gold-icon" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{r.name}</h3>
                <span className="text-[10px] metallic-gold font-semibold">{r.locations} locations</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{r.cities}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center pb-20">
        <Link to="/signin" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg metallic-gold-bg text-background font-semibold hover:brightness-110 transition-all duration-300 hover:scale-110">
          Find Your Territory <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}