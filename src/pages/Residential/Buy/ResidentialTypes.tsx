import {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  useCallback,
  MutableRefObject,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router";
import { createPortal } from "react-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import {
  fetchListings,
  ListingState,
  updatePropertyStatus,
} from "../../../store/slices/listings";
import { AppDispatch, RootState } from "../../../store/store";
import { TableLoader } from "../../../components/Loaders/LoadingLisings";
import LeadPullModal from "../../../components/common/LeadPullModal";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import ConfirmStatusModal from "../../../components/common/ConfirmStatusModal";
import DateFilter from "../../../components/common/DateFilter";
interface LeadPullFormData {
  mobile: string;
  email: string;
  name: string;
  sourceType: string;
}
const statusMap: { [key: number]: string } = {
  0: "Review",
  1: "Approved",
  2: "Rejected",
  3: "Deleted",
};
const userTypeMap: { [key: string]: string } = {
  "1": "Admin",
  "2": "User",
  "3": "Builder",
  "4": "Agent",
  "5": "Owner",
  "6": "Channel Partner",
  "7": "Manager",
  "8": "Telecaller",
  "9": "Marketing Executive",
  "10": "Customer Support",
  "11": "Customer Service",
};
const userTypeReverseMap: { [key: string]: string } = Object.keys(
  userTypeMap
).reduce((acc, key) => {
  acc[userTypeMap[key].toLowerCase()] = key;
  return acc;
}, {} as { [key: string]: string });
const ResidentialTypes: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [localPage, setLocalPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [initialSearch, setInitialSearch] = useState<string>("");
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [statusAction, setStatusAction] = useState<"approve" | "reject" | null>(
    null
  );
  const [selectedProperty, setSelectedProperty] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [leadPullFormData, setLeadPullFormData] = useState<LeadPullFormData>({
    mobile: "",
    email: "",
    name: "",
    sourceType: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<LeadPullFormData>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownButtonRefs = useRef<{
    [key: string]: HTMLButtonElement | null;
  }>({});
  const navigate = useNavigate();
  const location = useLocation();
  const { property_for, status } = useParams<{
    property_for: string;
    status: string;
  }>();
  const dispatch = useDispatch<AppDispatch>();
  const pageUserType = useSelector(
    (state: RootState) => state.auth.user?.user_type
  );
  const {
    listings,
    loading,
    error,
    totalCount,
    currentPage,
    currentCount,
    totalPages,
  } = useSelector((state: RootState) => state.listings as ListingState);
  const excludedUserTypes = [9, 10, 11];
  useEffect(() => {
    const savedSearch = localStorage.getItem("searchQuery") || "";
    setInitialSearch(savedSearch);
    handleSearch(savedSearch);
  }, []);
  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [loading]);
  const getPageTitle = () => {
    const baseTitle = `Residential ${property_for === "buy" ? "Sell" : "Rent"}`;
    return `${baseTitle} ${
      statusMap[parseInt(status || "0", 10)] || "Unknown"
    }`;
  };
  useEffect(() => {
    localStorage.removeItem("searchQuery");
    setSearchQuery("");
    setInitialSearch("");
    setLocalPage(1);
    setFromDate(null);
    setToDate(null);
  }, [location.pathname]);
  useEffect(() => {
    const filters: any = {
      property_status: parseInt(status || "0", 10),
      property_for: property_for === "buy" ? "Sell" : "Rent",
      property_in: "Residential",
      page: localPage,
      search: searchQuery,
    };
    if (fromDate) filters.from_date = fromDate;
    if (toDate) filters.to_date = toDate;
    dispatch(fetchListings(filters));
  }, [
    dispatch,
    property_for,
    status,
    searchQuery,
    refreshTrigger,
    localPage,
    fromDate,
    toDate,
  ]);
  useEffect(() => {
    setLocalPage(1);
  }, [searchQuery, fromDate, toDate]);
  useEffect(() => {
    const handleStorageChange = () => {
      const currentSearch = localStorage.getItem("searchQuery") || "";
      if (currentSearch === "" && initialSearch !== "") {
        setSearchQuery("");
        setLocalPage(1);
        setInitialSearch("");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [initialSearch]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownOpen &&
        dropdownPosition &&
        !document
          .getElementById(`dropdown-portal-${dropdownOpen}`)
          ?.contains(event.target as Node)
      ) {
        setDropdownOpen(null);
        setDropdownPosition(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen, dropdownPosition]);
  const handleEdit = (item: any) => {
    const editPath =
      property_for === "buy"
        ? "/residential-buy-edit"
        : "/residential-rent-edit";
    navigate(editPath, { state: { property: item } });
    setDropdownOpen(null);
  };
  const handleDelete = useCallback(
    (unique_property_id: string, property_name: string) => {
      setSelectedProperty({ id: unique_property_id, name: property_name });
      setIsDeleteModalOpen(true);
      setDropdownOpen(null);
    },
    []
  );
  const confirmDelete = useCallback(() => {
    if (selectedProperty) {
      setIsDeleteModalOpen(false);
      setSelectedProperty(null);
    }
  }, [selectedProperty]);
  const handleApprove = useCallback(
    (
      unique_property_id: string,
      property_name: string,
      action: "approve" | "reject"
    ) => {
      setSelectedProperty({ id: unique_property_id, name: property_name });
      setStatusAction(action);
      setIsStatusModalOpen(true);
      setDropdownOpen(null);
    },
    []
  );
  const handleView = useCallback((unique_property_id: string) => {
    if (!unique_property_id) return;
    try {
      const url = `https://meetowner.in/property?Id_${encodeURIComponent(
        unique_property_id
      )}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error navigating to property:", error);
    }
  }, []);
  const confirmStatusChange = useCallback(() => {
    if (selectedProperty && statusAction) {
      const property_status = statusAction === "approve" ? 1 : 2;
      dispatch(
        updatePropertyStatus({
          property_status,
          unique_property_id: selectedProperty.id,
        })
      )
        .unwrap()
        .then(() => setRefreshTrigger((prev) => prev + 1))
        .catch((err) => console.error("Status update failed:", err));
      setIsStatusModalOpen(false);
      setSelectedProperty(null);
      setStatusAction(null);
    }
  }, [dispatch, selectedProperty, statusAction]);
  const handleLead = useCallback(() => {
    setIsLeadModalOpen(true);
    setDropdownOpen(null);
  }, []);
  const handlePropertyClick = (propertyId: string) => {
    if (propertyId) {
      navigate(`/user-activities?property_id=${propertyId}`);
    }
  };
  const validateLeadPullForm = useCallback((): boolean => {
    const newErrors: Partial<LeadPullFormData> = {};
    if (!leadPullFormData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(leadPullFormData.mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
    }
    if (!leadPullFormData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadPullFormData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!leadPullFormData.name) {
      newErrors.name = "Name is required";
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [leadPullFormData]);
  const handleLeadPullSubmit = useCallback(
    (data: LeadPullFormData) => {
      if (validateLeadPullForm()) {
        alert("Lead pull submitted successfully!");
        setIsLeadModalOpen(false);
        setLeadPullFormData({
          mobile: "",
          email: "",
          name: "",
          sourceType: "",
        });
        setFormErrors({});
      }
    },
    [validateLeadPullForm]
  );
  const handleSearch = (value: string) => {
    let searchValue = value.trim();
    const userTypeKey = userTypeReverseMap[searchValue.toLowerCase()];
    if (userTypeKey) {
      searchValue = userTypeKey;
    }
    setSearchQuery(searchValue);
  };
  const goToPage = (page: number) => {
    setLocalPage(page);
  };
  const goToPreviousPage = () => currentPage > 1 && goToPage(currentPage - 1);
  const goToNextPage = () =>
    currentPage < totalPages && goToPage(currentPage + 1);
  const getPaginationItems = () => {
    const pages = [];
    const totalVisiblePages = 7;
    let startPage = Math.max(
      1,
      currentPage - Math.floor(totalVisiblePages / 2)
    );
    let endPage = Math.min(totalPages, startPage + totalVisiblePages - 1);
    if (endPage - startPage + 1 < totalVisiblePages) {
      startPage = Math.max(1, endPage - totalVisiblePages + 1);
    }
    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);
    return pages;
  };
  const shouldShowActions = (userType: number | undefined) => {
    if (userType === undefined) return false;
    return (
      !excludedUserTypes.includes(userType) &&
      (parseInt(status || "0", 10) === 0 ||
        parseInt(status || "0", 10) === 1 ||
        parseInt(status || "0", 10) === 2)
    );
  };
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLeadPullFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const dropdownButtonRef = useRef<HTMLButtonElement | null>(null);
  return (
    <div className="relative min-h-screen">
      <PageMeta
        title={`Meet Owner Residential ${
          property_for === "buy" ? "Sell" : "Rent"
        } ${getPageTitle()}`}
      />
      <PageBreadcrumb
        pageTitle={`Residential ${property_for === "buy" ? "Sell" : "Rent"}`}
        pagePlacHolder="Search by ID, Project Name, User Type, Name, Mobile, or Email"
        onFilter={handleSearch}
        inputRef={searchInputRef}
      />
      <DateFilter
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onClear={() => {
          setFromDate(null);
          setToDate(null);
        }}
        className="mb-4"
      />
      {loading ? (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
          <ComponentCard title={getPageTitle()}>
            <TableLoader
              title={getPageTitle()}
              hasActions={
                parseInt(status || "0", 10) === 0 ||
                parseInt(status || "0", 10) === 1
              }
            />
          </ComponentCard>
        </div>
      ) : error ? (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Error: {error}
          </h2>
        </div>
      ) : !listings || listings.length === 0 ? (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            No Listings Found
          </h2>
        </div>
      ) : (
        <>
          <h2 className="p-2">Search result - {totalCount}</h2>
          <div className="space-y-6">
            <ComponentCard title={getPageTitle()}>
              <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-auto">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Sl. No
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          ID
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Project Name
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Property Type
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          User Type
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {parseInt(status || "0", 10) === 0
                            ? "Listing Date & Time"
                            : "Updated Date & Time"}
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Location
                        </TableCell>
                        {shouldShowActions(pageUserType) && (
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            Actions
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {listings.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {(currentPage - 1) * currentCount + index + 1}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {item.unique_property_id || item.id}
                          </TableCell>
                          {parseInt(status || "0", 10) === 1 ? (
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                              <span
                                className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 cursor-pointer hover:underline"
                                onClick={() =>
                                  handlePropertyClick(item.unique_property_id)
                                }
                              >
                                {item.property_name}
                              </span>
                            </TableCell>
                          ) : (
                            <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                              {item.property_name || "N/A"}
                            </TableCell>
                          )}
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {item.sub_type || "N/A"}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                            <div
                              onMouseEnter={() =>
                                setHoveredUserId(item.id.toString())
                              }
                              onMouseLeave={() => setHoveredUserId(null)}
                              className="inline-block"
                            >
                              <span
                                style={{ color: "#1D3A76", fontWeight: "bold" }}
                              >
                                {userTypeMap[item.user.user_type] || "Unknown"}
                              </span>
                              {hoveredUserId === item.id.toString() &&
                                item.user && (
                                  <div className="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                      <p>
                                        <strong>Name:</strong>{" "}
                                        {item.user.name || "N/A"}
                                      </p>
                                      <p>
                                        <strong>Mobile:</strong>{" "}
                                        {item.user.mobile || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {`${item.updated_date || "N/A"} - ${
                              item.updated_time || "N/A"
                            }`}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {item.location_id}
                          </TableCell>
                          {shouldShowActions(pageUserType) && (
                            <TableCell className="relative px-5 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(
                                  e: React.MouseEvent<HTMLButtonElement>
                                ) => {
                                  const btn = e.currentTarget;
                                  const rect = btn.getBoundingClientRect();
                                  setDropdownOpen(
                                    dropdownOpen === item.id.toString()
                                      ? null
                                      : item.id.toString()
                                  );
                                  setDropdownPosition(
                                    dropdownOpen === item.id.toString()
                                      ? null
                                      : {
                                          top: rect.bottom + window.scrollY,
                                          left: rect.left + window.scrollX,
                                        }
                                  );
                                  dropdownButtonRefs.current[item.id] = btn;
                                }}
                                ref={(el: HTMLButtonElement | null) => {
                                  dropdownButtonRefs.current[item.id] = el;
                                }}
                              >
                                <svg
                                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </Button>
                              {dropdownOpen === item.id.toString() &&
                                dropdownPosition &&
                                createPortal(
                                  <div
                                    id={`dropdown-portal-${item.id}`}
                                    style={{
                                      position: "absolute",
                                      top: dropdownPosition.top,
                                      left: dropdownPosition.left,
                                      zIndex: 9999,
                                      width: "160px",
                                    }}
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
                                  >
                                    <button
                                      onClick={() => {
                                        handleView(item.unique_property_id);
                                        setDropdownOpen(null);
                                        setDropdownPosition(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      View
                                    </button>
                                    {parseInt(status || "0", 10) !== 2 && (
                                      <button
                                        onClick={() => {
                                          handleEdit(item);
                                          setDropdownOpen(null);
                                          setDropdownPosition(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        Edit
                                      </button>
                                    )}
                                    {parseInt(status || "0", 10) === 0 && (
                                      <button
                                        onClick={() => {
                                          handleApprove(
                                            item.unique_property_id,
                                            item.property_name ||
                                              "this property",
                                            "approve"
                                          );
                                          setDropdownOpen(null);
                                          setDropdownPosition(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        Approve
                                      </button>
                                    )}
                                    {parseInt(status || "0", 10) !== 2 && (
                                      <button
                                        onClick={() => {
                                          handleApprove(
                                            item.unique_property_id,
                                            item.property_name ||
                                              "this property",
                                            "reject"
                                          );
                                          setDropdownOpen(null);
                                          setDropdownPosition(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        Reject
                                      </button>
                                    )}
                                    {parseInt(status || "0", 10) === 1 && (
                                      <button
                                        onClick={() => {
                                          handleLead();
                                          setDropdownOpen(null);
                                          setDropdownPosition(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        Lead Pull
                                      </button>
                                    )}
                                  </div>,
                                  document.body
                                )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {totalCount > currentCount && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {(currentPage - 1) * currentCount + 1} to{" "}
                    {Math.min(currentPage * currentCount, totalCount)} of{" "}
                    {totalCount} entries
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button
                      variant={currentPage === 1 ? "outline" : "primary"}
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {getPaginationItems().map((page, index) => {
                      const uniqueKey = `${page}-${index}`;
                      return page === "..." ? (
                        <span
                          key={uniqueKey}
                          className="px-3 py-1 text-gray-500 dark:text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={uniqueKey}
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(page as number)}
                          isActive={page === currentPage}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant={
                        currentPage === totalPages ? "outline" : "primary"
                      }
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </ComponentCard>
          </div>
        </>
      )}
      <LeadPullModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setLeadPullFormData({
            mobile: "",
            email: "",
            name: "",
            sourceType: "",
          });
          setFormErrors({});
        }}
        onSubmit={handleLeadPullSubmit}
        formData={leadPullFormData}
        formErrors={formErrors}
        onInputChange={handleInputChange}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        propertyName={selectedProperty?.name || ""}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedProperty(null);
        }}
      />
      <ConfirmStatusModal
        isOpen={isStatusModalOpen}
        propertyName={selectedProperty?.name || ""}
        action={statusAction || "approve"}
        onConfirm={confirmStatusChange}
        onCancel={() => {
          setIsStatusModalOpen(false);
          setSelectedProperty(null);
          setStatusAction(null);
        }}
      />
    </div>
  );
};
export default ResidentialTypes;
