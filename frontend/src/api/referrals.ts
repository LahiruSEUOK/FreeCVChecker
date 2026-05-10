import apiClient from './client';
import type { ApiResponse } from '../types';

interface ShareResponse {
  refToken: string;
  shareUrl: string;
  shareText: string;
}

export async function trackShare(
  resumeId: string,
  platform: 'whatsapp' | 'linkedin' | 'copy',
): Promise<ApiResponse<ShareResponse>> {
  const { data } = await apiClient.post<ApiResponse<ShareResponse>>(
    '/api/v1/referrals/share',
    { resumeId, platform },
  );
  return data;
}
