export interface Area {
  id: number;
  name: string;
  description?: string;
  workerCount?: number;
  caseCount?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAreaRequest {
  name: string;
  metadata?: Record<string, any>;
}

export interface UpdateAreaRequest {
  name?: string;
  metadata?: Record<string, any>;
}
