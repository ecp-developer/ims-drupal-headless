import axios from 'axios';
import API_CONFIG from '../config/api';

class AuthService {
  private csrfToken: string | null = null;
  private sessionCookie: string | null = null;

  // Get CSRF token for authenticated requests
  async getCsrfToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/session/token`, {
        withCredentials: true,
      });
      this.csrfToken = response.data;
      return this.csrfToken;
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      throw new Error('Failed to get authentication token');
    }
  }

  // Simple login (if you have basic auth or want to implement user login)
  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/user/login?_format=json`,
        {
          name: username,
          pass: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Get CSRF token after login
        await this.getCsrfToken();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await axios.post(
        `${API_CONFIG.BASE_URL}/user/logout?_format=json`,
        {},
        {
          withCredentials: true,
        }
      );
      this.csrfToken = null;
      this.sessionCookie = null;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.csrfToken !== null;
  }
}

export const authService = new AuthService();
export default authService;
