const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_DRUPAL_BASE_URL || 'https://ims-drupal-headless.ddev.site',
  JSONAPI_BASE: '/jsonapi',
  ENDPOINTS: {
    ARTICLES: '/jsonapi/node/article',
    PAGES: '/jsonapi/node/page',
    VENDORS: '/jsonapi/node/vendors',
  },
  HEADERS: {
    'Content-Type': 'application/vnd.api+json',
    'Accept': 'application/vnd.api+json',
  },
  TIMEOUT: 10000,
};

export default API_CONFIG;
