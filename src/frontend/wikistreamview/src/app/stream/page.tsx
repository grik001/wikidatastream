"use client";

import React, { useEffect, useState } from "react";
import { useTable, useSortBy, Column } from "react-table";
import styles from "./page.module.css"; // Import the CSS module
import GetRecentDataApi from "../utils/getrecentdataapi";

type TableData = {
  title: string;
  user: string;
  wiki: string;
  bot: boolean;
  minor: boolean;
  comment: string;
  parsedComment: string;
};

const recentchangesitemsurl = process.env.NEXT_PUBLIC_RECENTCHANGESITEMS_URL as string;
const recentchangesitemsendpoint = process.env.NEXT_PUBLIC_RECENTCHANGESITEMS_ENDPOINT as string;

const apiService = new GetRecentDataApi(recentchangesitemsurl);

const DataTable: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiService.getData(recentchangesitemsendpoint);
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prevExpandedRows) => ({
      ...prevExpandedRows,
      [rowId]: !prevExpandedRows[rowId], // Toggle boolean value
    }));
  };

  // Columns are memoized since they don't change
  const columns: Column<TableData>[] = React.useMemo(
    () => [
      { Header: "Title", accessor: "title" },
      { Header: "User", accessor: "user" },
      { Header: "Wiki", accessor: "wiki" },
      { Header: "Bot", accessor: "bot" },
      { Header: "Minor", accessor: "minor" },
      { Header: "Comment", accessor: "comment" },
      { Header: "ParsedComment", accessor: "parsedComment" },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data }, useSortBy);

  return (
    <div className={styles.tableContainer}>
      <table {...getTableProps()} className={styles.table}>
        <thead>
          {headerGroups.map((headerGroup) => {
            const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
            return (
              <tr key={key} {...restHeaderGroupProps} className={styles.tableRow}>
                {headerGroup.headers.map((column) => {
                  const { key: colKey, ...restColumnProps } = column.getHeaderProps(column.getSortByToggleProps());

                  if (column.id.endsWith("comment") || column.id.endsWith("parsedComment")) {
                    return null;
                  }

                  return (
                    <th key={colKey} {...restColumnProps} className={styles.tableHeader}>
                      {column.render("Header")}
                      <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody className={styles.tableBody} {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            const isExpanded = expandedRows[row.id as string]; // Cast row.id to string if needed

            const { key, ...restRowProps } = row.getRowProps();
            return (
              <React.Fragment key={row.id}>
                <tr key={key} {...restRowProps} className={styles.tableRow}>
                  {row.cells.map((cell) => {
                    if (cell.column.id.endsWith("comment") || cell.column.id.endsWith("parsedComment")) {
                      return null;
                    }
                    const { key: cellKey, ...restCellProps } = cell.getCellProps();
                    return (
                      <td key={cellKey} {...restCellProps} className={styles.tableCell}>
                        {!(cell.column.id.endsWith("comment") || cell.column.id.endsWith("parsedComment"))
                          ? typeof cell.value === "boolean"
                            ? cell.value
                              ? "Yes"
                              : "No"
                            : cell.render("Cell")
                          : null}
                      </td>
                    );
                  })}
                </tr>
                {/* Comment Row */}
                {row.cells.some((cell) => cell.column.id.endsWith("comment")) && (
                  <tr className={`commentRow ${isExpanded ? "expanded" : ""}`} onClick={() => toggleRowExpansion(row.id as string)}>
                    <td colSpan={row.cells.length} className="tableCell">
                      {row.cells
                        .filter((cell) => cell.column.id.endsWith("comment"))
                        .map((cell) => (
                          <div key={cell.column.id} className={`${styles.commentContent} ${isExpanded ? styles.expanded : ""}`}>
                            {cell.render("Cell")}
                          </div>
                        ))}
                    </td>
                  </tr>
                )}
                {/* PARSEDCOMMENT ROW */}

                {row.cells.some((cell) => cell.column.id.endsWith("parsedComment")) && (
                  <tr className={styles.parsedCommentRow}>
                    <td colSpan={row.cells.length} className={styles.tableCell}>
                      {row.cells
                        .filter((cell) => cell.column.id.endsWith("parsedComment"))
                        .map((cell) => (
                          <div key={"c" + cell.column.id} className={styles.parsedCommentContent}>
                            {cell.render("Cell")}
                          </div>
                        ))}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
