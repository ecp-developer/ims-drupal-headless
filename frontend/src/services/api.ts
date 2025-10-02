import axios from 'axios';
import API_CONFIG from '../config/api';
import type { DrupalResponse, ContentType } from '../types/drupal';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADERS,
  timeout: API_CONFIG.TIMEOUT,
});

export const fetchContent = async (contentType: ContentType): Promise<DrupalResponse> => {
  try {
    const endpoint = `${API_CONFIG.JSONAPI_BASE}/node/${contentType}`;
    const response = await apiClient.get<DrupalResponse>(endpoint);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(`Failed to fetch ${contentType}`);
  }
};
