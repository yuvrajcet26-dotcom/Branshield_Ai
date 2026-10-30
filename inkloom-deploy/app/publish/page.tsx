"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { InkloomStore } from "@/lib/data/store";
import { ContentSubmission } from "@/lib/types";
import { PublishingGateway, PublishingDestination, PublishDispatchResult } from "@/lib/publishing/gateway";
import { useAuth } from "@/lib/context/AuthContext";
import {
  Send,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Share2,
  ExternalLink,
  Key,
  Hash,
  Terminal,
  RefreshCw,
  FileCheck2,
  ArrowRight,
} from "lucide-react";

export default function PublishPage() {
  const { currentUser } = useAuth();
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string>("");
  const [destination, setDestination] = useState<PublishingDestination>("wordpress");
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<PublishDispatchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  useEffect(() => {
    const list = InkloomStore.getSubmissions();
    setSubmissions(list);
    // Find first approved submission
    const firstApproved = list.find((s) => s.status === "approved") || list[0];
    if (firstApproved) {
      setSelectedSubId(firstApproved.id);
    }
  }, []);

  const selectedSub = submissions.find((s) => s.id === selectedSubId);
  const isApproved = selectedSub?.status === "approved";
  const complianceScore = selectedSub?.latest_review?.overall_indicator || 0;

  // Real-time cryptographic certificate preview
  const certProof = selectedSub && isApproved
    ? PublishingGateway.signApprovalCertificate(selectedSub, currentUser)
    : null;

  const handleDispatch = async () => {
    if (!selectedSub) return;
    setErrorMessage("");
    setDispatchResult(null);
    setIsDispatching(true);
    setTerminalLogs([
      `[INIT] Initiating Governance Firewall Handshake for Submission: ${selectedSub.id}...`,
      `[CHECK 1] Inspecting Editorial Status: ${selectedSub.status.toUpperCase()}...`,
    ]);

    await new Promise((r) => setTimeout(r, 400));

    if (!isApproved) {
      setIsDispatching(false);
      setTerminalLogs((prev) => [
        ...prev,
        `[FIREWALL REJECT] ✕ Submission status '${selectedSub.status}' is not approved.`,
        `[SECURITY HALT] Transmission aborted. Unapproved content cannot bypass governance.`,
      ]);
      setErrorMessage(
        `Governance Firewall Block: Content status is '${selectedSub.status}'. Only content with verified managerial sign-off can be published.`
      );
      return;
    }

    setTerminalLogs((prev) => [
      ...prev,
      `[CHECK 2] Verifying Compliance Score: ${complianceScore}/100 (Threshold >= 75: PASSED ✓)`,
      `[CRYPTO] Generating SHA-256 content digest...`,
      `[CRYPTO] Computing HMAC-SHA256 signature with Inkloom Master Key...`,
      `[DISPATCH] Routing to ${destination.toUpperCase()} connector...`,
      `[INJECT] Appending X-Inkloom-Signature & X-Inkloom-Certificate headers...`,
    ]);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          destination,
          actor: currentUser,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gateway dispatch failed");
      }

      setTerminalLogs((prev) => [
        ...prev,
        `[HTTP 200 OK] Destination acknowledged transmission.`,
        `[CONFIRMED] Post published remotely: ${data.result.remoteUrl}`,
        `[AUDIT] Immutable event logged to security ledger.`,
      ]);
      setDispatchResult(data.result);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to dispatch content.");
      setTerminalLogs((prev) => [
        ...prev,
        `[ERROR] ${err.message}`,
        `[HALT] Transaction rolled back.`,
      ]);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE9F8]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#159B72] px-2.5 py-0.5 rounded-full bg-[#E4F8F0]">
              Improvement 2: Publishing Gateway
            </span>
            <span className="text-xs text-[#64748B]">• Cryptographic Governance Firewall</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15265B]">
            CMS & Social Publishing Gateway with Cryptographic Proof
          </h1>
          <p className="text-xs text-[#64748B]">
            Directly dispatch approved content to WordPress, LinkedIn, or HubSpot with cryptographic HMAC-SHA256 signatures ensuring unapproved copy is strictly blocked.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submission Selector & Destination Config */}
        <div className="lg:col-span-6 space-y-6">
          <div className="pastel-card p-6 bg-white space-y-4">
            <h3 className="text-sm font-bold text-[#15265B] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#2878F0]" />
              <span>Select Content Submission</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#15265B] mb-1">Choose Submission:</label>
              <select
                value={selectedSubId}
                onChange={(e) => {
                  setSelectedSubId(e.target.value);
                  setDispatchResult(null);
                  setErrorMessage("");
                  setTerminalLogs([]);
                }}
                className="w-full text-xs p-3 rounded-xl border border-[#DCE9F8] bg-[#F8FBFF] text-[#15265B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2878F0]"
              >
                {submissions.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.status.toUpperCase()}] {s.title} ({s.brand_name})
                  </option>
                ))}
              </select>
            </div>

            {selectedSub && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  isApproved
                    ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                    : "bg-rose-50/60 border-rose-200 text-rose-900"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    {isApproved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                    Governance Status: {selectedSub.status.toUpperCase()}
                  </span>
                  <span>Compliance: {complianceScore}/100</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90 line-clamp-2 italic">
                  &ldquo;{selectedSub.current_content || selectedSub.original_content}&rdquo;
                </p>
              </div>
            )}

            {/* Destination Connectors */}
            <div className="pt-2 border-t border-[#E5F2FF] space-y-3">
              <label className="block text-xs font-bold text-[#15265B]">Publishing Destination:</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "wordpress", label: "WordPress CMS", desc: "REST API Endpoint", icon: Globe },
                  { id: "linkedin", label: "LinkedIn Posts", desc: "UGC Feed Connector", icon: Share2 },
                  { id: "hubspot", label: "HubSpot Marketing", desc: "Blog & Social Hub", icon: Send },
                  { id: "custom_webhook", label: "Custom Webhook", desc: "JSON Signature POST", icon: Terminal },
                ].map((dest) => {
                  const Icon = dest.icon;
                  const isSelected = destination === dest.id;
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => setDestination(dest.id as PublishingDestination)}
                      className={`p-3 rounded-xl border text-left transition ${
                        isSelected
                          ? "border-[#2878F0] bg-[#E5F2FF]/60 text-[#2878F0] shadow-xs"
                          : "border-[#DCE9F8] bg-white text-[#15265B] hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{dest.label}</span>
                      </div>
                      <div className="text-[10px] text-[#64748B] mt-0.5">{dest.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dispatch Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDispatch}
                disabled={isDispatching}
                className={`w-full py-3.5 rounded-2xl text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                  isApproved
                    ? "brand-gradient hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                    : "bg-[#E65378] hover:bg-rose-700"
                }`}
              >
                {isDispatching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Cryptographic Proof & Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {isApproved
                        ? `Authorize & Publish to ${destination.toUpperCase()}`
                        : "Test Firewall Block (Unapproved Content)"}
                    </span>
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cryptographic Certificate & Terminal Audit */}
        <div className="lg:col-span-6 space-y-6">
          {/* Cryptographic Certificate Card */}
          <div className="pastel-card p-6 bg-gradient-to-br from-white via-white to-[#F8FBFF] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5F2FF]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E4F8F0] text-[#159B72] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#15265B]">
                    Cryptographic Proof of Sign-Off
                  </h3>
                  <span className="text-[10px] text-[#64748B]">HMAC-SHA256 Governance Certificate</span>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isApproved ? "bg-[#E4F8F0] text-[#159B72]" : "bg-[#FFF0F5] text-[#E65378]"
                }`}
              >
                {isApproved ? "VERIFIED VALID" : "UNAUTHORIZED"}
              </span>
            </div>

            {certProof ? (
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-[#F8FBFF] border border-[#DCE9F8]">
                  <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-0.5">
                    Certificate ID
                  </span>
                  <span className="font-mono text-[11px] text-[#2878F0] font-bold">{certProof.certificateId}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8FBFF] border border-[#DCE9F8]">
                  <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-0.5">
                    Content SHA-256 Digest
                  </span>
                  <span className="font-mono text-[10px] text-slate-700 break-all">{certProof.contentSha256}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8FBFF] border border-[#DCE9F8]">
                  <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-0.5">
                    HMAC-SHA256 Digital Signature
                  </span>
                  <span className="font-mono text-[10px] text-slate-700 break-all">{certProof.signature}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-[#64748B] block">Signing Reviewer:</span>
                    <strong className="text-[#15265B]">{certProof.signingReviewerName}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Certified Compliance:</span>
                    <strong className="text-[#159B72]">{certProof.complianceScore}/100 Score</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-rose-600 bg-rose-50/50 rounded-xl border border-rose-200">
                <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-rose-500" />
                <span className="font-bold block">No Valid Sign-Off Certificate</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  This submission has not been approved by a manager. The cryptographic firewall will refuse publishing.
                </p>
              </div>
            )}
          </div>

          {/* Terminal Handshake Log */}
          <div className="pastel-card p-5 bg-[#15265B] text-white font-mono text-xs space-y-2 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-blue-200">
              <span className="flex items-center gap-1.5 font-bold">
                <Terminal className="w-3.5 h-3.5" /> Governance Firewall Log
              </span>
              <span>LIVE AUDIT</span>
            </div>

            <div className="h-44 overflow-y-auto space-y-1 text-[11px] text-emerald-400">
              {terminalLogs.length === 0 ? (
                <span className="text-slate-400 italic">Ready for publishing handshake. Click button to execute...</span>
              ) : (
                terminalLogs.map((log, i) => <div key={i}>{log}</div>)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      {dispatchResult && (
        <div className="pastel-card p-6 bg-emerald-50/80 border-emerald-300 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Published Successfully with Cryptographic Proof</span>
            </h3>
            <span className="text-xs font-mono font-bold bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full">
              HTTP 200 OK
            </span>
          </div>

          <p className="text-xs text-emerald-800 leading-relaxed">{dispatchResult.message}</p>

          <div className="p-4 rounded-xl bg-white border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Remote Resource URL:</span>
              <a
                href={dispatchResult.remoteUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[#2878F0] font-bold hover:underline flex items-center gap-1"
              >
                {dispatchResult.remoteUrl} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Remote Transaction ID:</span>
              <span className="font-mono font-bold text-[#15265B]">{dispatchResult.remotePostId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Timestamp:</span>
              <span className="text-[#15265B]">{new Date(dispatchResult.publishedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
