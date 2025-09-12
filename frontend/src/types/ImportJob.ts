export interface StartImportResponse {
  jobId: string;
  message: string;
  status: string;
}

export interface ImportJobStatus {
  jobId: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  progress?: number;
  message?: string;
  errors?: string[];
  importedCount?: number;
  errorCount?: number;
  createdAt: string;
  completedAt?: string;
}