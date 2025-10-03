import axios, { type AxiosInstance } from 'axios';

const DRUPAL_BASE_URL = import.meta.env.VITE_DRUPAL_BASE_URL || 'https://ims-drupal-headless.ddev.site';

// Item Master interface
export interface ItemMaster {
  id: string;
  title: string;
  item_code: string;
  specifications?: string;
  category_id?: string;
  category_name?: string;
  unit_of_measure_id?: string;
  unit_of_measure_name?: string;
  status: boolean;
  created?: string;
  changed?: string;
}

// Item Master form data
export interface ItemMasterFormData {
  title: string;
  item_code: string;
  specifications?: string;
  category_id?: string;
  unit_of_measure_id?: string;
  status: boolean;
}

// Stats interface
export interface ItemMasterStats {
  total: number;
  active: number;
  inactive: number;
}

// Taxonomy term interface for dropdowns
export interface TaxonomyTerm {
  id: string;
  name: string;
}

class ItemMasterService {
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

  // Transform JSON:API data to ItemMaster
  private transformItemMaster(item: any, included?: any[]): ItemMaster {
    const attributes = item.attributes;
    const relationships = item.relationships;

    // Get category name if exists
    let category_name: string | undefined;
    let category_id: string | undefined;
    if (relationships?.field_category?.data && included) {
      category_id = relationships.field_category.data.id;
      const categoryTerm = included.find(
        (inc: any) => inc.id === category_id && inc.type === 'taxonomy_term--categories'
      );
      if (categoryTerm) {
        category_name = categoryTerm.attributes.name;
      }
    }

    // Get unit of measure name if exists
    let unit_of_measure_name: string | undefined;
    let unit_of_measure_id: string | undefined;
    if (relationships?.field_unit_of_measure?.data && included) {
      unit_of_measure_id = relationships.field_unit_of_measure.data.id;
      const uomTerm = included.find(
        (inc: any) => inc.id === unit_of_measure_id && inc.type === 'taxonomy_term--unit_of_measure'
      );
      if (uomTerm) {
        unit_of_measure_name = uomTerm.attributes.name;
      }
    }

    return {
      id: item.id,
      title: attributes.title,
      item_code: attributes.field_item_code,
      specifications: attributes.field_specifications?.value || attributes.field_specifications || '',
      category_id,
      category_name,
      unit_of_measure_id,
      unit_of_measure_name,
      status: attributes.status,
      created: attributes.created,
      changed: attributes.changed,
    };
  }

  // Get all item masters
  async getItemMasters(): Promise<ItemMaster[]> {
    try {
      const response = await axios.get(
        `${DRUPAL_BASE_URL}/jsonapi/node/item_master?include=field_category,field_unit_of_measure&sort=-created`
      );
      
      if (!response.data?.data) {
        return [];
      }

      return response.data.data.map((item: any) => 
        this.transformItemMaster(item, response.data.included)
      );
    } catch (error) {
      console.error('Error fetching item masters:', error);
      throw error;
    }
  }

  // Get item master by ID
  async getItemMasterById(id: string): Promise<ItemMaster | null> {
    try {
      const response = await axios.get(
        `${DRUPAL_BASE_URL}/jsonapi/node/item_master/${id}?include=field_category,field_unit_of_measure`
      );
      
      if (!response.data?.data) {
        return null;
      }

      return this.transformItemMaster(response.data.data, response.data.included);
    } catch (error) {
      console.error('Error fetching item master:', error);
      return null;
    }
  }

  // Create item master
  async createItemMaster(itemData: ItemMasterFormData): Promise<ItemMaster> {
    try {
      // Get CSRF token
      const tokenResponse = await axios.get(`${DRUPAL_BASE_URL}/session/token`);
      const csrfToken = tokenResponse.data;

      const client = this.getAuthenticatedClient();
      
      const payload: any = {
        data: {
          type: 'node--item_master',
          attributes: {
            title: itemData.title,
            field_item_code: itemData.item_code,
            status: itemData.status,
          }
        }
      };

      // Add optional fields
      if (itemData.specifications) {
        payload.data.attributes.field_specifications = {
          value: itemData.specifications,
          format: 'plain_text'
        };
      }

      // Add relationships
      payload.data.relationships = {};

      if (itemData.category_id) {
        payload.data.relationships.field_category = {
          data: {
            type: 'taxonomy_term--categories',
            id: itemData.category_id
          }
        };
      }

      if (itemData.unit_of_measure_id) {
        payload.data.relationships.field_unit_of_measure = {
          data: {
            type: 'taxonomy_term--unit_of_measure',
            id: itemData.unit_of_measure_id
          }
        };
      }

      const response = await client.post(
        `${DRUPAL_BASE_URL}/jsonapi/node/item_master`,
        payload,
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          }
        }
      );

