import axios from 'axios';

const DRUPAL_BASE_URL = import.meta.env.VITE_DRUPAL_BASE_URL || 'https://ims-drupal-headless.ddev.site';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Office interface
export interface Office {
  id: string;
  name: string;
  officeCode?: string;
}

// Wing interface
export interface Wing {
  id: string;
  name: string;
  wingCode?: string;
}

// DEC interface
export interface Dec {
  id: string;
  name: string;
  decCode?: string;
}

class SQLReferenceService {
  // Get CSRF token
  private async getCsrfToken(): Promise<string> {
    const response = await axios.get(`${DRUPAL_BASE_URL}/session/token`);
    return response.data;
  }

  // ==================== GET DATA FROM SQL ====================
  
  // Get all offices from SQL Server
  async getOfficesFromSQL(): Promise<Office[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/offices-new`);
      return response.data.map((office: any) => ({
        id: office.id?.toString() || office.OfficeID?.toString(),
        name: office.name || office.OfficeName,
        officeCode: office.code || office.OfficeCode
      }));
    } catch (error) {
      console.error('Error fetching offices from SQL:', error);
      return [];
    }
  }

  // Get all wings from SQL Server
  async getWingsFromSQL(): Promise<Wing[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wings`);
      return response.data.map((wing: any) => ({
        id: wing.id?.toString() || wing.WingID?.toString(),
        name: wing.name || wing.WingName,
        wingCode: wing.code || wing.WingCode
      }));
    } catch (error) {
      console.error('Error fetching wings from SQL:', error);
      return [];
    }
  }

  // Get all DECs from SQL Server
  async getDecsFromSQL(): Promise<Dec[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dec-mst`);
      return response.data.map((dec: any) => ({
        id: dec.id?.toString() || dec.DECID?.toString(),
        name: dec.name || dec.DECName,
        decCode: dec.code || dec.DECCode
      }));
    } catch (error) {
      console.error('Error fetching DECs from SQL:', error);
      return [];
    }
  }

  // ==================== SYNC TO DRUPAL ====================

  // Sync offices to Drupal taxonomy
  async syncOfficesToDrupal(): Promise<{ success: boolean; synced: number; message: string }> {
    try {
      const offices = await this.getOfficesFromSQL();
      const csrfToken = await this.getCsrfToken();
      
      let synced = 0;
      
      for (const office of offices) {
        try {
          // Check if term already exists
          const checkResponse = await axios.get(
            `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/offices?filter[name]=${encodeURIComponent(office.name)}`
          );

          if (checkResponse.data.data.length === 0) {
            // Create new term
            const payload = {
              data: {
                type: 'taxonomy_term--offices',
                attributes: {
                  name: office.name,
                  description: {
                    value: office.officeCode ? `Office Code: ${office.officeCode}` : '',
                    format: 'plain_text'
                  }
                }
              }
            };

            await axios.post(
              `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/offices`,
              payload,
              {
                headers: {
                  'Content-Type': 'application/vnd.api+json',
                  'X-CSRF-Token': csrfToken,
                },
                withCredentials: true
              }
            );
            synced++;
          }
        } catch (error) {
          console.error(`Error syncing office ${office.name}:`, error);
        }
      }

      return {
        success: true,
        synced,
        message: `Synced ${synced} offices to Drupal`
      };
    } catch (error) {
      console.error('Error syncing offices:', error);
      return {
        success: false,
        synced: 0,
        message: 'Failed to sync offices'
      };
    }
  }

  // Sync wings to Drupal taxonomy
  async syncWingsToDrupal(): Promise<{ success: boolean; synced: number; message: string }> {
    try {
      const wings = await this.getWingsFromSQL();
      const csrfToken = await this.getCsrfToken();
      
      let synced = 0;
      
      for (const wing of wings) {
        try {
          const checkResponse = await axios.get(
            `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/wings?filter[name]=${encodeURIComponent(wing.name)}`
          );

          if (checkResponse.data.data.length === 0) {
            const payload = {
              data: {
                type: 'taxonomy_term--wings',
                attributes: {
                  name: wing.name,
                  description: {
                    value: wing.wingCode ? `Wing Code: ${wing.wingCode}` : '',
                    format: 'plain_text'
                  }
                }
              }
            };

            await axios.post(
              `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/wings`,
              payload,
              {
                headers: {
                  'Content-Type': 'application/vnd.api+json',
                  'X-CSRF-Token': csrfToken,
                },
                withCredentials: true
              }
            );
            synced++;
          }
        } catch (error) {
          console.error(`Error syncing wing ${wing.name}:`, error);
        }
      }

      return {
        success: true,
        synced,
        message: `Synced ${synced} wings to Drupal`
      };
    } catch (error) {
      console.error('Error syncing wings:', error);
      return {
        success: false,
        synced: 0,
        message: 'Failed to sync wings'
      };
    }
  }

  // Sync DECs to Drupal taxonomy
  async syncDecsToDrupal(): Promise<{ success: boolean; synced: number; message: string }> {
    try {
      const decs = await this.getDecsFromSQL();
      const csrfToken = await this.getCsrfToken();
      
      let synced = 0;
      
      for (const dec of decs) {
        try {
          const checkResponse = await axios.get(
            `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/decs?filter[name]=${encodeURIComponent(dec.name)}`
          );

          if (checkResponse.data.data.length === 0) {
            const payload = {
              data: {
                type: 'taxonomy_term--decs',
                attributes: {
                  name: dec.name,
                  description: {
                    value: dec.decCode ? `DEC Code: ${dec.decCode}` : '',
                    format: 'plain_text'
                  }
                }
              }
            };

            await axios.post(
              `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/decs`,
              payload,
              {
                headers: {
                  'Content-Type': 'application/vnd.api+json',
                  'X-CSRF-Token': csrfToken,
                },
                withCredentials: true
              }
            );
            synced++;
          }
        } catch (error) {
          console.error(`Error syncing DEC ${dec.name}:`, error);
        }
      }

      return {
        success: true,
        synced,
        message: `Synced ${synced} DECs to Drupal`
      };
    } catch (error) {
      console.error('Error syncing DECs:', error);
      return {
        success: false,
        synced: 0,
        message: 'Failed to sync DECs'
      };
    }
  }

  // Sync all references at once
  async syncAllReferences(): Promise<{
    offices: { success: boolean; synced: number; message: string };
    wings: { success: boolean; synced: number; message: string };
    decs: { success: boolean; synced: number; message: string };
  }> {
    const [offices, wings, decs] = await Promise.all([
      this.syncOfficesToDrupal(),
      this.syncWingsToDrupal(),
      this.syncDecsToDrupal()
    ]);

    return { offices, wings, decs };
  }

  // ==================== GET FROM DRUPAL FOR DROPDOWNS ====================

  // Get offices from Drupal (for dropdown)
  async getOfficesFromDrupal(): Promise<{ id: string; name: string }[]> {
    try {
      const response = await axios.get(
        `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/offices?sort=name`
      );
      
      if (!response.data?.data) {
        return [];
      }

      return response.data.data.map((term: any) => ({
        id: term.id,
        name: term.attributes.name
      }));
    } catch (error) {
      console.error('Error fetching offices from Drupal:', error);
      return [];
    }
  }

  // Get wings from Drupal (for dropdown)
  async getWingsFromDrupal(): Promise<{ id: string; name: string }[]> {
    try {
      const response = await axios.get(
        `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/wings?sort=name`
      );
      
      if (!response.data?.data) {
        return [];
      }

      return response.data.data.map((term: any) => ({
        id: term.id,
        name: term.attributes.name
      }));
    } catch (error) {
      console.error('Error fetching wings from Drupal:', error);
      return [];
    }
  }

  // Get DECs from Drupal (for dropdown)
  async getDecsFromDrupal(): Promise<{ id: string; name: string }[]> {
    try {
      const response = await axios.get(
        `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/decs?sort=name`
      );
      
      if (!response.data?.data) {
        return [];
      }

      return response.data.data.map((term: any) => ({
        id: term.id,
        name: term.attributes.name
      }));
    } catch (error) {
      console.error('Error fetching DECs from Drupal:', error);
      return [];
    }
  }
}

export default new SQLReferenceService();
