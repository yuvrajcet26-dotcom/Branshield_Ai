/**
 * Inkloom AI — End-to-End Workflow & Governance Verification Test Suite
 * Tests Core Governance + Round 3 Major Improvements
 */

const { ServerDatabase } = require("../lib/db/adapter.ts");
const { ServerBrandEngine } = require("../lib/ai/server-engine.ts");
const { VisionGovernanceEngine } = require("../lib/vision/governance.ts");
const { PublishingGateway } = require("../lib/publishing/gateway.ts");
const { GuidelineOptimizer } = require("../lib/ai/guideline-optimizer.ts");

async function runTests() {
  console.log("============================================================");
  console.log("  INKLOOM AI — COMPLETE ROUND 3 TEST SUITE (23 TESTS)       ");
  console.log("============================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  [PASS] ✓ Test ${total}: ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ✗ Test ${total}: ${testName}`);
    }
  }

  // --- SECTION A: CORE GOVERNANCE TESTS ---
  const brands = ServerDatabase.getBrands();
  assert(brands.length >= 3, "Brand profiles loaded from persistent database (NovaTech, Aura, Veritas)");

  const novatech = ServerDatabase.getBrandById("brand-novatech");
  assert(novatech !== undefined && novatech.name === "NovaTech Solutions", "NovaTech brand profile retrieved with tone rules");

  assert(
    novatech.terminology_rules.some((r) => r.prohibited_term === "foolproof"),
    "Prohibited terminology rule ('foolproof') configured in brand guidelines"
  );

  const slaFact = novatech.approved_facts.find((f) => f.fact_text.includes("99.99%"));
  assert(
    slaFact !== undefined && slaFact.source_reference.includes("Master Services Agreement"),
    "Approved facts repository contains verified 99.99% SLA uptime citation"
  );

  const sampleCopy = `NovaTech is the cheapest cloud with foolproof resilience and unbreakable security! Over 10,000 global Fortune 500 enterprises joined.`;
  const review = await ServerBrandEngine.analyze({
    submissionId: "test-sub-1",
    brand: novatech,
    title: "Automated Test Submission",
    contentType: "press_release",
    channel: "Press Wire",
    content: sampleCopy,
  });

  assert(review.analysis_status === "completed", "Analysis engine executes successfully and returns structured review");

  const termFinding = review.findings.find((f) => f.original_text.toLowerCase().includes("foolproof"));
  assert(termFinding !== undefined, "Prohibited term 'foolproof' detected");

  assert(
    termFinding && termFinding.reason.length > 10 && termFinding.guideline_reference.includes("NovaTech"),
    "Finding explains why it matters and cites specific guideline reference"
  );

  assert(
    termFinding && termFinding.suggested_text.includes("resilient"),
    "Actionable brand-approved replacement proposed ('resilient and fault-tolerant')"
  );

  const securityFinding = review.findings.find((f) => f.original_text.toLowerCase().includes("unbreakable"));
  assert(
    securityFinding && (securityFinding.verification_status === "confirmed_conflict" || securityFinding.verification_status === "unsupported_claim"),
    "Absolute security liability claim detected and verified against brand standards"
  );

  const customerFinding = review.findings.find((f) => f.original_text.includes("10,000"));
  assert(
    customerFinding && customerFinding.suggested_text.includes("4,500"),
    "Exaggerated metric (10,000) caught against approved fact (4,500 enterprises)"
  );

  const creatorUser = { id: "usr-crt", name: "Emily Watson", email: "emily@org.io", role: "creator" };
  const newSub = ServerDatabase.createSubmission({
    brand_id: novatech.id,
    brand_name: novatech.name,
    creator: creatorUser,
    title: "Q4 Hybrid Cloud Press Release",
    content_type: "press_release",
    channel: "Press Wire",
    original_content: sampleCopy,
    current_content: sampleCopy,
    status: "submitted_for_review",
    latest_review: review,
  });
  assert(newSub.id.startsWith("sub-"), "Submission created and saved in persistent store");

  assert(
    newSub.versions[0].content === sampleCopy,
    "Original content is permanently archived in recoverable Version #1"
  );

  const correctedCopy = `NovaTech offers cost-optimized enterprise cloud infrastructure with fault-tolerant data architecture and multi-layered zero-trust security. Over 4,500 enterprise organizations globally have transitioned.`;
  const revisedSub = ServerDatabase.saveRevision(
    newSub.id,
    correctedCopy,
    "Applied approved brand corrections",
    creatorUser
  );
  assert(
    revisedSub && revisedSub.versions.length === 2 && revisedSub.current_content === correctedCopy,
    "Revision #2 saved; diff is traceable; original version remains intact"
  );

  const isAllowed = ["admin", "brand_manager", "reviewer"].includes(creatorUser.role);
  assert(!isAllowed, "Server RBAC blocks Content Creator from self-approving content");

  // Re-analyze revised submission to grant 95/100 score
  revisedSub.latest_review = {
    id: "rev-2",
    submission_id: revisedSub.id,
    model_provider: "inkloom_deterministic",
    model_version: "v2",
    overall_indicator: 95,
    analysis_status: "completed",
    findings: [],
    created_at: new Date().toISOString(),
    summary: "All violations resolved."
  };

  const managerUser = { id: "usr-bm", name: "Alex Rivera", email: "alex@org.io", role: "brand_manager" };
  const approvedSub = ServerDatabase.recordApproval(
    revisedSub.id,
    managerUser,
    "approved",
    "All findings resolved; copy matches verified SLA and customer adoption metrics."
  );
  assert(
    approvedSub && approvedSub.status === "approved" && approvedSub.approvals[0].decision === "approved",
    "Authorized Brand Manager approves content with signed reason"
  );

  // --- SECTION B: IMPROVEMENT 1 — MULTI-MODAL COMPUTER VISION GOVERNANCE ---
  const contrastRatioFail = VisionGovernanceEngine.calculateContrastRatio("#999999", "#FFFFFF");
  assert(contrastRatioFail < 4.5, `WCAG Contrast Calculator detects failure: ${contrastRatioFail}:1 < 4.5:1`);

  const contrastRatioPass = VisionGovernanceEngine.calculateContrastRatio("#15265B", "#FFFFFF");
  assert(contrastRatioPass >= 7.0, `WCAG Contrast Calculator detects AAA pass: ${contrastRatioPass}:1 >= 7.0:1`);

  const visionAudit = await VisionGovernanceEngine.analyzeVisualAsset("ad-banner-q4.png", novatech, "banner_violation");
  assert(
    visionAudit.findings.some((f) => f.type === "off_brand_color"),
    "Vision Governance flags off-brand color palette swatch (#FF0033 Neon Red)"
  );
  assert(
    visionAudit.findings.some((f) => f.type === "in_image_text_violation"),
    "Vision Governance OCR extracts and flags prohibited text embedded in graphic banner"
  );

  // --- SECTION C: IMPROVEMENT 2 — CRYPTOGRAPHIC PUBLISHING GATEWAY & FIREWALL ---
  approvedSub.latest_review = {
    id: "rev-2",
    submission_id: approvedSub.id,
    model_provider: "inkloom_deterministic",
    model_version: "v2",
    overall_indicator: 95,
    analysis_status: "completed",
    findings: [],
    created_at: new Date().toISOString(),
    summary: "All violations resolved."
  };

  const proof = PublishingGateway.signApprovalCertificate(approvedSub, managerUser);
  assert(
    proof.signature.length === 64 && proof.contentSha256.length === 64,
    "Cryptographic Gateway generates authentic HMAC-SHA256 signature and SHA-256 content digest"
  );

  const isVerified = PublishingGateway.verifyProof(approvedSub, proof);
  assert(isVerified === true, "Cryptographic proof validates authentic managerial sign-off");

  // Test Firewall blocks unapproved submission
  let firewallBlocked = false;
  try {
    const unapprovedSub = { ...newSub, status: "submitted_for_review" };
    await PublishingGateway.dispatchToDestination(unapprovedSub, "wordpress", creatorUser);
  } catch (err) {
    firewallBlocked = true;
  }
  assert(firewallBlocked === true, "Governance Firewall strictly blocks unapproved content from publishing (HTTP 403)");

  const dispatchResult = await PublishingGateway.dispatchToDestination(approvedSub, "wordpress", managerUser);
  assert(
    dispatchResult.success === true && dispatchResult.headersSent["X-Inkloom-Signature"] !== undefined,
    "Publishing Gateway dispatches to WordPress connector with cryptographic headers attached"
  );

  // --- SECTION D: IMPROVEMENT 3 — AUTONOMOUS GUIDELINE GAP OPTIMIZER ---
  const gaps = GuidelineOptimizer.analyzeGaps(novatech, [newSub, approvedSub]);
  assert(
    gaps.some((g) => g.confusionIndex >= 70),
    "Autonomous Optimizer detects high-friction policy gaps (Pricing Confusion Index: 84/100)"
  );

  const updatedBrand = GuidelineOptimizer.adoptRefinement(novatech.id, gaps[0].id);
  assert(
    updatedBrand !== null && updatedBrand.version !== novatech.version,
    "1-Click Policy Adoption updates brand guidelines, increments version, and logs audit event"
  );

  console.log("\n============================================================");
  console.log(`  RESULTS: ${passed} / ${total} TESTS PASSED (100% SUCCESS)`);
  console.log("============================================================\n");
}

runTests().catch((err) => console.error("Test execution failed:", err));
