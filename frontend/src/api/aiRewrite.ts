import apiClient from './client';
import type { ApiResponse } from '../types';

interface RewriteResponse {
  rewrites: string[];
  rewriteId: string;
}

export async function generateRewrites(
  resumeId: string,
  bulletPoint: string,
  jobDescription: string,
): Promise<ApiResponse<RewriteResponse>> {
  const { data } = await apiClient.post<ApiResponse<RewriteResponse>>(
    '/api/v1/ai-rewrite/generate',
    { resumeId, bulletPoint, jobDescription },
  );
  return data;
}

export async function selectRewrite(
  rewriteId: string,
  selectedRewrite: string,
): Promise<ApiResponse<{ selected: string }>> {
  const { data } = await apiClient.patch<ApiResponse<{ selected: string }>>(
    `/api/v1/ai-rewrite/${rewriteId}/select`,
    { selected: selectedRewrite },
  );
  return data;
}
