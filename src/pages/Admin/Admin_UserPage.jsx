import React, { useState } from "react";
import { FaSearch, FaFilter, FaExclamationTriangle} from "react-icons/fa";
import Header from "../../components/Header";
import Sidebar_Admin from "../../components/SideBar_Admin";
import Admin_AddUserPopUp from "./Admin_AddUserPopUp";
import Admin_EditUserPopUp from "./Admin_EditUserPopUp";
import Admin_UserGenerateReport from "./Admin_UserGenerateReportPopUp";

const DeleteUserModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl w-[500px] h-[200px] shadow-lg">
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-[#C15454] text-xl" />
          <h2 className="text-2xl text-black font-bold">Delete User</h2>
        </div>
        <p className="text-black mt-2">Are you sure you want to delete the selected user(s)?</p>
        <p className="text-gray-600 text-sm">You cannot undo this later.</p>
        <div className="flex justify-end gap-2 mt-10">
          <button onClick={onClose} className="px-8 py-1 bg-gray-700 text-white rounded-2xl hover:scale-105">Cancel</button>
          <button onClick={onConfirm} className="px-8 py-1 bg-[#C15454] text-white rounded-2xl hover:scale-105">Delete</button>
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
        <p className="text-gray-600 mt-2">The user has been successfully removed.</p>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="mt-10 px-8 py-1 bg-[#F09C32] text-white rounded-2xl hover:scale-105">OK</button>
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

  const openAddUserPopup = () => setShowPopup(true);
  const closeAddUserPopup = () => setShowPopup(false);
  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);
  const openSuccessModal = () => setShowSuccessModal(true);
  const closeSuccessModal = () => setShowSuccessModal(false);
  const openGenerateReportPopup = () => setShowGenerateReportPopup(true);
  const closeGenerateReportPopup = () => setShowGenerateReportPopup(false);

  const handleDeleteUser = () => {
    closeDeleteModal();
    openSuccessModal();
  };

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white">
      <Header showSearch={false} showAuthButtons={false} />
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
              <button className="px-4 py-2 bg-white text-black rounded-full">Reset</button>
              <button className="px-4 py-2 bg-white text-black rounded-full flex items-center gap-2">
                <FaFilter /> Sort/Filter by
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-md shadow-md max-h-[400px] overflow-y-auto">
            <table className="w-full text-black border-collapse border border-[#D6D3D3] bg-white rounded-md overflow-hidden">
              <thead className="sticky top-0 bg-[#F09C32] text-[#333333] text-center z-1">
                <tr>
                  {["Username", "Full Name", "Role", "Email", "Account Status", "Violation Count"].map((header, index) => (
                    <th key={index} className="px-4 py-2 border border-[#D6D3D3] text-center">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { username: "olivesangels", fullName: "Olive's Angels", role: "Student", email: "olivesangels@ust.edu.ph", status: "Restricted/Active", violations: 0 },
                  { username: "john_doe", fullName: "John Doe", role: "Faculty", email: "johndoe@ust.edu.ph", status: "Active", violations: 1 },
                  { username: "tigersfan", fullName: "Tigers Fan Club", role: "Alumni", email: "tigersfan@ust.edu.ph", status: "Suspended", violations: 3 },
                  { username: "nathan_sci", fullName: "Nathan Science", role: "Student", email: "nathan@ust.edu.ph", status: "Active", violations: 0 },
                  { username: "lucas_m", fullName: "Lucas M.", role: "Student", email: "lucasm@ust.edu.ph", status: "Active", violations: 1 },
                  { username: "charlotte_d", fullName: "Charlotte D.", role: "Faculty", email: "charlotte_d@ust.edu.ph", status: "Active", violations: 0 },
                  { username: "kevin_ust", fullName: "Kevin UST", role: "Alumni", email: "kevin.ust@ust.edu.ph", status: "Suspended", violations: 2 },
                  { username: "elena_stu", fullName: "Elena Student", role: "Student", email: "elena@ust.edu.ph", status: "Active", violations: 0 },
                ].map((user, index) => (
                  <tr key={index} className="border border-[#D6D3D3] text-center">
                    <td className="px-4 py-2 border border-[#D6D3D3] flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="flex-1 text-center">{user.username}</span>
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">{user.fullName}</td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">{user.role}</td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">{user.email}</td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">{user.status}</td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">{user.violations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Buttons */}
          <div className="flex justify-center gap-4 mt-6">
          <button className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-200 hover:bg-[#F09C32] hover:font-bold hover:scale-105" onClick={() => setShowEditUserPopup(true)}>Edit User</button>
  <button className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-200 hover:bg-[#F09C32] hover:font-bold hover:scale-105" onClick={openAddUserPopup}>Add User</button>
  <button className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-200 hover:bg-[#F09C32] hover:font-bold hover:scale-105" onClick={openDeleteModal}>Delete User/s</button>
  <button className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-200 hover:bg-[#F09C32] hover:font-bold hover:scale-105" onClick={openGenerateReportPopup}>Generate Report</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteUserModal isOpen={showDeleteModal} onClose={closeDeleteModal} onConfirm={handleDeleteUser} />
      <SuccessModal isOpen={showSuccessModal} onClose={closeSuccessModal} />
      {showPopup && <Admin_AddUserPopUp showPopup={showPopup} togglePopup={closeAddUserPopup} />}
      {showEditUserPopup && <Admin_EditUserPopUp showPopup={showEditUserPopup} togglePopup={() => setShowEditUserPopup(false)} />}
      {showGenerateReportPopup && <Admin_UserGenerateReport isOpen={showGenerateReportPopup} onClose={closeGenerateReportPopup} />}
    </div>
  );
};

export default Admin_UserPage;
