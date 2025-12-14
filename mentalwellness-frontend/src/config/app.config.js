export const APP_CONFIG = {
  APP_NAME: 'Mental Wellness',
  APP_VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@mentalwellness.com',
  SUPPORT_PHONE: '+256 700 000 000',
  
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZES: [10, 20, 50, 100],
  },

  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm',

  CURRENCY: {
    SYMBOL: 'UGX',
    CODE: 'UGX',
  },

  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },
};

export default APP_CONFIG;

