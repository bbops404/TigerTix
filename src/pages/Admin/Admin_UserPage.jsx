
import React, { useEffect, useState } from "react";

import { FaSearch, FaFilter, FaExclamationTriangle } from "react-icons/fa";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";
import Header_Admin from "../../components/Admin/Header_Admin";
import Admin_AddUserPopUp from "./Admin_AddUserPopUp";
import Admin_EditUserPopUp from "./Admin_EditUserPopUp";
import Admin_UserGenerateReport from "./Admin_UserGenerateReportPopUp";
import Admin_UserFilter from "./Admin_UserFilter"
import axios from "axios";

const DeleteUserModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl w-[500px] h-[200px] shadow-lg">
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-[#C15454] text-xl" />
          <h2 className="text-2xl text-black font-bold">Delete User</h2>
        </div>
        <p className="text-black mt-2">
          Are you sure you want to delete the selected user(s)?
        </p>
        <p className="text-gray-600 text-sm">You cannot undo this later.</p>
        <div className="flex justify-end gap-2 mt-10">
          <button
            onClick={onClose}
            className="px-8 py-1 bg-gray-700 text-white rounded-2xl hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-1 bg-[#C15454] text-white rounded-2xl hover:scale-105"
          >
            Delete
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
        <h2 className="text-2xl text-black font-bold">User Deleted</h2>
        <p className="text-gray-600 mt-2">
          The user has been successfully removed.
        </p>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="mt-10 px-8 py-1 bg-[#F09C32] text-white rounded-2xl hover:scale-105"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const Admin_UserPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showEditUserPopup, setShowEditUserPopup] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showGenerateReportPopup, setShowGenerateReportPopup] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const openAddUserPopup = () => setShowPopup(true);
  const closeAddUserPopup = () => setShowPopup(false);

  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);
  const openSuccessModal = () => setShowSuccessModal(true);
  const closeSuccessModal = () => setShowSuccessModal(false);

  const openGenerateReportPopup = () => setShowGenerateReportPopup(true);
  const closeGenerateReportPopup = () => setShowGenerateReportPopup(false);

  const [users, setUsers] = useState([]);

  const handleDeleteUser = () => {
    closeDeleteModal();
    openSuccessModal();
  };


  useEffect(() => {
    // Fetching user data from the API
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5003/users"); //5002 yung sa backend na mismo
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []); 

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">

      {/* Header */}
      <Header_Admin />

      {/* Main Layout */}

      <div className="flex">
        <Sidebar_Admin />
        <div className="flex-1 px-10 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-grow mr-4">
              <FaSearch className="absolute left-4 top-3 text-white" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-500 text-white outline-none"
              />
            </div>
            <div className="flex gap-2">

              <button className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300">
                Reset
              </button>
              <button
                className="px-4 py-2 bg-white text-black rounded-md flex items-center gap-2 hover:bg-[#FFAB40] hover:text-black transition duration-300"
                onClick={() => setShowFilter(!showFilter)}
              >
                <FaFilter /> Sort/Filter by
              </button>
            </div>
          </div>

          {/* Filter Component */}
          {showFilter && (
            <Admin_UserFilter
              showFilter={showFilter}
              setShowFilter={setShowFilter}
            />
          )}

          {/* Users Table */}
          <div className="overflow-x-auto rounded-md shadow-md max-h-[400px] overflow-y-auto">
            <table className="w-full text-black border-collapse border border-[#D6D3D3] bg-white rounded-md overflow-hidden">
              <thead className="sticky top-0 bg-[#F09C32] text-[#333333] text-center z-1">
                <tr>
                  {[
                    "Username",
                    "Full Name",
                    "Role",
                    "Email",
                    "Account Status",
                    "Violation Count",
                  ].map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-2 border border-[#D6D3D3] text-center"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>

                  {users.map((user, index) => (
                    <tr key={index} className="border border-[#D6D3D3] text-center">
                      <td className="px-4 py-2 border border-[#D6D3D3] text-left">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>{user.username}</span>
                  </div>
                </td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">{user.first_name} {user.last_name}</td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">{user.role}</td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">{user.email}</td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">{user.status}</td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">{user.violation_count}</td>
                    </tr>
                  ))}

              </tbody>
            </table>
          </div>

          {/* Bottom Buttons */}
          <div className="flex justify-center gap-4 mt-6">

            <button
              className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-100 hover:bg-[#F09C32] hover:scale-105"
              onClick={() => setShowEditUserPopup(true)}
            >
              Edit User
            </button>
            <button
              className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-100 hover:bg-[#F09C32] hover:scale-105"
              onClick={openAddUserPopup}
            >
              Add User
            </button>
            <button
              className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-100 hover:bg-[#F09C32] hover:scale-105"
              onClick={openDeleteModal}
            >
              Delete User/s
            </button>
            <button
              className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-100 hover:bg-[#F09C32] hover:scale-105"
              onClick={openGenerateReportPopup}
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteUser}
      />
      <SuccessModal isOpen={showSuccessModal} onClose={closeSuccessModal} />


      {/*PopUps*/}

      {showPopup && (
        <Admin_AddUserPopUp
          showPopup={showPopup}
          togglePopup={closeAddUserPopup}
        />
      )}
      {showEditUserPopup && (
        <Admin_EditUserPopUp
          showPopup={showEditUserPopup}
          togglePopup={() => setShowEditUserPopup(false)}
        />
      )}
      {showGenerateReportPopup && (
        <Admin_UserGenerateReport
          isOpen={showGenerateReportPopup}
          onClose={closeGenerateReportPopup}
        />
      )}
    </div>
  );
};

export default Admin_UserPage;
