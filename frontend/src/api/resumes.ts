import apiClient from './client';
import type { ApiResponse, Resume, ResumeScore } from '../types';

export async function uploadResume(
  file: File,
  userIdentifier: string,
): Promise<ApiResponse<Resume>> {
  const form = new FormData();
  form.append('resume', file);
  form.append('userIdentifier', userIdentifier);
  const { data } = await apiClient.post<ApiResponse<Resume>>(
    '/api/v1/resumes/upload',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

export async function scoreResume(
  resumeId: string,
  jobDescription: string,
): Promise<ApiResponse<ResumeScore>> {
  const { data } = await apiClient.post<ApiResponse<ResumeScore>>(
    '/api/v1/resumes/score',
    { resumeId, jobDescription },
  );
  return data;
}
