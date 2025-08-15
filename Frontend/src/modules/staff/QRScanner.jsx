import React, { useState, useRef } from 'react';
import QrReader from 'react-qr-scanner';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { saveAs } from 'file-saver';

const QRScanner = () => {
  // Existing states
  const [result, setResult] = useState('');
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [actionType, setActionType] = useState('receive');
  const qrRef = useRef(null);
  const streamRef = useRef(null);

  // New states for QR generation
  const [showGenerateQR, setShowGenerateQR] = useState(false);
  const [itemsList, setItemsList] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [qrSize, setQrSize] = useState(256);
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrFgColor, setQrFgColor] = useState('#000000');

  // Existing functions remain exactly the same
  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  const extractObjectId = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (qrRef.current) {
      qrRef.current.stopCamera();
    }
  };

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
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
    stopCamera();
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

const fetchItems = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axios.get(`http://localhost:3000/api/qr/items/list`, { 
      withCredentials: true 
    });
    console.log('Response data:', response.data); // Right after the axios call

    if (!response.data) {
      throw new Error('No data received from server');
    }

    // Simplify the response handling
    const itemsData = Array.isArray(response.data) ? response.data : [];
    
    setItemsList(itemsData);
  } catch (err) {
    console.error('Error fetching items:', err);
    setError(err.response?.data?.message || err.message || 'Failed to load items');
  } finally {
    setLoading(false);
  }
};
 

  const handleGenerateQR = () => {
    if (!selectedItem) {
      setError('Please select an item');
      return;
    }
    setQrValue(`http://localhost:3000/items/${selectedItem}`);
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        saveAs(blob, `qr-code-${selectedItem}.png`);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const toggleGenerateQR = async () => {
    setShowGenerateQR(!showGenerateQR);
    if (!showGenerateQR) {
      await fetchItems();
    } else {
      setSelectedItem('');
      setQrValue('');
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">QR Code Manager</h1>

        {/* Mode selector */}
        <div className="flex mb-6 rounded-md overflow-hidden border border-gray-300">
          <button
            onClick={() => setShowGenerateQR(false)}
            className={`flex-1 py-2 px-4 transition duration-200 ${!showGenerateQR ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
          >
            Scan QR
          </button>
          <button
            onClick={toggleGenerateQR}
            className={`flex-1 py-2 px-4 transition duration-200 ${showGenerateQR ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
          >
            Generate QR
          </button>
        </div>

        {showGenerateQR ? (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Generate QR Code</h2>

            <div className="mb-4">
              <label htmlFor="item-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Item
              </label>
              <select
                id="item-select"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">Select an item</option>
                {itemsList.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} 
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="qr-size" className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code Size
                </label>
                <input
                  type="range"
                  id="qr-size"
                  min="128"
                  max="512"
                  step="32"
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center mt-1">{qrSize}px</div>
              </div>

              <div>
                <label htmlFor="qr-fg-color" className="block text-sm font-medium text-gray-700 mb-2">
                  QR Color
                </label>
                <input
                  type="color"
                  id="qr-fg-color"
                  value={qrFgColor}
                  onChange={(e) => setQrFgColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateQR}
              disabled={!selectedItem || loading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 mb-4 disabled:opacity-50"
            >
              Generate QR Code
            </button>

            {qrValue && (
              <div className="flex flex-col items-center">
                <div className="mb-4 p-4 border border-gray-300 rounded-md bg-white">
                  <div style={{ background: qrBgColor, padding: '16px' }}>
                    <QRCodeSVG
                      id="qr-code-svg"
                      value={qrValue}
                      size={qrSize - 32}
                      fgColor={qrFgColor}
                      bgColor={qrBgColor}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>
                <button
                  onClick={downloadQRCode}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Download QR Code
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Existing scanning UI remains exactly the same */}
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
                    className={`flex-1 ${actionType === 'receive' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
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
          </>
        )}
      </div>
    </div>
  );
};

export default QRScanner;