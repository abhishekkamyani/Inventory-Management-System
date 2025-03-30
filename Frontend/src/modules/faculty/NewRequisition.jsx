import React, { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import axios from 'axios';
import RequisitionForm from '../../components/RequisitionForm';

const NewRequisition = ({ onSuccess }) => {
  const [items, setItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const API_BASE_URL = "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both items and categories
        const [itemsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/inventory/items`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/api/inventory/categories`, { withCredentials: true })
        ]);

        // Process items data similar to InventoryConfig
        const itemsData = itemsRes.data;
        let processedItems = [];
        
        if (Array.isArray(itemsData)) {
          processedItems = itemsData;
        } else if (itemsData && Array.isArray(itemsData.items)) {
          processedItems = itemsData.items;
        } else if (itemsData && Array.isArray(itemsData.data)) {
          processedItems = itemsData.data;
        } else {
          console.warn('Unexpected items data format:', itemsData);
        }

        // Filter out items with quantity <= 0
        const available = processedItems.filter(item => item.quantity > 0);
        
        // Process categories data
        const categoriesData = categoriesRes.data;
        let processedCategories = [];
        
        if (Array.isArray(categoriesData)) {
          processedCategories = categoriesData;
        } else if (categoriesData && Array.isArray(categoriesData.categories)) {
          processedCategories = categoriesData.categories;
        } else if (categoriesData && Array.isArray(categoriesData.data)) {
          processedCategories = categoriesData.data;
        } else {
          console.warn('Unexpected categories data format:', categoriesData);
        }

        setAvailableItems(available);
        setCategories(processedCategories);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load available items');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <ClipboardList className="mr-2" /> New Requisition
      </h3>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      <RequisitionForm 
        items={items} 
        setItems={setItems} 
        availableItems={availableItems} 
        categories={categories}
        submitting={submitting} 
        setSubmitting={setSubmitting} 
        onSuccess={onSuccess} 
        API_BASE_URL={API_BASE_URL}
      />
    </div>
  );
};

export default NewRequisition;