import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";
import { handleApiError } from "../../utils/apiErrorHandler";
import { useNavigate } from "react-router-dom";

const AddUserModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl w-[500px] h-[200px] shadow-lg">
        <h2 className="text-2xl text-black font-bold">Create a User</h2>
        <p className="text-black mt-2">
          Are you sure you want to add this user?
        </p>
        <p className="text-gray-600 text-sm">Please confirm to proceed.</p>
        <div className="flex justify-end gap-2 mt-10">
          <button
            onClick={onClose}
            className="px-8 py-1 bg-gray-700 text-white rounded-2xl"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-1 bg-[#F09C32] text-white rounded-2xl"
          >
            Confirm
          </button>
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
        <h2 className="text-2xl text-black font-bold">
          User Created Successfully!
        </h2>
        <p className="text-gray-600 mt-2">The new user has been added.</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="mt-10 px-8 py-1 bg-[#F09C32] text-white rounded-2xl"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const SupportStaff_AddUserPopUp = ({ showPopup, togglePopup }) => {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const navigate = useNavigate();

  const roles = ["Student", "Employee", "Alumni"];
  const token = sessionStorage.getItem("authToken"); // Get JWT token

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !firstName || !lastName || !email || !role) {
      alert("All fields are required!");
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmModalOpen(false);

    try {
      // Make a POST request to the backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/users/add`,
        {
          email,
          first_name: firstName,
          last_name: lastName,
          username,
          role,
        },
        {
          withCredentials: true, // ✅ Ensures cookies are sent (if applicable)
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Proper placement of the token
            "Content-Type": "application/json", // ✅ Explicitly setting content type
          },
        }
      );

      // If user is created successfully, show success modal
      if (response.status === 201) {
        setSuccessModalOpen(true);
      } else {
        alert(response.data.message || "Something went wrong!");
      }
    } catch (error) {
      if (!handleApiError(error, navigate)) {
        console.error("Error adding user:", error);

        // Handle different types of errors
        if (error.response) {
          // Server responded with a status code outside of 2xx
          alert(error.response.data.message || "Failed to add user.");
        } else if (error.request) {
          // Request was made but no response received
          alert("No response from server. Check your connection.");
        } else {
          // Something else happened
          alert("An unexpected error occurred.");
        }
      }
    }
  };

  return (
    showPopup && (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-20">
        <div className="bg-white w-[500px] max-w-[90vw] p-6 rounded-lg shadow-lg text-black relative">
          <button
            className="absolute top-4 left-4 text-gray-700"
            onClick={togglePopup}
          >
            <IoArrowBack size={24} />
          </button>
          <h2 className="text-xl font-bold text-center mb-6">ADD USER</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Username</label>
                <input
                  type="text"
                  className="border p-2 rounded w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>First Name</label>
                <input
                  type="text"
                  className="border p-2 rounded w-full"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Last Name</label>
                <input
                  type="text"
                  className="border p-2 rounded w-full"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  className="border p-2 rounded w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>User Type</label>
                <select
                  className="border p-2 rounded w-full"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="" disabled>
                    See Roles
                  </option>
                  {roles.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-[#FFAB40] text-white font-bold px-2 py-2 rounded w-full mt-4 hover:bg-[#E69530]"
            >
              ADD USER
            </button>
          </form>
        </div>
        <AddUserModal
          isOpen={isConfirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={handleConfirm}
        />
        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => {
            setSuccessModalOpen(false);
            togglePopup();
          }}
        />
      </div>
    )
  );
};

export default SupportStaff_AddUserPopUp;
