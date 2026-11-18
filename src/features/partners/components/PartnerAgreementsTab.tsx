import React from "react";
import { toast } from "@/components/common/ToastMessage";
import {
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  Landmark,
  Award,
} from "lucide-react";

export interface PartnerAgreementsTabProps {
  partnerType: "agent" | "representative";
  partnerName: string;
  partnerCode: string;
}

export const PartnerAgreementsTab: React.FC<PartnerAgreementsTabProps> = ({
  partnerType,
  partnerName,
  partnerCode,
}) => {
  const isAgent = partnerType === "agent";

  const handleDownloadAgreement = (docName: string) => {
    toast.success("Document Download Initiated", {
      description: `Downloading ${docName} for ${partnerName} (${partnerCode}).`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Governance & Contract Status Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Column: Contractual Agreement Terms */}
        <div className="rounded-2xl border border-brand-border/80 bg-white p-6 shadow-xs sm:rounded-[24px] lg:col-span-7">
          <div className="mb-4 flex items-center justify-between border-b border-brand-border/70 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  {isAgent ? "Agency Representation Agreement" : "Regional Diplomatic Mandate"}
                </h3>
                <p className="text-xs text-text-muted">Legally binding contract under Avis World College Board</p>
              </div>
            </div>

            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              Contract Active
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/60 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Contract Number</span>
                <p className="mt-1 font-mono text-xs font-bold text-text-primary">
                  AWC-CON-{partnerCode.replace("AWC-", "")}-2026
                </p>
              </div>

              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/60 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Effective Period</span>
                <p className="mt-1 text-xs font-bold text-text-primary">
                  01 Feb 2024 – 31 Jan 2027 (3 Years)
                </p>
              </div>

              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/60 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Commission Structure
                </span>
                <p className="mt-1 text-xs font-bold text-burgundy-primary">
                  {isAgent ? "15.0% First Semester Net Tuition" : "Executive Liaison Stipend & Overriding 2.5%"}
                </p>
              </div>

              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/60 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Settlement Cycle</span>
                <p className="mt-1 text-xs font-bold text-text-primary">Net 30 Days Post-Census</p>
              </div>
            </div>

            {/* Compliance Bullet Points */}
            <div className="rounded-xl border border-brand-border/60 bg-brand-bg/30 p-4">
              <h4 className="font-bold text-text-primary">Key Contractual Standards:</h4>
              <ul className="mt-2 space-y-1.5 text-text-secondary">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Full ethical adherence to International Student Recruitment Standards (ISRS).</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Mandatory visa compliance verification prior to Form I-20 / CAS issuance.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Annual re-certification audit conducted by Avis Quality & Governance Council.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Banking & Disbursements */}
        <div className="rounded-2xl border border-brand-border/80 bg-white p-6 shadow-xs sm:rounded-[24px] lg:col-span-5">
          <div className="mb-4 flex items-center justify-between border-b border-brand-border/70 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
                <Landmark className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Banking & Settlements</h3>
                <p className="text-xs text-text-muted">Verified disbursement accounts</p>
              </div>
            </div>

            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              KYC Approved
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-brand-border/60 bg-brand-bg/60 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Beneficiary Name</span>
              <p className="mt-1 font-bold text-text-primary">{partnerName}</p>
            </div>

            <div className="rounded-xl border border-brand-border/60 bg-brand-bg/60 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Bank Institution</span>
              <p className="mt-1 font-bold text-text-primary">Standard Chartered Corporate Banking</p>
            </div>

            <div className="rounded-xl border border-brand-border/60 bg-brand-bg/60 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Account / IBAN</span>
              <p className="mt-1 font-mono font-bold text-text-primary">•••• •••• 8920 (SWIFT: SCBLINBB)</p>
            </div>

            <div className="rounded-xl border border-brand-border/60 bg-brand-bg/60 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Settlement Currency
              </span>
              <p className="mt-1 font-bold text-text-primary">USD ($) / Regional Multi-Currency Gateway</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Downloadable Documents Section */}
      <div className="rounded-2xl border border-brand-border/80 bg-white p-6 shadow-xs sm:rounded-[24px]">
        <div className="mb-4 flex items-center justify-between border-b border-brand-border/70 pb-3">
          <div>
            <h4 className="text-sm font-bold text-text-primary">Official Documents & Credentials Repository</h4>
            <p className="text-xs text-text-muted">Authenticated certificates, agreements, and compliance dossiers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center justify-between rounded-xl border border-brand-border/70 bg-brand-bg/40 p-3 transition-colors hover:bg-brand-bg">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-burgundy-primary/10 text-burgundy-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">Master Representation Agreement.pdf</div>
                <div className="text-[10px] text-text-muted">Signed 15 Jan 2024 • 1.8 MB</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDownloadAgreement("Master Agreement")}
              className="rounded-lg p-2 text-text-secondary hover:bg-white hover:text-burgundy-primary"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-brand-border/70 bg-brand-bg/40 p-3 transition-colors hover:bg-brand-bg">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">Avis Accreditation Certificate 2026.pdf</div>
                <div className="text-[10px] text-text-muted">Verified Gold Seal • 940 KB</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDownloadAgreement("Accreditation Certificate")}
              className="rounded-lg p-2 text-text-secondary hover:bg-white hover:text-burgundy-primary"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-brand-border/70 bg-brand-bg/40 p-3 transition-colors hover:bg-brand-bg">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">Annual Quality Audit Clearance.pdf</div>
                <div className="text-[10px] text-text-muted">Passed 100% • 680 KB</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDownloadAgreement("Audit Clearance")}
              className="rounded-lg p-2 text-text-secondary hover:bg-white hover:text-burgundy-primary"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
