import { AnalysisResponse } from './themes/types';

export interface ReelSubmission {
  id: string;
  submissionId: string;
  gid: string;
  region: string;
  themeId: string;
  themeName: string;
  reelUrl?: string;
  videoFileName?: string;
  caption: string;
  ideaDescription: string;
  analysisScore?: number;
  verdict?: 'PASS' | 'FAIL';
  submittedAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
