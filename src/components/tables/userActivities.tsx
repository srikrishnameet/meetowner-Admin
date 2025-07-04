import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import ComponentCard from "../common/ComponentCard";
import PageBreadcrumbList from "../common/PageBreadCrumbLists";
import { getPropertyActivity } from "../../store/slices/propertyDetailsbyUser";
import { formatDate } from "../../hooks/FormatDate";
import FilterBar from "../common/FilterBar";
export default function UserActivities() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { propertyActivities, loading, error } = useSelector(
    (state: RootState) => state.propertyDetailsByUser
  );
  const userType = useSelector(
    (state: RootState) => state.auth.user?.user_type
  );
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const itemsPerPage = 10;
  const queryParams = new URLSearchParams(location.search);
  const propertyId = queryParams.get("property_id");
  useEffect(() => {
    if (propertyId) {
      dispatch(getPropertyActivity(propertyId));
    }
  }, [dispatch, propertyId]);
  useEffect(() => {
    setCurrentPage(1);
  }, [filterValue, startDate, endDate]);
  const filteredActivities = propertyActivities.filter((activity) => {
    const searchableFields = [
      activity.fullname || activity.userDetails?.name || "",
      activity.email || activity.userDetails?.email || "",
      activity.mobile || activity.userDetails?.mobile || "",
      activity.unique_property_id || "",
      formatDate(activity.created_date),
    ];

    const matchesSearch = searchableFields
      .map((field) => field.toLowerCase())
      .some((field) => field.includes(filterValue.toLowerCase()));
    let matchesDate = true;
    if (startDate || endDate) {
      if (!activity.created_date) {
        matchesDate = false;
      } else {
        try {
          const activityDate = activity.created_date.split("T")[0];
          matchesDate =
            (!startDate || activityDate >= startDate) &&
            (!endDate || activityDate <= endDate);
        } catch {
          matchesDate = false;
        }
      }
    }
    return matchesSearch && matchesDate;
  });
  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);
  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };
  const clearFilters = () => {
    setFilterValue("");
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
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
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);
    return pages;
  };
  return (
    <div className="relative min-h-screen p-6">
      <PageBreadcrumbList
        pageTitle="Property Activities"
        pagePlacHolder="Filter activities by name, email, mobile, property ID, or date"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <FilterBar
          showDateFilters={true}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClearFilters={clearFilters}
          startDate={startDate}
          endDate={endDate}
        />

        {(startDate || endDate || filterValue) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: Date: {startDate || "Any"} to {endDate || "Any"} | Search:{" "}
            {filterValue || "None"}
          </div>
        )}
        <ComponentCard title="Property Activities">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-200 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Sl.No
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Property ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Property Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    {userType === 1 && (
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Email
                      </TableCell>
                    )}
                    {userType === 1 && (
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Mobile
                      </TableCell>
                    )}
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Contacted Date
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                  {loading && (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                        Loading activities...
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && error && (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-red-500 text-theme-sm dark:text-red-400">
                        {error}
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && !error && paginatedActivities.length === 0 && (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                        No activities found
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading &&
                    !error &&
                    paginatedActivities.map((activity, index) => (
                      <TableRow key={activity.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.unique_property_id || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.property_name || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.fullname ||
                            activity.userDetails?.name ||
                            "N/A"}
                        </TableCell>
                        {userType === 1 && (
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {activity.email ||
                              activity.userDetails?.email ||
                              "N/A"}
                          </TableCell>
                        )}
                        {userType === 1 && (
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {activity.mobile ||
                              activity.userDetails?.mobile ||
                              "N/A"}
                          </TableCell>
                        )}
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(activity.created_date)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
          {totalItems > itemsPerPage && !loading && !error && (
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
                    <span
                      key={index}
                      className="px-3 py-1 text-gray-500 dark:text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={page === currentPage ? "primary" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page as number)}
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
}
