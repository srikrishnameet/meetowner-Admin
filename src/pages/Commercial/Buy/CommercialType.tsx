import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
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
import { fetchListings, ListingState,  updatePropertyStatus } from "../../../store/slices/listings";
import { AppDispatch, RootState } from "../../../store/store";

const statusMap: { [key: number]: string } = {
  0: "Review",
  1: "Approved",
  2: "Rejected",
  3: "Deleted",
};

const CommercialTypes: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { property_for, status } = useParams<{ property_for: string; status: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { listings, loading, error, totalCount } = useSelector(
    (state: RootState) => state.listings as ListingState
  );

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Define filters based on URL params (no page parameter for API)
  const filters = {
    property_status: parseInt(status || "0", 10),
    property_for: property_for === "buy" ? "Sell" : "Rent",
    property_in: "Commercial",
  };

  const getPageTitle = () => {
    const baseTitle = `Commercial ${filters.property_for}`;
    return `${baseTitle} ${statusMap[filters.property_status] || "Unknown"}`;
  };


  const formatDateTime = (date: string | undefined, time: string | undefined): string => {
    if (!date || !time) return "N/A";

    // Parse the UTC date and time
    const dateTime = new Date(`${date.split("T")[0]}T${time}Z`);

    // Extract components
    const day = String(dateTime.getUTCDate()).padStart(2, "0");
    const month = String(dateTime.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = dateTime.getUTCFullYear();
    let hours = dateTime.getUTCHours();
    const minutes = String(dateTime.getUTCMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12 || 12; // Convert 0 to 12 for midnight/noon
    const hoursStr = String(hours).padStart(2, "0");

    return `${day}-${month}-${year} ${hoursStr}:${minutes} ${ampm}`;
  };

  // Fetch listings when component mounts or filters/refreshTrigger changes
  useEffect(() => {
    dispatch(fetchListings(filters));
  }, [dispatch, property_for, status, refreshTrigger]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = (item: any) => {
    const editPath = property_for === "buy" ? "/commercial-buy-edit" : "/commercial-rent-edit";
    navigate(editPath, { state: { property: item } });
    setDropdownOpen(null);
  };

  const handleDelete = (unique_property_id: string) => {
    const property_status = 3;
    dispatch(updatePropertyStatus({ property_status, unique_property_id }))
      .unwrap()
      .then(() => setRefreshTrigger((prev) => prev + 1))
      .catch((err) => console.error("Status update failed:", err));
    setDropdownOpen(null);
  };

  const handleApprove = (unique_property_id: string) => {
    const property_status = filters.property_status === 0 ? 1 : 2;
    dispatch(updatePropertyStatus({ property_status, unique_property_id }))
      .unwrap()
      .then(() => setRefreshTrigger((prev) => prev + 1))
      .catch((err) => console.error("Status update failed:", err));
    setDropdownOpen(null);
  };

  // Search filter logic
  const filteredListings = listings.filter((item) =>
    searchQuery
      ? [
          item.unique_property_id || item.id.toString(),
          item.property_name || "",
          item.user_type === 1 ? "Admin" :
          item.user_type === 2 ? "User" :
          item.user_type === 3 ? "Builder" :
          item.user_type === 4 ? "Agent" :
          item.user_type === 5 ? "Owner" :
          item.user_type === 6 ? "Channel Partner" : "Unknown",
          item.location_id || "", 
        ].some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  // Pagination logic (client-side)
  const totalItems = searchQuery ? filteredListings.length : totalCount;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => setCurrentPage(page);
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const getPaginationItems = () => {
    const pages = [];
    const totalVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(totalVisiblePages / 2));
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

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">Loading...</h2></div>;
  if (error) return <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">Error: {error}</h2></div>;
  if (!listings || listings.length === 0) return <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">No Data Available</h2></div>;

  return (
    <div className="relative min-h-screen">
      <PageMeta
        title={` Meet Owner Commercial ${filters.property_for} ${getPageTitle()}`}
        description={`This is the Commercial ${filters.property_for} ${getPageTitle()} Table page`}
      />
      <PageBreadcrumb
        pageTitle={`Commercial ${filters.property_for}`}
        pagePlacHolder="Search by ID, Project Name, or User Type"
        onFilter={handleSearch}
      />
      <div className="space-y-6">
        <ComponentCard title={getPageTitle()}>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Sl. No</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Project Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Property SubType</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">User Type</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Listing Time & Date</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Location</TableCell>
                    {(filters.property_status === 0 || filters.property_status === 1) && 
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedListings.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{item.unique_property_id || item.id}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{startIndex + index + 1}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{item.property_name || "N/A"}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{item.sub_type || "N/A"}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.user_type === 1 ? "Admin" :
                         item.user_type === 2 ? "User" :
                         item.user_type === 3 ? "Builder" :
                         item.user_type === 4 ? "Agent" :
                         item.user_type === 5 ? "Owner" :
                         item.user_type === 6 ? "Channel Partner" : "Unknown"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDateTime(item.created_date!,item.created_time!)}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.location_id}
                      </TableCell>
                      {(filters.property_status === 0 || filters.property_status === 1) && (
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDropdownOpen(dropdownOpen === item.id.toString() ? null : item.id.toString())}
                          >
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </Button>
                          {dropdownOpen === item.id.toString() && (
                            <div ref={dropdownRef} className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                              <button onClick={() => handleEdit(item)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Edit</button>
                              <button onClick={() => handleDelete(item.unique_property_id)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Delete</button>
                              <button onClick={() => handleApprove(item.unique_property_id)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                {filters.property_status === 0 ? "Approve" : "Reject"}
                              </button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          {totalItems > itemsPerPage && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1} to {endIndex} of {totalItems} entries
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
                {getPaginationItems().map((page, index) =>
                  page === "..." ? (
                    <span key={index} className="px-3 py-1 text-gray-500 dark:text-gray-400">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(page as number)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant={currentPage === totalPages ? "outline" : "primary"}
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
    </div>
  );
};

export default CommercialTypes;