import React, { useState, useMemo, useEffect } from "react";
import { Calendar, Archive } from "lucide-react";
import { TableCard, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { initialIntakeDocumentCounts } from "../data/reportsData";
import { IntakeDocumentCountItem } from "../types";

export const StudentDocumentCountTab: React.FC = () => {
  const [data] = useState<IntakeDocumentCountItem[]>(initialIntakeDocumentCounts);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Reset pagination on search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (item) => item.intakeName.toLowerCase().includes(q) || item.term.toLowerCase().includes(q) || item.academicYear.toLowerCase().includes(q),
    );
  }, [data, searchQuery]);

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page is in valid bounds
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, validCurrentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* Search Toolbar & Actions */}
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-border bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold tracking-tight text-text-primary sm:text-lg">Student Document Count</h2>
        <div className="w-full sm:max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Search intakes by cohort, year, or term..."
            size="sm"
          />
        </div>
      </div>

      {/* Document Count Table */}
      <TableCard
        showResizeGuide={false}
        className="overflow-hidden p-0 sm:p-0 md:p-0"
      >
        <div className="overflow-x-auto">
          <Table
            layout="auto"
            className="w-full text-left"
          >
            <TableHeader>
              <TableRow className="border-b border-brand-border bg-brand-bg/90">
                <TableHead className="w-14 px-3 py-3 text-center [&>div]:justify-center">#</TableHead>
                <TableHead className="min-w-[260px] px-4 py-3">Intakes</TableHead>
                <TableHead className="w-32 px-4 py-3 text-center [&>div]:justify-center">CLOO</TableHead>
                <TableHead className="w-32 px-4 py-3 text-center [&>div]:justify-center">LOO</TableHead>
                <TableHead className="w-32 px-4 py-3 text-center [&>div]:justify-center">Contract</TableHead>
                <TableHead className="w-36 px-4 py-3 text-center [&>div]:justify-center">Advisory Note</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-text-muted"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Archive className="h-8 w-8 text-text-muted/60" />
                      <p className="text-sm font-semibold text-text-primary">No intake records found</p>
                      <p className="text-xs text-text-secondary">Try adjusting your search query.</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="mt-2"
                      >
                        Clear Search
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="transition-colors hover:bg-brand-bg/60"
                  >
                    {/* # Index */}
                    <TableCell className="px-3 py-3 text-center text-xs font-bold text-text-muted">
                      {(validCurrentPage - 1) * pageSize + index + 1}
                    </TableCell>

                    {/* Intakes */}
                    <TableCell className="px-4 py-3">
                      <p className="font-bold text-text-primary">{item.intakeName}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-text-muted" />
                          {item.term}
                        </span>
                        <span>•</span>
                        <span className="text-text-muted">{item.academicYear}</span>
                      </div>
                    </TableCell>

                    {/* CLOO */}
                    <TableCell className="px-4 py-3 text-center">
                      <span className="shadow-2xs inline-flex min-w-[38px] items-center justify-center rounded-full border border-brand-border bg-brand-light-red/70 px-2.5 py-1 text-xs font-bold text-burgundy-primary">
                        {item.cloo}
                      </span>
                    </TableCell>

                    {/* LOO */}
                    <TableCell className="px-4 py-3 text-center">
                      <span className="shadow-2xs inline-flex min-w-[38px] items-center justify-center rounded-full border border-brand-border bg-brand-light-red/90 px-2.5 py-1 text-xs font-bold text-brand-red">
                        {item.loo}
                      </span>
                    </TableCell>

                    {/* Contract */}
                    <TableCell className="px-4 py-3 text-center">
                      <span className="shadow-2xs inline-flex min-w-[38px] items-center justify-center rounded-full border border-brand-border bg-brand-bg px-2.5 py-1 text-xs font-bold text-burgundy-primary">
                        {item.contract}
                      </span>
                    </TableCell>

                    {/* Advisory Note */}
                    <TableCell className="px-4 py-3 text-center">
                      <span className="shadow-2xs inline-flex min-w-[38px] items-center justify-center rounded-full border border-brand-border bg-white px-2.5 py-1 text-xs font-bold text-text-primary">
                        {item.advisoryNote}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TableCard>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <Pagination
          currentPage={validCurrentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 8, 12, 20]}
          showTotal={true}
          showPageSize={true}
        />
      )}
    </div>
  );
};
