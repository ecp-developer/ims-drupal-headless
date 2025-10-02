import axios from 'axios';
import API_CONFIG from '../config/api';
import type { TaxonomyResponse, TaxonomyTerm, TaxonomyVocabulary } from '../types/drupal';

// Create authenticated axios instance
const createApiInstance = () => {
  return axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 30000,
    headers: API_CONFIG.HEADERS,
    withCredentials: true,
  });
};

class TaxonomyService {
  // Get all terms from a specific vocabulary
  async getTermsByVocabulary(vocabulary: TaxonomyVocabulary): Promise<TaxonomyResponse> {
    const apiClient = createApiInstance();
    const response = await apiClient.get<TaxonomyResponse>(
      `/jsonapi/taxonomy_term/${vocabulary}?sort=name`
    );
    console.log(`📊 Raw ${vocabulary} response:`, response.data);
    return response.data;
  }

  // Get countries from Drupal
  async getCountries(): Promise<TaxonomyTerm[]> {
    try {
      const response = await this.getTermsByVocabulary('country');
      const countries = response.data || [];
      console.log('🌍 Countries loaded:', countries.length, 'terms');
      console.log('🌍 Sample country data:', countries[0]);
      return countries;
    } catch (error) {
      console.error('❌ Failed to load countries:', error);
      return [];
    }
  }

  // Get cities from Drupal
  async getCities(): Promise<TaxonomyTerm[]> {
    try {
      const response = await this.getTermsByVocabulary('city');
      const cities = response.data || [];
      console.log('🏙️ Cities loaded:', cities.length, 'terms');
      console.log('🏙️ Sample city data:', cities[0]);
      return cities;
    } catch (error) {
      console.error('❌ Failed to load cities:', error);
      return [];
    }
  }

  // Search terms by name
  async searchTerms(vocabulary: TaxonomyVocabulary, query: string): Promise<TaxonomyTerm[]> {
    try {
      const apiClient = createApiInstance();
      const response = await apiClient.get<TaxonomyResponse>(
        `/jsonapi/taxonomy_term/${vocabulary}?filter[name][operator]=CONTAINS&filter[name][value]=${encodeURIComponent(query)}&sort=name`
      );
      return response.data.data || [];
    } catch (error) {
      console.error(`❌ Failed to search ${vocabulary} terms:`, error);
      return [];
    }
  }

  // Get term by ID
  async getTermById(vocabulary: TaxonomyVocabulary, id: string): Promise<TaxonomyTerm | null> {
    try {
      const apiClient = createApiInstance();
      const response = await apiClient.get<{ data: TaxonomyTerm }>(
        `/jsonapi/taxonomy_term/${vocabulary}/${id}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`❌ Failed to get ${vocabulary} term by ID:`, error);
      return null;
    }
  }
}

export const taxonomyService = new TaxonomyService();
export default taxonomyService;
