import React from "react";
import { Table, Button } from "react-bootstrap";
import { useTable, usePagination } from "react-table";
import "./DataTable.css"; // Import the CSS file
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // Import icons for actions

const DataTable = ({ columns, data, onEdit, onDelete }) => {
  // We need to slightly adjust the columns passed to useTable if we're adding actions here
  // A common pattern is to extend the columns with an 'Actions' column
  const tableColumns = React.useMemo(
    () => {
      // Check if onEdit or onDelete are provided to add the Actions column
      if (onEdit || onDelete) {
        return [
          ...columns,
          {
            Header: "Actions",
            id: "actions", // Unique ID for the actions column
            Cell: ({ row }) => (
              <div className="table-actions">
                {onEdit && (
                  <Button
                    variant="warning" // Bootstrap warning for edit
                    size="sm"
                    onClick={() => onEdit(row.original)} // Pass the full row data
                    className="action-btn edit-btn"
                  >
                    <FaEdit /> { /* Edit */ }
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="danger" // Bootstrap danger for delete
                    size="sm"
                    onClick={() => onDelete(row.original)} // Pass the full row data
                    className="action-btn delete-btn"
                  >
                    <FaTrashAlt /> { /* Delete */ }
                  </Button>
                )}
              </div>
            ),
          },
        ];
      }
      return columns; // Return original columns if no actions are needed
    },
    [columns, onEdit, onDelete] // Re-memoize if columns or handlers change
  );


  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { pageIndex, pageSize },
    setPageSize,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    previousPage,
    nextPage,
  } = useTable(
    {
      columns: tableColumns, // Use the adjusted columns
      data,
      initialState: { pageIndex: 0, pageSize: 5 },
    },
    usePagination
  );

  return (
    <div className="table-container">
      {/* Table Component */}
      <Table
        {...getTableProps()}
        striped
        hover
        responsive // Make table responsive
        className="custom-table mt-3"
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()} key={column.id}>
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.id}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} key={cell.column.id}>
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      <div className="pagination-wrapper"> {/* New wrapper for pagination controls */}
        <div className="pagination-info">
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageCount}
          </strong>{" "}
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            className="pagination-input"
            min="1"
            max={pageCount}
          />
        </div>

        <div className="pagination-controls">
          <Button
            variant="outline-primary" // Use outline for these
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className="pagination-btn"
          >
            {"« First"}
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="pagination-btn"
          >
            {"‹ Prev"}
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="pagination-btn"
          >
            {"Next ›"}
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            className="pagination-btn"
          >
            {"Last »"}
          </Button>
        </div>

        <select
          className="form-select pagination-select" // Use form-select for Bootstrap styling
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[5, 10, 20, 50, 100].map((size) => ( // Added 20 for more options
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DataTable;