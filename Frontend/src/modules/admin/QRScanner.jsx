import React, { useState, useRef } from 'react';
import QrReader from 'react-qr-scanner';
import axios from 'axios';

const QRScanner = () => {
  const [result, setResult] = useState('');
  const [item, setItem] = useState(null);
  const [quantityReceived, setQuantityReceived] = useState(1);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const qrRef = useRef(null);

  // Validate ObjectId format
  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Extract ObjectId from URL (if applicable)
  const extractObjectId = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  // Request camera access
  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
    if (quantityReceived < 1) {
      alert('Quantity received must be at least 1');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/qr/scan', {
        itemId: result,
        quantityReceived,
        expectedName: item.name,
        expectedCategory: item.category,
      });
      setShowSuccess(true);
      // Reset state after successful update
      setResult('');
      setItem(null);
      setQuantityReceived(1);
      setIsScanning(false);
      setCameraAllowed(false);
    } catch (err) {
      alert('Failed to update stock levels');
      console.error('Error updating stock levels:', err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner error:', err);
    setError('Failed to access the camera. Please allow camera permissions and try again.');
  };

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
              onClick={() => setIsScanning(false)}
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
            <p className="text-gray-700"><span className="font-medium">Quantity:</span> {item.quantity}</p>

            <div className="mt-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity Received
              </label>
              <input
                type="number"
                id="quantity"
                value={quantityReceived}
                onChange={(e) => setQuantityReceived(Number(e.target.value))}
                min="1"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleUpdateStock}
              disabled={loading}
              className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 disabled:opacity-50"
            >
              Update Stock
            </button>
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
              onClick={() => setShowSuccess(false)}
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