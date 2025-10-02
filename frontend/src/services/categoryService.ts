import axios, { type AxiosInstance } from 'axios';

const DRUPAL_BASE_URL = import.meta.env.VITE_DRUPAL_BASE_URL || 'https://ims-drupal-headless.ddev.site';

// Category interface
export interface Category {
  id: string;
  name: string;
  description?: string;
  weight?: number;
  status: boolean;
  parent_id?: string;
  parent_name?: string;
  created?: string;
  changed?: string;
}

// Category form data
export interface CategoryFormData {
  name: string;
  description?: string;
  weight?: number;
  status: boolean;
  parent_id?: string;
}

// Stats interface
export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
}

class CategoryService {
  private getAuthenticatedClient(): AxiosInstance {
    return axios.create({
      baseURL: '', // Empty for Vite proxy
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      withCredentials: true,
    });
  }

  // Transform JSON:API data to Category
  private transformCategory(item: any, included?: any[]): Category {
    const attributes = item.attributes;
    const relationships = item.relationships;

    // Get parent category if exists
    let parent_name: string | undefined;
    if (relationships?.parent?.data?.length > 0 && included) {
      const parentId = relationships.parent.data[0].id;
      const parentTerm = included.find(
        (inc: any) => inc.id === parentId && inc.type === 'taxonomy_term--categories'
      );
      if (parentTerm) {
        parent_name = parentTerm.attributes.name;
      }
    }

    return {
      id: item.id,
      name: attributes.name,
      description: attributes.description?.value || attributes.description?.processed || '',
      weight: attributes.weight || 0,
      status: attributes.status,
      parent_id: relationships?.parent?.data?.[0]?.id,
      parent_name,
      created: attributes.created,
      changed: attributes.changed,
    };
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      console.log('Calling Drupal API for categories...');
      const url = `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/categories?include=parent&sort=weight,name`;
      console.log('API URL:', url);
      
      const response = await axios.get(url);
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      if (!response.data?.data) {
        console.log('No data in response');
        return [];
      }

      const categories = response.data.data.map((item: any) => 
        this.transformCategory(item, response.data.included)
      );
      
      console.log('Transformed categories:', categories);
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw error;
    }
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const response = await axios.get(
        `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/categories/${id}?include=parent`
      );
      
      if (!response.data?.data) {
        return null;
      }

      return this.transformCategory(response.data.data, response.data.included);
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  // Create category
  async createCategory(categoryData: CategoryFormData): Promise<Category> {
    try {
      // Get CSRF token
      const tokenResponse = await axios.get(`${DRUPAL_BASE_URL}/session/token`);
      const csrfToken = tokenResponse.data;

      const client = this.getAuthenticatedClient();
      client.defaults.headers.common['X-CSRF-Token'] = csrfToken;

      const payload: any = {
        data: {
          type: 'taxonomy_term--categories',
          attributes: {
            name: categoryData.name,
            status: categoryData.status,
          },
        },
      };

      // Add optional fields
      if (categoryData.description) {
        payload.data.attributes.description = {
          value: categoryData.description,
          format: 'plain_text',
        };
      }

      if (categoryData.weight !== undefined) {
        payload.data.attributes.weight = categoryData.weight;
      }

      // Add parent relationship
      if (categoryData.parent_id) {
        payload.data.relationships = {
          parent: {
            data: [{
              type: 'taxonomy_term--categories',
              id: categoryData.parent_id,
            }],
          },
        };
      }

      console.log('Creating category with payload:', JSON.stringify(payload, null, 2));

      const response = await client.post(
        '/jsonapi/taxonomy_term/categories',
        payload
      );

      console.log('Category created successfully:', response.data);

      return this.transformCategory(response.data.data);
    } catch (error: any) {
      console.error('Error creating category:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Update category
  async updateCategory(id: string, categoryData: CategoryFormData): Promise<Category> {
    try {
      // Get CSRF token
      const tokenResponse = await axios.get(`${DRUPAL_BASE_URL}/session/token`);
      const csrfToken = tokenResponse.data;

      const client = this.getAuthenticatedClient();
      client.defaults.headers.common['X-CSRF-Token'] = csrfToken;

      const payload: any = {
        data: {
          type: 'taxonomy_term--categories',
          id: id,
          attributes: {
            name: categoryData.name,
            status: categoryData.status,
          },
        },
      };

      // Add optional fields
      if (categoryData.description !== undefined) {
        payload.data.attributes.description = {
          value: categoryData.description,
          format: 'plain_text',
        };
      }

      if (categoryData.weight !== undefined) {
        payload.data.attributes.weight = categoryData.weight;
      }

      // Add parent relationship
      if (categoryData.parent_id !== undefined) {
        payload.data.relationships = {
          parent: {
            data: categoryData.parent_id ? [{
              type: 'taxonomy_term--categories',
              id: categoryData.parent_id,
            }] : [],
          },
        };
      }

      console.log('Updating category with payload:', JSON.stringify(payload, null, 2));

      const response = await client.patch(
        `/jsonapi/taxonomy_term/categories/${id}`,
        payload
      );

      console.log('Category updated successfully:', response.data);

      return this.transformCategory(response.data.data);
    } catch (error: any) {
      console.error('Error updating category:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    try {
      // Get CSRF token
      const tokenResponse = await axios.get(`${DRUPAL_BASE_URL}/session/token`);
      const csrfToken = tokenResponse.data;

      const client = this.getAuthenticatedClient();
      client.defaults.headers.common['X-CSRF-Token'] = csrfToken;

      await client.delete(`/jsonapi/taxonomy_term/categories/${id}`);
      
      console.log('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Get category statistics
  async getCategoryStats(): Promise<CategoryStats> {
    try {
      const categories = await this.getCategories();
      
      return {
        total: categories.length,
        active: categories.filter(c => c.status).length,
        inactive: categories.filter(c => !c.status).length,
      };
    } catch (error) {
      console.error('Error fetching category stats:', error);
      return { total: 0, active: 0, inactive: 0 };
    }
  }

  // Search categories
  async searchCategories(query: string): Promise<Category[]> {
    try {
      const response = await axios.get(
        `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/categories?include=parent&filter[name][operator]=CONTAINS&filter[name][value]=${encodeURIComponent(query)}&sort=weight,name`
      );
      
      if (!response.data?.data) {
        return [];
      }

      return response.data.data.map((item: any) => 
        this.transformCategory(item, response.data.included)
      );
    } catch (error) {
      console.error('Error searching categories:', error);
      return [];
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;
