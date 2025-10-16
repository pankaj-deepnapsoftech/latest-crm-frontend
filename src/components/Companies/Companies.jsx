import { Button, Link, Select, useDisclosure, Input } from "@chakra-ui/react";
import {
  MdOutlineRefresh,
  MdArrowBack,
  MdEdit,
  MdDeleteOutline,
  MdOutlineVisibility,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddCompaniesDrawer,
  closeEditCompaniesDrawer,
  closeShowDetailsCompaniesDrawer,
  openAddCompaniesDrawer,
  openEditCompaniesDrawer,
  openShowDetailsCompaniesDrawer,
} from "../../redux/reducers/misc";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../ui/Loading";
import { FcDatabase } from "react-icons/fc";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import moment from "moment";

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { usePagination, useSortBy, useTable } from "react-table";
import ClickMenu from "../ui/ClickMenu";
import CompaniesEditDrawer from "../ui/Drawers/Edit Drawers/CompaniesEditDrawer";
import CompaniesDetailsDrawer from "../ui/Drawers/Details Drawers/CompaniesDetailsDrawer";
import CompaniesDrawer from "../ui/Drawers/Add Drawers/CompaniesDrawer";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
} from "@chakra-ui/react";
import { checkAccess } from "../../utils/checkAccess";
import { FaFileCsv } from "react-icons/fa6";
import * as XLSX from 'xlsx';

