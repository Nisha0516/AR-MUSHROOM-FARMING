import { useState, useEffect } from 'react';
import { mushroomAPI, orderAPI, userAPI, checkServerHealth } from './api';

// Custom hook for fetching mushrooms
export const useMushrooms = () => {
  const [mushrooms, setMushrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMushrooms = async () => {
      try {
        setLoading(true);
        const response = await mushroomAPI.getAll();
        if (response.success) {
          setMushrooms(response.data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching mushrooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMushrooms();
  }, []);

  return { mushrooms, loading, error };
};

// Custom hook for fetching a single mushroom
export const useMushroom = (id) => {
  const [mushroom, setMushroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMushroom = async () => {
      try {
        setLoading(true);
        const response = await mushroomAPI.getById(id);
        if (response.success) {
          setMushroom(response.data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching mushroom:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMushroom();
    }
  }, [id]);

  return { mushroom, loading, error };
};

// Custom hook for server health check
export const useServerHealth = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await checkServerHealth();
        setIsConnected(response.status === 'Server is running');
      } catch (err) {
        setIsConnected(false);
        console.error('Server health check failed:', err);
      } finally {
        setChecking(false);
      }
    };

    checkHealth();
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { isConnected, checking };
};

// Custom hook for user authentication
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.login(credentials);
      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.register(userData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return { user, loading, error, login, register, logout };
};

export default useMushrooms;
