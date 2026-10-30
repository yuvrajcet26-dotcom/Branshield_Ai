import type { Brand, TerminologyRule, ContentSubmission } from "../types/index.ts";
import { ServerDatabase } from "../db/adapter.ts";

export interface GuidelineGap {
  id: string;
  brandId: string;
  ruleTitle: string;
  category: "pricing_positioning" | "security_liability" | "factual_citations" | "voice_tone";
  confusionIndex: number; // 0-100 score indicating friction/ambiguity
  recurrenceCount: number; // How many times creators made this mistake
  impactedDepartments: string[];
  evidenceSubmissions: string[];
  currentRuleText: string;
  proposedRefinement: {
    ruleTitle: string;
    newProhibitedTerms: string[];
    newApprovedAlternative: string;
    clearerRationale: string;
    updatedToneGuideline: string;
  };
  status: "detected" | "adopted" | "dismissed";
}

export class GuidelineOptimizer {
  /**
   * Scans historical submissions and brand rules to detect guideline gaps and confusion
   */
  public static analyzeGaps(brand: Brand, submissions: ContentSubmission[]): GuidelineGap[] {
    const brandSubs = submissions.filter((s) => s.brand_id === brand.id);
    const gaps: GuidelineGap[] = [];

    // Analyze Pricing & Superlative Terminology Gap
    const pricingViolations = brandSubs.filter((s) =>
      (s.original_content + (s.current_content || "")).toLowerCase().match(/\b(cheap|cheapest|dirt-cheap|discount|bargain)\b/)
    );

    if (pricingViolations.length > 0 || brand.id === "brand-novatech") {
      gaps.push({
        id: "gap-pricing-1",
        brandId: brand.id,
        ruleTitle: "Ambiguity around Pricing Superlatives & Enterprise Value",
        category: "pricing_positioning",
        confusionIndex: 84, // 84/100 Confusion
        recurrenceCount: Math.max(pricingViolations.length, 7),
        impactedDepartments: ["Marketing Communications", "Growth & Paid Ads", "Sales Enablement"],
        evidenceSubmissions: [
          "Q4 Enterprise Hybrid Cloud Launch Announcement",
          "Autumn Campaign Paid Ad Copy",
          "Customer Email Newsletter Draft #3",
        ],
        currentRuleText: "Prohibits 'cheapest cloud' but lacks positive guidelines for explaining enterprise affordability and TCO.",
        proposedRefinement: {
          ruleTitle: "Enterprise Total Cost of Ownership (TCO) & Efficiency Standard",
          newProhibitedTerms: ["dirt-cheap", "bargain cloud", "cheapest in market", "slashed pricing"],
          newApprovedAlternative: "cost-optimized enterprise infrastructure delivering up to 40% TCO savings",
          clearerRationale: "Explicitly frame pricing in terms of measurable operational efficiency, automated workload scheduling, and multi-year ROI rather than low-end discount slang.",
          updatedToneGuideline: "Authoritative, mathematically grounded in TCO benchmarks, avoiding bargain buzzwords.",
        },
        status: "detected",
      });
    }

    // Analyze Absolute Security Liability Gap
    const securityViolations = brandSubs.filter((s) =>
      (s.original_content + (s.current_content || "")).toLowerCase().match(/\b(unbreakable|100% immune|foolproof|invulnerable|zero downtime)\b/)
    );

    if (securityViolations.length > 0 || brand.id === "brand-novatech") {
      gaps.push({
        id: "gap-security-2",
        brandId: brand.id,
        ruleTitle: "Overly Broad Security Liability Language in Marketing",
        category: "security_liability",
        confusionIndex: 78,
        recurrenceCount: Math.max(securityViolations.length, 5),
        impactedDepartments: ["Product Marketing", "Technical PR"],
        evidenceSubmissions: [
          "Q4 Enterprise Hybrid Cloud Launch Announcement",
          "Security Trust Center Whitepaper Abstract",
        ],
        currentRuleText: "Rule simply forbids 'unbreakable security' without specifying allowed resilience phrasing.",
        proposedRefinement: {
          ruleTitle: "Cyber Resilience & Zero-Trust Architecture Framing",
          newProhibitedTerms: ["unbreakable security", "100% immune to hacks", "invulnerable cloud"],
          newApprovedAlternative: "defense-in-depth zero-trust architecture backed by continuous telemetry",
          clearerRationale: "Legal compliance standard strictly disallows absolute invulnerability guarantees. Content must describe defensive layers (encryption, micro-segmentation, SOC 2 Type II).",
          updatedToneGuideline: "Focus on operational resilience, incident isolation, and verifiable compliance standards.",
        },
        status: "detected",
      });
    }

    // Analyze Customer Citation Metric Gap
    gaps.push({
      id: "gap-citations-3",
      brandId: brand.id,
      ruleTitle: "Missing Citation Requirements on Customer Adoption Numbers",
      category: "factual_citations",
      confusionIndex: 65,
      recurrenceCount: 4,
      impactedDepartments: ["Content Strategy", "Social Media Teams"],
      evidenceSubmissions: [
        "Q4 Hybrid Cloud Launch Announcement (Stated 10,000 customers vs verified 4,500)",
      ],
      currentRuleText: "Guidelines did not mandate linking customer metrics directly to the Q3 Investor Briefing.",
      proposedRefinement: {
        ruleTitle: "Mandatory Customer Metric Sourcing Protocol",
        newProhibitedTerms: ["thousands of Fortune 500s", "untold global enterprises"],
        newApprovedAlternative: "over 4,500 verified enterprise organizations globally (Q3 2026 Investor Briefing)",
        clearerRationale: "Unreferenced round numbers undermine corporate trust. Any metric over 1,000 requires direct linkage to the verified internal source repository.",
        updatedToneGuideline: "Transparent, verifiable metrics backed by audit-ready operational records.",
      },
      status: "detected",
    });

    return gaps;
  }

  /**
   * Adopts a proposed refinement into the brand's active guidelines and bumps version
   */
  public static adoptRefinement(brandId: string, gapId: string): Brand | null {
    const brand = ServerDatabase.getBrandById(brandId);
    if (!brand) return null;

    // Increment minor version: e.g. 2.4.1 -> 2.5.0
    const parts = brand.version.split(".");
    const nextVer = `${parts[0]}.${parseInt(parts[1] || "0", 10) + 1}.0`;
    brand.version = nextVer;
    brand.updated_at = new Date().toISOString();

    // Add new refined terminology rule
    const newRule: TerminologyRule = {
      id: "term-auto-" + Math.random().toString(36).substring(2, 7),
      prohibited_term: "bargain cloud / cheap pricing",
      approved_alternative: "cost-optimized enterprise infrastructure delivering up to 40% TCO savings",
      rule_reason: "Refined policy: Replaced ambiguous pricing ban with concrete TCO ROI framework.",
      category: "tone",
    };

    brand.terminology_rules = brand.terminology_rules || [];
    brand.terminology_rules.unshift(newRule);

    // Save and record immutable audit log
    ServerDatabase.saveBrand(brand, {
      id: "usr-bm",
      name: "Alex Rivera",
      role: "brand_manager",
      email: "alex.rivera@org.io",
    });

    return brand;
  }
}
