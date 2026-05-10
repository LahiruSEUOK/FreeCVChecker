export interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  summary?: string;
}

export interface ExperienceItem {
  company: string;
  title: string;
  duration: string;
  bullets: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  year: string;
}

export interface ScoreBreakdown {
  formatting: number;
  keywords: number;
  structure: number;
  content: number;
}

export interface Recommendation {
  field: string;
  message: string;
}

export interface ResumeScore {
  scoreId: string;
  score: number;
  breakdown: ScoreBreakdown;
  missingKeywords: string[];
  recommendations: Recommendation[];
}

export interface SectionSuggestion {
  section: string;
  issue: string;
  currentContent: string;
  improvedVersion: string;
}

export interface EnhanceResult {
  estimatedNewScore: number;
  sections: SectionSuggestion[];
}

export interface Resume {
  resumeId: string;
  parsedData: ParsedResumeData | null;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  method: string;
}
