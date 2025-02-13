import React, { useState } from "react";

const ChangePasswordPopup = ({ showPopup, togglePopup }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match!");
      return;
    }

    alert("Password successfully changed!");
    togglePopup();
  };

  return (
    showPopup && (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 z-5">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>

          <div className="mb-3">
            <label className="text-sm font-semibold">Current Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="text-sm font-semibold">New Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="text-sm font-semibold">Confirm New Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-2 mt-4">
            <button className="bg-gray-500 text-white px-4 py-2 rounded-md" onClick={togglePopup}>
              Cancel
            </button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleChangePassword}>
              Save
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ChangePasswordPopup;