import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AgentItem, AgentType, AgentStatus } from "@/features/agents/types";
import { RepresentativeItem, RepresentativeStatus } from "@/features/representatives/types";
import { Edit3 } from "lucide-react";
import { toast } from "@/components/common/ToastMessage";

export interface EditPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerType: "agent" | "representative";
  agent?: AgentItem | null;
  representative?: RepresentativeItem | null;
  allRepresentatives: RepresentativeItem[];
  onSaveAgent: (updatedAgent: AgentItem) => void | boolean | Promise<void | boolean>;
  onSaveRepresentative: (updatedRep: RepresentativeItem) => void | boolean | Promise<void | boolean>;
}

export const EditPartnerModal: React.FC<EditPartnerModalProps> = ({
  isOpen,
  onClose,
  partnerType,
  agent,
  representative,
  allRepresentatives,
  onSaveAgent,
  onSaveRepresentative,
}) => {
  const isAgent = partnerType === "agent";

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Suspended">("Active");
  const [notes, setNotes] = useState("");

  // Agent Specific
  const [agencyName, setAgencyName] = useState("");
  const [agentType, setAgentType] = useState<AgentType>("Exclusive Partner");
  const [supervisingRep, setSupervisingRep] = useState("");

  // Representative Specific
  const [organization, setOrganization] = useState("");
  const [region, setRegion] = useState("");

  // Populate data when opening
  useEffect(() => {
    if (isAgent && agent) {
      setName(agent.name || "");
      setEmail(agent.email || "");
      setPhone(agent.phone || "");
      setCountry(agent.country || "");
      setStatus(agent.status || "Active");
      setNotes(agent.notes || "");
      setAgencyName(agent.agencyName || "");
      setAgentType(agent.type || "Exclusive Partner");
      setSupervisingRep(agent.representative || "");
    } else if (!isAgent && representative) {
      setName(representative.name || "");
      setEmail(representative.email || "");
      setPhone(representative.phone || "");
      setCountry(representative.country || "");
      setStatus(representative.status || "Active");
      setNotes(representative.notes || "");
      setOrganization(representative.organization || "");
      setRegion(representative.region || "");
    }
  }, [isAgent, agent, representative, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (isAgent && agent) {
      const updated: AgentItem = {
        ...agent,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim(),
        status: status as AgentStatus,
        notes: notes.trim(),
        agencyName: agencyName.trim() || undefined,
        type: agentType,
        representative: supervisingRep || agent.representative,
      };
      if (await onSaveAgent(updated) === false) return;
      toast.success("Agent Profile Updated", {
        description: `Details for ${updated.name} saved successfully.`,
      });
      onClose();
    } else if (!isAgent && representative) {
      const updated: RepresentativeItem = {
        ...representative,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim(),
        status: status as RepresentativeStatus,
        notes: notes.trim(),
        organization: organization.trim() || undefined,
        region: region.trim() || undefined,
      };
      if (await onSaveRepresentative(updated) === false) return;
      toast.success("Representative Profile Updated", {
        description: `Details for ${updated.name} saved successfully.`,
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <span>Edit {isAgent ? "Agent Partner Profile" : "Representative Profile"}</span>
          <span className="rounded-full bg-burgundy-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-burgundy-primary">
            {isAgent ? agent?.agentCode : representative?.repCode}
          </span>
        </div>
      }
      subtitle={`Update core credentials, contact coordinates, and operational terms for ${name || "partner"}`}
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
          <Edit3 className="h-5 w-5 stroke-[2.2]" />
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl px-4 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-partner-form"
            variant="burgundy"
            size="sm"
            className="rounded-xl px-5 text-xs font-bold shadow-sm"
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <form id="edit-partner-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Name and Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-primary">
              Full Legal Name <span className="text-brand-red">*</span>
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. EduGlobal Overseas Partners"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-primary">
              Official Email Address <span className="text-brand-red">*</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. partner@eduglobal.com"
              required
            />
          </div>
        </div>

        {/* Phone and Country */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-primary">
              Contact Telephone / Hotline <span className="text-brand-red">*</span>
            </label>
            <Input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98234 56789"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-primary">
              Operational Country <span className="text-brand-red">*</span>
            </label>
            <Input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. India, United Kingdom, Singapore"
              required
            />
          </div>
        </div>

        {/* Status & Sub-entity */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-primary">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "Active" | "Inactive" | "Suspended")}
              className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-medium text-text-primary outline-hidden focus:border-burgundy-primary focus:ring-1 focus:ring-burgundy-primary"
            >
              <option value="Active">Active (Accredited)</option>
              <option value="Inactive">Inactive (Under Review)</option>
              <option value="Suspended">Suspended (Access Revoked)</option>
            </select>
          </div>

          {isAgent ? (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-primary">Parent Agency / Institution</label>
              <Input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="e.g. EduGlobal International Network"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-primary">Organization / Mission</label>
              <Input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. South Asia Regional Liaison"
              />
            </div>
          )}
        </div>

        {/* Specific fields */}
        {isAgent ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-primary">Agent Classification Type</label>
              <select
                value={agentType}
                onChange={(e) => setAgentType(e.target.value as AgentType)}
                className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-medium text-text-primary outline-hidden focus:border-burgundy-primary focus:ring-1 focus:ring-burgundy-primary"
              >
                <option value="Exclusive Partner">Exclusive Partner</option>
                <option value="Direct Recruiter">Direct Recruiter</option>
                <option value="Institutional Agent">Institutional Agent</option>
                <option value="Authorized Consultant">Authorized Consultant</option>
                <option value="Regional Partner">Regional Partner</option>
                <option value="Sub-Agent">Sub-Agent</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-primary">Supervising Representative</label>
              <select
                value={supervisingRep}
                onChange={(e) => setSupervisingRep(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-medium text-text-primary outline-hidden focus:border-burgundy-primary focus:ring-1 focus:ring-burgundy-primary"
              >
                {allRepresentatives.map((rep) => (
                  <option key={rep.id} value={rep.name}>
                    {rep.name} ({rep.repCode} - {rep.country})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-primary">Regional Jurisdiction</label>
              <Input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. South Asia, Europe, Southeast Asia"
              />
            </div>
          </div>
        )}

        {/* Operational Notes / Scope */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-text-primary">
            Operational Territory Scope & Mandate Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe recruitment scope, partner focus, or key region targets..."
            className="w-full rounded-xl border border-brand-border bg-white p-3 text-xs font-medium text-text-primary outline-hidden focus:border-burgundy-primary focus:ring-1 focus:ring-burgundy-primary"
          />
        </div>
      </form>
    </Modal>
  );
};
