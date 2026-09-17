export interface RequirementItem {
  id: number;
  title: string;
  description: string;
  checkType: 'caption' | 'idea' | 'video' | 'metadata' | 'combined';
  isCritical?: boolean;
  failMessage: string;
  fixSuggestion: string;
}

export interface RegionOption {
  id: string;
  label: string;
  hashtag: string;
  group: 'East-West' | 'North-South' | 'Other';
}

export interface ThemeConfig {
  id: string;
  name: string;
  displayName: string;
  month: string;
  isActive: boolean;
  pov: string;
  criticalFailRule: string;
  captionExplainer: string;
  subIdeas: string[];
  captionTemplate: string;
  requirements: RequirementItem[];
  regionHashtagMap: Record<string, string>;
  requiredTags: string[];
  requiredHashtags: string[];
}

export interface RequirementCheckResult {
  id: number;
  title: string;
  passed: boolean;
  isCritical?: boolean;
  evidence: string;
  suggestion: string;
}

export interface AnalysisResponse {
  overallVerdict: 'PASS' | 'FAIL';
  criticalFailTriggered: boolean;
  criticalFailReason?: string;
  score: number; // e.g. 8/10
  totalRequirements: number;
  requirements: RequirementCheckResult[];
  summaryFeedback: string;
  fixChecklist: string[];
  analyzedAt: string;
  mode: 'gemini-2.5-flash' | 'heuristic-engine';
}
