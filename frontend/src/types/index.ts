export interface ParsedResumeData {
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  summary: string | null;
  rawText: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
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
  contentQuality: number;
}

export interface Recommendation {
  type: 'critical' | 'improvement' | 'suggestion';
  message: string;
}

export interface ResumeScore {
  id: string;
  score: number;
  breakdown: ScoreBreakdown;
  missingKeywords: string[];
  recommendations: Recommendation[];
}

export interface Resume {
  id: string;
  fileName: string;
  parsedData: ParsedResumeData | null;
  createdAt: string;
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
