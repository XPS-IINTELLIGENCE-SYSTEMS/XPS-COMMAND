import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // XPS Operations Prompts
    const xpsPrompts = [
      {
        title: "Lead Scoring Analysis",
        category: "leads_intelligence",
        library_type: "xps_operations",
        prompt_text: "Analyze the following lead information and provide a scoring from 0-100 based on fit, engagement, company size, budget indicators, and timeline:\n\nCompany: {{company_name}}\nIndustry: {{industry}}\nContact: {{contact_name}}\nRecent Activity: {{activity_summary}}\n\nProvide: 1) Overall score 2) Score breakdown by category 3) Key strengths 4) Areas of concern 5) Recommended next action",
        use_case: "Prioritize leads for outreach campaigns",
        variables: '["company_name", "industry", "contact_name", "activity_summary"]',
        tags: "lead_scoring, intelligence, pipeline"
      },
      {
        title: "Competitor Pricing Intelligence",
        category: "competitor_research",
        library_type: "xps_operations",
        prompt_text: "Research and analyze competitor pricing for {{service_type}} in {{market_region}}. Create a competitive pricing matrix showing:\n\n1) Direct competitors and their pricing models\n2) Price ranges for {{specific_offering}}\n3) Value-add offerings that justify premium pricing\n4) Discount/bundling strategies\n5) Recommended pricing strategy for our offerings\n\nProvide actionable pricing recommendations based on market analysis.",
        use_case: "Set dynamic pricing and bid competitively",
        variables: '["service_type", "market_region", "specific_offering"]',
        tags: "pricing, competition, market_analysis"
      },
      {
        title: "Email Campaign Copy Generator",
        category: "outreach_campaigns",
        library_type: "xps_operations",
        prompt_text: "Write a compelling {{email_type}} email for {{recipient_title}} at {{company_name}}. The email should:\n\n1) Hook: Reference something specific about their company/industry\n2) Problem: Identify a pain point in {{industry_vertical}}\n3) Solution: Present {{solution}} as the answer\n4) Proof: Include {{success_metric}} from similar companies\n5) CTA: Clear next step {{call_to_action}}\n\nTone: {{tone}} | Length: {{word_count}} words | Avoid being salesy.",
        use_case: "Generate personalized outreach templates",
        variables: '["email_type", "recipient_title", "company_name", "industry_vertical", "solution", "success_metric", "call_to_action", "tone", "word_count"]',
        tags: "email, outreach, copywriting"
      },
      {
        title: "Bid Analysis & Recommendation",
        category: "bid_pricing",
        library_type: "xps_operations",
        prompt_text: "Analyze the following commercial bid opportunity and recommend a go/no-go decision:\n\nProject: {{project_name}}\nScope: {{scope_description}}\nBudget: {{budget_range}}\nTimeline: {{timeline}}\nCompetitors: {{estimated_competitors}}\nOur Capacity: {{capacity_status}}\n\nProvide: 1) Win probability estimate 2) Recommended bid price 3) Risk factors 4) Resource requirements 5) Final recommendation with reasoning",
        use_case: "Make data-driven bidding decisions",
        variables: '["project_name", "scope_description", "budget_range", "timeline", "estimated_competitors", "capacity_status"]',
        tags: "bidding, pricing, opportunity_analysis"
      },
      {
        title: "Lead Qualification Framework",
        category: "leads_intelligence",
        library_type: "xps_operations",
        prompt_text: "Evaluate if this lead qualifies for our {{product_type}} offering using the BANT framework:\n\nBudget: {{budget_info}}\nAuthority: {{decision_maker_info}}\nNeed: {{stated_need}}\nTimeline: {{implementation_timeline}}\n\nAdditional Context:\n- Company Size: {{company_size}}\n- Industry Fit: {{industry}}\n- Current Solution: {{current_solution}}\n\nProvide: 1) BANT score for each dimension 2) Overall qualification level (Hot/Warm/Cold) 3) Gap analysis 4) Nurture strategy if not ready 5) Next conversation topics",
        use_case: "Qualify leads before sales engagement",
        variables: '["product_type", "budget_info", "decision_maker_info", "stated_need", "implementation_timeline", "company_size", "industry", "current_solution"]',
        tags: "qualification, lead_assessment, sales_framework"
      },
      {
        title: "Content Audit & SEO Recommendations",
        category: "content_creation",
        library_type: "xps_operations",
        prompt_text: "Audit the content strategy for {{website_url}} in {{target_market}}. Analyze:\n\n1) Top-performing content (topics, formats, CTAs)\n2) SEO gaps in {{industry}} keywords\n3) Competitor content benchmarking\n4) Recommended content calendar (next 90 days)\n5) Content types with highest engagement potential\n\nProvide specific article topics, keywords, and publishing schedule that will drive {{business_objective}}.",
        use_case: "Plan content strategy for lead generation",
        variables: '["website_url", "target_market", "industry", "business_objective"]',
        tags: "content, seo, strategy"
      },
      {
        title: "Workflow Automation Design",
        category: "automation_workflows",
        library_type: "xps_operations",
        prompt_text: "Design an automated workflow for {{process_name}} that reduces manual work by {{efficiency_target}}%.\n\nCurrent Process: {{current_steps}}\nPain Points: {{pain_points}}\nAvailable Tools: {{tool_stack}}\nTeam Skill Level: {{skill_level}}\n\nProvide: 1) Automation architecture diagram 2) Step-by-step workflow 3) Decision trees/conditions 4) Error handling 5) Monitoring/alerts 6) Expected time savings 7) Implementation roadmap",
        use_case: "Build scalable business processes",
        variables: '["process_name", "efficiency_target", "current_steps", "pain_points", "tool_stack", "skill_level"]',
        tags: "automation, workflow, process_improvement"
      },
      {
        title: "Customer Journey Mapping",
        category: "leads_intelligence",
        library_type: "xps_operations",
        prompt_text: "Map the complete customer journey for {{customer_persona}} purchasing {{product_category}}:\n\nTarget Persona: {{persona_details}}\nPrice Range: {{price_sensitivity}}\nDecision Timeline: {{timeline}}\nKey Influencers: {{influencer_roles}}\n\nIdentify: 1) Awareness stage triggers 2) Consideration challenges 3) Decision factors 4) Post-purchase needs 5) Upsell opportunities 6) Touchpoints for each stage 7) Messaging for each stage",
        use_case: "Align marketing and sales efforts",
        variables: '["customer_persona", "product_category", "persona_details", "price_sensitivity", "timeline", "influencer_roles"]',
        tags: "customer_journey, persona, marketing"
      },
      {
        title: "Proposal Win Strategy",
        category: "bid_pricing",
        library_type: "xps_operations",
        prompt_text: "Develop a winning proposal strategy for {{prospect_name}} requesting {{deliverable}}:\n\nCompeting Against: {{competitors}}\nDecision Criteria: {{stated_criteria}}\nBudget: {{budget}}\nUnique Advantage: {{our_advantage}}\n\nCreate: 1) Executive summary positioning 2) Proof of capability framework 3) Differentiation narrative 4) Risk mitigation strategy 5) Pricing justification 6) Timeline realism 7) Client success story alignment",
        use_case: "Win high-value deals",
        variables: '["prospect_name", "deliverable", "competitors", "stated_criteria", "budget", "our_advantage"]',
        tags: "proposals, sales, strategy"
      },
      {
        title: "Agent Capability Definition",
        category: "agent_building",
        library_type: "xps_operations",
        prompt_text: "Define capabilities and boundaries for a {{agent_type}} agent focused on {{primary_function}}:\n\nDesired Outcomes: {{desired_outcomes}}\nData Sources: {{available_data}}\nDomain Expertise: {{expertise_domain}}\nConstraints: {{business_constraints}}\n\nSpecify: 1) Core responsibilities 2) Authority/decision-making limits 3) Required knowledge/tools 4) Success metrics 5) Escalation triggers 6) Error handling approach 7) Learning/improvement mechanisms",
        use_case: "Build effective autonomous agents",
        variables: '["agent_type", "primary_function", "desired_outcomes", "available_data", "expertise_domain", "business_constraints"]',
        tags: "ai_agents, automation, design"
      }
    ];

    // Autonomous AI Systems Prompts
    const autonomousPrompts = [
      {
        title: "Autonomous Wealth Generation System Architecture",
        category: "wealth_creation",
        library_type: "autonomous_ai_systems",
        prompt_text: "Design a complete autonomous AI system architecture that generates measurable wealth through {{revenue_model}} in {{timeframe}}.\n\nTarget: {{financial_goal}}\nStarting Capital: {{starting_capital}}\nMarket: {{market_segment}}\nCompetitive Advantage: {{unique_advantage}}\n\nProvide: 1) System components and interconnections 2) Revenue streams and scaling paths 3) Automation loops and feedback mechanisms 4) Resource optimization strategies 5) Risk mitigation and failsafes 6) Milestone-based growth targets 7) Measurement dashboard specifications",
        use_case: "Build systems that create wealth autonomously",
        variables: '["revenue_model", "timeframe", "financial_goal", "starting_capital", "market_segment", "unique_advantage"]',
        tags: "wealth_creation, autonomy, system_design"
      },
      {
        title: "Recursive System Building Framework",
        category: "recursive_building",
        library_type: "autonomous_ai_systems",
        prompt_text: "Create a recursive system design where AI builds {{system_type}}, which builds {{sub_system}}, which builds {{sub_sub_system}}, generating value at each layer:\n\nLayer 1 Purpose: {{layer1_goal}}\nLayer 2 Purpose: {{layer2_goal}}\nLayer 3 Purpose: {{layer3_goal}}\nValue Multiplication: {{value_hypothesis}}\n\nSpecify: 1) Each layer's autonomy level 2) Data/output flow between layers 3) Quality gates at each level 4) Error correction mechanisms 5) Learning across layers 6) Revenue generation per layer 7) Scaling strategy",
        use_case: "Build systems that multiply in capability",
        variables: '["system_type", "sub_system", "sub_sub_system", "layer1_goal", "layer2_goal", "layer3_goal", "value_hypothesis"]',
        tags: "recursion, meta_systems, multiplication"
      },
      {
        title: "Financial Trading System Design",
        category: "trading_systems",
        library_type: "autonomous_ai_systems",
        prompt_text: "Design a fully autonomous financial trading system for {{asset_class}} using {{strategy_type}}:\n\nCapital: {{starting_capital}}\nRisk Tolerance: {{risk_level}}\nMarket Focus: {{markets}}\nTimeframe: {{trading_timeframe}}\n\nDefine: 1) Market analysis engine 2) Signal generation logic 3) Position sizing algorithm 4) Risk management rules 5) Profit-taking mechanisms 6) Loss-limiting stops 7) Portfolio rebalancing triggers 8) Performance monitoring and adaptation 9) Fail-safe shutdown conditions",
        use_case: "Create passive income through automated trading",
        variables: '["asset_class", "strategy_type", "starting_capital", "risk_level", "markets", "trading_timeframe"]',
        tags: "trading, financial_systems, autonomy"
      },
      {
        title: "Prediction System Architecture",
        category: "prediction_systems",
        library_type: "autonomous_ai_systems",
        prompt_text: "Build a prediction system that forecasts {{prediction_target}} with {{accuracy_goal}}% accuracy:\n\nData Sources: {{data_sources}}\nHistorical Data: {{data_volume}}\nFeature Complexity: {{feature_count}}\nUpdate Frequency: {{update_interval}}\n\nConfigure: 1) Data pipeline architecture 2) Feature engineering process 3) Model selection and ensemble strategy 4) Retraining schedule 5) Accuracy monitoring 6) Prediction confidence intervals 7) Feedback loops for continuous improvement 8) Decision thresholds for action triggers",
        use_case: "Create systems that predict and adapt",
        variables: '["prediction_target", "accuracy_goal", "data_sources", "data_volume", "feature_count", "update_interval"]',
        tags: "prediction, ml, forecasting"
      },
      {
        title: "Intelligent Recommendation Engine",
        category: "recommendation_systems",
        library_type: "autonomous_ai_systems",
        prompt_text: "Design a recommendation system that increases {{business_metric}} by {{improvement_target}}%:\n\nUser Base: {{user_count}}\nItems to Recommend: {{catalog_size}}\nData Available: {{data_types}}\nPersonalization Level: {{personalization_depth}}\n\nBuild: 1) User profiling mechanism 2) Collaborative filtering strategy 3) Content-based analysis 4) Hybrid recommendation logic 5) Real-time vs batch processing 6) Cold-start problem solution 7) A/B testing framework 8) Feedback incorporation loop 9) Diversity/serendipity balancing",
        use_case: "Drive engagement and conversion through intelligence",
        variables: '["business_metric", "improvement_target", "user_count", "catalog_size", "data_types", "personalization_depth"]',
        tags: "recommendations, personalization, engagement"
      },
      {
        title: "Automated Scraping & Data Harvesting",
        category: "scraping_harvesting",
        library_type: "autonomous_ai_systems",
        prompt_text: "Design a robust, scalable scraping system for {{data_source}} that harvests {{data_type}} at {{harvest_frequency}}:\n\nTarget URLs/APIs: {{target_count}}\nData Volume: {{volume_estimate}}\nComplexity: {{technical_complexity}}\nUpdate Requirements: {{refresh_rate}}\n\nImplement: 1) Distributed scraping architecture 2) IP rotation and anti-detection 3) Rate limiting and throttling 4) Data validation and cleaning 5) Storage optimization 6) Error recovery and retry logic 7) Monitoring and alerting 8) Legal compliance checks 9) Data enrichment pipeline",
        use_case: "Build competitive intelligence systems autonomously",
        variables: '["data_source", "data_type", "harvest_frequency", "target_count", "volume_estimate", "technical_complexity", "refresh_rate"]',
        tags: "scraping, data_collection, automation"
      },
      {
        title: "System Cloning & Adaptation",
        category: "system_cloning",
        library_type: "autonomous_ai_systems",
        prompt_text: "Create a system that clones proven business models and adapts them to {{target_market}}:\n\nSource System: {{source_business}}\nRevenue Model: {{model_type}}\nTarget Market: {{new_market}}\nLocalization Needs: {{adaptation_requirements}}\n\nDesign: 1) Core component extraction 2) Market research and adaptation mapping 3) Automation level preservation 4) Local regulation compliance 5) Technology stack evaluation 6) Cost structure optimization 7) Timeline for launch 8) Risk mitigation for new market 9) Measurement and adjustment framework",
        use_case: "Rapidly scale proven models to new markets",
        variables: '["target_market", "source_business", "model_type", "new_market", "adaptation_requirements"]',
        tags: "cloning, adaptation, scaling"
      },
      {
        title: "Invention & Product Creation System",
        category: "invention_systems",
        library_type: "autonomous_ai_systems",
        prompt_text: "Design an AI-driven invention system that creates {{product_category}} solving {{problem_statement}}:\n\nMarket Gap: {{market_opportunity}}\nTarget Users: {{user_profile}}\nProduction Capability: {{manufacturing_constraint}}\nTime to Market: {{launch_timeline}}\n\nSpecify: 1) Problem validation methodology 2) Ideation and concept generation 3) Feasibility analysis framework 4) Prototype rapid iteration 5) Market testing approach 6) Feedback incorporation 7) IP protection strategy 8) Go-to-market plan 9) Continuous improvement loops",
        use_case: "Generate new products and revenue streams",
        variables: '["product_category", "problem_statement", "market_opportunity", "user_profile", "manufacturing_constraint", "launch_timeline"]',
        tags: "innovation, product_development, creation"
      },
      {
        title: "Meta-System Architecture (Systems Building Systems)",
        category: "meta_systems",
        library_type: "autonomous_ai_systems",
        prompt_text: "Design a meta-system that builds {{system_count}} different business systems autonomously:\n\nSystem Types: {{system_list}}\nCommon Infrastructure: {{shared_resources}}\nScaling Target: {{scale_goal}}\nTime Constraint: {{timeframe}}\n\nArchitect: 1) Universal system building blocks 2) Configuration framework for customization 3) Template library and patterns 4) Quality assurance across variants 5) Resource pooling and optimization 6) Cross-system learning 7) Unified monitoring dashboard 8) Rapid deployment pipeline 9) System retirement and replacement strategy",
        use_case: "Build a system factory that generates systems",
        variables: '["system_count", "system_list", "shared_resources", "scale_goal", "timeframe"]',
        tags: "meta_systems, scaling, architecture"
      },
      {
        title: "Open Source Integration & Leveraging",
        category: "open_source_integration",
        library_type: "autonomous_ai_systems",
        prompt_text: "Create a strategy to build {{system_type}} using only free/cheap open-source components:\n\nBudget: {{total_budget}}\nPerformance Requirements: {{performance_targets}}\nScaling Needs: {{scale_requirements}}\nMaintenance Capability: {{support_level}}\n\nPlan: 1) Technology stack selection with TCO analysis 2) Integration architecture 3) Community vs commercial support balance 4) Customization strategy 5) Deployment infrastructure (cloud options) 6) Monitoring and logging setup 7) Backup and disaster recovery 8) Security hardening 9) Knowledge transfer and documentation",
        use_case: "Build enterprise systems with minimal costs",
        variables: '["system_type", "total_budget", "performance_targets", "scale_requirements", "support_level"]',
        tags: "open_source, cost_optimization, architecture"
      },
      {
        title: "Code Refactoring for AI Enhancement",
        category: "system_refactoring",
        library_type: "autonomous_ai_systems",
        prompt_text: "Design a refactoring strategy to improve {{codebase_type}} for AI integration and autonomy:\n\nCurrent Code Quality: {{quality_score}}\nLegacy Components: {{legacy_percentage}}\nTeam Size: {{team_capacity}}\nBusiness Continuity: {{downtime_tolerance}}\n\nCreate: 1) Code analysis and technical debt inventory 2) Modularity improvement plan 3) API abstraction strategy 4) AI integration points 5) Testing and validation framework 6) Incremental refactoring roadmap 7) Team training plan 8) Rollback procedures 9) Performance and reliability monitoring",
        use_case: "Modernize systems for AI enhancement",
        variables: '["codebase_type", "quality_score", "legacy_percentage", "team_capacity", "downtime_tolerance"]',
        tags: "refactoring, architecture, modernization"
      }
    ];

    // Combine all prompts
    const allPrompts = [...xpsPrompts, ...autonomousPrompts];

    // Create prompts in batches
    const batchSize = 10;
    let created = 0;
    for (let i = 0; i < allPrompts.length; i += batchSize) {
      const batch = allPrompts.slice(i, i + batchSize);
      await base44.entities.PromptLibrary.bulkCreate(batch).catch(err => {
        console.log(`Batch ${i / batchSize} partially created:`, err.message);
      });
      created += batch.length;
    }

    return Response.json({
      success: true,
      message: `Prompt library populated with ${created} prompts`,
      prompts_created: created,
      xps_operations: xpsPrompts.length,
      autonomous_ai: autonomousPrompts.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});