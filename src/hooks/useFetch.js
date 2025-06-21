// src/hooks/useFetch.js

import { useState, useEffect } from 'react';
import directusClient from '../api/directusClient';

const useFetch = (endpoint) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the access token from local storage
        const token = localStorage.getItem('access_token');

        // Check if token exists, if so, set it in the Authorization header
        if (token) {
          directusClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const response = await directusClient.get(endpoint);
        setData(response.data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};

export default useFetch;
