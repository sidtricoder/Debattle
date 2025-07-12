const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000' 
  : 'https://neomentor-backend-140655189111.us-central1.run.app';

export { API_BASE_URL };
