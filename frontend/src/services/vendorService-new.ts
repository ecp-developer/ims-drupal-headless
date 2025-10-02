import axios from 'axios';
import authService from './authService';

const DRUPAL_BASE_URL = import.meta.env.VITE_DRUPAL_BASE_URL || 'https://ims-drupal-headless.ddev.site';

// Vendor field interface based on your Drupal fields
export interface VendorFormData {
  id?: string;
  vendorCode: string;           // field_vendor_code (required)
  vendorName: string;            // title (required)
  contactPerson?: string;        // field_contact_person_name
  email?: string;                // field_email
  phone?: string;                // field_phone
  address?: string;              // field_address
  taxNumber?: string;            // field_tax_number
  countryId?: string;            // field_country (entity reference)
  cityId?: string;               // field_city (entity reference)
  photo?: File | null;           // field_photo (image)
  status?: boolean;              // status (published/unpublished)
}

export interface VendorResponse {
  data: any[];
  included?: any[];
  links?: any;
  meta?: any;
}

class VendorService {
  private apiClient = axios.create({
    baseURL: DRUPAL_BASE_URL,
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    },
    withCredentials: true,
  });

  /**
   * Get authenticated API client with CSRF token
   */
  private async getAuthenticatedClient() {
    const token = await authService.getCsrfToken();
    return axios.create({
      baseURL: '', // Empty baseURL to use relative paths through Vite proxy
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
        'X-CSRF-Token': token,
      },
      withCredentials: true,
    });
  }

  /**
   * Generate unique vendor code
   */
  generateVendorCode(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `VEN-${timestamp}-${random}`;
  }

  /**
   * Transform JSON:API vendor data to application format
   */
  private transformVendor(apiData: any, included?: any[]): any {
    const attributes = apiData.attributes;
    const relationships = apiData.relationships;

    // Extract country name from included data
    let countryName = null;
    let cityName = null;
    
    if (included && relationships) {
      if (relationships.field_country?.data?.id) {
        const country = included.find((inc: any) => 
          inc.id === relationships.field_country.data.id && inc.type === 'taxonomy_term--country'
        );
        countryName = country?.attributes?.name || null;
      }
      
      if (relationships.field_city?.data?.id) {
        const city = included.find((inc: any) => 
          inc.id === relationships.field_city.data.id && inc.type === 'taxonomy_term--city'
        );
        cityName = city?.attributes?.name || null;
      }
    }

    return {
      id: apiData.id,
      vendorCode: attributes.field_vendor_code || '',
      title: attributes.title || '',
      contactPerson: attributes.field_contact_person_name || '',
      email: attributes.field_email || '',
      phone: attributes.field_phone || '',
      address: attributes.field_address || '',
      taxNumber: attributes.field_tax_number || '',
      country: countryName,
      city: cityName,
      countryId: relationships?.field_country?.data?.id || null,
      cityId: relationships?.field_city?.data?.id || null,
      status: attributes.status === true || attributes.status === 1,
      created: attributes.created || attributes.drupal_internal__created,
    };
  }

  /**
   * Get all vendors with optional filters
   */
  async getVendors(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    countryId?: string;
    cityId?: string;
    status?: boolean;
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      
      // Include related entities
      queryParams.append('include', 'field_country,field_city');
      
      // Pagination
      if (params?.page) {
        queryParams.append('page[offset]', String((params.page - 1) * (params.pageSize || 10)));
        queryParams.append('page[limit]', String(params.pageSize || 10));
      }
      
      // Search by vendor name
      if (params?.search) {
        queryParams.append('filter[title][operator]', 'CONTAINS');
        queryParams.append('filter[title][value]', params.search);
      }
      
      // Filter by country
      if (params?.countryId) {
        queryParams.append('filter[field_country.id]', params.countryId);
      }
      
      // Filter by city
      if (params?.cityId) {
        queryParams.append('filter[field_city.id]', params.cityId);
      }
      
      // Filter by status
      if (params?.status !== undefined) {
        queryParams.append('filter[status]', params.status ? '1' : '0');
      }
      
      // Sort by created date (newest first)
      queryParams.append('sort', '-created');
      
      console.log('🌐 Fetching vendors from:', `/jsonapi/node/vendors?${queryParams.toString()}`);
      const response = await this.apiClient.get(`/jsonapi/node/vendors?${queryParams.toString()}`);
      console.log('📦 Raw response:', response.data);
      
      // Transform the data
      const transformedData = response.data.data.map((vendor: any) => 
        this.transformVendor(vendor, response.data.included)
      );

      console.log('✅ Transformed data:', transformedData);
      console.log('📊 Meta data:', response.data.meta);

      return {
        data: transformedData,
        meta: response.data.meta,
        links: response.data.links
      };
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  }

  /**
   * Get single vendor by ID
   */
  async getVendorById(id: string): Promise<any> {
    try {
      const response = await this.apiClient.get(
        `/jsonapi/node/vendors/${id}?include=field_country,field_city`
      );
      return this.transformVendor(response.data.data, response.data.included);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      throw error;
    }
  }

  /**
   * Create new vendor
   */
  async createVendor(vendorData: VendorFormData): Promise<any> {
    try {
      const client = await this.getAuthenticatedClient();
      
      const payload = {
        data: {
          type: 'node--vendors',
          attributes: {
            title: vendorData.vendorName,
            field_vendor_code: vendorData.vendorCode || this.generateVendorCode(),
            field_contact_person_name: vendorData.contactPerson || null,
            field_email: vendorData.email || null,
            field_phone: vendorData.phone || null,
            field_address: vendorData.address || null,
            field_tax_number: vendorData.taxNumber || null,
            status: vendorData.status !== false, // Published by default
          },
          relationships: {} as any,
        },
      };
      
      // Add country relationship if provided
      if (vendorData.countryId) {
        payload.data.relationships.field_country = {
          data: {
            type: 'taxonomy_term--country',
            id: vendorData.countryId,
          },
        };
      }
      
      // Add city relationship if provided
      if (vendorData.cityId) {
        payload.data.relationships.field_city = {
          data: {
            type: 'taxonomy_term--city',
            id: vendorData.cityId,
          },
        };
      }
      
      console.log('Creating vendor with payload:', JSON.stringify(payload, null, 2));
      
      const response = await client.post('/jsonapi/node/vendors', payload);
      console.log('Vendor created successfully:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating vendor:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Update existing vendor
   */
  async updateVendor(id: string, vendorData: VendorFormData): Promise<any> {
    try {
      console.log('🔄 updateVendor called with ID:', id);
      console.log('📝 Vendor data:', vendorData);
      
      const client = await this.getAuthenticatedClient();
      console.log('✅ Got authenticated client');
      
      const payload = {
        data: {
          type: 'node--vendors',
          id: id,
          attributes: {
            title: vendorData.vendorName,
            field_vendor_code: vendorData.vendorCode,
            field_contact_person_name: vendorData.contactPerson || null,
            field_email: vendorData.email || null,
            field_phone: vendorData.phone || null,
            field_address: vendorData.address || null,
            field_tax_number: vendorData.taxNumber || null,
            status: vendorData.status !== false,
          },
          relationships: {} as any,
        },
      };
      
      // Update country relationship
      if (vendorData.countryId) {
        payload.data.relationships.field_country = {
          data: {
            type: 'taxonomy_term--country',
            id: vendorData.countryId,
          },
        };
      }
      
      // Update city relationship
      if (vendorData.cityId) {
        payload.data.relationships.field_city = {
          data: {
            type: 'taxonomy_term--city',
            id: vendorData.cityId,
          },
        };
      }
      
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));
      console.log('🌐 Request URL:', `/jsonapi/node/vendors/${id}`);
      
      const response = await client.patch(`/jsonapi/node/vendors/${id}`, payload);
      console.log('✅ Response status:', response.status);
      console.log('✅ Vendor updated successfully:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating vendor:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      
      if (error.response?.status === 403) {
        throw new Error('Permission denied. Make sure you are logged in.');
      } else if (error.response?.status === 422) {
        const details = error.response?.data?.errors?.map((e: any) => e.detail).join(', ');
        throw new Error(`Validation error: ${details}`);
      }
      
      throw error;
    }
  }

  /**
   * Delete vendor
   */
  async deleteVendor(id: string): Promise<void> {
    try {
      const client = await this.getAuthenticatedClient();
      await client.delete(`/jsonapi/node/vendors/${id}`);
      console.log('Vendor deleted successfully');
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }

  /**
   * Get vendor statistics for dashboard
   */
  async getVendorStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    recentCount: number;
  }> {
    try {
      // Get total vendors
      const allVendors = await this.getVendors();
      const total = allVendors.data?.length || 0;
      
      // Get active vendors
      const activeVendors = await this.getVendors({ status: true });
      const active = activeVendors.data?.length || 0;
      
      // Calculate inactive
      const inactive = total - active;
      
      // Get recent vendors (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentVendors = allVendors.data?.filter((vendor: any) => {
        const created = new Date(vendor.created);
        return created >= weekAgo;
      });
      const recentCount = recentVendors?.length || 0;
      
      return { total, active, inactive, recentCount };
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      return { total: 0, active: 0, inactive: 0, recentCount: 0 };
    }
  }

  /**
   * Search vendors by multiple criteria
   */
  async searchVendors(searchTerm: string): Promise<VendorResponse> {
    return this.getVendors({ search: searchTerm });
  }

  /**
   * Extract term name from included data
   */
  extractTermName(includedTerms: any[], termId?: string): string {
    if (!termId || !includedTerms) return 'N/A';
    const term = includedTerms.find((t) => t.id === termId);
    return term?.attributes?.name || 'N/A';
  }
}

export default new VendorService();