const columns = [
  {
    Header: "Created By",
    accessor: "creator",
  },
  {
    Header: "ID",
    accessor: "uniqueId",
  },
  {
    Header: "Created On",
    accessor: "created_on",
  },
 
  {
    Header: "Name",
    accessor: "companyname",
  },
  {
    Header: "Contact",
    accessor: "contact",
  },
  {
    Header: "Phone",
    accessor: "phone",
  },
  {
    Header: "Email",
    accessor: "email",
  },
  {
    Header: "Verification",
    accessor: "verified",
    Cell: ({ row }) => {
      const { isOpen, onOpen, onClose } = useDisclosure();
      const cancelRef = useRef();
      const [cookies] = useCookies();
      const baseURL = process.env.REACT_APP_BACKEND_URL;

      const companyId = row.original._id;
      const [otp, setOtp] = useState("");
      const [isVerified, setIsVerified] = useState(row.original.verify);

      const reSendVerificationOtp = async () => {
        try {
          const response = await fetch(
            `${baseURL}company/resend-otp/${companyId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );
          const otpResponse = await response.json();
          toast.success("OTP has been resent successfully!");
        } catch (error) {
          toast.error("Failed to resend OTP. Please try again.");
        }
      };

      const verifyOtp = async () => {
        try {
          if (!companyId || !otp) {
            toast.warning("Please enter OTP before verifying.");
            return;
          }
          const numericOtp = Number(otp);
          if (isNaN(numericOtp)) {
            toast.warning("Invalid OTP format. Please enter a valid number.");
            return;
          }
          const response = await fetch(
            `${baseURL}company/verify-company/${companyId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${cookies?.access_token}`,
              },
              body: JSON.stringify({ otp: numericOtp }),
            }
          );
          const verifyResponse = await response.json();
          if (verifyResponse.success) {
            toast.success("OTP verified successfully!");
            setIsVerified(true);
            onClose();
          } else {
            toast.error(verifyResponse.message || "Invalid OTP. Please try again.");
          }
        } catch (error) {
          toast.error("Something went wrong. Please try again.");
        }
      };

      return (
        <>
          {isVerified ? (
            <span className="px-2 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
              Verified
            </span>
          ) : (
            <>
              <Button size="sm" colorScheme="blue" onClick={onOpen}>
                Verify
              </Button>
              <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                <AlertDialogOverlay>
                  <AlertDialogContent className="p-6 rounded-lg shadow-lg">
                    <AlertDialogHeader className="text-xl font-semibold text-center">
                      Confirm Verification
                    </AlertDialogHeader>
                    <AlertDialogBody className="text-center space-y-4">
                      <p className="text-gray-600">A one-time password has been sent to your email</p>
                      <Input
                        className="text-center border border-gray-300 rounded-md py-2 px-4 w-3/4 mx-auto"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <div className="flex justify-center gap-4">
                        <Button onClick={verifyOtp} colorScheme="blue">Verify OTP</Button>
                        <Button onClick={reSendVerificationOtp} variant="outline" colorScheme="gray">Resend OTP</Button>
                      </div>
                    </AlertDialogBody>
                    <AlertDialogFooter className="flex justify-end gap-3">
                      <Button ref={cancelRef} onClick={onClose} variant="outline">Cancel</Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialogOverlay>
              </AlertDialog>
            </>
          )}
        </>
      );
    },
  },
  {
    Header: "Website",
    accessor: "website",
  },
  {
    Header: "GST No.",
    accessor: "gst_no",
  },
];

const Companies = () => {
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataId, setDataId] = useState();
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");

  const dispatch = useDispatch();

  const [companyDeleteId, setCompanyDeleteId] = useState();
  const [bulkPreviewRows, setBulkPreviewRows] = useState([]);
  const [showBulkPreview, setShowBulkPreview] = useState(false);
  const companyBulkInputRef = useRef(null);

  const downloadCompanySampleCSV = () => {
    const headers = ["companyname", "contact", "phone", "email", "website", "gst_no"];
    const sample = [
      { companyname: "Acme Pvt Ltd", contact: "Ravi Kumar", phone: "9876001122", email: "contact@acme.com", website: "https://acme.com", gst_no: "22AAAAA0000A1Z5" },
      { companyname: "Globex Corp", contact: "Priya Singh", phone: "9876003344", email: "sales@globex.com", website: "https://globex.com", gst_no: "27BBBBB1111B2Z6" },
    ];
    const csvRows = [];
    csvRows.push(headers.join(","));
    for (const row of sample) {
      csvRows.push(headers.map((h) => (row[h] !== undefined ? String(row[h]).replaceAll(",", " ") : "")).join(","));
    }
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "corporates_sample.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const { role, ...auth } = useSelector((state) => state.auth);
  const { isAllowed, msg } = checkAccess(auth, "company");

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state: { pageIndex, pageSize },
    pageCount,
    setPageSize,
  } = useTable({ columns, data: filteredData }, useSortBy, usePagination);

  const {
    addCompaniesDrawerIsOpened,
    editCompaniesDrawerIsOpened,
    showDetailsCompaniesDrawerIsOpened,
  } = useSelector((state) => state.misc);

  const baseURL = process.env.REACT_APP_BACKEND_URL;
  const handleCompanyBulkFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
      setBulkPreviewRows(Array.isArray(json) ? json.slice(0, 2000) : []);
      setShowBulkPreview(true);
    };
    reader.readAsArrayBuffer(file);
  };


  const fetchAllCompanies = async () => {
    setSearchKey("");
    setData([]);
    setFilteredData([]);
    setLoading(true);
    try {
      const response = await fetch(baseURL + "company/all-companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }
      setData(data.companies);
      setFilteredData(data.companies);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  const addCompaniesHandler = () => {
    dispatch(openAddCompaniesDrawer());
  };

  const editHandler = (id) => {
    setDataId(id);
    dispatch(openEditCompaniesDrawer());
  };

  const showDetailsHandler = (id) => {
    setDataId(id);
    dispatch(openShowDetailsCompaniesDrawer());
  };

  const confirmDeleteHandler = async () => {
    onOpen();
  };

  const deleteHandler = async () => {
    if (!companyDeleteId) {
      return;
    }

    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(baseURL + "company/delete-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          companyId: companyDeleteId,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      onClose();
      fetchAllCompanies();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (isAllowed) {
      fetchAllCompanies();
    }
  }, []);

  useEffect(() => {
    if (searchKey.trim() !== "") {
      const searchedData = data.filter(
        (d) =>
          d?.creator?.name?.toLowerCase().includes(searchKey.toLowerCase()) ||
          (d?.createdAt &&
            new Date(d?.createdAt)
              ?.toISOString()
              ?.substring(0, 10)
              ?.split("-")
              .reverse()
              .join("")
              ?.includes(searchKey.replaceAll("/", ""))) ||
          d?.companyname?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.contact?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.website?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.phone?.includes(searchKey) ||
          d?.email?.toLowerCase().includes(searchKey.toLowerCase())
      );
      setFilteredData(searchedData);
    } else {
      setFilteredData(data);
    }
  }, [searchKey]);

  return (
    <>
      {!isAllowed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-[#ff6f6f] flex gap-x-2">
          {msg}
        </div>
      )}

      {isAllowed && (
        <div
          className="border-[1px] px-2 py-8 md:px-9 rounded"
          style={{ boxShadow: "0 0 20px 3px #96beee26" }}
        >
          <>
            <AlertDialog
              isOpen={isOpen}
              leastDestructiveRef={cancelRef}
              onClose={onClose}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete Corporate
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Are you sure, deleting a Corporate will also delete it from
                    Customer section, its Leads, Offers, Proforma Invoices,
                    Invoices and Payments?
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button colorScheme="red" onClick={deleteHandler} ml={3}>
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </>
          <div>
            <div className="flex flex-col items-start justify-start md:flex-row gap-y-1 md:justify-between md:items-center mb-8">
              <div className="flex text-lg md:text-xl font-semibold items-center gap-y-1">
                {/* <span className="mr-2">
                  <MdArrowBack />
                </span> */}
                Corporate List
              </div>

              <div className="mt-2 md:mt-0 flex flex-wrap gap-y-1 gap-x-2 w-full md:w-fit">
                <input
                  ref={companyBulkInputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleCompanyBulkFile}
                  style={{ display: "none" }}
                />
                <Button
                  onClick={() => companyBulkInputRef.current && companyBulkInputRef.current.click()}
                  fontSize={{ base: "14px", md: "14px" }}
                  paddingX={{ base: "10px", md: "12px" }}
                  paddingY={{ base: "0", md: "3px" }}
                  width={{ base: "-webkit-fill-available", md: 160 }}
                  rightIcon={<FaFileCsv size={18} />}
                  color="white"
                  backgroundColor="#1640d6"
                >
                  Bulk Upload
                </Button>
                <Button
                  onClick={downloadCompanySampleCSV}
                  fontSize={{ base: "14px", md: "14px" }}
                  paddingX={{ base: "10px", md: "12px" }}
                  paddingY={{ base: "0", md: "3px" }}
                  width={{ base: "-webkit-fill-available", md: 200 }}
                  rightIcon={<FaFileCsv size={18} />}
                  color="#1640d6"
                  borderColor="#1640d6"
                  variant="outline"
                >
                  Download Sample CSV
                </Button>
                <textarea
                  className="rounded-[10px] w-full md:flex-1 px-2 py-2 md:px-3 md:py-2 text-sm focus:outline-[#1640d6] hover:outline:[#1640d6] border resize-none"
                  rows="1"
                  width="220px"
                  placeholder="Search"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
                <Button
                  fontSize={{ base: "14px", md: "14px" }}
                  paddingX={{ base: "10px", md: "12px" }}
                  paddingY={{ base: "0", md: "3px" }}
                  width={{ base: "-webkit-fill-available", md: 100 }}
                  onClick={fetchAllCompanies}
                  leftIcon={<MdOutlineRefresh />}
                  color="#1640d6"
                  borderColor="#1640d6"
                  variant="outline"
                >
                  Refresh
                </Button>
                <Button
                  fontSize={{ base: "14px", md: "14px" }}
                  paddingX={{ base: "10px", md: "12px" }}
                  paddingY={{ base: "0", md: "3px" }}
                  width={{ base: "-webkit-fill-available", md: 200 }}
                  onClick={addCompaniesHandler}
                  color="white"
                  backgroundColor="#1640d6"
                >
                  Add New Corporate
                </Button>
                <Select
                  onChange={(e) => setPageSize(e.target.value)}
                  width="80px"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={100000}>All</option>
                </Select>
              </div>
            </div>

            <div>
              {showBulkPreview && bulkPreviewRows.length > 0 && (
                <div className="mb-4 border rounded p-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold">Bulk Preview ({bulkPreviewRows.length} rows)</div>
                    <button className="text-red-600 text-sm" onClick={() => setShowBulkPreview(false)}>Close Preview</button>
                  </div>
                  <div className="overflow-auto" style={{ maxHeight: 300 }}>
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          {Object.keys(bulkPreviewRows[0] || {}).map((key) => (
                            <th key={key} className="border px-2 py-1 text-left bg-gray-50">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bulkPreviewRows.slice(0, 50).map((row, idx) => (
                          <tr key={idx}>
                            {Object.keys(bulkPreviewRows[0] || {}).map((key) => (
                              <td key={key} className="border px-2 py-1">{String(row[key])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {addCompaniesDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeAddCompaniesDrawer())
                  }
                >
                  <CompaniesDrawer
                    fetchAllCompanies={fetchAllCompanies}
                    closeDrawerHandler={() =>
                      dispatch(closeAddCompaniesDrawer())
                    }
                  />
                </ClickMenu>
              )}

              {editCompaniesDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeEditCompaniesDrawer())
                  }
                >
                  <CompaniesEditDrawer
                    fetchAllCompanies={fetchAllCompanies}
                    dataId={dataId}
                    closeDrawerHandler={() => {
                      dispatch(closeEditCompaniesDrawer());
                      fetchAllCompanies();
                    }}
                  />
                </ClickMenu>
              )}

              {showDetailsCompaniesDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeShowDetailsCompaniesDrawer())
                  }
                >
                  <CompaniesDetailsDrawer
                    dataId={dataId}
                    closeDrawerHandler={() =>
                      dispatch(closeShowDetailsCompaniesDrawer())
                    }
                  />
                </ClickMenu>
              )}
              {loading && (
                <div>
                  <Loading />
                </div>
              )}
              {!loading && filteredData.length === 0 && (
                <div className="flex items-center justify-center flex-col">
                  <FcDatabase color="red" size={80} />
                  <span className="mt-1 font-semibold text-2xl">No Data</span>
                </div>
              )}
              {!loading && filteredData.length > 0 && (
                <div>
                  <TableContainer maxHeight="600px" overflowY="auto">
                    <Table variant="simple" {...getTableProps()}>
                      <Thead className="bg-blue-400 text-white text-lg font-semibold">
                        {headerGroups.map((hg) => {
                          return (
                            <Tr
                              {...hg.getHeaderGroupProps()}
                              className="border-b-2 border-gray-300"
                            >
                              {hg.headers.map((column) => {
                                return (
                                  <Th
                                    className={`
                    ${
                      column.id === "companyname"
                        ? "sticky top-0 left-[-2px]"
                        : ""
                    }
                    text-transform: capitalize
                    font-size: 15px
                    font-weight: 700
                    text-center
                    border-r border-gray-300
                    py-3
                    px-4
                    hover:bg-blue-200 cursor-pointer
                  `}
                                    {...column.getHeaderProps(
                                      column.getSortByToggleProps()
                                    )}
                                  >
                                    <div className="flex items-center justify-center text-white">
                                      {column.render("Header")}
                                      {column.isSorted && (
                                        <span className="ml-1 text-xs">
                                          {column.isSortedDesc ? (
                                            <FaCaretDown />
                                          ) : (
                                            <FaCaretUp />
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </Th>
                                );
                              })}
                              <Th className="text-center py-3 px-4 bg-blue-400">
                                <p className="text-white">Actions</p>
                              </Th>
                            </Tr>
                          );
                        })}
                      </Thead>

                      <Tbody {...getTableBodyProps()}>
                        {page.map((row) => {
                          prepareRow(row);

                          return (
                            <Tr
                              className="relative hover:bg-gray-100 text-base text-gray-700 transition duration-300 ease-in-out"
                              {...row.getRowProps()}
                            >
                              {row.cells.map((cell) => {
                                return (
                                  <Td
                                    className={`
                    ${
                      cell.column.id === "companyname"
                        ? "sticky top-0 left-[-2px]"
                        : ""
                    }
                    text-center
                    border-b border-gray-200
                    p-3
                  `}
                                    {...cell.getCellProps()}
                                  >
                                    {cell.column.id !== "created_on" &&
                                      cell.column.id !== "creator" &&
                                      cell.render("Cell")}
                                    {cell.column.id === "created_on" &&
                                      row.original?.createdAt && (
                                        <span>
                                          {moment(
                                            row.original?.createdAt
                                          ).format("DD/MM/YYYY")}
                                        </span>
                                      )}
                                    {cell.column.id === "creator" && (
                                      <span className="text-blue-500 text-semibold">
                                        {row.original.creator.name}
                                      </span>
                                    )}
                                  </Td>
                                );
                              })}

                              <Td className="flex justify-center items-center gap-x-3 p-3">
                                <MdOutlineVisibility
                                  className="text-blue-500 hover:scale-110 transition-transform duration-200"
                                  size={20}
                                  onClick={() =>
                                    showDetailsHandler(row.original?._id)
                                  }
                                />
                                <MdEdit
                                  className="text-yellow-500 hover:scale-110 transition-transform duration-200"
                                  size={20}
                                  onClick={() => editHandler(row.original?._id)}
                                />
                                <MdDeleteOutline
                                  className="text-red-500 hover:scale-110 transition-transform duration-200"
                                  size={20}
                                  onClick={() => {
                                    setCompanyDeleteId(row.original?._id);
                                    confirmDeleteHandler();
                                  }}
                                />
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>

                  <div className="w-[max-content] m-auto my-7">
                    <button
                      className="text-sm mt-2 bg-[#1640d6] py-1 px-4 text-white border-[1px] border-[#1640d6] rounded-3xl disabled:bg-[#b2b2b2] disabled:border-[#b2b2b2] disabled:cursor-not-allowed md:text-lg md:py-1 md:px-4 lg:text-xl lg:py-1 xl:text-base"
                      disabled={!canPreviousPage}
                      onClick={previousPage}
                    >
                      Prev
                    </button>
                    <span className="mx-3 text-sm md:text-lg lg:text-xl xl:text-base">
                      {pageIndex + 1} of {pageCount}
                    </span>
                    <button
                      className="text-sm mt-2 bg-[#1640d6] py-1 px-4 text-white border-[1px] border-[#1640d6] rounded-3xl disabled:bg-[#b2b2b2] disabled:border-[#b2b2b2] disabled:cursor-not-allowed md:text-lg md:py-1 md:px-4 lg:text-xl lg:py-1 xl:text-base"
                      disabled={!canNextPage}
                      onClick={nextPage}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Companies;