      return this.transformItemMaster(response.data.data, response.data.included);
    } catch (error) {
      console.error('Error creating item master:', error);
      throw error;
    }
  }

  // Update item master
  async updateItemMaster(id: string, itemData: ItemMasterFormData): Promise<ItemMaster> {
    try {
      // Get CSRF token
      const tokenResponse = await axios.get(`${DRUPAL_BASE_URL}/session/token`);
      const csrfToken = tokenResponse.data;

      const client = this.getAuthenticatedClient();
      
      const payload: any = {
        data: {
          type: 'node--item_master',
          id: id,
          attributes: {
            title: itemData.title,
            field_item_code: itemData.item_code,
            status: itemData.status,
          }
        }
      };

      // Add optional fields
      if (itemData.specifications) {
        payload.data.attributes.field_specifications = {
          value: itemData.specifications,
          format: 'plain_text'
        };
      }

      // Add relationships
      payload.data.relationships = {};

      if (itemData.category_id) {
        payload.data.relationships.field_category = {
          data: {
            type: 'taxonomy_term--categories',
            id: itemData.category_id
          }
        };
      } else {
        payload.data.relationships.field_category = {
          data: null
        };
      }

      if (itemData.unit_of_measure_id) {
        payload.data.relationships.field_unit_of_measure = {
          data: {
            type: 'taxonomy_term--unit_of_measure',
            id: itemData.unit_of_measure_id
          }
        };
      } else {
        payload.data.relationships.field_unit_of_measure = {
          data: null
        };
      }

      const response = await client.patch(
        `${DRUPAL_BASE_URL}/jsonapi/node/item_master/${id}`,
        payload,
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          }
        }
      );

      return this.transformItemMaster(response.data.data, response.data.included);
    } catch (error) {
      console.error('Error updating item master:', error);
      throw error;
    }
  }

  // Delete item master
  async deleteItemMaster(id: string): Promise<void> {
    try {
      // Get CSRF token
      const tokenResponse = await axios.get(`${DRUPAL_BASE_URL}/session/token`);
      const csrfToken = tokenResponse.data;

      const client = this.getAuthenticatedClient();
      
      await client.delete(
        `${DRUPAL_BASE_URL}/jsonapi/node/item_master/${id}`,
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          }
        }
      );
    } catch (error) {
      console.error('Error deleting item master:', error);
      throw error;
    }
  }

  // Get statistics
  async getItemMasterStats(): Promise<ItemMasterStats> {
    try {
      const items = await this.getItemMasters();
      return {
        total: items.length,
        active: items.filter(item => item.status).length,
        inactive: items.filter(item => !item.status).length,
      };
    } catch (error) {
      console.error('Error fetching item master stats:', error);
      return { total: 0, active: 0, inactive: 0 };
    }
  }

  // Search item masters
  async searchItemMasters(query: string): Promise<ItemMaster[]> {
    try {
      const allItems = await this.getItemMasters();
      const searchLower = query.toLowerCase();
      
      return allItems.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.item_code.toLowerCase().includes(searchLower) ||
        (item.specifications && item.specifications.toLowerCase().includes(searchLower)) ||
        (item.category_name && item.category_name.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching item masters:', error);
      return [];
    }
  }

  // Get categories for dropdown
  async getCategories(): Promise<TaxonomyTerm[]> {
    try {
      const response = await axios.get(
        `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/categories?sort=name`
      );
      
      if (!response.data?.data) {
        return [];
      }

      return response.data.data.map((term: any) => ({
        id: term.id,
        name: term.attributes.name
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get units of measure for dropdown
  async getUnitsOfMeasure(): Promise<TaxonomyTerm[]> {
    try {
      const response = await axios.get(
        `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/unit_of_measure?sort=name`
      );
      
      if (!response.data?.data) {
        return [];
      }

      return response.data.data.map((term: any) => ({
        id: term.id,
        name: term.attributes.name
      }));
    } catch (error) {
      console.error('Error fetching units of measure:', error);
      return [];
    }
  }
}

export default new ItemMasterService();
