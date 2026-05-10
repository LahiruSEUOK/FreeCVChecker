import { create } from 'zustand';
import type { ParsedResumeData, ResumeScore } from '../types';

interface ResumeState {
  resumeId: string | null;
  fileName: string | null;
  parsedData: ParsedResumeData | null;
  score: ResumeScore | null;
  rewrites: string[];
  selectedRewrite: string | null;
  jobDescription: string;
  isUploading: boolean;
  isScoring: boolean;
  isRewriting: boolean;
  uploadError: string | null;
  scoreError: string | null;
  rewriteError: string | null;

  setResumeId: (id: string) => void;
  setFileName: (name: string) => void;
  setParsedData: (data: ParsedResumeData) => void;
  setScore: (score: ResumeScore) => void;
  setRewrites: (rewrites: string[]) => void;
  setSelectedRewrite: (rewrite: string) => void;
  setJobDescription: (jd: string) => void;
  setIsUploading: (v: boolean) => void;
  setIsScoring: (v: boolean) => void;
  setIsRewriting: (v: boolean) => void;
  setUploadError: (err: string | null) => void;
  setScoreError: (err: string | null) => void;
  setRewriteError: (err: string | null) => void;
  reset: () => void;
}

const initialState = {
  resumeId: null,
  fileName: null,
  parsedData: null,
  score: null,
  rewrites: [],
  selectedRewrite: null,
  jobDescription: '',
  isUploading: false,
  isScoring: false,
  isRewriting: false,
  uploadError: null,
  scoreError: null,
  rewriteError: null,
};

export const useResumeStore = create<ResumeState>((set) => ({
  ...initialState,
  setResumeId: (id) => set({ resumeId: id }),
  setFileName: (name) => set({ fileName: name }),
  setParsedData: (data) => set({ parsedData: data }),
  setScore: (score) => set({ score }),
  setRewrites: (rewrites) => set({ rewrites }),
  setSelectedRewrite: (rewrite) => set({ selectedRewrite: rewrite }),
  setJobDescription: (jd) => set({ jobDescription: jd }),
  setIsUploading: (v) => set({ isUploading: v }),
  setIsScoring: (v) => set({ isScoring: v }),
  setIsRewriting: (v) => set({ isRewriting: v }),
  setUploadError: (err) => set({ uploadError: err }),
  setScoreError: (err) => set({ scoreError: err }),
  setRewriteError: (err) => set({ rewriteError: err }),
  reset: () => set(initialState),
}));
