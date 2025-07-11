import {
  useEffect,
  useState,
  ChangeEvent,
  FormEvent,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../../store/slices/users";
import { RootState, AppDispatch } from "../../store/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { MoreVertical } from "lucide-react";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import axios from "axios";
import FilterBar from "../../components/common/FilterBar";
import { fetchAllCities, fetchAllStates } from "../../store/slices/places";
import toast from "react-hot-toast";
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
interface FormData {
  user_id: string;
  amount: string;
  mobile: string;
  email: string;
  name: string;
  city: string;
  state: string;
  userType: string;
  package: string;
}
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};
export default function GeneratePayments() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.users
  );
  const {
    states,
    statesLoading,
    statesError,
    cities,
    citiesLoading,
    citiesError,
  } = useSelector((state: RootState) => state.places);
  const pageuserType = useSelector(
    (state: RootState) => state.auth.user?.user_type
  );
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    user_id: "",
    amount: "",
    mobile: "",
    email: "",
    name: "",
    city: "",
    state: "",
    userType: "",
    package: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState<string>("");
  const [paymentLink, setPaymentLink] = useState<string>("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [isStateDropdownOpen, setIsStateDropdownOpen] =
    useState<boolean>(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const itemsPerPage = 10;
  const packageOptions: SelectOption[] = [
    { value: "Basic", label: "Basic" },
    { value: "Prime", label: "Prime" },
    { value: "Prime Plus", label: "Prime Plus" },
  ];
  const canShowMobileAndEmail =
    pageuserType === 1 ||
    (pageuserType !== null &&
      pageuserType !== undefined &&
      [7, 8, 9].includes(pageuserType) &&
      selectedUserType !== "User");
  useEffect(() => {
    dispatch(fetchAllStates());
    dispatch(fetchAllUsers());
  }, [dispatch]);
  useEffect(() => {
    if (formData.state) {
      dispatch(fetchAllCities({ state: formData.state }));
    } else {
      dispatch(fetchAllCities());
    }
  }, [dispatch, formData.state]);
  useEffect(() => {
    const handleClickOutsideDropdowns = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".state-dropdown")) {
        setIsStateDropdownOpen(false);
      }
      if (!target.closest(".city-dropdown")) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideDropdowns);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdowns);
    };
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUserType, startDate, endDate, cityFilter, filterValue]);
  const filteredUsers = useMemo(
    () =>
      users && Array.isArray(users)
        ? users.filter((user) => {
            const searchableFields = [
              user.name,
              user.mobile,
              user.email,
              user.city,
              user.state,
              user.address,
              user.designation,
            ];
            const matchesSearch = searchableFields
              .filter(
                (field): field is string =>
                  field !== null && field !== undefined
              )
              .map((field) => field.toLowerCase())
              .some((field) => field.includes(filterValue.toLowerCase()));
            const matchesUserType =
              selectedUserType === null ||
              selectedUserType === "" ||
              userTypeMap[user.user_type] === selectedUserType;
            let matchesDate = true;
            if (startDate || endDate) {
              if (!user.created_date) {
                matchesDate = false;
              } else {
                try {
                  const userDate = user.created_date.split("T")[0];
                  matchesDate =
                    (!startDate || userDate >= startDate) &&
                    (!endDate || userDate <= endDate);
                } catch {
                  matchesDate = false;
                }
              }
            }
            const matchesCity =
              !cityFilter ||
              (user.city &&
                user.city.toLowerCase() === cityFilter.toLowerCase());
            return (
              matchesSearch && matchesUserType && matchesDate && matchesCity
            );
          })
        : [],
    [users, filterValue, selectedUserType, startDate, endDate, cityFilter]
  );
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };
  const handleCreate = () => {
    navigate("/accounts/create-new-user");
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
  const openPopup = (user: any) => {
    setSelectedUser(user);
    setFormData({
      user_id: user.id.toString(),
      amount: "",
      mobile: user.mobile || "",
      email: user.email || "",
      name: user.name || "",
      city: user.city || "",
      state: user.state || "",
      userType: userTypeMap[user.user_type] || "",
      package: "",
    });
    setErrors({});
    setApiError("");
    setPaymentLink("");
    setShowPopup(true);
    if (user.state) {
      dispatch(fetchAllCities({ state: user.state }));
    }
  };
  const closePopup = () => {
    setShowPopup(false);
    setSelectedUser(null);
    setActiveMenu(null);
  };
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };
  const handleSelectChange =
    (name: keyof FormData) => async (value: string) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        amount: value === "Custom" ? "" : prev.amount,
      }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
      setApiError("");
      if (name === "package" && value !== "Custom") {
        try {
          const { state, city, userType } = formData;
          if (!state || !city || !userType) {
            return setApiError(
              "State, city, and user type are required to fetch pricing"
            );
          }
          const apiUserType = userType.toLowerCase().replace(" ", "_");
          const response = await axios.get(
            `https://api.meetowner.in/packages/v1/getPackagePrice`,
            {
              params: {
                package_for: apiUserType,
                packageName: value.toLowerCase().replace(" ", " "),
                city,
              },
            }
          );
          if (response.data?.price) {
            setFormData((prev) => ({
              ...prev,
              amount: response.data.price.toString(),
            }));
          } else {
            setApiError(
              "Price not found for selected package, state, and city"
            );
          }
        } catch (err: any) {
          setApiError("Failed to fetch price from server");
        }
      }
    };
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.package) {
      newErrors.package = "Package is required";
    }
    if (formData.package === "Custom" && !formData.amount) {
      newErrors.amount = "Amount is required for custom package";
    } else if (
      formData.package === "Custom" &&
      (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0)
    ) {
      newErrors.amount = "Please enter a valid positive amount";
    }
    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError("");
    setPaymentLink("");
    if (!validateForm()) {
      return;
    }
    const apiURL = "https://api.meetowner.in";

    try {
      const checkResponse = await fetch(
        `${apiURL}/payments/checkSubscription`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: formData.user_id,
            city: formData?.city || "",
          }),
        }
      );
      const checkData = await checkResponse.json();
      if (!checkData.success) {
        return;
      }
      const { isSubscriptionActive, payment_status } = checkData;
      if (payment_status === "processing") {
        toast.error("Your plan is in processing. Please wait.");
        return;
      }
      if (isSubscriptionActive) {
        toast.error("You already have an active subscription.");
        return;
      }
    } catch (error) {
      toast.error("Error checking subscription status. Please try again.");
      return;
    }
    const payload = {
      amount: parseFloat(formData.amount),
      currency: "INR",
      user_id: parseInt(formData.user_id),
      user_type: formData?.userType || "N/A",
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      city: formData.city,
      subscription_package: formData.package,
      customer_email: formData.email,
      customer_contact: formData.mobile,
    };
    try {
      const response = await axios.post(
        `${apiURL}/payments/createPaymentLink`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );
      if (response.data.success) {
        setPaymentLink(response.data.payment_link);
        alert("Payment link generated successfully!");
        closePopup();
      } else {
        setApiError(response.data.message || "Failed to generate payment link");
      }
    } catch (error) {
      setApiError(
        (error as any).response?.data?.message ||
          (error as any).message ||
          "Failed to connect to the payment service"
      );
    }
  };
  const userFilterOptions: SelectOption[] = [
    { value: "", label: "All Users" },
    ...Object.entries(userTypeMap).map(([key, value]) => ({
      value: value,
      label: value,
    })),
  ];
  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!users || users.length === 0) return <div>No users found.</div>;
  const hideUserDetails = (mobile, user_type) => {
    const isBuyer = user_type === 2;
    if (isBuyer && pageuserType !== 1) {
      return `${mobile?.slice(0, 3)}xxxxxxx`;
    }
    return mobile;
  };
  return (
    <div className="relative min-h-screen">
      <PageBreadcrumbList
        pageTitle="All Users Table"
        pagePlacHolder="Filter users by name, mobile, email, city, state, address, or designation"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
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
          <button
            type="button"
            className="px-3 py-1 text-sm bg-[#1D3A76] text-white rounded-md hover:bg-brand-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-[50%] sm:w-auto"
            onClick={handleCreate}
          >
            Create User
          </button>
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
        <ComponentCard title="All Users Table">
          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
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
                      User Id
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      User
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
                      Payment Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Since
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
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedUsers.map((user, index) => {
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {user.id}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 cursor-pointer hover:underline">
                                {user.name}
                              </span>
                              <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                {userTypeMap[user.user_type] || "Unknown"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {hideUserDetails(user.mobile, user.user_type)}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {hideUserDetails(user.email, user.user_type)}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {user.city}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {user.subscription_status}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(user.created_date)}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 0
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : user.status === 2
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : user.status === 3
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {user.status === 0
                              ? "Active"
                              : user.status === 2
                              ? "Suspended"
                              : user.status === 3
                              ? "Blocked"
                              : user.status === null
                              ? "N/A"
                              : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleMenu(user.id)}
                          >
                            <MoreVertical className="size-5 text-gray-500 dark:text-gray-400" />
                          </Button>
                          {activeMenu === user.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                              <div className="py-2">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => openPopup(user)}
                                >
                                  Generate Payment Link
                                </button>
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
        </ComponentCard>
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">
              Generate Payment Link
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {apiError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {apiError}
                </p>
              )}
              {paymentLink && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  Payment Link:{" "}
                  <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {paymentLink}
                  </a>
                </div>
              )}
              <div>
                <Label htmlFor="state">State</Label>
                <div className="relative state-dropdown">
                  <input
                    id="state-search"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        state: e.target.value,
                        city: "",
                        amount: "",
                      }));
                      setErrors((prev) => ({ ...prev, state: "", city: "" }));
                    }}
                    onClick={() => setIsStateDropdownOpen(true)}
                    onFocus={() => setIsStateDropdownOpen(true)}
                    placeholder="Search for a state..."
                    className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-dark-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                    disabled={statesLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setIsStateDropdownOpen((prev) => !prev)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    disabled={statesLoading}
                  >
                    <svg
                      className={`w-4 h-4 transform ${
                        isStateDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isStateDropdownOpen && states.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                      {states.map((state) => (
                        <li
                          key={state.name}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              state: state.name,
                              city: "",
                              amount: "",
                            }));
                            setIsStateDropdownOpen(false);
                            setErrors((prev) => ({
                              ...prev,
                              state: "",
                              city: "",
                            }));
                            dispatch(fetchAllCities({ state: state.name }));
                          }}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          {state.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  {statesError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {statesError}
                    </p>
                  )}
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <div className="relative city-dropdown">
                  <input
                    id="city-search"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        city: e.target.value,
                        amount: "",
                      }));
                      setErrors((prev) => ({ ...prev, city: "" }));
                    }}
                    onClick={() => setIsCityDropdownOpen(true)}
                    onFocus={() => setIsCityDropdownOpen(true)}
                    placeholder="Search for a city..."
                    className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-dark-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                    disabled={citiesLoading || !formData.state}
                  />
                  <button
                    type="button"
                    onClick={() => setIsCityDropdownOpen((prev) => !prev)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    disabled={citiesLoading || !formData.state}
                  >
                    <svg
                      className={`w-4 h-4 transform ${
                        isCityDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isCityDropdownOpen && cities.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                      {cities.map((city) => (
                        <li
                          key={city.name}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              city: city.name,
                            }));
                            setIsCityDropdownOpen(false);
                            setErrors((prev) => ({ ...prev, city: "" }));
                            if (
                              formData.package &&
                              formData.package !== "Custom"
                            ) {
                              handleSelectChange("package")(formData.package);
                            }
                          }}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          {city.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  {citiesError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {citiesError}
                    </p>
                  )}
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="package">Package</Label>
                <Select
                  options={packageOptions}
                  placeholder="Select Package"
                  onChange={handleSelectChange("package")}
                  value={formData.package}
                  className="dark:bg-dark-900"
                />
                {errors.package && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.package}
                  </p>
                )}
              </div>
              {formData.package && (
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    type="text"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={
                      formData.package === "Custom"
                        ? handleInputChange
                        : undefined
                    }
                    className={`dark:bg-dark-900 ${
                      formData.package !== "Custom"
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder={
                      formData.package === "Custom"
                        ? "Enter custom amount"
                        : "Amount set by package"
                    }
                    disabled={formData.package !== "Custom"}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.amount}
                    </p>
                  )}
                </div>
              )}
              {(!selectedUser?.email || selectedUser?.email === "") && (
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900"
                    placeholder="Enter user email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>
              )}
              {(!selectedUser?.mobile || selectedUser?.mobile === "") && (
                <div>
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    type="text"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900"
                    placeholder="Enter 10-digit mobile number"
                  />
                  {errors.mobile && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.mobile}
                    </p>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={closePopup}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button className="px-4 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-700">
                  Generate Payment Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
