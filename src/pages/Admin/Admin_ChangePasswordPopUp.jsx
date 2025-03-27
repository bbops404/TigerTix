import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";

const Admin_ChangePasswordPopUp = ({ showPopup, togglePopup }) => {
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
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-20 font-[Poppins]">
        <div className="w-[500px] max-w-[90vw] h-auto max-h-[90vh] bg-white p-6 rounded-lg shadow-lg text-black relative">
          <button className="absolute top-4 left-4 text-black text-2xl" onClick={togglePopup}>
            <IoArrowBack />
          </button>
          <h2 className="text-xl font-bold mb-4 text-center">CHANGE PASSWORD</h2>

          <div className="mb-3 text-left">
            <label className="text-sm">Current Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded text-black"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="mb-3 text-left">
            <label className="text-sm">New Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded text-black"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="mb-3 text-left">
            <label className="text-sm">Confirm New Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded text-black"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex justify-center mt-4">
            <button className="bg-[#F09C32] text-white px-10 py-2 rounded-full" onClick={handleChangePassword}>
              Update Password
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default Admin_ChangePasswordPopUp;
