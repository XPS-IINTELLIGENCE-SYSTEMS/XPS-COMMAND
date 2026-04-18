export default function CRMTopNav({ tabs, activeTab, onTabChange }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 h-14">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mr-8">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS" className="w-7 h-7 object-contain"
          />
          <div className="hidden sm:block">
            <span className="text-sm font-extrabold metallic-gold tracking-wider">XPS</span>
            <span className="text-[10px] text-muted-foreground ml-1.5">Smart Lead Management</span>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="w-8" /> {/* Spacer */}
      </div>
    </header>
  );
}