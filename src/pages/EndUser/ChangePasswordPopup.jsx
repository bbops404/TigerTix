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
      <div className="font-Poppins fixed top-0 left-0 w-full h-full z-50 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-sm">
        <div className="w-[500px] max-w-[90vw] h-auto max-h-[90vh] bg-white p-6 rounded-lg shadow-lg">
          <h2 className="font-Poppins text-xl font-bold mb-4 text-center">CHANGE PASSWORD</h2>

          
          <div className="text-left w-full mb-5"> 
            <p className="text-custom_black mb-1 text-sm">Current Password</p>
            <div className="bg-white flex px-3 py-3 gap-2 items-center rounded-lg border-2 border-[#D8DADC] w-full">
              <input
                type="password"
                className="focus:outline-none text-sm w-full text-gray-600"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="text-left w-full mb-5"> 
            <p className="text-custom_black mb-1 text-sm">New Password</p>
            <div className="bg-white flex px-3 py-3 gap-2 items-center rounded-lg border-2 border-[#D8DADC] w-full">
              <input
                type="password"
                className="focus:outline-none text-sm w-full text-gray-600"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="text-left w-full mb-5"> 
            <p className="text-custom_black mb-1 text-sm">Confirm New Password</p>
            <div className="bg-white flex px-3 py-3 gap-2 items-center rounded-lg border-2 border-[#D8DADC] w-full">
              <input
                type="password"
                className="focus:outline-none text-sm w-full text-gray-600"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>


          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-2 mt-4">
            <button className="font-Poppins bg-[#333333] text-[#FFD7A5] hover:bg-[#FFD7A5] hover:text-[#333333] text-white px-4 py-2 rounded-md" onClick={togglePopup}>
              Cancel
            </button>
            <button className="font-Poppins bg-[#333333] text-[#FFD7A5] hover:bg-[#FFD7A5] hover:text-[#333333] text-white px-4 py-2 rounded-md" onClick={handleChangePassword}>
              UPDATE
            </button>
          </div>
        </div>
      </div>
    )  
  );
};

export default ChangePasswordPopup;