import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";

const AddUserModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl w-[500px] h-[200px] shadow-lg">
        <h2 className="text-2xl text-black font-bold">Create a User</h2>
        <p className="text-black mt-2">Are you sure you want to add this user?</p>
        <p className="text-gray-600 text-sm">Please confirm to proceed.</p>
        <div className="flex justify-end gap-2 mt-10">
          <button onClick={onClose} className="px-8 py-1 bg-gray-700 text-white rounded-2xl">Cancel</button>
          <button onClick={onConfirm} className="px-8 py-1 bg-[#F09C32] text-white rounded-2xl">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl w-[500px] h-[200px] shadow-lg">
        <h2 className="text-2xl text-black font-bold">User Created Successfully!</h2>
        <p className="text-gray-600 mt-2">The new user has been added.</p>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="mt-10 px-8 py-1 bg-[#F09C32] text-white rounded-2xl">OK</button>
        </div>
      </div>
    </div>
  );
};

const Admin_AddUserPopUp = ({ showPopup, togglePopup }) => {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  
  const roles = ["Student", "Faculty", "Alumni"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !firstName || !lastName || !email || !password || !confirmPassword || !role) {
      alert("All fields are required!");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleConfirm = () => {
    setConfirmModalOpen(false);
    setSuccessModalOpen(true);
  };

  return (
    showPopup && (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-20">
        <div className="bg-white w-[500px] max-w-[90vw] p-6 rounded-lg shadow-lg text-black relative">
          <button className="absolute top-4 left-4 text-gray-700" onClick={togglePopup}>
            <IoArrowBack size={24} />
          </button>
          <h2 className="text-xl font-bold text-center mb-6">ADD USER</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Username</label>
                <input type="text" className="border p-2 rounded w-full" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div>
                <label>First Name</label>
                <input type="text" className="border p-2 rounded w-full" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div>
                <label>Password</label>
                <input type="password" className="border p-2 rounded w-full" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div>
                <label>Last Name</label>
                <input type="text" className="border p-2 rounded w-full" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div>
                <label>Confirm Password</label>
                <input type="password" className="border p-2 rounded w-full" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <div>
                <label>Email</label>
                <input type="email" className="border p-2 rounded w-full" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label>Role</label>
                <select className="border p-2 rounded w-full" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="" disabled>See Roles</option>
                  {roles.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="bg-[#FFAB40] text-white font-bold px-2 py-2 rounded w-full mt-4 hover:bg-[#E69530]">
              ADD USER
            </button>
          </form>
        </div>
        <AddUserModal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={handleConfirm} />
        <SuccessModal isOpen={isSuccessModalOpen} onClose={() => { setSuccessModalOpen(false); togglePopup(); }} />
      </div>
    )
  );
};

export default Admin_AddUserPopUp;