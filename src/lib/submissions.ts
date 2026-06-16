/** One submission per supplier per RFX — stable id prevents cross-supplier overwrites. */
export function getSubmissionId(rfxId: string, supplierId: string): string {
  return `sub-${rfxId}-${supplierId}`;
}

export function isSameSupplierSubmission(
  a: { rfxId: string; supplierId: string },
  b: { rfxId: string; supplierId: string }
): boolean {
  return a.rfxId === b.rfxId && a.supplierId === b.supplierId;
}
