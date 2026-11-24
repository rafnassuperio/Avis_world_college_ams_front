import React, { useState } from "react";
import { Eye, FileText, Check, Plus, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/common/ToastMessage";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { apiClient } from "@/services/api/apiClient";
import { apiMessage, type Row } from "@/services/ams";
import { useApiQuery } from "@/hooks/useApiQuery";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { CollegeStudent } from "../../types";
import { StudentDocumentPreviewModal } from "./StudentDocumentPreviewModal";
import { AddContractAddendumModal } from "./AddContractAddendumModal";

export interface StudentOfficialDocumentItem {
  intakeId?: string;
  id: string;
  name: string;
  code: string;
  hasCheckmark: boolean;
  status: "generated" | "not_generated";
  generatedDate?: string;
  hasAddAction?: boolean;
  type: "contract" | "cloo" | "loo" | "advisory" | "custom";
  category?: string;
  intakePeriod?: string;
}

export interface StudentContractsTabProps {
  student: CollegeStudent;
}

const DEFAULT_DOCUMENTS: StudentOfficialDocumentItem[] = [
  {
    id: "doc-contract",
    name: "Student Contract",
    code: "PEI-CONTRACT",
    hasCheckmark: false,
    status: "not_generated",
    hasAddAction: true,
    type: "contract",
  },
  {
    id: "doc-cloo",
    name: "Conditional Letter Of Offer (CLOO)",
    code: "CLOO",
    hasCheckmark: false,
    status: "not_generated",
    type: "cloo",
  },
  {
    id: "doc-loo",
    name: "Letter Of Offer (LOO) & Acceptance Of Offer",
    code: "LOO",
    hasCheckmark: false,
    status: "not_generated",
    type: "loo",
  },
  {
    id: "doc-advisory",
    name: "Advisory Note",
    code: "FORM-12",
    hasCheckmark: false,
    status: "not_generated",
    type: "advisory",
  },
];

export const StudentContractsTab: React.FC<StudentContractsTabProps> = ({ student }) => {
  const documentTypes: Record<string, string> = { contract: "contract", cloo: "conditionalLetterOfOffer", loo: "letterOfOffer", advisory: "advisoryNote" };
  const { data, loading, error, reload } = useApiQuery(() => apiClient.get<Row>(`/api/admin/generate-contracts/${student.id}`), [student.id]);
  const documents: StudentOfficialDocumentItem[] = DEFAULT_DOCUMENTS.map(doc => ({ ...doc,
    hasCheckmark: Boolean(data?.data?.studentDocuments?.[documentTypes[doc.type]]),
    status: data?.data?.studentDocuments?.[documentTypes[doc.type]] ? "generated" : "not_generated" }));
  for (const c of data?.data?.newContract || []) documents.push({ id: c._id, name: "Student Contract (" + (c.intakeId?.name || "") + ")", code: "PEI-CONTRACT", hasCheckmark: true,
    status: "generated", generatedDate: c.timestamp || "", type: "custom", intakeId: c.intakeId?._id || c.intakeId, intakePeriod: c.intakeId?.name || "" });

  // Modal States
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<StudentOfficialDocumentItem | null>(null);
  const [docToDelete, setDocToDelete] = useState<StudentOfficialDocumentItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState<string | null>(null);

  const handleGenerate = async (doc: StudentOfficialDocumentItem) => {
    setIsGeneratingId(doc.id);
    try {
      await apiClient.post("/api/admin/document-data/generate-document", { studentId: student.id, documentType: documentTypes[doc.type], action: "generate" });
      await reload(); toast.success(doc.name + " generated.");
    } catch (error) { toast.error("Unable to generate document", { description: apiMessage(error) }); }
    finally { setIsGeneratingId(null); }
  };
  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      if (docToDelete.type === "custom") await apiClient.put(`/api/admin/generate-contracts/${student.id}/${docToDelete.intakeId}`);
      else await apiClient.post("/api/admin/document-data/generate-document", { studentId: student.id, documentType: documentTypes[docToDelete.type], action: "ungenerate" });
      await reload(); setDocToDelete(null); toast.success("Document updated.");
    } catch (error) { toast.error("Unable to update document", { description: apiMessage(error) }); return false; }
  };
  const handleAddDocument = async (intakeId: string) => {
    try { await apiClient.post(`/api/admin/generate-contracts/${student.id}`, { intakeId }); await reload(); toast.success("Student contract added."); }
    catch (error) { toast.error("Unable to add contract", { description: apiMessage(error) }); return false; }
  };
  if (loading || error) return <AsyncStateView isLoading={loading} error={error} onRetry={() => void reload()}>{null}</AsyncStateView>;

  return (
    <div className="space-y-4">
      {/* Table Container Card with App Brand Border & Styling */}
      <div className="shadow-xs overflow-hidden rounded-2xl border border-brand-border bg-brand-card">
        <Table
          layout="fixed"
          density="normal"
          containerClassName="w-full overflow-x-auto"
        >
          {/* Table Header using components/ui/Table */}
          <TableHeader className="select-none border-b border-brand-border bg-brand-bg/85 text-text-secondary">
            <TableRow className="border-b border-brand-border/80 hover:bg-transparent">
              <TableHead
                width="60%"
                className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary"
              >
                DOCUMENT NAME
              </TableHead>
              <TableHead
                width="40%"
                className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary"
              >
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* Table Body using components/ui/Table */}
          <TableBody className="divide-y divide-brand-border/60">
            {documents.map((doc) => {
              const isGenerated = doc.status === "generated";
              const isGenerating = isGeneratingId === doc.id;

              return (
                <TableRow
                  key={doc.id}
                  className="transition-colors duration-150 hover:bg-brand-bg/60"
                >
                  {/* Document Name Column */}
                  <TableCell className="px-6 py-3.5 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-text-primary">{doc.name}</span>

                        {/* Green Checkmark */}
                        {doc.hasCheckmark && (
                          <Check
                            className="h-4 w-4 shrink-0 stroke-[2.5] text-emerald-600"
                            aria-label="Verified / Generated"
                          />
                        )}
                      </div>

                      {/* Optional Intake Period / Category Tag */}
                      {doc.intakePeriod && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-text-muted">
                          <span className="inline-flex items-center rounded-md border border-brand-border bg-brand-bg px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary">
                            {doc.intakePeriod}
                          </span>
                          {doc.category && <span className="text-[10px] text-text-muted">• {doc.category}</span>}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell className="px-6 py-3.5 align-middle">
                    <div className="flex items-center justify-between">
                      {/* Action Buttons using Avis World College Brand Palette */}
                      <div className="flex items-center gap-2">
                        {isGenerated ? (
                          <>
                            {/* View Button using Button variant="burgundy" */}
                            <Button
                              type="button"
                              variant="burgundy"
                              size="sm"
                              onClick={() => setSelectedPreviewDoc(doc)}
                              className="shadow-xs h-8 gap-1.5 rounded-xl px-3.5 text-xs font-semibold"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>View</span>
                            </Button>

                            {/* Delete Button using Button variant="secondary" */}
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setDocToDelete(doc)}
                              className="h-8 rounded-xl px-3.5 text-xs font-medium text-text-secondary hover:border-brand-red/30 hover:text-brand-red"
                            >
                              Delete
                            </Button>
                          </>
                        ) : (
                          /* Generate Button using Button variant="primary" */
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => handleGenerate(doc)}
                            disabled={isGenerating}
                            className="shadow-xs h-8 gap-1.5 rounded-xl px-3.5 text-xs font-semibold"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>{isGenerating ? "Generating..." : "Generate"}</span>
                          </Button>
                        )}
                      </div>

                      {/* Red '+' Button for Student Contract */}
                      {doc.hasAddAction && (
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setIsAddModalOpen(true)}
                          className="rounded-xl p-1.5 text-brand-red transition-colors hover:bg-brand-light-red/40 hover:text-burgundy-primary focus:outline-none focus:ring-2 focus:ring-brand-red/30"
                          title="Add Contract Addendum / New Document"
                          aria-label="Add document"
                        >
                          <Plus className="h-5 w-5 stroke-[2.4]" />
                        </motion.button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Institutional Compliance Footer Banner with Brand Colors */}
      <div className="shadow-xs flex flex-col justify-between gap-3 rounded-2xl border border-brand-border bg-white px-5 py-3.5 text-xs text-text-secondary sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-burgundy-primary" />
          <span>Complies with Singapore Committee for Private Education (CPE) &amp; EduTrust Standard Student Contracts.</span>
        </div>
        <div className="font-mono text-[11px] text-text-muted">
          Student ID: <span className="font-semibold text-text-primary">{student.studentId}</span>
        </div>
      </div>

      {/* Document View Preview Modal */}
      {selectedPreviewDoc && (
        <StudentDocumentPreviewModal
          isOpen={!!selectedPreviewDoc}
          onClose={() => setSelectedPreviewDoc(null)}
          student={student}
          documentTitle={selectedPreviewDoc.name}
          documentType={selectedPreviewDoc.type}
          generatedDate={selectedPreviewDoc.generatedDate}
          intakePeriod={selectedPreviewDoc.intakePeriod}
        />
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <DeleteModal
          isOpen={!!docToDelete}
          onClose={() => setDocToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Generated Document"
          description={`Are you sure you want to delete "${docToDelete.name}" for ${student.name}? You can re-generate this document whenever needed.`}
          confirmText="Yes, Delete Document"
          itemPreview={
            <div className="rounded-xl border border-brand-border bg-white p-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light-red/40 text-brand-red">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-text-primary">{docToDelete.name}</div>
                  <div className="text-[11px] text-text-muted">
                    Student: {student.name} • {student.studentId}
                  </div>
                </div>
              </div>
            </div>
          }
        />
      )}

      {/* Add Addendum / Custom Document Modal with Intake Period FilterSelect */}
      {isAddModalOpen && (
        <AddContractAddendumModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddDocument}
          studentName={student.name}
          defaultIntake={student.intake || "Fall 2026"}
        />
      )}
    </div>
  );
};
