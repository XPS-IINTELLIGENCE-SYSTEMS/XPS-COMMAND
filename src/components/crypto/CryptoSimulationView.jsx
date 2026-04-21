import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Search, Coins, Rocket, Eye, FileText, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import CryptoResearchPanel from "./CryptoResearchPanel";
import CoinDesignPanel from "./CoinDesignPanel";
import LaunchSimulationPanel from "./LaunchSimulationPanel";
import PatternScanPanel from "./PatternScanPanel";
import DocumentationPanel from "./DocumentationPanel";

const BLOCKCHAINS = [
  { value: 'ethereum_erc20', label: 'Ethereum (ERC-20)' },
  { value: 'solana_spl', label: 'Solana (SPL)' },
  { value: 'base_l2', label: 'Base L2' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'bnb_chain', label: 'BNB Chain' },
  { value: 'avalanche', label: 'Avalanche' },
];

export default function CryptoSimulationView() {
  const [simulations, setSimulations] = useState([]);
  const [activeSim, setActiveSim] = useState(null);
  const [research, setResearch] = useState(null);
  const [patternData, setPatternData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(null);
  const [tab, setTab] = useState('research');

  // Config
  const [coinName, setCoinName] = useState('XPS Coin');
  const [coinTicker, setCoinTicker] = useState('XPSC');
  const [blockchain, setBlockchain] = useState('ethereum_erc20');
  const [supply, setSupply] = useState('100000000');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const sims = await base44.entities.CryptoSimulation.filter({ status: 'active' }, '-created_date', 20).catch(() => []);
    setSimulations(sims);
    if (sims.length > 0 && !activeSim) {
      const latest = sims[0];
      setActiveSim(latest);
      try { setResearch(JSON.parse(latest.market_research || 'null')); } catch {}
    }
    setLoading(false);
  };

  const runAction = async (action) => {
    setRunning(action);
    const params = {
      action,
      coin_name: coinName,
      coin_ticker: coinTicker,
      blockchain,
      total_supply: parseInt(supply) || 100000000,
      simulation_id: activeSim?.id || null,
    };

    const res = await base44.functions.invoke('cryptoResearchAgent', params).catch(e => ({ data: { error: e.message } }));
    const data = res.data;

    if (data.research) setResearch(data.research);
    if (data.patterns) setPatternData(data.patterns);

    // Reload simulations
    await loadData();

    // Switch to relevant tab
    if (action === 'research') setTab('research');
    if (action === 'create_coin') setTab('design');
    if (action === 'simulate_launch') setTab('launch');
    if (action === 'pattern_scan') setTab('patterns');
    if (action === 'full_pipeline') setTab('launch');

    setRunning(null);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl metallic-gold-bg flex items-center justify-center">
            <Coins className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold metallic-gold">Crypto Research & Simulation</h1>
            <p className="text-[11px] text-muted-foreground">Deep market research → Token design → Smart contract → Launch simulation → Pattern detection</p>
          </div>
        </div>

        {/* Config */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
          <Input value={coinName} onChange={e => setCoinName(e.target.value)} placeholder="Coin Name" className="text-xs h-9" />
          <Input value={coinTicker} onChange={e => setCoinTicker(e.target.value)} placeholder="Ticker" className="text-xs h-9" />
          <Select value={blockchain} onValueChange={setBlockchain}>
            <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{BLOCKCHAINS.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={supply} onChange={e => setSupply(e.target.value)} placeholder="Supply" className="text-xs h-9" />
          <Button onClick={() => runAction('full_pipeline')} disabled={!!running} className="metallic-gold-bg text-background text-xs h-9 gap-1.5">
            {running === 'full_pipeline' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Full Pipeline
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { action: 'research', label: 'Deep Research', icon: Search, desc: 'Live crypto market analysis' },
            { action: 'create_coin', label: 'Create Coin', icon: Coins, desc: 'Tokenomics + smart contract' },
            { action: 'simulate_launch', label: 'Launch Sim', icon: Rocket, desc: '30-day price simulation' },
            { action: 'pattern_scan', label: 'Pattern Scan', icon: Eye, desc: 'Detect live patterns' },
          ].map(a => (
            <Button key={a.action} onClick={() => runAction(a.action)} disabled={!!running}
              variant={running === a.action ? 'default' : 'outline'} className="text-[10px] h-8 gap-1.5">
              {running === a.action ? <Loader2 className="w-3 h-3 animate-spin" /> : <a.icon className="w-3 h-3" />}
              {a.label}
            </Button>
          ))}
        </div>

        {running && <div className="text-[10px] text-primary mt-2 animate-pulse">Agent is researching live market data and generating analysis...</div>}
      </div>

      {/* Previous Simulations */}
      {simulations.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {simulations.map(sim => (
            <button key={sim.id} onClick={() => { setActiveSim(sim); try { setResearch(JSON.parse(sim.market_research || 'null')); } catch {} }}
              className={`flex-shrink-0 glass-card rounded-lg px-3 py-2 text-[9px] transition-all ${activeSim?.id === sim.id ? 'ring-1 ring-primary' : ''}`}>
              <div className="font-bold text-foreground">{sim.coin_ticker || sim.simulation_name}</div>
              <div className="text-muted-foreground">{sim.phase}</div>
            </button>
          ))}
        </div>
      )}

      {/* Tabbed Content */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent gap-1 h-auto flex-wrap">
          <TabsTrigger value="research" className="text-xs gap-1.5"><Search className="w-3 h-3" />Research</TabsTrigger>
          <TabsTrigger value="design" className="text-xs gap-1.5"><Coins className="w-3 h-3" />Coin Design</TabsTrigger>
          <TabsTrigger value="launch" className="text-xs gap-1.5"><Rocket className="w-3 h-3" />Launch Sim</TabsTrigger>
          <TabsTrigger value="patterns" className="text-xs gap-1.5"><Eye className="w-3 h-3" />Patterns</TabsTrigger>
          <TabsTrigger value="docs" className="text-xs gap-1.5"><FileText className="w-3 h-3" />Documentation</TabsTrigger>
        </TabsList>
        <TabsContent value="research"><CryptoResearchPanel research={research} /></TabsContent>
        <TabsContent value="design"><CoinDesignPanel simulation={activeSim} /></TabsContent>
        <TabsContent value="launch"><LaunchSimulationPanel simulation={activeSim} /></TabsContent>
        <TabsContent value="patterns"><PatternScanPanel patternData={patternData} /></TabsContent>
        <TabsContent value="docs"><DocumentationPanel simulation={activeSim} /></TabsContent>
      </Tabs>
    </div>
  );
}