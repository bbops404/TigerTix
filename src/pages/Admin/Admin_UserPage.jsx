//Admin_UserPage.jsx
import React, { useEffect, useState } from 'react';
import { FaSearch, FaFilter, FaExclamationTriangle} from "react-icons/fa";
import Sidebar_Admin from "../../components/SideBar_Admin";
import Header_Admin from "../../components/Header_Admin";
import Admin_AddUserPopUp from "./Admin_AddUserPopUp";
import Admin_EditUserPopUp from "./Admin_EditUserPopUp";
import Admin_UserGenerateReport from "./Admin_UserGenerateReportPopUp";
import axios from 'axios';


const DeleteUserModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl w-[500px] h-[200px] shadow-lg">
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-[#C15454] text-xl" />
          <h2 className="text-2xl text-black font-bold">Delete U`ser</h2>
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

// ✅ Add this state for search
const [searchTerm, setSearchTerm] = useState("");


  const [users, setUsers] = useState([]);


  const handleDeleteUser = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      
      // Make sure there are selected users
      if (selectedUsers.length === 0) {
        alert("No users selected for deletion");
        return;
      }
  
      // Send the selected user IDs in the request body
      const response = await axios.delete('http://localhost:5002/admin/users/delete', {
        withCredentials: true, // Ensures cookies are sent (if applicable)
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          ids: selectedUsers, // Passing selected user IDs
        },
      });
  
      // Handle response
      if (response.status === 200) {
        openSuccessModal(); // Open success modal if deletion is successful
      } else {
        alert(response.data.message || "Something went wrong during deletion.");
      }
    } catch (error) {
      console.error('Error deleting users:', error);
      alert('An error occurred while deleting users.');
    }
  
    closeDeleteModal(); // Close the delete modal after the process
  };
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem('authToken'); // 
        const response = await axios.get('http://localhost:5002/admin/users', {
          withCredentials: true, // ✅ Ensures cookies are sent (if applicable)
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Proper placement of the token
            "Content-Type": "application/json", // ✅ Explicitly setting content type
          },
        });

      // Map the users and combine first_name & last_name
      const formattedUsers = response.data.map(user => ({
        ...user,
        fullName: `${user.first_name} ${user.last_name}`.trim(), // Combine first and last name
      }));

      setUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
  
    fetchUsers();
  }, []);
  
  // ✅ Filter users based on the search term
const filteredUsers = users.filter(user =>
  user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.violation_count.toString().includes(searchTerm) // Ensure numbers are searchable
);
const [selectedUsers, setSelectedUsers] = useState([]);


const handleCheckboxChange = (user_id, isChecked) => {
  setSelectedUsers((prevSelected) =>
    isChecked
      ? [...prevSelected, user_id]
      : prevSelected.filter((id) => id !== user_id)
  );
};



  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white">


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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // ✅ Updates state on input change
          />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300">Reset</button>
              <button className="px-4 py-2 bg-white text-black rounded-md flex items-center gap-2 hover:bg-[#FFAB40] hover:text-black transition duration-300"
              onClick={() => setShowFilter(!showFilter)}>
                <FaFilter /> Sort/Filter by
              </button>
            </div>
          </div>


          {/* Filter Component */}
          {showFilter && <Admin_UserFilter showFilter={showFilter} setShowFilter={setShowFilter} />}


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
              <th key={index} className="px-4 py-2 border border-[#D6D3D3] text-center">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
        {filteredUsers.map((user, index) => (
            <tr key={index} className="border border-[#D6D3D3] text-center">
              <td className="px-4 py-2 border border-[#D6D3D3] flex items-center">
              <input
        type="checkbox"
        className="mr-2"
        onChange={(e) => handleCheckboxChange(user.user_id, e.target.checked)}
      />                <span className="flex-1 text-center">{user.username}</span>
              </td>
              <td className="px-4 py-2 border border-[#D6D3D3]">{user.fullName}</td>
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
            <button className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-100 hover:bg-[#F09C32] hover:scale-105" onClick={() => setShowEditUserPopup(true)}>Edit User</button>
            <button className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-100 hover:bg-[#F09C32] hover:scale-105" onClick={openAddUserPopup}>Add User</button>
            <button className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-100 hover:bg-[#F09C32] hover:scale-105" onClick={openDeleteModal}>Delete User</button>
            <button className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-100 hover:bg-[#F09C32] hover:scale-105" onClick={openGenerateReportPopup}>Generate Report</button>
          </div>
        </div>
      </div>


      {/* Modals */}
      <DeleteUserModal isOpen={showDeleteModal} onClose={closeDeleteModal} onConfirm={handleDeleteUser} selectedUserIds={selectedUsers}/>
      <SuccessModal isOpen={showSuccessModal} onClose={closeSuccessModal} />


      {/*PopUps*/}
      {showPopup && <Admin_AddUserPopUp showPopup={showPopup} togglePopup={closeAddUserPopup} />}
      {showEditUserPopup && <Admin_EditUserPopUp showPopup={showEditUserPopup} togglePopup={() => setShowEditUserPopup(false)} selectedUserIds={selectedUsers} />}
      {showGenerateReportPopup && <Admin_UserGenerateReport isOpen={showGenerateReportPopup} onClose={closeGenerateReportPopup}  
 />}
    </div>
  );
};


export default Admin_UserPage;