import React from 'react';
import { useTable, useSortBy, usePagination, useFilters, useRowSelect } from 'react-table';
import PropTypes from 'prop-types';

// Global Filter Component
const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
  <div className="my-2">
    <input
      value={globalFilter || ''}
      onChange={(e) => setGlobalFilter(e.target.value)}
      placeholder="Search..."
      className="border px-4 py-2 w-full rounded-md"
    />
  </div>
);

const Table = ({ 
  columns, 
  data, 
  isLoading, 
  selectedFlatRows, 
  enableRowSelection = true // Default to true if not provided
}) => {
  if (!columns || !Array.isArray(data)) {
    return <p className="text-red-500 text-center">Error: Columns or Data is missing!</p>;
  }
  
  if (data.length === 0) {
    return <p className="text-gray-500 text-center">No data available.</p>;
  }
  
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { pageIndex, pageSize, globalFilter, sortBy, selectedRowIds },
    setGlobalFilter,
    page,
    canPreviousPage,
    canNextPage,
    previousPage,
    nextPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useSortBy,
    usePagination,
    enableRowSelection ? useRowSelect : []  // Conditionally apply useRowSelect
  );

  return (
    <div className="overflow-x-auto rounded-md shadow-md max-h-[400px] overflow-y-auto bg-white p-4">
      {isLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <>
          {/* Global Filter */}
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />

          {/* Table */}
          <table {...getTableProps()} className="w-full text-black border-collapse border border-gray-300 rounded-md overflow-hidden">
            <thead className="sticky top-0 bg-orange-500 text-white text-center z-10">
              {headerGroups.map((headerGroup, index) => (
                <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                  {headerGroup.headers.map((column, colIndex) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      key={colIndex}
                      className="px-4 py-2 border border-gray-300 text-center cursor-pointer"
                    >
                      {column.render('Header')}
                      <span>
                        {sortBy.some((sort) => sort.id === column.id)
                          ? sortBy.find((sort) => sort.id === column.id)?.desc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row, rowIndex) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} key={rowIndex} className="border border-gray-300 text-center hover:bg-gray-100">
                    {row.cells.map((cell, cellIndex) => (
                      <td {...cell.getCellProps()} key={cellIndex} className="px-4 py-2 border border-gray-300">
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button onClick={previousPage} disabled={!canPreviousPage} className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50">
              {'<'}
            </button>
            <span>
              Page <strong>{pageIndex + 1} of {Math.ceil(rows.length / pageSize)}</strong>
            </span>
            <button onClick={nextPage} disabled={!canNextPage} className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50">
              {'>'}
            </button>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border px-4 py-2 rounded-md"
            >
              {[5, 10, 15, 20].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  enableRowSelection: PropTypes.bool, // Optional prop to control row selection
};

export default Table;
