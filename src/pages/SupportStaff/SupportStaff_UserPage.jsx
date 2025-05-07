import React, { useEffect, useState, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import Header_SupportStaff from "../../components/SupportStaff/Header_SupportStaff";
import SideBar_SupportStaff from "../../components/SupportStaff/SideBar_SupportStaff";

import SupportStaff_AddUserPopUp from "./SupportStaff_AddUserPopUp";
import SupportStaff_EditUserPopUp from "./SupportStaff_EditUserPopUp";
import SupportStaff_UserGenerateReportPopUp from "./SupportStaff_UserGenerateReportPopUp";
import axios from "axios";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

// This component is referenced but not defined - adding a placeholder
const Admin_UserFilter = ({ showFilter, setShowFilter }) => {
  // Placeholder for the filter component
  return (
    <div className="bg-gray-700 p-4 rounded-md mb-4">
      <h3 className="text-white text-lg mb-2">Filter Options</h3>
      {/* Filter options would go here */}
      <button
        className="px-4 py-2 bg-white text-black rounded-md mt-2"
        onClick={() => setShowFilter(false)}
      >
        Close
      </button>
    </div>
  );
};

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

const SupportStaff_UserPage = () => {
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

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Users data state
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Sorting state
  const [sorting, setSorting] = useState([]);

  // Create a column helper
  const columnHelper = createColumnHelper();

  // Handle sorting function
  const handleSort = (columnId) => {
    setSorting((prevSorting) => {
      // If we're already sorting by this column
      if (prevSorting.length > 0 && prevSorting[0].id === columnId) {
        // If it's ascending, switch to descending
        if (!prevSorting[0].desc) {
          return [{ id: columnId, desc: true }];
        }
        // If it's already descending, remove sorting
        return [];
      }
      // Set new sort on this column (ascending)
      return [{ id: columnId, desc: false }];
    });
  };

  // Helper to render sort icon
  const renderSortIcon = (columnId) => {
    if (sorting.length === 0 || sorting[0].id !== columnId) {
      return <FaSort className="text-gray-400 ml-1" />;
    }
    return sorting[0].desc ? (
      <FaSortDown className="text-white ml-1" />
    ) : (
      <FaSortUp className="text-white ml-1" />
    );
  };

  // Manual sorting implementation
  const sortedUsers = useMemo(() => {
    if (sorting.length === 0) return users;

    const sortColumn = sorting[0].id;
    const sortDirection = sorting[0].desc ? "desc" : "asc";

    return [...users].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Handle null or undefined values
      if (aValue == null) return sortDirection === "asc" ? -1 : 1;
      if (bValue == null) return sortDirection === "asc" ? 1 : -1;

      // Case insensitive string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Numeric comparison
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [users, sorting]);

  // Define columns for TanStack Table
  const columns = useMemo(
    () => [
      // Selection column with checkbox
      {
        id: "select",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={selectedUsers.includes(row.original.user_id)}
              onChange={(e) =>
                handleCheckboxChange(row.original.user_id, e.target.checked)
              }
            />
          </div>
        ),
        enableSorting: false,
      },
      // Data columns
      columnHelper.accessor("username", {
        header: () => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("username")}
          >
            Username
            {renderSortIcon("username")}
          </div>
        ),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("fullName", {
        header: () => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("fullName")}
          >
            Full Name
            {renderSortIcon("fullName")}
          </div>
        ),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("role", {
        header: () => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("role")}
          >
            Role
            {renderSortIcon("role")}
          </div>
        ),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("email", {
        header: () => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("email")}
          >
            Email
            {renderSortIcon("email")}
          </div>
        ),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("status", {
        header: () => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("status")}
          >
            Account Status
            {renderSortIcon("status")}
          </div>
        ),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("violation_count", {
        header: () => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("violation_count")}
          >
            Violation Count
            {renderSortIcon("violation_count")}
          </div>
        ),
        cell: (info) => info.getValue(),
      }),
    ],
    [selectedUsers, sorting]
  );

  // Global filter state (for search)
  const [globalFilter, setGlobalFilter] = useState("");

  const handleCheckboxChange = (user_id, isChecked) => {
    setSelectedUsers((prevSelected) =>
      isChecked
        ? [...prevSelected, user_id]
        : prevSelected.filter((id) => id !== user_id)
    );
  };

  // Initialize the table
  const table = useReactTable({
    data: sortedUsers,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10, // Set the initial page size
      },
    },
    manualSorting: true, // Important to enable manual sorting
  });

  // Effect to update global filter when search term changes
  useEffect(() => {
    setGlobalFilter(searchTerm);
  }, [searchTerm]);

  const handleDeleteUser = async () => {
    try {
      const token = sessionStorage.getItem("authToken");

      if (selectedUsers.length === 0) {
        alert("No users selected for deletion");
        return;
      }

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/users/delete`, // Updated URL
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            ids: selectedUsers,
          },
        }
      );

      if (response.status === 200) {
        openSuccessModal();
        setSelectedUsers([]);
      } else {
        alert(response.data.message || "Something went wrong during deletion.");
      }
    } catch (error) {
      console.error("Error deleting users:", error);
      alert("An error occurred while deleting users.");
    }

    closeDeleteModal();
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/users`, // Updated URL
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const formattedUsers = response.data.map((user) => ({
          ...user,
          fullName: `${user.first_name} ${user.last_name}`.trim(),
        }));

        setUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [showSuccessModal]);

  // Check different selection states
  const hasNoSelection = selectedUsers.length === 0;
  const hasSingleSelection = selectedUsers.length === 1;
  const hasMultipleSelection = selectedUsers.length > 1;

  // Handle reset for search and sort
  const handleReset = () => {
    setSearchTerm("");
    setSorting([]);
    setSelectedUsers([]);
    table.resetPageIndex();
  };

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
      {/* Header */}
      <Header_SupportStaff />

      {/* Main Layout */}
      <div className="flex">
        <SideBar_SupportStaff />
        <div className="flex-1 px-10 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-grow mr-4">
              <FaSearch className="absolute left-4 top-3 text-white" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-500 text-white outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300"
                onClick={handleReset}
              >
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
                  {table.getHeaderGroups().map((headerGroup) =>
                    headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-2 border border-[#D6D3D3] text-center"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border border-[#D6D3D3] text-center"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-2 border border-[#D6D3D3]"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 bg-white text-black rounded-md hover:bg-[#F09C32]"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                {"<<"}
              </button>
              <button
                className="px-2 py-1 bg-white text-black rounded-md hover:bg-[#F09C32]"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {"<"}
              </button>
              <button
                className="px-2 py-1 bg-white text-black rounded-md hover:bg-[#F09C32]"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {">"}
              </button>
              <button
                className="px-2 py-1 bg-white text-black rounded-md hover:bg-[#F09C32]"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                {">>"}
              </button>
            </div>
            <div className="text-white">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <select
              className="px-2 py-1 bg-white text-black rounded-md"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>

          {/* Bottom Buttons - Conditionally rendered based on selection */}
          <div className="flex justify-center gap-4 mt-6">
            {hasNoSelection && (
              <>
                {/* Buttons when no users are selected */}
                <button
                  className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-100 hover:bg-[#F09C32] hover:scale-105"
                  onClick={openAddUserPopup}
                >
                  Add User
                </button>
                <button
                  className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-100 hover:bg-[#F09C32] hover:scale-105"
                  onClick={openGenerateReportPopup}
                >
                  Generate Report
                </button>
              </>
            )}

            {hasSingleSelection && (
              <>
                {/* Buttons when exactly one user is selected */}
                <button
                  className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-100 hover:bg-[#F09C32] hover:scale-105"
                  onClick={() => setShowEditUserPopup(true)}
                >
                  Edit User
                </button>
                <button
                  className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-100 hover:bg-[#F09C32] hover:scale-105"
                  onClick={openDeleteModal}
                >
                  Delete User
                </button>
              </>
            )}

            {hasMultipleSelection && (
              /* Only Delete button when multiple users are selected */
              <button
                className="w-[190px] h-[40px] bg-white text-black rounded-full transition-all duration-100 hover:bg-[#F09C32] hover:scale-105"
                onClick={openDeleteModal}
              >
                Delete User
              </button>
            )}
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
        <SupportStaff_AddUserPopUp
          showPopup={showPopup}
          togglePopup={closeAddUserPopup}
        />
      )}
      {showEditUserPopup && (
        <SupportStaff_EditUserPopUp
          showPopup={showEditUserPopup}
          togglePopup={() => setShowEditUserPopup(false)}
          selectedUserIds={selectedUsers}
        />
      )}
      {showGenerateReportPopup && (
        <SupportStaff_UserGenerateReportPopUp
          isOpen={showGenerateReportPopup}
          onClose={closeGenerateReportPopup}
          visibleRows={table.getRowModel().rows.map((row) => row.original)} // Pass visible rows
        />
      )}
    </div>
  );
};

export default SupportStaff_UserPage;
