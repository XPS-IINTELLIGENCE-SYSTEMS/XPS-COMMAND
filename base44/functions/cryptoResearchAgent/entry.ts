import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * CRYPTO RESEARCH & SIMULATION AGENT
 * Actions:
 *   research        — Deep live crypto market research
 *   create_coin     — Design tokenomics + generate smart contract code
 *   simulate_launch — Simulate deployment, DEX listing, price action
 *   pattern_scan    — Identify market patterns, correlations, signals
 *   full_pipeline   — Run all phases end-to-end
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let body = {};
  try { body = await req.json(); } catch {}
  const action = body.action || 'research';
  const simId = body.simulation_id || null;
  const coinName = body.coin_name || 'XPS Coin';
  const coinTicker = body.coin_ticker || 'XPSC';
  const blockchain = body.blockchain || 'ethereum_erc20';
  const supply = body.total_supply || 100000000;
  const ts = new Date().toISOString();

  // ─── PHASE 1: DEEP CRYPTO RESEARCH ───
  if (action === 'research' || action === 'full_pipeline') {
    const research = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a world-class crypto analyst with LIVE market access. Time: ${ts}

DO EXTENSIVE RESEARCH RIGHT NOW on the current crypto market. Look up REAL LIVE data:

1. TOP 20 CRYPTO PRICES — exact current prices for BTC, ETH, SOL, BNB, XRP, ADA, AVAX, DOT, MATIC, LINK, UNI, AAVE, ARB, OP, DOGE, SHIB, PEPE, WIF, RENDER, FET
2. MARKET CONDITIONS — total crypto market cap, BTC dominance, fear/greed index, funding rates, liquidation data
3. TRENDING NARRATIVES — what sectors are hot right now (AI, RWA, DePIN, memes, L2s, restaking, etc.)
4. RECENT NEWS — last 48h breaking crypto news, regulatory updates, major launches
5. ON-CHAIN SIGNALS — whale movements, exchange inflows/outflows, stablecoin flows
6. PATTERN DETECTION — identify technical patterns across top coins (head & shoulders, double bottoms, breakouts, wedges)
7. CORRELATION MATRIX — how are different crypto sectors correlating with each other and with TradFi right now
8. DEX ACTIVITY — what's trending on Uniswap, Raydium, Jupiter (hot new tokens, volume spikes)
9. UPCOMING CATALYSTS — token unlocks, ETF decisions, protocol upgrades, airdrops in next 30 days
10. SMART MONEY FLOWS — where are VCs and institutions deploying capital right now

Be extremely specific with REAL numbers, REAL prices, REAL headlines.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          top_prices: { type: 'array', items: { type: 'object', properties: {
            ticker: { type: 'string' }, price: { type: 'string' }, change_24h: { type: 'string' }, market_cap: { type: 'string' },
          }}},
          market_conditions: { type: 'object', properties: {
            total_market_cap: { type: 'string' }, btc_dominance: { type: 'string' },
            fear_greed: { type: 'string' }, sentiment: { type: 'string' },
            funding_rates: { type: 'string' }, liquidations_24h: { type: 'string' },
          }},
          trending_narratives: { type: 'array', items: { type: 'object', properties: {
            narrative: { type: 'string' }, momentum: { type: 'string' }, top_tokens: { type: 'string' }, outlook: { type: 'string' },
          }}},
          breaking_news: { type: 'array', items: { type: 'object', properties: {
            headline: { type: 'string' }, impact: { type: 'string' }, affected_tokens: { type: 'string' },
          }}},
          patterns_detected: { type: 'array', items: { type: 'object', properties: {
            asset: { type: 'string' }, pattern: { type: 'string' }, timeframe: { type: 'string' },
            direction: { type: 'string' }, confidence: { type: 'number' }, target_price: { type: 'string' },
          }}},
          correlations: { type: 'array', items: { type: 'object', properties: {
            pair: { type: 'string' }, correlation: { type: 'number' }, note: { type: 'string' },
          }}},
          dex_trending: { type: 'array', items: { type: 'object', properties: {
            token: { type: 'string' }, dex: { type: 'string' }, volume_24h: { type: 'string' }, change: { type: 'string' },
          }}},
          upcoming_catalysts: { type: 'array', items: { type: 'object', properties: {
            event: { type: 'string' }, date: { type: 'string' }, impact: { type: 'string' }, tokens: { type: 'string' },
          }}},
          smart_money: { type: 'array', items: { type: 'object', properties: {
            entity: { type: 'string' }, action: { type: 'string' }, sector: { type: 'string' }, amount: { type: 'string' },
          }}},
          optimal_launch_window: { type: 'string' },
          recommended_narrative: { type: 'string' },
          risk_level: { type: 'string' },
          summary: { type: 'string' },
        }
      }
    });

    const sim = await base44.asServiceRole.entities.CryptoSimulation.create({
      simulation_name: `Crypto Research — ${ts.split('T')[0]}`,
      simulation_type: action === 'full_pipeline' ? 'full_pipeline' : 'research',
      coin_name: coinName, coin_ticker: coinTicker,
      blockchain_platform: blockchain, total_supply: supply,
      market_research: JSON.stringify(research),
      pattern_analysis: JSON.stringify(research.patterns_detected || []),
      correlated_assets: JSON.stringify(research.correlations || []),
      ai_insights: research.summary || '',
      phase: action === 'full_pipeline' ? 'design' : 'research',
      status: 'active',
      documentation: `# Crypto Market Research — ${ts}\n\n## Summary\n${research.summary}\n\n## Market: ${research.market_conditions?.total_market_cap} cap, BTC dom ${research.market_conditions?.btc_dominance}, Fear/Greed: ${research.market_conditions?.fear_greed}\n\n## Patterns Found: ${(research.patterns_detected||[]).length}\n${(research.patterns_detected||[]).map(p => `- ${p.asset}: ${p.pattern} (${p.timeframe}) → ${p.direction} (${p.confidence}% conf, target ${p.target_price})`).join('\n')}\n\n## Recommended Narrative: ${research.recommended_narrative}\n## Launch Window: ${research.optimal_launch_window}\n## Risk: ${research.risk_level}`,
    });

    if (action === 'research') {
      return Response.json({ success: true, simulation_id: sim.id, research });
    }
    // Continue to coin creation for full_pipeline
    body.simulation_id = sim.id;
  }

  // ─── PHASE 2: COIN CREATION + SMART CONTRACT ───
  if (action === 'create_coin' || action === 'full_pipeline') {
    let existingResearch = '';
    if (simId || body.simulation_id) {
      const existing = await base44.asServiceRole.entities.CryptoSimulation.filter(
        { id: simId || body.simulation_id }, '-created_date', 1
      ).catch(() => []);
      if (existing[0]?.market_research) existingResearch = existing[0].market_research.substring(0, 2000);
    }

    const coinDesign = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a senior blockchain architect and tokenomics designer.

Create a COMPLETE crypto coin design for: "${coinName}" ($${coinTicker})
Blockchain: ${blockchain} | Total Supply: ${supply.toLocaleString()}

${existingResearch ? `Market context: ${existingResearch.substring(0, 800)}` : ''}

Generate:
1. TOKENOMICS — full distribution (team, treasury, community, liquidity, staking, burns), vesting schedules, emission curve
2. SMART CONTRACT CODE — COMPLETE production-ready Solidity (ERC-20) or Rust (SPL) code with: transfers, burns, minting cap, owner controls, anti-bot, max wallet, tax mechanism, liquidity lock
3. DEPLOYMENT STEPS — exact step-by-step process to deploy on ${blockchain}: compile, verify, deploy, initialize liquidity, list on DEX
4. LAUNCH STRATEGY — fair launch vs presale, initial liquidity, marketing, community building, CEX listing path
5. UTILITY DESIGN — what this token does, governance, staking rewards, ecosystem integration

Make the smart contract code REAL and COMPLETE — not pseudocode.`,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          tokenomics: { type: 'object', properties: {
            distribution: { type: 'array', items: { type: 'object', properties: {
              category: { type: 'string' }, percentage: { type: 'number' }, amount: { type: 'number' },
              vesting: { type: 'string' }, cliff: { type: 'string' },
            }}},
            burn_mechanism: { type: 'string' }, staking_apy: { type: 'string' },
            max_wallet_pct: { type: 'number' }, buy_tax_pct: { type: 'number' }, sell_tax_pct: { type: 'number' },
          }},
          smart_contract_code: { type: 'string' },
          deployment_steps: { type: 'array', items: { type: 'object', properties: {
            step: { type: 'number' }, title: { type: 'string' }, description: { type: 'string' },
            command: { type: 'string' }, status: { type: 'string' },
          }}},
          launch_strategy: { type: 'object', properties: {
            type: { type: 'string' }, initial_liquidity_usd: { type: 'number' },
            initial_price: { type: 'number' }, marketing_plan: { type: 'string' },
            community_plan: { type: 'string' }, cex_path: { type: 'string' },
          }},
          utility: { type: 'string' },
          risk_assessment: { type: 'string' },
          estimated_fdv: { type: 'string' },
        }
      }
    });

    const updateData = {
      tokenomics: JSON.stringify(coinDesign.tokenomics || {}),
      smart_contract_code: coinDesign.smart_contract_code || '',
      deployment_steps: JSON.stringify(coinDesign.deployment_steps || []),
      launch_strategy: JSON.stringify(coinDesign.launch_strategy || {}),
      initial_price: coinDesign.launch_strategy?.initial_price || 0.001,
      current_simulated_price: coinDesign.launch_strategy?.initial_price || 0.001,
      risk_assessment: coinDesign.risk_assessment || '',
      phase: action === 'full_pipeline' ? 'deployment_simulation' : 'contract_generation',
    };

    const targetId = simId || body.simulation_id;
    if (targetId) {
      await base44.asServiceRole.entities.CryptoSimulation.update(targetId, updateData);
    }

    if (action === 'create_coin') {
      return Response.json({ success: true, simulation_id: targetId, coin_design: coinDesign });
    }
  }

  // ─── PHASE 3: LAUNCH SIMULATION + PRICE ACTION ───
  if (action === 'simulate_launch' || action === 'full_pipeline') {
    const targetId = simId || body.simulation_id;
    let simData = null;
    if (targetId) {
      const sims = await base44.asServiceRole.entities.CryptoSimulation.filter({ id: targetId }, '-created_date', 1).catch(() => []);
      simData = sims[0];
    }

    const launchSim = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a crypto market simulator with LIVE market awareness.

Simulate the FULL LAUNCH of "${coinName}" ($${coinTicker}) on ${blockchain}.
Initial price: $${simData?.initial_price || 0.001}
Supply: ${supply.toLocaleString()}

Look up CURRENT real crypto market conditions to make this realistic.

Simulate 30 days of price action with these phases:
- Day 1-3: Launch hype, initial DEX listing, bot activity, first pump
- Day 4-7: First correction, paper hands sell, accumulation
- Day 8-14: Narrative building, influencer mentions, organic growth
- Day 15-21: Major catalyst or FUD event, volatility spike
- Day 22-30: Stabilization, true value discovery

For each day generate: price, volume, market_cap, holders, key_event, pattern_detected.

Also identify:
- Technical patterns that form during the 30-day simulation
- Correlation with BTC and ETH price movements
- Whale wallet behavior simulation
- Bot detection patterns
- Liquidity depth analysis`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          price_simulation: { type: 'array', items: { type: 'object', properties: {
            day: { type: 'number' }, price: { type: 'number' }, volume: { type: 'string' },
            market_cap: { type: 'string' }, holders: { type: 'number' },
            key_event: { type: 'string' }, pattern_detected: { type: 'string' },
            btc_correlation: { type: 'number' },
          }}},
          patterns_found: { type: 'array', items: { type: 'object', properties: {
            pattern: { type: 'string' }, day_range: { type: 'string' }, significance: { type: 'string' },
            tradeable: { type: 'boolean' }, expected_outcome: { type: 'string' },
          }}},
          whale_activity: { type: 'array', items: { type: 'object', properties: {
            day: { type: 'number' }, action: { type: 'string' }, amount: { type: 'string' }, impact: { type: 'string' },
          }}},
          final_price: { type: 'number' },
          peak_price: { type: 'number' },
          lowest_price: { type: 'number' },
          total_volume_30d: { type: 'string' },
          final_holders: { type: 'number' },
          final_market_cap: { type: 'string' },
          launch_success_score: { type: 'number' },
          key_learnings: { type: 'array', items: { type: 'string' } },
          full_documentation: { type: 'string' },
        }
      }
    });

    if (targetId) {
      await base44.asServiceRole.entities.CryptoSimulation.update(targetId, {
        price_simulation_data: JSON.stringify(launchSim.price_simulation || []),
        pattern_analysis: JSON.stringify(launchSim.patterns_found || []),
        current_simulated_price: launchSim.final_price || 0,
        market_cap_simulated: parseFloat((launchSim.final_market_cap || '0').replace(/[^0-9.]/g, '')) || 0,
        phase: 'complete',
        documentation: (simData?.documentation || '') + `\n\n---\n# Launch Simulation Results\n${launchSim.full_documentation || ''}\n\n## Key Learnings\n${(launchSim.key_learnings || []).map((l,i) => `${i+1}. ${l}`).join('\n')}\n\n## Patterns Detected: ${(launchSim.patterns_found||[]).length}\n${(launchSim.patterns_found||[]).map(p => `- ${p.pattern} (Days ${p.day_range}): ${p.expected_outcome}`).join('\n')}`,
        ai_insights: `Launch Score: ${launchSim.launch_success_score}/100 | Peak: $${launchSim.peak_price} | Final: $${launchSim.final_price} | ${launchSim.final_holders} holders | ${(launchSim.patterns_found||[]).length} patterns detected`,
      });
    }

    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: 'Crypto Simulation Agent',
      action: `${coinName} ($${coinTicker}) launch sim complete — Score: ${launchSim.launch_success_score}/100, Peak: $${launchSim.peak_price}, ${(launchSim.patterns_found||[]).length} patterns`,
      status: 'success', category: 'analysis',
      details: JSON.stringify({ final_price: launchSim.final_price, peak: launchSim.peak_price, patterns: (launchSim.patterns_found||[]).length, holders: launchSim.final_holders }),
    });

    return Response.json({ success: true, simulation_id: targetId, launch: launchSim });
  }

  // ─── PATTERN SCAN (standalone) ───
  if (action === 'pattern_scan') {
    const patterns = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a crypto technical analyst. Look up LIVE crypto prices and charts RIGHT NOW.

Scan the top 30 cryptocurrencies for technical patterns:
- Chart patterns: H&S, double top/bottom, triangles, wedges, flags, cups
- Indicator signals: RSI divergences, MACD crossovers, Bollinger squeezes
- Volume patterns: accumulation/distribution, volume climax, dry-up
- On-chain patterns: whale accumulation, exchange outflows, NVT signals
- Cross-asset correlations: BTC vs alts, crypto vs S&P, sector rotations

For each pattern found, provide: asset, pattern name, timeframe, confidence (0-100), direction, target price, and detailed reasoning.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          scan_time: { type: 'string' },
          patterns: { type: 'array', items: { type: 'object', properties: {
            asset: { type: 'string' }, ticker: { type: 'string' },
            pattern: { type: 'string' }, timeframe: { type: 'string' },
            direction: { type: 'string' }, confidence: { type: 'number' },
            current_price: { type: 'string' }, target_price: { type: 'string' },
            stop_loss: { type: 'string' }, reasoning: { type: 'string' },
          }}},
          strongest_signal: { type: 'string' },
          market_regime: { type: 'string' },
          summary: { type: 'string' },
        }
      }
    });

    return Response.json({ success: true, patterns });
  }

  return Response.json({ error: 'Unknown action. Use: research, create_coin, simulate_launch, pattern_scan, full_pipeline' }, { status: 400 });
});