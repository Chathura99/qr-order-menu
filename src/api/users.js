// src/hooks/useFetch.js

import { useState, useEffect } from 'react';
import directusClient from './directusClient';

const users = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect((endpoint) => {
    const fetchData = async () => {
      try {
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

export default users;
