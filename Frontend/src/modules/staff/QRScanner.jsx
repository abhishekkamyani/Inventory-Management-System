import React, { useState, useRef } from 'react';
import QrReader from 'react-qr-scanner';
import axios from 'axios';

const QRScanner = () => {
  const [result, setResult] = useState('');
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [actionType, setActionType] = useState('receive'); // 'receive' or 'take'
  const qrRef = useRef(null);
  const streamRef = useRef(null); // To keep track of the camera stream

  // Validate ObjectId format
  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Extract ObjectId from URL (if applicable)
  const extractObjectId = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (qrRef.current) {
      qrRef.current.stopCamera();
    }
  };

  // Request camera access
  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream; // Store the stream reference
      setCameraAllowed(true);
      setIsScanning(true);
      if (qrRef.current) {
        qrRef.current.startCamera();
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions to scan QR codes.');
      console.error('Camera access error:', err);
    }
  };

  const handleScan = async (data) => {
    if (data) {
      const scannedValue = data.text;
      console.log('Scanned data:', scannedValue);

      const scannedId = extractObjectId(scannedValue);
      if (!isValidObjectId(scannedId)) {
        setError('Invalid Item ID format. Please scan a valid QR code.');
        return;
      }

      setResult(scannedId);
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3000/api/qr/${scannedId}`);
        setItem(response.data);
        setError('');
      } catch (err) {
        setError('Item not found or server error');
        console.error('Error fetching item:', err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateStock = async () => {
    if (quantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }
    
    if (actionType === 'take' && quantity > item.quantity) {
      alert(`Cannot take more than available stock (${item.quantity})`);
      return;
    }

    setLoading(true);
    try {
      const endpoint = actionType === 'receive' 
        ? 'http://localhost:3000/api/qr/receive' 
        : 'http://localhost:3000/api/qr/take';

      const response = await axios.post(endpoint, {
        itemId: result,
        quantity,
        expectedName: item.name,
        expectedCategory: item.category,
      });
      
      setShowSuccess(true);
      // Reset state after successful update
      resetForm();
    } catch (err) {
      alert(`Failed to ${actionType} stock`);
      console.error(`Error ${actionType === 'receive' ? 'receiving' : 'taking'} stock:`, 
        err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    stopCamera(); // Stop the camera when resetting
    setResult('');
    setItem(null);
    setQuantity(1);
    setIsScanning(false);
    setCameraAllowed(false);
    setActionType('receive');
    setError('');
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleStopScanning = () => {
    stopCamera();
    setIsScanning(false);
    setCameraAllowed(false);
  };

  const handleError = (err) => {
    console.error('QR Scanner error:', err);
    setError('Failed to access the camera. Please allow camera permissions and try again.');
  };

  // Clean up camera stream when component unmounts
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">QR Code Scanner</h1>

        {!isScanning && !showSuccess && (
          <button
            onClick={requestCameraAccess}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Start Scanning
          </button>
        )}

        {isScanning && (
          <>
            {cameraAllowed ? (
              <QrReader
                ref={qrRef}
                delay={300}
                onError={handleError}
                onScan={handleScan}
                className="w-full mb-4"
              />
            ) : (
              <p className="text-red-500 text-center">Camera access not granted.</p>
            )}
            <button
              onClick={handleStopScanning}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
            >
              Stop Scanning
            </button>
          </>
        )}

        {result && (
          <p className="mt-4 text-center text-gray-700">
            Scanned Item ID: <span className="font-semibold">{result}</span>
          </p>
        )}

        {loading && (
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {item && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Item Details</h2>
            <p className="text-gray-700"><span className="font-medium">Name:</span> {item.name}</p>
            <p className="text-gray-700"><span className="font-medium">Category:</span> {item.category}</p>
            <p className="text-gray-700"><span className="font-medium">Current Quantity:</span> {item.quantity}</p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="actionType"
                    value="receive"
                    checked={actionType === 'receive'}
                    onChange={() => setActionType('receive')}
                  />
                  <span className="ml-2">Receive Stock</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="actionType"
                    value="take"
                    checked={actionType === 'take'}
                    onChange={() => setActionType('take')}
                  />
                  <span className="ml-2">Take Stock</span>
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                {actionType === 'receive' ? 'Quantity Received' : 'Quantity Taken'}
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                max={actionType === 'take' ? item.quantity : undefined}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleUpdateStock}
                disabled={loading}
                className={`flex-1 ${
                  actionType === 'receive' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
                } text-white py-2 px-4 rounded-md transition duration-200 disabled:opacity-50`}
              >
                {actionType === 'receive' ? 'Add to Stock' : 'Remove from Stock'}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="mt-6 text-center">
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
              Stock updated successfully!
            </div>
            <button
              onClick={() => {
                setShowSuccess(false);
                requestCameraAccess();
              }}
              className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Start Scanning Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;