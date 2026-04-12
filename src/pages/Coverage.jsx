import { MapPin, ArrowRight, Building } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNav from "../components/landing/LandingNav";
import PageHexGlow from "../components/PageHexGlow";

const regions = [
  { name: "Florida (HQ)", locations: 8, cities: "Pompano Beach (HQ), Miami, Tampa, Orlando, Jacksonville, Fort Lauderdale, Boca Raton, Fort Myers" },
  { name: "Southeast", locations: 12, cities: "Atlanta, Charlotte, Raleigh, Nashville, Birmingham, Charleston, Savannah" },
  { name: "Northeast", locations: 10, cities: "New York, Boston, Philadelphia, Hartford, Newark, Washington D.C." },
  { name: "Midwest", locations: 9, cities: "Chicago, Detroit, Columbus, Indianapolis, Milwaukee, Minneapolis" },
  { name: "Texas & Southwest", locations: 10, cities: "Dallas, Houston, Austin, San Antonio, Phoenix, Tucson, El Paso" },
  { name: "West Coast", locations: 8, cities: "Los Angeles, San Francisco, San Diego, Sacramento, Portland" },
  { name: "Mountain & Pacific NW", locations: 5, cities: "Denver, Salt Lake City, Las Vegas, Seattle, Boise" },
];

const highlights = [
  { value: "60+", label: "ACTIVE LOCATIONS" },
  { value: "35+", label: "STATES COVERED" },
  { value: "200+", label: "XTREME TEAM" },
  { value: "2010", label: "EST. FLORIDA" },
];

export default function Coverage() {
  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative">
      <PageHexGlow />
      <div className="relative z-[1]">
      <LandingNav />

      <div className="flex flex-col items-center text-center px-6 pt-14 md:pt-24 pb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-none max-w-4xl transition-all duration-500 hover:scale-105" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-gold-slow-shimmer">NATIONWIDE</span>
          <br />
          <span className="text-foreground">COVERAGE</span>
        </h1>
        <p className="mt-6 text-sm md:text-base text-foreground max-w-2xl leading-relaxed transition-all duration-500 hover:scale-[1.02]">
          From our flagship HQ in Pompano Beach, Florida to 60+ locations coast-to-coast — each territory backed by AI intelligence, XPS-certified training, and the Epoxy Network contractor marketplace.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 px-6 pb-12">
        {highlights.map((s) => (
          <div key={s.label} className="shimmer-card text-center cursor-default p-3 rounded-xl">
            <div className="text-2xl md:text-3xl font-bold metallic-gold shimmer-icon">{s.value}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* HQ Callout */}
      <div className="max-w-5xl mx-auto px-6 pb-8">
        <div className="shimmer-card bg-card border border-primary/30 rounded-2xl p-6 md:p-8 cursor-default flex flex-col items-center text-center">
          <div className="shimmer-icon-container w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 mb-3">
            <Building className="w-6 h-6 metallic-gold-icon shimmer-icon" />
          </div>
          <h3 className="text-base font-bold text-foreground">XPS Headquarters & Training Center</h3>
          <span className="text-xs metallic-gold font-semibold mt-1">2200 NW 32nd Street, Suite 700 · Pompano Beach, FL 33069</span>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Our flagship campus houses the XPS Xpress training center, product showroom, R&D lab, and corporate operations — the nerve center for nationwide contractor enablement and AI-powered sales intelligence.
          </p>
        </div>
      </div>

      {/* Regions grid */}
      <div className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {regions.map((r) => (
          <div key={r.name} className="shimmer-card bg-card border border-border rounded-2xl p-6 cursor-default flex flex-col items-center text-center">
            <div className="shimmer-icon-container w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 mb-3">
              <MapPin className="w-4 h-4 metallic-gold-icon shimmer-icon" />
            </div>
            <h3 className="text-sm font-bold text-foreground">{r.name}</h3>
            <span className="text-[10px] metallic-gold font-semibold">{r.locations} locations</span>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">{r.cities}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center pb-20">
        <Link to="/signin" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg metallic-gold-bg text-background font-semibold hover:brightness-110 transition-all duration-300 hover:scale-110">
          Find Your Territory <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      </div>
    </div>
  );
}