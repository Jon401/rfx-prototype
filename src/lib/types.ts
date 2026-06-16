export type RfxType = "RFI" | "RFQ" | "RFP";

export type RfxStatus =
  | "draft"
  | "published"
  | "open"
  | "closed"
  | "awarded";

export type UserRole = "buyer" | "supplier";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  diversityTag?: string;
}

export interface RfiQuestion {
  id: string;
  text: string;
  required: boolean;
  type: "text" | "textarea" | "yes_no";
}

export interface RfqLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice?: number;
}

export interface RfpSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export interface ScoringCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  weight: number;
}

export interface RfxBase {
  id: string;
  type: RfxType;
  title: string;
  description: string;
  status: RfxStatus;
  buyerId: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  publishedAt?: string;
  closedAt?: string;
}

export interface RfiRecord extends RfxBase {
  type: "RFI";
  questions: RfiQuestion[];
  closeNotes?: string;
  shortlistedSupplierIds: string[];
  convertedToRfpId?: string;
}

export interface RfqRecord extends RfxBase {
  type: "RFQ";
  lineItems: RfqLineItem[];
  awardedSupplierId?: string;
  awardNotes?: string;
}

export interface RfpRecord extends RfxBase {
  type: "RFP";
  sections: RfpSection[];
  scoringCriteria: ScoringCriterion[];
  awardedSupplierId?: string;
  awardNotes?: string;
  linkedFromRfiId?: string;
}

export type RfxRecord = RfiRecord | RfqRecord | RfpRecord;

export interface ExternalContact {
  name: string;
  email: string;
  company: string;
}

export interface Invitation {
  id: string;
  rfxId: string;
  supplierType: "internal" | "external";
  supplierId?: string;
  externalContact?: ExternalContact;
  status: "pending" | "accepted" | "declined";
  invitedAt: string;
  respondedAt?: string;
}

export interface QaThread {
  id: string;
  rfxId: string;
  supplierId: string;
  question: string;
  askedAt: string;
  answer?: string;
  answeredAt?: string;
  isPublic: boolean;
}

export interface RfiAnswer {
  questionId: string;
  value: string;
}

export interface RfqLineQuote {
  lineItemId: string;
  unitPrice: number;
  notes?: string;
}

export interface RfpSectionResponse {
  sectionId: string;
  content: string;
}

export interface CriterionScore {
  criterionId: string;
  score: number;
}

export interface AttachmentChip {
  id: string;
  name: string;
}

export interface Submission {
  id: string;
  rfxId: string;
  supplierId: string;
  status: "draft" | "submitted";
  submittedAt?: string;
  updatedAt: string;
  rfiAnswers?: RfiAnswer[];
  rfqQuotes?: RfqLineQuote[];
  rfpResponses?: RfpSectionResponse[];
  criterionScores?: CriterionScore[];
  totalScore?: number;
  attachments?: AttachmentChip[];
}

export interface Notification {
  id: string;
  userId: string;
  rfxId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "award";
  read: boolean;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  rfxId: string;
  userId: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface AppState {
  users: User[];
  currentUserId: string;
  rfxRecords: RfxRecord[];
  invitations: Invitation[];
  qaThreads: QaThread[];
  submissions: Submission[];
  notifications: Notification[];
  activityLog: ActivityEntry[];
}
