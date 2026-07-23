import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const DataContext = createContext();

export const useData = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, contentRes] = await Promise.all([
        fetch(`${API_URL}/api/products`, { cache: 'no-store' }),
        fetch(`${API_URL}/api/content`, { cache: 'no-store' })
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      } else {
        console.warn("Failed to fetch products");
      }

      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setContent(contentData);
      } else {
        console.warn("Failed to fetch content");
      }
    } catch (err) {
      console.error("Failed to fetch global data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ products, content, loading, error, refreshData: fetchData }}>
      {children}
    </DataContext.Provider>
  );
};
