import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";

const Admin_EditDetailsPopUp = ({ showPopup, togglePopup }) => {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const handleUpdateProfile = () => {
    alert("Profile updated successfully!");
    togglePopup();
  };

  return (
    showPopup && (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-20">
        <div className="bg-white w-[500px] max-w-[90vw] p-6 rounded-lg shadow-lg text-black relative">
          {/* Back Icon */}
          <button className="absolute top-4 left-4 text-gray-700" onClick={togglePopup}>
            <IoArrowBack size={24} />
          </button>

          <h2 className="text-xl font-bold text-center mb-4">EDIT PROFILE</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Username</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded" 
                placeholder="Enter Username"
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm">First Name</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded" 
                placeholder="Enter First Name"
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm">Email</label>
              <input 
                type="email" 
                className="w-full p-2 border rounded" 
                placeholder="Enter Email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm">Last Name</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded" 
                placeholder="Enter Last Name"
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <button 
              className="bg-[#F09C32] text-white px-10 py-2 rounded-full" 
              onClick={handleUpdateProfile}
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default Admin_EditDetailsPopUp;
