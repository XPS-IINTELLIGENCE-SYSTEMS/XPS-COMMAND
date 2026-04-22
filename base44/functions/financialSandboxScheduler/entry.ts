import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Cost-optimized 24/7 schedule:
// Market hours (9:30 AM - 4:00 PM ET): Every 30 min (8 calls/day)
// Pre-market (7:00 AM - 9:30 AM ET): Every 60 min (3 calls)
// After-hours (4:00 PM - 8:00 PM ET): Every 60 min (4 calls)
// Overnight (8:00 PM - 7:00 AM ET): Every 4 hours (5 calls)
// Total: ~20 calls/day = 600 calls/month (vs 1440 calls for continuous)
// Cost reduction: 58% savings while maintaining realistic market coverage

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();
    const hour = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    const dayOfWeek = now.getUTCDay();

    // Market closed on weekends (UTC Saturday 4 PM - Sunday 8 PM)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return Response.json({ skipped: true, reason: 'Weekend market closed' });
    }

    // ET to UTC conversion: ET = UTC - 4 (EDT) or UTC - 5 (EST)
    const utcHour = hour;
    const etHour = hour <= 4 ? hour + 20 : hour - 4; // Approximate ET from UTC

    let shouldRun = false;
    let reason = '';

    // Market hours: 9:30 AM - 4:00 PM ET (13:30 - 20:00 UTC) → every 30 min
    if (utcHour >= 13 && utcHour < 20) {
      if (minutes % 30 === 0 || minutes % 30 === 1) {
        shouldRun = true;
        reason = 'Market hours (30-min cycle)';
      }
    }
    // Pre-market: 7:00 AM - 9:30 AM ET (11:00 - 13:30 UTC) → every 60 min
    else if (utcHour >= 11 && utcHour < 13.5) {
      if (minutes <= 1) {
        shouldRun = true;
        reason = 'Pre-market (hourly cycle)';
      }
    }
    // After-hours: 4:00 PM - 8:00 PM ET (20:00 - 00:00 UTC) → every 60 min
    else if (utcHour >= 20 || utcHour < 4) {
      if (minutes <= 1) {
        shouldRun = true;
        reason = 'After-hours (hourly cycle)';
      }
    }
    // Overnight: 8:00 PM - 7:00 AM ET (00:00 - 11:00 UTC) → every 4 hours
    else {
      const overnight = hour % 4 === 0 && minutes <= 1;
      if (overnight) {
        shouldRun = true;
        reason = 'Overnight (4-hour cycle)';
      }
    }

    if (!shouldRun) {
      return Response.json({
        skipped: true,
        reason: 'Not in execution window',
        nextRun: getNextRunTime(utcHour, minutes),
      });
    }

    // Check if sandbox is initialized
    const portfolios = await base44.asServiceRole.entities.FinancialPortfolio
      .filter({ status: 'active' }, '-created_date', 1)
      .catch(() => []);

    if (portfolios.length === 0) {
      return Response.json({
        skipped: true,
        reason: 'Sandbox not initialized',
        message: 'Run init action first',
      });
    }

    // Run the trading cycle
    const result = await base44.asServiceRole.functions.invoke('financialSandbox', {
      action: 'daily_cycle',
    });

    return Response.json({
      success: true,
      reason,
      timestamp: ts,
      cycle_result: result,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getNextRunTime(hour, minutes) {
  const now = new Date();
  now.setUTCHours(hour, minutes, 0, 0);

  if (hour >= 13 && hour < 20) {
    // Market hours: next 30-min mark
    now.setMinutes(Math.ceil(minutes / 30) * 30);
  } else if (hour >= 11 && hour < 13.5) {
    // Pre-market: next hour
    now.setHours(now.getHours() + 1, 0, 0, 0);
  } else if (hour >= 20 || hour < 4) {
    // After-hours: next hour
    now.setHours(now.getHours() + 1, 0, 0, 0);
  } else {
    // Overnight: next 4-hour mark
    now.setHours(Math.ceil(hour / 4) * 4, 0, 0, 0);
  }

  return now.toISOString();
}