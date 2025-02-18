import React from 'react';

const QRCodeScanner = () => {
  const handleScan = (data) => {
    if (data) {
      alert(`Scanned QR Code: ${data}`);
      // Add logic to update inventory based on scanned data
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">QR Code Scanner</h2>
      <div className="text-center">
        <p className="mb-4">Scan a QR code to update inventory.</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={() => {
            // Simulate QR code scanning
            handleScan('Item ID: 12345');
          }}
        >
          Simulate Scan
        </button>
      </div>
    </div>
  );
};

export default QRCodeScanner;