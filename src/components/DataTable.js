import React from "react";
import { Table, Button } from "react-bootstrap";
import { useTable, usePagination } from "react-table";
import "./DataTable.css"; // Import the CSS file

const DataTable = ({ columns, data, onEdit, onDelete }) => {
  // Accept onEdit and onDelete handlers
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
      columns,
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
        bordered
        hover
        className="custom-table mt-3"
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
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
                  <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      <div className="pagination-container">
        <Button
          variant="primary"
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
        >
          {"↞"}
        </Button>
        <Button
          variant="primary"
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
        >
          {"←"}
        </Button>
        <span className="pagination-info">
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageCount}
          </strong>
        </span>
        <Button
          variant="primary"
          onClick={() => nextPage()}
          disabled={!canNextPage}
        >
          {"→"}
        </Button>
        <Button
          variant="primary"
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
        >
          {"↠"}
        </Button>
        <select
          className="pagination-select"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[5, 10, 50, 100].map((size) => (
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
