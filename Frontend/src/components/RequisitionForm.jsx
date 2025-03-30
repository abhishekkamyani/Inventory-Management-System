import React, { useState } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import axios from 'axios';
const RequisitionForm = ({ 
  items, 
  setItems, 
  availableItems, 
  categories,
  submitting, 
  setSubmitting, 
  onSuccess,
  API_BASE_URL
}) => {
  const [error, setError] = useState(null);

  const handleAddItem = () => {
    setItems([...items, { item: '', quantity: 1, purpose: '' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Validate items
      const invalidItems = items.filter(item => 
        !item.item || !item.quantity || item.quantity <= 0 || !item.purpose
      );
      
      if (invalidItems.length > 0) {
        throw new Error('Please fill all item fields with valid values');
      }
  
      // Prepare payload matching backend expectations
      const payload = {
        items: items.map(item => ({
          item: item.item, // Ensure this is the correct item ID
          quantity: Number(item.quantity),
          purpose: item.purpose,
          name: availableItems.find(i => i._id === item.item)?.name || ''
        }))
      };
  
      console.log('Submitting payload:', payload); // Debug log
  
      const response = await axios.post(
        `${API_BASE_URL}/api/requisitions`,
        payload,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('Response:', response.data);
      
      onSuccess();
      setItems([{ item: '', quantity: 1, purpose: '' }]);
    } catch (err) {
      console.error('Full error:', err);
      const serverError = err.response?.data?.error;
      const validationError = err.response?.data?.errors?.join('\n');
      const errorMessage = serverError || validationError || err.message || 'Failed to submit requisition';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {items.map((item, index) => (
        <div key={index} className="flex flex-wrap gap-4 items-end p-4 border rounded-lg">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <select
              value={item.item}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].item = e.target.value;
                setItems(newItems);
              }}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Item</option>
              {categories.map(category => (
                <optgroup key={category._id} label={category.name}>
                  {availableItems
                    .filter(item => item.category === category._id)
                    .map(item => (
                      <option key={item._id} value={item._id}>
                        {item.name} (Stock: {item.quantity})
                      </option>
                    ))
                  }
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[100px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].quantity = parseInt(e.target.value) || 0;
                setItems(newItems);
              }}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <input
              type="text"
              value={item.purpose}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].purpose = e.target.value;
                setItems(newItems);
              }}
              placeholder="Purpose"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {items.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <MinusCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Item
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 flex items-center"
        >
          {submitting ? 'Submitting...' : 'Submit Requisition'}
        </button>
      </div>
    </form>
  );
};

export default RequisitionForm;