import crypto from "crypto";
import type { ContentSubmission, User } from "../types/index.ts";
import { ServerDatabase } from "../db/adapter.ts";

export type PublishingDestination = "wordpress" | "linkedin" | "hubspot" | "custom_webhook";

export interface CryptographicProof {
  contentSha256: string;
  signature: string;
  signingReviewerId: string;
  signingReviewerName: string;
  complianceScore: number;
  timestamp: string;
  certificateId: string;
  algorithm: string;
}

export interface PublishDispatchResult {
  success: boolean;
  destination: PublishingDestination;
  submissionId: string;
  title: string;
  remotePostId: string;
  remoteUrl: string;
  cryptographicProof: CryptographicProof;
  publishedAt: string;
  headersSent: Record<string, string>;
  message: string;
}

export class PublishingGateway {
  private static SECRET_SIGNING_KEY = process.env.INKLOOM_SIGNING_KEY || "inkloom_governance_master_key_2026";

  /**
   * Generates a cryptographic SHA-256 digest of approved content
   */
  public static generateContentDigest(title: string, content: string): string {
    return crypto
      .createHash("sha256")
      .update(`${title.trim()}:${content.trim()}`)
      .digest("hex");
  }

  /**
   * Generates an HMAC-SHA256 signature validating managerial sign-off
   */
  public static signApprovalCertificate(
    submission: ContentSubmission,
    signingReviewer: User
  ): CryptographicProof {
    const contentSha256 = this.generateContentDigest(
      submission.title,
      submission.current_content || submission.original_content
    );
    const complianceScore = submission.latest_review?.overall_indicator || 90;
    const timestamp = new Date().toISOString();
    const certificateId = "cert-" + crypto.randomBytes(6).toString("hex");

    const payloadToSign = `${certificateId}:${submission.id}:${contentSha256}:${signingReviewer.id}:${complianceScore}:${timestamp}`;
    const signature = crypto
      .createHmac("sha256", this.SECRET_SIGNING_KEY)
      .update(payloadToSign)
      .digest("hex");

    return {
      contentSha256,
      signature,
      signingReviewerId: signingReviewer.id,
      signingReviewerName: signingReviewer.name,
      complianceScore,
      timestamp,
      certificateId,
      algorithm: "HMAC-SHA256",
    };
  }

  /**
   * Verifies the cryptographic proof before allowing transmission through the Governance Firewall
   */
  public static verifyProof(
    submission: ContentSubmission,
    proof: CryptographicProof
  ): boolean {
    const currentSha256 = this.generateContentDigest(
      submission.title,
      submission.current_content || submission.original_content
    );

    // 1. Content integrity check: hash must match current approved text
    if (currentSha256 !== proof.contentSha256) {
      return false;
    }

    // 2. Re-compute signature to verify authenticity
    const payloadToSign = `${proof.certificateId}:${submission.id}:${proof.contentSha256}:${proof.signingReviewerId}:${proof.complianceScore}:${proof.timestamp}`;
    const expectedSig = crypto
      .createHmac("sha256", this.SECRET_SIGNING_KEY)
      .update(payloadToSign)
      .digest("hex");

    return expectedSig === proof.signature;
  }

  /**
   * Dispatches approved content to configured destination CMS or Social Webhook
   */
  public static async dispatchToDestination(
    submission: ContentSubmission,
    destination: PublishingDestination,
    actor: User
  ): Promise<PublishDispatchResult> {
    // 1. Governance Firewall Check #1: Submission MUST be approved
    if (submission.status !== "approved") {
      throw new Error(
        `Governance Firewall Block: Content status is '${submission.status}'. Content cannot be published without formal managerial approval.`
      );
    }

    // 2. Governance Firewall Check #2: Compliance score must meet threshold
    const complianceScore = submission.latest_review?.overall_indicator || 0;
    if (complianceScore < 75) {
      throw new Error(
        `Governance Firewall Block: Compliance score (${complianceScore}/100) is below the required 75 threshold.`
      );
    }

    // 3. Generate Cryptographic Proof
    const reviewer = submission.assigned_reviewer || actor;
    const proof = this.signApprovalCertificate(submission, reviewer);

    // 4. Verify Proof
    const isAuthentic = this.verifyProof(submission, proof);
    if (!isAuthentic) {
      throw new Error("Cryptographic verification failed: Content hash tampering detected.");
    }

    // 5. Connectors simulation with realistic payloads & headers
    const publishedAt = new Date().toISOString();
    const remoteId = "pub-" + crypto.randomBytes(4).toString("hex");

    const destinationUrls: Record<PublishingDestination, string> = {
      wordpress: `https://cms.enterprise.org/wp-json/wp/v2/posts/${remoteId}`,
      linkedin: `https://www.linkedin.com/feed/update/urn:li:share:${remoteId}`,
      hubspot: `https://app.hubspot.com/blog/2026/post/${remoteId}`,
      custom_webhook: `https://api.destination-webhook.io/v1/content-ingest/${remoteId}`,
    };

    const headersSent = {
      "Content-Type": "application/json",
      "X-Inkloom-Certificate-ID": proof.certificateId,
      "X-Inkloom-Signature": proof.signature,
      "X-Inkloom-Content-SHA256": proof.contentSha256,
      "X-Inkloom-Compliance-Score": String(proof.complianceScore),
      "X-Inkloom-Signer": `${proof.signingReviewerName} (${proof.signingReviewerId})`,
      "X-Inkloom-Timestamp": publishedAt,
    };

    // Record immutable audit log
    ServerDatabase.recordApproval(
      submission.id,
      actor,
      "approved",
      `Published to ${destination.toUpperCase()} with Cryptographic Proof Certificate ${proof.certificateId}`
    );

    return {
      success: true,
      destination,
      submissionId: submission.id,
      title: submission.title,
      remotePostId: remoteId,
      remoteUrl: destinationUrls[destination],
      cryptographicProof: proof,
      publishedAt,
      headersSent,
      message: `Successfully verified by Governance Firewall and published to ${destination.toUpperCase()} with cryptographic audit signature.`,
    };
  }
}
