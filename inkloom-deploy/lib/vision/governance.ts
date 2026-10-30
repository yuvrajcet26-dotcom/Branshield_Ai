import type { Brand } from "../types/index.ts";

export interface ColorSwatch {
  hex: string;
  rgb: [number, number, number];
  percentage: number;
  isBrandApproved: boolean;
  closestApprovedColor?: string;
  colorDifference: number; // Delta-E approximation
}

export interface ContrastCheckResult {
  foreground: string;
  background: string;
  ratio: number;
  wcagAA: boolean; // >= 4.5:1
  wcagAAA: boolean; // >= 7.0:1
  wcagAALarge: boolean; // >= 3.0:1
  status: "pass" | "warning" | "fail";
  recommendation: string;
}

export interface VisualFinding {
  id: string;
  type: "contrast_violation" | "off_brand_color" | "logo_clearspace" | "in_image_text_violation";
  severity: "high" | "medium" | "low";
  description: string;
  reason: string;
  location?: { x: number; y: number; width: number; height: number };
  detectedValue: string;
  recommendedValue: string;
  guidelineReference: string;
}

export interface VisualAuditReport {
  id: string;
  imageName: string;
  timestamp: string;
  overallVisualScore: number; // 0-100
  contrastScore: number;
  colorComplianceScore: number;
  logoComplianceScore: number;
  ocrBrandScore: number;
  dominantColors: ColorSwatch[];
  contrastChecks: ContrastCheckResult[];
  findings: VisualFinding[];
  ocrExtractedText: string;
  summary: string;
}

export class VisionGovernanceEngine {
  /**
   * Helper: Calculate relative luminance according to WCAG 2.1
   */
  public static calculateLuminance(r: number, g: number, b: number): number {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  /**
   * Helper: Calculate contrast ratio between two HEX colors
   */
  public static calculateContrastRatio(hex1: string, hex2: string): number {
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);
    if (!rgb1 || !rgb2) return 1;

    const lum1 = this.calculateLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const lum2 = this.calculateLuminance(rgb2[0], rgb2[1], rgb2[2]);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
  }

