// Authentication Debug Helper
// This file helps debug authentication issues with Drupal

import axios from 'axios';
import API_CONFIG from '../config/api';
import authService from '../services/authService';
import type { AxiosError } from 'axios';

// Create authenticated axios instance
const createApiInstance = () => {
  return axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
    withCredentials: true,
  });
};

export class AuthDebugger {
  
  // Test basic connectivity to Drupal site
  static async testBasicConnectivity() {
    try {
      console.log('🔍 Testing basic connectivity to Drupal site...');
      console.log('Target URL:', API_CONFIG.BASE_URL);
      
      const apiInstance = createApiInstance();
      
      // Try a simple GET request to the home page or a basic endpoint
      const response = await apiInstance.get('/', {
        timeout: 30000, // Increased timeout for this test
      });
      
      console.log('✅ Basic connectivity successful');
      console.log('Response status:', response.status);
      return { success: true, status: response.status };
    } catch (error) {
      console.error('❌ Basic connectivity failed:', error);
      const axiosError = error as AxiosError;
      if (axiosError.code === 'ECONNABORTED') {
        console.error('Request timed out - Drupal site may not be running');
      } else if (axiosError.response) {
        console.error('Response status:', axiosError.response.status);
        console.error('Response data:', axiosError.response.data);
      } else if (axiosError.request) {
        console.error('No response received:', axiosError.request);
      }
      return { success: false, error: (error as Error).message, code: axiosError.code };
    }
  }
  
  // Test if we can get CSRF token
  static async testCsrfToken() {
    try {
      console.log('🔍 Testing CSRF token retrieval...');
      const token = await authService.getCsrfToken();
      console.log('✅ CSRF token retrieved successfully:', token.substring(0, 20) + '...');
      return { success: true, token };
    } catch (error) {
      console.error('❌ Failed to get CSRF token:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Test if we can make an authenticated GET request
  static async testAuthenticatedGet() {
    try {
      console.log('🔍 Testing authenticated GET request...');
      
      // Get CSRF token first
      const csrfToken = await authService.getCsrfToken();
      
      // Create API instance
      const apiInstance = createApiInstance();
      
      // Make authenticated request
      const response = await apiInstance.get('/jsonapi/node/vendors?page[limit]=1', {
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
      
      console.log('✅ Authenticated GET request successful');
      return { success: true, status: response.status };
    } catch (error) {
      console.error('❌ Authenticated GET request failed:', error);
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error('Response status:', axiosError.response.status);
        console.error('Response data:', axiosError.response.data);
      }
      return { success: false, error: (error as Error).message, status: axiosError.response?.status };
    }
  }

  // Test if we can make an authenticated POST request
  static async testAuthenticatedPost() {
    try {
      console.log('🔍 Testing authenticated POST request...');
      
      // Get CSRF token first
      const csrfToken = await authService.getCsrfToken();
      
      // Create API instance
      const apiInstance = createApiInstance();
      
      // Test payload (minimal vendor data)
      const testPayload = {
        data: {
          type: 'node--vendors',
          attributes: {
            title: 'Test Vendor ' + Date.now(),
            status: true,
            field_vendor_code: 'TEST' + Date.now(),
            field_contact_person_name: 'Test Contact',
            field_email: 'test@example.com',
            field_phone: '1234567890',
            field_address: 'Test Address',
          }
        }
      };
      
      // Make authenticated POST request with increased timeout
      const response = await apiInstance.post('/jsonapi/node/vendors', testPayload, {
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        timeout: 30000, // Increased timeout to 30 seconds
      });
      
      console.log('✅ Authenticated POST request successful');
      return { success: true, status: response.status, data: response.data };
    } catch (error) {
      console.error('❌ Authenticated POST request failed:', error);
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNABORTED') {
        console.error('🕐 Request timed out. Possible causes:');
        console.error('   - Drupal site is not running (check DDEV status)');
        console.error('   - Slow server response');
        console.error('   - Network connectivity issues');
      } else if (axiosError.response) {
        console.error('Response status:', axiosError.response.status);
        console.error('Response data:', axiosError.response.data);
        console.error('Response headers:', axiosError.response.headers);
      } else if (axiosError.request) {
        console.error('No response received:', axiosError.request);
      }
      
      return { success: false, error: (error as Error).message, status: axiosError.response?.status, data: axiosError.response?.data };
    }
  }

  // Run all authentication tests
  static async runAllTests() {
    console.log('🚀 Starting authentication debugging...');
    
    const results = {
      connectivityTest: await this.testBasicConnectivity(),
      csrfTest: await this.testCsrfToken(),
      getTest: await this.testAuthenticatedGet(),
      postTest: await this.testAuthenticatedPost(),
    };

    console.log('📊 Authentication Test Results:', results);
    return results;
  }

  // Check current authentication status
  static checkAuthStatus() {
    const isAuth = authService.isAuthenticated();
    console.log('🔐 Current auth status:', isAuth ? 'Authenticated' : 'Not authenticated');
    return isAuth;
  }
}

export default AuthDebugger;