import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { your_url, competitor_url, your_company, competitor_company } = await req.json();

  if (!your_url && !competitor_url) {
    return Response.json({ error: 'At least one URL is required' }, { status: 400 });
  }

  // Scrape both companies in parallel
  const scrapePrompt = (company, url) => `
You are a competitive intelligence analyst for the flooring, epoxy, and polishing industry.
Research this company thoroughly using the URL and any available web data:

Company: ${company}
URL: ${url}

Provide a comprehensive analysis including:

1. PRODUCTS: List their main products/services with descriptions. Include product categories, flagship products, and any unique offerings.
2. PRICING: Find any publicly available pricing, price ranges, or pricing tiers. Note if pricing is "call for quote" or hidden.
3. REVIEWS & REPUTATION: Google rating, review count, BBB rating, Yelp rating, social media presence, any notable reviews or complaints.
4. COMPANY INFO: Years in business, employee count estimate, locations, service area, certifications, awards.
5. STRENGTHS: What they do well, unique selling points, competitive advantages.
6. WEAKNESSES: Areas where they fall short, common complaints, gaps in offerings.
7. MARKET POSITION: Are they premium, mid-range, or budget? Target customer profile.

Be specific with real data when available. If you can't find exact data, provide educated estimates and note them as estimates.`;

  const schema = {
    type: "object",
    properties: {
      company_name: { type: "string" },
      website: { type: "string" },
      tagline: { type: "string" },
      years_in_business: { type: "number" },
      employee_estimate: { type: "string" },
      locations: { type: "string" },
      service_area: { type: "string" },
      certifications: { type: "string" },
      market_position: { type: "string" },
      google_rating: { type: "number" },
      review_count: { type: "number" },
      bbb_rating: { type: "string" },
      social_presence: { type: "string" },
      reputation_summary: { type: "string" },
      products: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            price_range: { type: "string" },
            is_flagship: { type: "boolean" }
          }
        }
      },
      pricing_model: { type: "string" },
      price_range_low: { type: "string" },
      price_range_high: { type: "string" },
      strengths: { type: "array", items: { type: "string" } },
      weaknesses: { type: "array", items: { type: "string" } },
      unique_selling_points: { type: "array", items: { type: "string" } }
    }
  };

  const promises = [];

  if (your_url) {
    promises.push(
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: scrapePrompt(your_company || "My Company", your_url),
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: schema
      })
    );
  } else {
    promises.push(Promise.resolve(null));
  }

  if (competitor_url) {
    promises.push(
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: scrapePrompt(competitor_company || "Competitor", competitor_url),
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: schema
      })
    );
  } else {
    promises.push(Promise.resolve(null));
  }

  const [yourData, competitorData] = await Promise.all(promises);

  // Generate comparison recommendations
  let recommendations = null;
  if (yourData && competitorData) {
    recommendations = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a senior sales strategist for the flooring/epoxy industry.
Compare these two companies and provide actionable recommendations:

YOUR COMPANY: ${JSON.stringify(yourData)}
COMPETITOR: ${JSON.stringify(competitorData)}

Provide:
1. SALES RECOMMENDATIONS: How to win deals against this competitor. Specific talking points, price positioning, value props.
2. PRICING STRATEGY: How your pricing compares and what adjustments could help.
3. PRODUCT GAPS: Products/services the competitor offers that you don't, and vice versa.
4. MARKETING OPPORTUNITIES: Ways to differentiate and capture market share.
5. THREAT LEVEL: Rate 1-10 how much of a threat this competitor is and why.
6. WIN STRATEGY: Step-by-step approach to winning a deal when competing head-to-head.`,
      response_json_schema: {
        type: "object",
        properties: {
          threat_level: { type: "number" },
          threat_summary: { type: "string" },
          sales_recommendations: { type: "array", items: { type: "string" } },
          pricing_strategy: { type: "string" },
          your_advantages: { type: "array", items: { type: "string" } },
          competitor_advantages: { type: "array", items: { type: "string" } },
          product_gaps_you_miss: { type: "array", items: { type: "string" } },
          product_gaps_they_miss: { type: "array", items: { type: "string" } },
          marketing_opportunities: { type: "array", items: { type: "string" } },
          win_strategy: { type: "array", items: { type: "string" } },
          overall_summary: { type: "string" }
        }
      }
    });
  }

  return Response.json({
    your_company: yourData,
    competitor: competitorData,
    recommendations
  });
});