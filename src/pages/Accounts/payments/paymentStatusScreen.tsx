import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import PageMeta from "../../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  clearSubscriptions,
  fetchAllSubscriptions,
  updateSubscriptionStatus,
} from "../../../store/slices/paymentSlice";
import { AppDispatch, RootState } from "../../../store/store";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumbList from "../../../components/common/PageBreadCrumbLists";
import { useParams } from "react-router";
import Button from "../../../components/ui/button/Button";
import ConfirmStatusModal from "../../../components/common/ConfirmStatusModal";
import FilterBar from "../../../components/common/FilterBar";
import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "../Invoice";
import axios from "axios";
const userTypeMap: { [key: number]: string } = {
  2: "User",
  3: "Builder",
  4: "Agent",
  5: "Owner",
  6: "Channel Partner",
};
interface SelectOption {
  value: string;
  label: string;
}
interface SubscriptionFilters {
  payment_status?: string;
}
interface Subscription {
  id: number;
  user_id: number;
  user_type?: number;
  name: string;
  mobile: string;
  email: string;
  subscription_package: string;
  subscription_start_date: string;
  subscription_expiry_date: string;
  subscription_status: string;
  payment_status: string;
  payment_amount: string;
  payment_reference: string;
  payment_mode: string;
  payment_gateway: string;
  transaction_time: string;
  created_at: string;
  updated_at: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  actual_amount: string;
  gst: string;
  sgst: string;
  gst_percentage: string;
  gst_number: string;
  rera_number: string;
  invoice_number: string | null;
  city: string;
}
interface InvoiceResponse {
  id: number;
  invoice_number: string;
  user_id: number;
  payment_status: string;
  subscription_status: string;
  created_at: string;
  invoice_url: string;
}
const PaymentStatusScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { subscriptions, loading, error } = useSelector(
    (state: RootState) => state.payment
  );
  const { status } = useParams<{ status: string }>();
  const [filterValue, setFilterValue] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const subscriptionFilters: SubscriptionFilters = {
    payment_status: status,
  };
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [statusAction, setStatusAction] = useState<"approve" | "reject" | null>(
    null
  );
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [stateFilter, setStateFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const itemsPerPage = 10;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (status) {
      dispatch(fetchAllSubscriptions(subscriptionFilters));
    }
    return () => {
      dispatch(clearSubscriptions());
    };
  }, [dispatch, status]);
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUserType, startDate, endDate, filterValue, cityFilter]);
  const handleInvoice = useCallback(async (sub: Subscription) => {
    if (!sub.invoice_number) {
      setDropdownOpen(null);
      return;
    }
    try {
      const response = await axios.get<InvoiceResponse[]>(
        `https://api.meetowner.in/payments/getInvoiceByID?invoice_number=${sub.invoice_number}`
      );
      const invoices = response.data;
      if (invoices.length > 0 && invoices[0].invoice_url) {
        window.open(invoices[0].invoice_url, "_blank");
      } else {
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
    setDropdownOpen(null);
  }, []);
  const handleApprove = useCallback(
    (
      userId: number,
      subscriptionName: string,
      action: "approve" | "reject"
    ) => {
      setSelectedSubscription({ id: userId, name: subscriptionName });
      setStatusAction(action);
      setIsStatusModalOpen(true);
      setDropdownOpen(null);
    },
    []
  );
  const confirmStatusChange = useCallback(() => {
    if (selectedSubscription && statusAction) {
      const subscriptionStatus =
        statusAction === "approve" ? "active" : "inactive";
      const paymentStatus = statusAction === "approve" ? "success" : "rejected";
      dispatch(
        updateSubscriptionStatus({
          user_id: selectedSubscription.id,
          subscription_status: subscriptionStatus,
          payment_status: paymentStatus,
        })
      ).then(async (result) => {
        if (result.meta.requestStatus === "fulfilled") {
          dispatch(fetchAllSubscriptions({ payment_status: status }));
          if (statusAction === "approve") {
            try {
              const subscription = subscriptions.find(
                (sub) => sub.user_id === selectedSubscription.id
              );
              if (!subscription) {
                throw new Error("Subscription not found");
              }
              const pdfDoc = pdf(<InvoicePDF subscription={subscription} />);
              const pdfBlob = await pdfDoc.toBlob();
              const formData = new FormData();
              formData.append("pdf", pdfBlob, `invoice-${subscription.id}.pdf`);
              formData.append("user_id", selectedSubscription.id.toString());
              formData.append("subscription_name", selectedSubscription.name);
              await axios.post("YOUR_BACKEND_ENDPOINT", formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
            } catch (error) {
              console.error("Failed to generate or send PDF:", error);
            }
          }
        } else if (result.meta.requestStatus === "rejected") {
          console.error(
            "Failed to update subscription status:",
            result.payload
          );
        }
      });
      setIsStatusModalOpen(false);
      setSelectedSubscription(null);
      setStatusAction(null);
    }
  }, [dispatch, selectedSubscription, statusAction, status, subscriptions]);
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };
  const formatPackageName = (packageName: string): string => {
    return (
      packageName.charAt(0).toUpperCase() + packageName.slice(1).toLowerCase()
    );
  };
  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };
  const clearFilters = () => {
    setSelectedUserType(null);
    setStartDate(null);
    setEndDate(null);
    setStateFilter("");
    setCityFilter("");
    setFilterValue("");
    setCurrentPage(1);
  };
  const pageTitleStatus = status
    ? `${status.charAt(0).toUpperCase() + status.slice(1)} Payments`
    : "Payments";
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const searchableFields = [sub.name || "", sub.mobile || ""];
      const matchesSearch = searchableFields.some((field) =>
        field.toLowerCase().includes(filterValue.toLowerCase())
      );
      const matchesUserType =
        selectedUserType === null ||
        selectedUserType === "" ||
        userTypeMap[sub.user_type || 0] === selectedUserType;
      let matchesDate = true;
      if (startDate || endDate) {
        if (!sub.subscription_start_date) {
          matchesDate = false;
        } else {
          try {
            const subDate = sub.subscription_start_date.split("T")[0];
            matchesDate =
              (!startDate || subDate >= startDate) &&
              (!endDate || subDate <= endDate);
          } catch {
            matchesDate = false;
          }
        }
      }
      const matchesCity =
        !cityFilter ||
        (sub.city && sub.city.toLowerCase() === cityFilter.toLowerCase());
      return matchesSearch && matchesUserType && matchesDate && matchesCity;
    });
  }, [
    subscriptions,
    filterValue,
    selectedUserType,
    startDate,
    endDate,
    cityFilter,
  ]);
  const userFilterOptions: SelectOption[] = [
    { value: "", label: "All Users" },
    ...Object.entries(userTypeMap).map(([key, value]) => ({
      value: value,
      label: value,
    })),
  ];
  const totalItems = filteredSubscriptions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedSubscriptions = filteredSubscriptions.slice(
    startIndex,
    endIndex
  );
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
    const pages: (number | string)[] = [];
    const totalVisiblePages = 5;
    if (totalPages <= totalVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);
      if (currentPage <= 3) {
        start = 2;
        end = 5;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages - 1;
      }
      pages.push(1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 1) pages.push("...");
      if (totalPages > 1) pages.push(totalPages);
    }
    return pages;
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Loading subscriptions...
        </h2>
      </div>
    );
  }
  return (
    <div className="relative min-h-screen">
      <PageMeta title="Meet Owner Payments" />
      <PageBreadcrumbList
        pageTitle={pageTitleStatus}
        pagePlacHolder="Filter subscriptions"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-3 py-2">
          <FilterBar
            showUserTypeFilter={true}
            showDateFilters={true}
            showStateFilter={true}
            showCityFilter={true}
            userFilterOptions={userFilterOptions}
            onUserTypeChange={setSelectedUserType}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onStateChange={setStateFilter}
            onCityChange={setCityFilter}
            onClearFilters={clearFilters}
            selectedUserType={selectedUserType}
            startDate={startDate}
            endDate={endDate}
            stateValue={stateFilter}
            cityValue={cityFilter}
          />
        </div>
        {}
        {(selectedUserType ||
          startDate ||
          endDate ||
          cityFilter ||
          filterValue) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: User Type: {selectedUserType || "All"} | Date:{" "}
            {startDate || "Any"} to {endDate || "Any"} | City:{" "}
            {cityFilter || "Any"} | Search: {filterValue || "None"}
          </div>
        )}
        <ComponentCard title={pageTitleStatus}>
          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-auto">
              {error && (
                <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
                  <h2 className="text-lg font-bold text-red-500">
                    Error: {error}
                  </h2>
                </div>
              )}
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Sl.No
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Mobile
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Email
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      City
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Package
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Start Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Expiry Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Payment Mode
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Payment Gateway
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Gst Number
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Payment Amount
                    </TableCell>
                    {status?.toLowerCase() === "success" && (
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Invoice Number
                      </TableCell>
                    )}
                    {(status?.toLowerCase() === "processing" ||
                      status?.toLowerCase() === "success") && (
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
                  {(!paginatedSubscriptions ||
                    paginatedSubscriptions.length === 0) && (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                        {filterValue ||
                        selectedUserType ||
                        startDate ||
                        endDate ||
                        cityFilter
                          ? "No Matching Subscriptions Found"
                          : "No Subscriptions Available"}
                      </TableCell>
                    </TableRow>
                  )}
                  {paginatedSubscriptions.map((sub: Subscription, index) => (
                    <TableRow key={sub.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1} {}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 cursor-pointer hover:underline">
                              {sub.name}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {userTypeMap[sub.user_type!] || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.mobile}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.email}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.city}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        <span
                          className={`inline-block px-2 py-1 rounded-md text-xs w-auto font-medium ${
                            sub.subscription_package.toLowerCase() === "basic"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : sub.subscription_package.toLowerCase() ===
                                "prime"
                              ? "bg-[#EC9A0C] text-black dark:bg-[#EC9A0C] dark:text-white"
                              : "bg-[#1D3A76] text-white dark:bg-purple-900 dark:text-purple-200"
                          }`}
                        >
                          {formatPackageName(
                            sub.subscription_package === "prime_plus"
                              ? "Prime Plus"
                              : sub.subscription_package
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(sub.subscription_start_date)}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(sub.subscription_expiry_date)}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.subscription_status}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.payment_mode}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.payment_gateway}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.gst_number}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.payment_amount}
                      </TableCell>
                      {status?.toLowerCase() === "success" && (
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {sub.invoice_number}
                        </TableCell>
                      )}
                      {status?.toLowerCase() === "processing" && (
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setDropdownOpen(
                                  dropdownOpen === sub.id.toString()
                                    ? null
                                    : sub.id.toString()
                                )
                              }
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
                            {dropdownOpen === sub.id.toString() && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10"
                              >
                                <button
                                  onClick={() =>
                                    handleApprove(
                                      sub.user_id,
                                      sub.name,
                                      "approve"
                                    )
                                  }
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleApprove(
                                      sub.user_id,
                                      sub.name,
                                      "reject"
                                    )
                                  }
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </>
                        </TableCell>
                      )}
                      {status?.toLowerCase() === "success" && (
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setDropdownOpen(
                                  dropdownOpen === sub.id.toString()
                                    ? null
                                    : sub.id.toString()
                                )
                              }
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
                            {dropdownOpen === sub.id.toString() && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20"
                              >
                                <button
                                  onClick={() => handleInvoice(sub)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  View Invoice
                                </button>
                              </div>
                            )}
                          </>
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
                    <span
                      key={`ellipsis-${index}`}
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
                      className={
                        page === currentPage
                          ? "bg-[#1D3A76] text-white"
                          : "text-gray-500"
                      }
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
          <ConfirmStatusModal
            isOpen={isStatusModalOpen}
            propertyName={selectedSubscription?.name || ""}
            action={statusAction || "approve"}
            onConfirm={confirmStatusChange}
            onCancel={() => {
              setIsStatusModalOpen(false);
              setSelectedSubscription(null);
              setStatusAction(null);
            }}
          />
        </ComponentCard>
      </div>
    </div>
  );
};
export default PaymentStatusScreen;
