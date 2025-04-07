import React, { useEffect, useState } from "react";

const SuccessModal = ({ isOpen, onClose, onRedirect, title, message, redirectAfterSeconds = 5 }) => {
  const [countdown, setCountdown] = useState(redirectAfterSeconds);

  useEffect(() => {
    if (isOpen) {
      setCountdown(redirectAfterSeconds); // Reset countdown when modal opens
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      setTimeout(() => {
        clearInterval(timer);
        onRedirect(); // Redirect after countdown
      }, redirectAfterSeconds * 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, redirectAfterSeconds, onRedirect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-semibold text-green-600">{title}</h2>
        <p className="mt-2 text-gray-700">{message}</p>
        <p className="mt-2 text-sm text-gray-500">Redirecting in {countdown} seconds...</p>
      </div>
    </div>
  );
};

export default SuccessModal;
