export type AuthorRole = 'patient' | 'worker' | 'doctor' | 'admin' | 'system';

export interface Message {
  id: number;
  caseId: number;
  authorId: number;
  authorRole: AuthorRole;
  content: string;
  createdAt: Date;
  authorName?: string;
  senderName?: string;
}

export interface CreateMessageRequest {
  caseId: number;
  content: string;
}
