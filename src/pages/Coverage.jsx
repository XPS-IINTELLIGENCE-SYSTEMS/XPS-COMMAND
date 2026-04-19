import { MapPin, ArrowRight, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";
import GlobalNav from "../components/navigation/GlobalNav";
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
      <GlobalNav />

      <div className="flex flex-col items-center text-center px-6 pt-16 md:pt-28 pb-12">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-none max-w-5xl transition-all duration-500 hover:scale-105" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-gold-slow-shimmer">NATIONWIDE</span>
          <br />
          <span className="text-white">COVERAGE</span>
        </h1>
        <p className="mt-8 text-base md:text-lg text-white/90 max-w-3xl leading-relaxed transition-all duration-500 hover:scale-[1.02]">
          From our flagship HQ in Pompano Beach, Florida to 60+ locations coast-to-coast — each territory backed by AI intelligence, XPS-certified training, and the Epoxy Network contractor marketplace.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-10 md:gap-20 px-6 pb-16">
        {highlights.map((s) => (
          <div key={s.label} className="shimmer-card text-center cursor-default p-5 rounded-xl">
            <div className="text-3xl md:text-5xl font-extrabold metallic-gold shimmer-icon">{s.value}</div>
            <div className="text-xs md:text-sm text-white/70 tracking-widest mt-2 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* HQ Callout */}
      <div className="max-w-5xl mx-auto px-6 pb-8">
        <div className="shimmer-card bg-card border border-primary/30 rounded-2xl p-8 md:p-12 cursor-default flex flex-col items-center text-center">
          <div className="shimmer-icon-container w-24 h-18 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 mb-5">
            <Warehouse className="w-14 h-14 metallic-gold-icon shimmer-icon" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white">XPS Headquarters & Training Center</h3>
          <span className="text-sm metallic-gold font-semibold mt-2">2200 NW 32nd Street, Suite 700 · Pompano Beach, FL 33069</span>
          <p className="text-sm md:text-base text-white/70 leading-relaxed mt-4">
            Our flagship campus houses the XPS Xpress training center, product showroom, R&D lab, and corporate operations — the nerve center for nationwide contractor enablement and AI-powered sales intelligence.
          </p>
        </div>
      </div>

      {/* Regions grid */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-24 flex flex-wrap justify-center gap-6 md:gap-8">
        {regions.map((r) => (
          <div key={r.name} className="shimmer-card bg-card border border-border rounded-2xl p-8 md:p-10 cursor-default flex flex-col items-center text-center w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]">
            <div className="shimmer-icon-container w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 mb-4">
              <MapPin className="w-6 h-6 md:w-7 md:h-7 metallic-gold-icon shimmer-icon" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-white">{r.name}</h3>
            <span className="text-xs md:text-sm metallic-gold font-semibold mt-1">{r.locations} locations</span>
            <p className="text-sm text-white/70 leading-relaxed mt-3">{r.cities}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center pb-20">
        <Link to="/signin" className="inline-flex items-center gap-3 px-8 py-4 rounded-xl metallic-gold-bg text-background text-lg font-bold hover:brightness-110 transition-all duration-300 hover:scale-110">
          Find Your Territory <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
      </div>
    </div>
  );
}