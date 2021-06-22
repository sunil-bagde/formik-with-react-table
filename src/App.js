import React from "react";
import styled from "styled-components";
import { useTable, usePagination, useRowSelect } from "react-table";
import makeData from "./makeData";
import { Formik, Field, Form, FieldArray } from "formik";

const initialValues = {
  friends: [
    {
      name: "Klaus",
      email: "klaus@formik.com",
      isSelected: false,
    },
    {
      name: "Hans",
      email: "hans@formik.com",
      isSelected: false,
    },
  ],
};
const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.1rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }

  .pagination {
    padding: 0.5rem;
  }
`;

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  }
);

function Table({ columns, data, onTableRowSelect }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    toggleAllRowsSelected,
    state: { pageIndex, pageSize, selectedRowIds },
  } = useTable(
    {
      columns,
      data,
      onTableRowSelect,
    },
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: "selection",
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllPageRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );
  // Render the UI for your table
  return (
    <>
      <table {...getTableProps()}>
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
          {page.map((row, i) => {
            console.log("row", row);
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps({
                  style: {
                    backgroundColor: row.original.isSelected
                      ? "lightblue"
                      : "transparent",
                  },
                  onClick: (e) => {
                    toggleAllRowsSelected(false);
                    row.toggleRowSelected();
                    onTableRowSelect(row.index);
                  },
                })}
              >
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <pre>
          <code>
            {JSON.stringify(
              {
                selectedRowIds: selectedRowIds,
                "selectedFlatRows[].original": selectedFlatRows.map(
                  (d) => d.original
                ),
              },
              null,
              2
            )}
          </code>
        </pre>
      </div>
    </>
  );
}

const App = () => {
  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        columns: [
          {
            Header: "First Name",
            accessor: "name",
          },
        ],
      },
      {
        Header: "Info",
        columns: [
          {
            Header: "Email",
            accessor: "email",
          },
        ],
      },
    ],
    []
  );
  function updateSelectedIndex(state, index) {
    let values = state.values;
    let newArray = state.values.friends.map((friend) => {
      friend.isSelected = false;
       return friend;
    });
    newArray[index] = {
      ...newArray[index],
      isSelected: !newArray[index].isSelected,
    };
    return {
      ...state,
      values: {
        ...values,
        friends: newArray,
      },
    };
  }
  const data = React.useMemo(() => makeData(5), []);
  return (
    <div className="">
      <Formik
        initialValues={initialValues}
        validate={() => ({ foo: true })}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={() => {}}
      >
        {({ values, setFormikState, errors, touched, handleReset }) => {
          return (
            <div className="grid grid-cols-2 gap-2  ">
              <Styles>
                <Table
                  columns={columns}
                  data={values.friends}
                  onTableRowSelect={(index) => {
                    console.log("index", index);
                    setFormikState((state) =>
                      updateSelectedIndex(state, index)
                    );
                  }}
                />
              </Styles>
              <Form>
                <FieldArray
                  name="friends"
                  render={({ insert, remove, push }) => (
                    <div className="max-w-3xl w-full mx-auto">
                      {values.friends.length > 0 &&
                        values.friends.map((friend, index) => (
                          <div className="row" key={index}>
                            <Field
                              name={`friends.${index}.isSelected`}
                              type="hidden"
                            />
                            <div className="col flex flex-col">
                              <label
                                htmlFor={`friends.${index}.name`}
                                className="mt-2  text-xs  block mb-2  text-gray-600 dark:text-gray-400"
                              >
                                Name
                              </label>
                              <Field
                                name={`friends.${index}.name`}
                                placeholder="Jane Doe"
                                type="text"
                                className="w-full px-3 py-1.5  bg-white placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 text-xs "
                              />
                            </div>
                            <div className="col">
                              <label
                                htmlFor={`friends.${index}.email`}
                                className="block mb-2 text-xs  text-gray-600  mt-2 "
                              >
                                Email
                              </label>

                              <Field
                                name={`friends.${index}.email`}
                                placeholder="jane@acme.com"
                                type="email"
                                className="text-xs  w-full px-3 py-1.5 bg-white placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                              />
                              {errors.friends &&
                                errors.friends[index] &&
                                errors.friends[index].email &&
                                touched.friends &&
                                touched.friends[index].email && (
                                  <div className="field-error">
                                    {errors.friends[index].email}
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      <button
                        type="button"
                        className=" mt-2  text-xs text-white btn btn-default border p-1 bg-blue-500  rounded-md"
                        onClick={() => push({ name: "", email: "" })}
                      >
                        Add Friend
                      </button>
                    </div>
                  )}
                />
                <br />
                <div className="max-w-3xl w-full mx-auto">
                  <button
                    className="mt-2 mr-2 px-3 text-xs text-white btn btn-default border p-1 bg-red-400  rounded-md"
                    onClick={(event) => {
                      event.preventDefault();
                      handleReset();
                    }}
                  >
                    Reset
                  </button>
                  <button
                    className="mt-2 px-3 text-xs text-white btn btn-default border p-1 bg-indigo-500  rounded-md "
                    type="submit"
                  >
                    Submit
                  </button>
                </div>
              </Form>
            </div>
          );
        }}
      </Formik>
    </div>
  );
};

export default App;
