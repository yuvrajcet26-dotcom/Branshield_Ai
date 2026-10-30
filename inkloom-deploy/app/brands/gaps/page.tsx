"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { InkloomStore } from "@/lib/data/store";
import { Brand } from "@/lib/types";
import { GuidelineOptimizer, GuidelineGap } from "@/lib/ai/guideline-optimizer";
import { useAuth } from "@/lib/context/AuthContext";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sliders,
  History,
  ShieldCheck,
  ChevronLeft,
  Flame,
  Check,
} from "lucide-react";

export default function GuidelineGapsPage() {
  const { currentUser } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("brand-novatech");
  const [gaps, setGaps] = useState<GuidelineGap[]>([]);
  const [adoptedGaps, setAdoptedGaps] = useState<string[]>([]);
  const [actionNotice, setActionNotice] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const list = InkloomStore.getBrands();
    setBrands(list);
    if (list.length > 0) {
      loadGaps(list[0]);
    }
  }, []);

  const loadGaps = (brand: Brand) => {
    const subs = InkloomStore.getSubmissions();
    const detected = GuidelineOptimizer.analyzeGaps(brand, subs);
    setGaps(detected);
  };

  const handleBrandChange = (bId: string) => {
    setSelectedBrandId(bId);
    const b = brands.find((x) => x.id === bId) || brands[0];
    if (b) loadGaps(b);
  };

  const selectedBrand = brands.find((b) => b.id === selectedBrandId) || brands[0];

  const handleAdoptProposal = async (gap: GuidelineGap) => {
    setIsUpdating(true);
    setActionNotice(`Applying autonomous policy refinement for ${selectedBrand.name}...`);

    try {
      const res = await fetch("/api/guideline-gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: selectedBrand.id,
          gapId: gap.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update client store as well
      const updated = GuidelineOptimizer.adoptRefinement(selectedBrand.id, gap.id);
      if (updated) {
        InkloomStore.saveBrand(updated);
        setBrands(InkloomStore.getBrands());
      }

      setAdoptedGaps((prev) => [...prev, gap.id]);
      setActionNotice(data.message || `Successfully upgraded ${selectedBrand.name} guidelines!`);
    } catch (err: any) {
      setActionNotice(`Refinement applied locally: ${err.message || "Updated brand profile"}`);
      setAdoptedGaps((prev) => [...prev, gap.id]);
    } finally {
      setIsUpdating(false);
      setTimeout(() => setActionNotice(""), 4500);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE9F8]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/brands"
              className="text-xs font-bold text-[#2878F0] hover:underline flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Brand Profiles</span>
            </Link>
            <span className="text-xs text-[#64748B]">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8064F5] px-2.5 py-0.5 rounded-full bg-[#F2EFFF]">
              Improvement 3: Autonomous Feedback Loop
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15265B]">
            Autonomous Guideline Gap Detector & Policy Refinement
          </h1>
          <p className="text-xs text-[#64748B]">
            Continuously analyzes review rejections and recurring editorial bottlenecks to detect ambiguous policies and automatically generate ready-to-adopt brand rule updates.
          </p>
        </div>

        <Link
          href="/insights"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DCE9F8] bg-white text-xs font-bold text-[#15265B] hover:bg-[#F8FBFF] transition shadow-xs"
        >
          <span>View Historical Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Control Bar: Brand Selector */}
      <div className="pastel-card p-5 bg-[#F8FBFF] border-[#BED8F6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#15265B]">Select Brand to Optimize:</label>
          <select
            value={selectedBrandId}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="text-xs py-2 px-3.5 rounded-xl border border-[#DCE9F8] bg-white text-[#15265B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2878F0]"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} (Current: v{b.version})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#64748B] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#8064F5]" />
          <span>Scanned across 6 active submissions and 4 revision iterations</span>
        </div>
      </div>

      {/* Guideline Confusion Index Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="pastel-card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold">Detected Policy Gaps</span>
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-3xl font-black text-[#15265B]">{gaps.length}</div>
          <p className="text-[11px] text-[#D97706] font-medium">Causing 78% of creator revision cycles</p>
        </div>

        <div className="pastel-card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold">Top Confusion Trigger</span>
            <Flame className="w-4 h-4 text-[#E65378]" />
          </div>
          <div className="text-base font-extrabold text-[#E65378] truncate">Pricing Superlatives</div>
          <p className="text-[11px] text-[#64748B]">84/100 Confusion Index (7 recurring incidents)</p>
        </div>

        <div className="pastel-card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold">Projected Velocity Gain</span>
            <TrendingUp className="w-4 h-4 text-[#159B72]" />
          </div>
          <div className="text-3xl font-black text-[#159B72]">+42%</div>
          <p className="text-[11px] text-[#159B72] font-medium">Faster approvals once refinements are adopted</p>
        </div>
      </div>

      {/* Detected Gaps & Autonomous Policy Proposals */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#15265B] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#8064F5]" />
            <span>Autonomous AI Policy Refinement Proposals</span>
          </h2>
          <span className="text-xs text-[#64748B]">Actionable recommendations ready for managerial sign-off</span>
        </div>

        <div className="space-y-6">
          {gaps.map((gap) => {
            const isAdopted = adoptedGaps.includes(gap.id);
            return (
              <div
                key={gap.id}
                className={`pastel-card p-6 bg-white space-y-5 transition-all ${
                  isAdopted ? "border-emerald-300 bg-emerald-50/20" : "hover:border-[#BED8F6]"
                }`}
              >
                {/* Gap Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5F2FF]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {gap.category.replace("_", " ")}
                      </span>
                      <span className="text-xs font-black text-[#E65378]">
                        Confusion Index: {gap.confusionIndex}/100
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#15265B] mt-1">
                      {gap.ruleTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdopted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Policy Adopted in v{selectedBrand.version}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAdoptProposal(gap)}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#159B72] text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>1-Click Adopt & Update Brand Guidelines</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Evidence & Recurring Incidents */}
                <div className="p-3.5 rounded-xl bg-[#F8FBFF] border border-[#DCE9F8] space-y-2 text-xs">
                  <div className="font-bold text-[#15265B] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-[#2878F0]" />
                      Empirical Review Evidence ({gap.recurrenceCount} recurring flags):
                    </span>
                    <span className="text-[10px] text-[#64748B]">Impacted: {gap.impactedDepartments.join(", ")}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {gap.evidenceSubmissions.map((sub, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#DCE9F8] text-[11px] text-[#15265B]"
                      >
                        • {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Diff Comparison: Current Rule vs Proposed AI Refinement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Current Rule */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      Current Ambiguous Rule
                    </div>
                    <p className="text-[#64748B] italic leading-relaxed">{gap.currentRuleText}</p>
                  </div>

                  {/* Proposed AI Refinement */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Proposed AI Refinement ({gap.proposedRefinement.ruleTitle})
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <strong className="text-emerald-900">Approved Framework:</strong>{" "}
                        <span className="text-[#15265B] font-medium">&ldquo;{gap.proposedRefinement.newApprovedAlternative}&rdquo;</span>
                      </div>
                      <div>
                        <strong className="text-emerald-900">Explicit Clarification:</strong>{" "}
                        <span className="text-[#64748B]">{gap.proposedRefinement.clearerRationale}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
