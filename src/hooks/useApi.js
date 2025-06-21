import axios from 'axios';

// Create an instance of axios for Directus API
const directusClient = axios.create({
  baseURL: process.env.REACT_APP_DIRECTUS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to make GET and POST requests to Directus flows
export const callDirectusFlow = async (flowId, method = 'GET', data = null) => {
  try {
    const url = `/flows/trigger/${flowId}`;
    const config = {
      method,
      url,
      data,
    };

    const response = await directusClient(config);

    // Check for a successful response
    if (response.data.success) {
      console.log('Response:', response.data.data);
      return response.data.data;
    } else {
      // Handle cases where `success` is false
      console.error('Directus API returned an error:', response.data);
      throw new Error(`Error: ${response.data.message || 'Server error'}`);
    }
  } catch (error) {
    // Enhanced error handling
    console.error(`Failed to ${method} flow ${flowId}:`, error.response?.data || error.message || error);
    throw error; // Rethrow to let the caller handle it
  }
};

export default directusClient;
