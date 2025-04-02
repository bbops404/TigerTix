import React, { useState, useCallback } from "react";
import { FaSearch, FaFilter, FaExclamationTriangle } from "react-icons/fa";
import Sidebar_Admin from "../../components/SideBar_Admin";
import Table from "../../components/Table";
import Header_Admin from "../../components/Header_Admin";
import Admin_AddUserPopUp from "./Admin_AddUserPopUp";
import Admin_EditUserPopUp from "./Admin_EditUserPopUp";
import Admin_UserGenerateReport from "./Admin_UserGenerateReportPopUp";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTable, useSortBy, usePagination, useFilters, useRowSelect } from 'react-table';
import ErrorBoundary from "../../components/ErrorBoundary";

// Modal for Deleting Users
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

// Success Modal
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

  const queryClient = useQueryClient();

  const openAddUserPopup = () => setShowPopup(true);
  const closeAddUserPopup = () => setShowPopup(false);
  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);
  const openSuccessModal = () => setShowSuccessModal(true);
  const closeSuccessModal = () => setShowSuccessModal(false);
  const openGenerateReportPopup = () => setShowGenerateReportPopup(true);
  const closeGenerateReportPopup = () => setShowGenerateReportPopup(false);

  const columns = React.useMemo(
    () => [
      {
        id: "selection",
        Header: ({ getToggleAllRowsSelectedProps, state }) => {
          const isIndeterminate =
            state.selectedRowIds &&
            Object.keys(state.selectedRowIds).length > 0 &&
            Object.keys(state.selectedRowIds).length < state.rowCount;
          
          // Clone the props and remove any indeterminate property
          const toggleAllProps = { ...getToggleAllRowsSelectedProps() };
          delete toggleAllProps.indeterminate;
  
          return (
            <input
              type="checkbox"
              {...toggleAllProps}
              ref={(el) => {
                if (el) {
                  el.indeterminate = isIndeterminate;
                }
              }}
            />
          );
        },
        Cell: ({ row }) => (
          <input type="checkbox" {...row.getToggleRowSelectedProps()} />
        ),
      },
      { Header: 'Username', accessor: 'username' },
      { Header: 'Full Name', accessor: 'fullName' },
      { Header: 'Role', accessor: 'role' },
      { Header: 'Email', accessor: 'email' },
      { Header: 'Account Status', accessor: 'status' },
      { Header: 'Violation Count', accessor: 'violation_count' },
    ],
    []
  );

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const token = sessionStorage.getItem("authToken");
      try {
        const response = await axios.get("http://localhost:5002/admin/users", {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.map(user => ({
          ...user,
          fullName: `${user.first_name} ${user.last_name}`,
        }));
      } catch (err) {
        console.error("Error fetching users:", err);
        throw err; // Rethrow the error to trigger the error state in React Query
      }
    },
    onError: (error) => {
      console.error("Query failed:", error);
    },
    refetchOnWindowFocus: false,
  });

  const handleDelete = useCallback(async () => {
    const selectedFlatRows = rows.filter(row => selectedRowIds[row.id]);

    if (!selectedFlatRows.length) {
        console.error("No users selected for deletion");
        return; // Do nothing if no rows are selected
    }

    const selectedUsers = selectedFlatRows.map(row => row.original);
    const userIds = selectedUsers.map(user => user.id); // Extract the user IDs to send

    try {
        // Send a single DELETE request with an array of user IDs
        await axios.delete("http://localhost:5002/admin/users", {
            data: { ids: userIds },
            withCredentials: true,
            headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
        });

        queryClient.invalidateQueries(["users"]);
        setShowDeleteModal(false);
        setShowSuccessModal(true);
    } catch (error) {
        console.error("Error deleting users:", error);
    }
  }, [rows, selectedRowIds, queryClient]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { selectedRowIds }
  } = useTable(
    {
      columns,
      data: users,
    },
    useFilters,
    useSortBy,
    usePagination,
    useRowSelect
  );

  const selectedFlatRows = rows?.filter(row => selectedRowIds?.[row.id]) || [];

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white">
      <Header_Admin />
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

          <div className="admin-users">
            <ErrorBoundary>
              <Table 
                columns={columns} 
                data={users || []} 
                isLoading={isLoading ?? false}
                enableRowSelection={true}
                handleDeleteUser={handleDelete}
                selectedFlatRows={selectedFlatRows || []}
              />
            </ErrorBoundary>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button onClick={() => setShowEditUserPopup(true)}>Edit User</button>
            <button onClick={openAddUserPopup}>Add User</button>
            <button onClick={openDeleteModal}>Delete User/s</button>
            <button onClick={openGenerateReportPopup}>Generate Report</button>
          </div>
        </div>
      </div>

      <DeleteUserModal isOpen={showDeleteModal} onClose={closeDeleteModal} onConfirm={handleDelete} />
      <SuccessModal isOpen={showSuccessModal} onClose={closeSuccessModal} />
      <Admin_AddUserPopUp showPopup={showPopup} togglePopup={closeAddUserPopup} />
      <Admin_EditUserPopUp showPopup={showEditUserPopup} togglePopup={() => setShowEditUserPopup(false)} />
      {showGenerateReportPopup && <Admin_UserGenerateReport isOpen={showGenerateReportPopup} onClose={closeGenerateReportPopup} />}
    </div>
  );
};

export default Admin_UserPage;
