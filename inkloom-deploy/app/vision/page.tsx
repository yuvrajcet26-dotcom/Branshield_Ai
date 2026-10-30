"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { InkloomStore } from "@/lib/data/store";
import { Brand } from "@/lib/types";
import { VisionGovernanceEngine, VisualAuditReport, VisualFinding } from "@/lib/vision/governance";
import {
  Eye,
  Palette,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Download,
  UploadCloud,
  FileCheck2,
  Sliders,
  Layers,
  ChevronRight,
  Maximize2,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function VisionPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("brand-novatech");
  const [currentScenario, setCurrentScenario] = useState<"banner_violation" | "compliant_graphic">("banner_violation");
  const [report, setReport] = useState<VisualAuditReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  useEffect(() => {
    const bList = InkloomStore.getBrands();
    setBrands(bList);
    if (bList.length > 0) {
      loadVisualAudit(bList[0], "banner_violation");
    }
  }, []);

  const loadVisualAudit = async (brand: Brand, scenario: "banner_violation" | "compliant_graphic") => {
    setIsAnalyzing(true);
    setCurrentScenario(scenario);
    // Simulating vision analysis pipeline
    await new Promise((r) => setTimeout(r, 400));
    const rep = await VisionGovernanceEngine.analyzeVisualAsset(
      scenario === "banner_violation" ? "Q4_Ad_Banner_Draft.png" : "Enterprise_Approved_Asset.png",
      brand,
      scenario
    );
    setReport(rep);
    setIsAnalyzing(false);
  };

  const handleBrandChange = (newBrandId: string) => {
    setSelectedBrandId(newBrandId);
    const b = brands.find((x) => x.id === newBrandId) || brands[0];
    if (b) loadVisualAudit(b, currentScenario);
  };

  const selectedBrand = brands.find((b) => b.id === selectedBrandId) || brands[0];

  const handleExportReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visual-brand-audit-${report.imageName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE9F8]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8064F5] px-2.5 py-0.5 rounded-full bg-[#F2EFFF]">
              Improvement 1: Multi-Modal Vision
            </span>
            <span className="text-xs text-[#64748B]">• Computer Vision Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15265B]">
            Visual Identity & Computer Vision Governance Studio
          </h1>
          <p className="text-xs text-[#64748B]">
            Automatically inspect brand asset color swatches, calculate WCAG 2.2 AA contrast ratios, verify logo clear-space rules, and run OCR on embedded graphic text.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCE9F8] bg-white text-[#15265B] text-xs font-bold hover:bg-[#F8FBFF] transition shadow-xs"
        >
          <Download className="w-4 h-4 text-[#2878F0]" />
          <span>Export Visual Audit (JSON)</span>
        </button>
      </div>

      {/* Control Bar: Brand selector & Preset scenarios */}
      <div className="pastel-card p-5 bg-[#F8FBFF] border-[#BED8F6] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-[#15265B]">Select Brand Guidelines:</label>
          <select
            value={selectedBrandId}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="text-xs py-2 px-3.5 rounded-xl border border-[#DCE9F8] bg-white text-[#15265B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2878F0]"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} (v{b.version})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#64748B] font-semibold mr-1">Test Scenarios:</span>
          <button
            onClick={() => loadVisualAudit(selectedBrand, "banner_violation")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              currentScenario === "banner_violation"
                ? "bg-[#E65378] text-white shadow-xs"
                : "bg-white border border-[#FECDD3] text-[#E65378] hover:bg-rose-50"
            }`}
          >
            Violating Ad Banner (Low Contrast + Off-Brand Colors)
          </button>
          <button
            onClick={() => loadVisualAudit(selectedBrand, "compliant_graphic")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              currentScenario === "compliant_graphic"
                ? "bg-[#159B72] text-white shadow-xs"
                : "bg-white border border-[#A7F3D0] text-[#159B72] hover:bg-emerald-50"
            }`}
          >
            Compliant Enterprise Graphic (WCAG AAA Passed)
          </button>
        </div>
      </div>

      {/* Main Analysis Layout */}
      {report && (
        <div className="space-y-6">
          {/* Executive Score Summary Banner */}
          <div className="pastel-card p-6 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5F2FF]">
              <div className="text-center px-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                  Overall Visual Score
                </span>
                <span
                  className={`text-3xl font-black ${
                    report.overallVisualScore >= 80 ? "text-[#159B72]" : "text-[#E65378]"
                  }`}
                >
                  {report.overallVisualScore}/100
                </span>
              </div>
              <div className="text-center px-2 pt-2 sm:pt-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                  Contrast Accessibility
                </span>
                <span
                  className={`text-2xl font-black ${
                    report.contrastScore >= 80 ? "text-[#159B72]" : "text-[#E65378]"
                  }`}
                >
                  {report.contrastScore}%
                </span>
              </div>
              <div className="text-center px-2 pt-2 sm:pt-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                  Color Compliance
                </span>
                <span
                  className={`text-2xl font-black ${
                    report.colorComplianceScore >= 80 ? "text-[#159B72]" : "text-[#E65378]"
                  }`}
                >
                  {report.colorComplianceScore}%
                </span>
              </div>
              <div className="text-center px-2 pt-2 sm:pt-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                  Logo Clear-Space
                </span>
                <span
                  className={`text-2xl font-black ${
                    report.logoComplianceScore >= 80 ? "text-[#159B72]" : "text-[#E9A23B]"
                  }`}
                >
                  {report.logoComplianceScore}%
                </span>
              </div>
              <div className="text-center px-2 pt-2 sm:pt-0 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                  In-Image OCR Claims
                </span>
                <span
                  className={`text-2xl font-black ${
                    report.ocrBrandScore >= 80 ? "text-[#159B72]" : "text-[#E65378]"
                  }`}
                >
                  {report.ocrBrandScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Visual Canvas & Computer Vision Bounding Boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Canvas Simulator */}
            <div className="lg:col-span-7 pastel-card p-6 bg-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5F2FF]">
                <h3 className="text-sm font-bold text-[#15265B] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#2878F0]" />
                  <span>Computer Vision Asset View & Spatial Inspection</span>
                </h3>
                <span className="text-xs font-mono font-bold text-slate-500">{report.imageName}</span>
              </div>

              {/* Graphic Mockup Area */}
              <div
                className={`relative w-full h-80 rounded-2xl overflow-hidden border-2 transition-all p-6 flex flex-col justify-between ${
                  currentScenario === "banner_violation"
                    ? "bg-gradient-to-r from-[#FF0033] via-[#D60029] to-[#990000] border-rose-300"
                    : "bg-gradient-to-r from-[#2878F0] via-[#1E62C9] to-[#15265B] border-emerald-300"
                }`}
              >
                {/* Logo with Clearspace box */}
                <div
                  className={`relative inline-block p-1.5 rounded-lg border-2 border-dashed transition-all ${
                    currentScenario === "banner_violation"
                      ? "border-amber-400 bg-amber-400/20"
                      : "border-emerald-300 bg-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 text-white font-extrabold text-sm px-2 py-1 bg-black/30 rounded">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>NovaTech</span>
                  </div>
                  {currentScenario === "banner_violation" && (
                    <span className="absolute -bottom-5 left-0 text-[10px] bg-amber-500 text-white font-bold px-1.5 rounded whitespace-nowrap">
                      ⚠ Clear Space: 8px (Min 24px Req)
                    </span>
                  )}
                </div>

                {/* Banner Copy Area */}
                <div className="space-y-2 max-w-md">
                  <div
                    className={`p-2 rounded-lg border-2 border-dashed ${
                      currentScenario === "banner_violation"
                        ? "border-rose-400 bg-black/40 text-white"
                        : "border-emerald-400 bg-white/20 text-white"
                    }`}
                  >
                    <h2 className="text-xl font-black tracking-tight leading-tight">
                      {currentScenario === "banner_violation"
                        ? "CHEAPEST CLOUD INFRASTRUCTURE IN THE WORLD"
                        : "Resilient Hybrid Cloud Infrastructure"}
                    </h2>
                    {currentScenario === "banner_violation" && (
                      <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded inline-block mt-1">
                        ⚠ In-Image Violation: Prohibited Term & Absolute Superlative
                      </span>
                    )}
                  </div>

                  {/* Subheader with Contrast flag */}
                  <div
                    className={`p-2 rounded-lg border-2 border-dashed ${
                      currentScenario === "banner_violation"
                        ? "border-rose-400 bg-white text-[#999999]"
                        : "border-emerald-400 bg-white text-[#15265B]"
                    }`}
                  >
                    <p className="text-xs font-semibold">
                      {currentScenario === "banner_violation"
                        ? "100% Unbreakable security guaranteed for everyone."
                        : "Delivering 99.99% SLA uptime with zero-trust architecture."}
                    </p>
                    {currentScenario === "banner_violation" && (
                      <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded inline-block mt-1">
                        ⚠ Low Contrast: 2.84:1 (WCAG AA Requires 4.5:1)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-white/80 font-mono text-right">
                  1200 × 630 px • RGB Color Space
                </div>
              </div>
            </div>

            {/* Extracted Dominant Color Swatches */}
            <div className="lg:col-span-5 pastel-card p-6 bg-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5F2FF]">
                <h3 className="text-sm font-bold text-[#15265B] flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#8064F5]" />
                  <span>Dominant Color Palette vs Approved Brand Rules</span>
                </h3>
              </div>

              <div className="space-y-3">
                {report.dominantColors.map((swatch, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${
                      swatch.isBrandApproved
                        ? "border-emerald-200 bg-emerald-50/40"
                        : "border-rose-200 bg-rose-50/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm border border-slate-300"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <div>
                        <div className="font-mono font-bold text-xs text-[#15265B] flex items-center gap-1.5">
                          <span>{swatch.hex}</span>
                          <span className="text-[10px] font-sans font-normal text-slate-500">
                            ({swatch.percentage}% pixel area)
                          </span>
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {swatch.isBrandApproved ? (
                            <span className="text-[#159B72] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Approved Brand Palette
                            </span>
                          ) : (
                            <span className="text-[#E65378] font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Off-Brand Swatch (Replace with {swatch.closestApprovedColor})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        swatch.isBrandApproved ? "bg-[#E4F8F0] text-[#159B72]" : "bg-[#FFF0F5] text-[#E65378]"
                      }`}
                    >
                      {swatch.isBrandApproved ? "PASSED" : "VIOLATION"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Contrast Evaluation Card */}
              <div className="pt-2 border-t border-[#E5F2FF]">
                <h4 className="text-xs font-bold text-[#15265B] mb-2">WCAG 2.2 Contrast Ratio Audit:</h4>
                {report.contrastChecks.map((chk, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      chk.status === "pass"
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                        : "bg-rose-50 text-rose-900 border border-rose-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Contrast: {chk.ratio}:1</span>
                      <span className="uppercase text-[10px] font-black">{chk.status === "pass" ? "WCAG AAA ✓" : "FAIL ✕"}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{chk.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Findings List */}
          <div className="pastel-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5F2FF]">
              <h3 className="text-sm font-bold text-[#15265B] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2878F0]" />
                <span>Detected Visual Findings ({report.findings.length})</span>
              </h3>
            </div>

            {report.findings.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#159B72] bg-[#E4F8F0]/30 rounded-2xl border border-[#A7F3D0]">
                <CheckCircle2 className="w-8 h-8 text-[#159B72] mx-auto mb-2" />
                <span className="font-bold text-sm block">100% Visual Brand Compliance</span>
                <p className="text-[#64748B] mt-1">This graphic passes all color palette checks, WCAG AA contrast, logo clear-space, and OCR rules.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {report.findings.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl border border-[#DCE9F8] bg-[#F8FBFF] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#E65378] bg-[#FFF0F5] px-2 py-0.5 rounded border border-[#FECDD3] text-[10px] uppercase">
                          {f.type.replace("_", " ")}
                        </span>
                        <h4 className="font-bold text-[#15265B]">{f.description}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-rose-700 bg-red-100 px-2 py-0.5 rounded">
                        {f.severity.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[#64748B] text-[11px] leading-relaxed">
                      <strong className="text-[#15265B]">Why this matters:</strong> {f.reason}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                        <strong className="block text-[10px] text-rose-600 uppercase">Detected:</strong>
                        {f.detectedValue}
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <strong className="block text-[10px] text-emerald-600 uppercase">Recommended Fix:</strong>
                        {f.recommendedValue}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-1 border-t border-[#E5F2FF]">
                      <strong className="text-[#15265B]">Rule Citation:</strong> {f.guidelineReference}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