  public static hexToRgb(hex: string): [number, number, number] | null {
    hex = hex.replace("#", "");
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    const num = parseInt(hex, 16);
    if (isNaN(num)) return null;
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  /**
   * Approximate color distance between two RGB colors (Euclidean in RGB space)
   */
  public static colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
    return Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
    );
  }

  /**
   * Complete Visual Brand Governance Evaluation
   */
  public static async analyzeVisualAsset(
    imageName: string,
    brand: Brand,
    mockScenario?: "banner_violation" | "compliant_graphic" | "luxury_editorial"
  ): Promise<VisualAuditReport> {
    const findings: VisualFinding[] = [];
    const contrastChecks: ContrastCheckResult[] = [];
    const dominantColors: ColorSwatch[] = [];

    // Approved Brand Palette definitions
    const approvedHexes = brand.id === "brand-novatech"
      ? ["#2878F0", "#8064F5", "#15265B", "#E5F2FF", "#FFFFFF", "#F4FAFF"]
      : brand.id === "brand-aura"
      ? ["#3D352E", "#C2A68C", "#E8E0D5", "#F7F5F0", "#5C6B5E"]
      : ["#1B4D3E", "#4E9F76", "#E9F5EF", "#1F2937", "#FFFFFF"];

    // Evaluate based on asset scenario
    if (mockScenario === "banner_violation" || imageName.toLowerCase().includes("violation") || imageName.toLowerCase().includes("ad")) {
      // Dominant detected colors (contains unapproved neon red #FF0033 and low contrast gray #999999 on white)
      dominantColors.push(
        { hex: "#FF0033", rgb: [255, 0, 51], percentage: 38, isBrandApproved: false, closestApprovedColor: "#2878F0", colorDifference: 245 },
        { hex: "#FFFFFF", rgb: [255, 255, 255], percentage: 32, isBrandApproved: true, closestApprovedColor: "#FFFFFF", colorDifference: 0 },
        { hex: "#999999", rgb: [153, 153, 153], percentage: 18, isBrandApproved: false, closestApprovedColor: "#64748B", colorDifference: 65 },
        { hex: "#2878F0", rgb: [40, 120, 240], percentage: 12, isBrandApproved: true, closestApprovedColor: "#2878F0", colorDifference: 0 }
      );

      // Contrast checks
      const ratio1 = this.calculateContrastRatio("#999999", "#FFFFFF"); // ~2.84:1 (FAILS WCAG AA)
      contrastChecks.push({
        foreground: "#999999",
        background: "#FFFFFF",
        ratio: ratio1,
        wcagAA: false,
        wcagAAA: false,
        wcagAALarge: false,
        status: "fail",
        recommendation: "Subheader text contrast is 2.84:1, failing WCAG AA (4.5:1 required). Darken text to #15265B (ratio 12.6:1).",
      });

      findings.push({
        id: "vis-find-1",
        type: "contrast_violation",
        severity: "high",
        description: `Subheader text contrast ratio ${ratio1}:1 fails WCAG 2.2 AA standard.`,
        reason: "Poor contrast degrades readability for low-vision users and violates international accessibility laws (ADA / EN 301 549).",
        location: { x: 80, y: 340, width: 420, height: 45 },
        detectedValue: `#999999 on #FFFFFF (${ratio1}:1)`,
        recommendedValue: `Darken text to #15265B (achieves 12.6:1 contrast)`,
        guidelineReference: `${brand.name} Accessibility Guidelines — §4.1 Color Contrast Requirements`,
      });

      findings.push({
        id: "vis-find-2",
        type: "off_brand_color",
        severity: "high",
        description: `Dominant background color #FF0033 (Neon Red) is not in the approved brand palette.`,
        reason: `NovaTech brand rules strictly prohibit aggressive red backgrounds on marketing banners. Primary brand color must be Enterprise Blue (#2878F0).`,
        location: { x: 0, y: 0, width: 1200, height: 300 },
        detectedValue: "#FF0033 (Neon Red)",
        recommendedValue: "#2878F0 (Enterprise Electric Blue) or #F4FAFF",
        guidelineReference: `${brand.name} Asset Standards — §2.1 Color Palette Usage`,
      });

      findings.push({
        id: "vis-find-3",
        type: "logo_clearspace",
        severity: "medium",
        description: "Brand logo placed with only 8px padding, violating minimum 24px clear-space requirement.",
        reason: "Insufficient clear space around the brand monogram crowds visual hierarchy and compromises identity recognition.",
        location: { x: 20, y: 20, width: 140, height: 40 },
        detectedValue: "8px top/left margin",
        recommendedValue: "Maintain minimum 24px isolation zone around logo bounding box",
        guidelineReference: `${brand.name} Brand Assets — §1.3 Logo Clear Space Standards`,
      });

      const ocrText = "CHEAPEST CLOUD INFRASTRUCTURE IN THE WORLD. 100% UNBREAKABLE SECURITY GUARANTEED.";
      findings.push({
        id: "vis-find-4",
        type: "in_image_text_violation",
        severity: "high",
        description: "OCR detected prohibited term 'CHEAPEST CLOUD' embedded inside graphic banner.",
        reason: "Violates brand positioning. Content reviewers often miss prohibited terminology baked into static graphic artwork.",
        detectedValue: "CHEAPEST CLOUD",
        recommendedValue: "Cost-Optimized Enterprise Cloud",
        guidelineReference: `${brand.name} Prohibited Terminology Rule #2`,
      });

      return {
        id: "vis-rep-" + Math.random().toString(36).substring(2, 9),
        imageName,
        timestamp: new Date().toISOString(),
        overallVisualScore: 48,
        contrastScore: 50,
        colorComplianceScore: 40,
        logoComplianceScore: 60,
        ocrBrandScore: 45,
        dominantColors,
        contrastChecks,
        findings,
        ocrExtractedText: ocrText,
        summary: "Visual audit identified 4 critical issues: WCAG AA contrast failure, unapproved neon red background, logo clear-space violation, and prohibited claims in raster text.",
      };
    } else {
      // Compliant Asset Scenario
      dominantColors.push(
        { hex: "#2878F0", rgb: [40, 120, 240], percentage: 45, isBrandApproved: true, closestApprovedColor: "#2878F0", colorDifference: 0 },
        { hex: "#FFFFFF", rgb: [255, 255, 255], percentage: 35, isBrandApproved: true, closestApprovedColor: "#FFFFFF", colorDifference: 0 },
        { hex: "#15265B", rgb: [21, 38, 91], percentage: 15, isBrandApproved: true, closestApprovedColor: "#15265B", colorDifference: 0 },
        { hex: "#E5F2FF", rgb: [229, 242, 255], percentage: 5, isBrandApproved: true, closestApprovedColor: "#E5F2FF", colorDifference: 0 }
      );

      const ratio = this.calculateContrastRatio("#15265B", "#FFFFFF"); // 12.6:1
      contrastChecks.push({
        foreground: "#15265B",
        background: "#FFFFFF",
        ratio,
        wcagAA: true,
        wcagAAA: true,
        wcagAALarge: true,
        status: "pass",
        recommendation: `Exceptional contrast ratio ${ratio}:1 exceeds WCAG AAA requirements.`,
      });

      return {
        id: "vis-rep-" + Math.random().toString(36).substring(2, 9),
        imageName,
        timestamp: new Date().toISOString(),
        overallVisualScore: 96,
        contrastScore: 98,
        colorComplianceScore: 95,
        logoComplianceScore: 95,
        ocrBrandScore: 96,
        dominantColors,
        contrastChecks,
        findings: [],
        ocrExtractedText: "NovaTech Solutions. Resilient Enterprise Hybrid Cloud Architecture with 99.99% SLA Uptime.",
        summary: "All visual elements strictly conform to approved color swatches, WCAG AAA accessibility contrast, and logo clear-space guidelines.",
      };
    }
  }
}
