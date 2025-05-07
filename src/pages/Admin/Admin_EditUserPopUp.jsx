import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";

const EditUserModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl w-[500px] h-[200px] shadow-lg">
        <h2 className="text-2xl text-black font-bold">Update User</h2>
        <p className="text-black mt-2">
          Are you sure you want to update the following user?
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
            Update
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
          User Updated Successfully!
        </h2>
        <p className="text-gray-600 mt-2">
          The user's information has been successfully updated.
        </p>
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

const Admin_EditUserPopUp = ({ showPopup, togglePopup, selectedUserIds }) => {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const token = "your-auth-token"; // Replace this with your actual token

  const roles = ["Student", "Employee", "Alumni", "Admin", "Support Staff"];
  const statuses = ["Active", "Restricted", "Suspended"];

  const handleSubmit = (e) => {
    e.preventDefault();

    setConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmModalOpen(false);

    try {
      // Loop through selected users and send update requests for each one
      const updatePromises = selectedUserIds.map(async (userId) => {
        try {
          // Update status for each user
          const token = sessionStorage.getItem("authToken"); //
          const statusResponse = await axios.put(
            `${import.meta.env.VITE_API_URL}/admin/users/${userId}/status`,
            { status: accountStatus.toLowerCase() },
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          // Update role for each user
          const roleResponse = await axios.put(
            `${import.meta.env.VITE_API_URL}/admin/users/${userId}/role`,
            { role: role.toLowerCase() },
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          // Optionally handle the response to check for successful update
          if (statusResponse.status === 200 && roleResponse.status === 200) {
            console.log(`User ${userId} updated successfully`);
            setSuccessModalOpen(true);
          } else {
            console.error(`Failed to update user ${userId}`);
          }
        } catch (error) {
          console.error(`Error updating user ${userId}:`, error);
          alert(`Failed to update user ${userId}. Please try again.`);
        }
      });

      // Wait for all update promises to resolve
      await Promise.all(updatePromises);

      // Show success modal after all updates are complete
    } catch (error) {
      console.error("Error updating users:", error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with a status code outside of 2xx
        alert(error.response.data.message || "Failed to update users.");
      } else if (error.request) {
        // Request was made but no response received
        alert("No response from server. Check your connection.");
      } else {
        // Something else happened
        alert("An unexpected error occurred.");
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
          <h2 className="text-xl font-bold text-center mb-6">EDIT USER</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Role</label>
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
              <div>
                <label>Account Status</label>
                <select
                  className="border p-2 rounded w-full"
                  value={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.value)}
                >
                  <option value="" disabled>
                    Change Account Status
                  </option>
                  {statuses.map((option, index) => (
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
              UPDATE USER
            </button>
          </form>
        </div>

        {/* Modals */}
        <EditUserModal
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

export default Admin_EditUserPopUp;
