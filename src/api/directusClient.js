import axios from 'axios';

// Create an instance of axios for Directus API
const directusClient = axios.create({
  baseURL: process.env.REACT_APP_DIRECTUS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to authenticate and get a token
export const authenticate = async () => {
  try {
    const response = await directusClient.post('/auth/login', {
      email: process.env.REACT_APP_DIRECTUS_EMAIL,
      password: process.env.REACT_APP_DIRECTUS_PASSWORD,
    });

    const { access_token } = response.data.data;
    directusClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
  } catch (error) {
    console.error('Authentication failed', error);
  }
};

// authenticate();

export default directusClient;
