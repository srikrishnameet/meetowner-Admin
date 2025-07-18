import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import toast from "react-hot-toast";
import { AppDispatch, RootState } from "../../store/store";
import { fetchUsersByType } from "../../store/slices/users";
import { clearMessages, deleteEmployee, updateEmployee } from "../../store/slices/employee";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import ComponentCard from "../../components/common/ComponentCard";
import { MoreVertical  } from "lucide-react";
import {Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import EditUserModal from "../../components/common/EditUser";

// User type mapping
const userTypeMap: { [key: number]: string } = {
  1: "Admin",
  2: "User",
  3: "Builder",
  4: "Agent",
  5: "Owner",
  6: "Channel Partner",
  7: "Manager",
  8: "Telecaller",
  9: "Marketing Executive",
  10: "Customer Support",
  11: "Customer Service",
};


interface EditUserFormData {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// Format date function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

export default function AllUsers() {
 
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector((state: RootState) => state.users);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);


 const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name: string;
    email: string;
    mobile: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    status: number;
    created_by: string;
    created_userID: number;
  } | null>(null);
  const [formData, setFormData] = useState<EditUserFormData>({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<EditUserFormData>>({});


  const itemsPerPage = 10;
 
  const { deleteError, deleteSuccess,updateLoading, updateError, updateSuccess} = useSelector((state: RootState) => state.employee);
  
  useEffect(() => {
      dispatch(fetchUsersByType({ user_type:2}));
  }, [dispatch]);

  const filteredUsers = users.filter((user) => {
    const searchableFields = [
      user.name,
      user.mobile, 
      user.email,
      user.city,
      user.state,
    ];
    return searchableFields
      .map((field) => field?.toLowerCase() || "")
      .some((field) => field.includes(filterValue.toLowerCase()));
  });

const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);


const handleEdit = (user: {
    id: number;
    name: string;
    email: string;
    mobile: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    status: number;
    created_by: string;
    created_userID: number;
  }) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
    });
    setFormErrors({});
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

   const validateForm = (data: EditUserFormData): Partial<EditUserFormData> => {
    const errors: Partial<EditUserFormData> = {};
    if (!data.name.trim()) errors.name = "Name is required";
    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Invalid email address";
    }
    if (!data.address.trim()) errors.address = "Address is required";
    if (!data.city.trim()) errors.city = "City is required";
    if (!data.state.trim()) errors.state = "State is required";
    if (!data.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(data.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }
    return errors;
  };

   const handleEditSubmit = (data: EditUserFormData) => {
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    if (selectedUser) {
      const employeeToUpdate = {
        id: selectedUser.id,
        name: data.name,
        email: data.email,
        mobile: selectedUser.mobile || "", // Include mobile from selectedUser
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        designation: "User",
        user_type: 2,
        status: 0,
        created_by: selectedUser.created_by || "", // Include created_by
        created_userID: selectedUser.created_userID || 0, // Include created_userID
      };
      dispatch(updateEmployee(employeeToUpdate));
    }
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
    setFormErrors({});
  };



useEffect(() => {
    if (deleteSuccess) {
      toast.success(deleteSuccess);
      dispatch(fetchUsersByType({ user_type: 2 })).then(() => {
        dispatch(clearMessages());
      });
    }
    if (deleteError) {
      toast.error(deleteError);
      dispatch(clearMessages());
    }
    if (updateSuccess) {
      toast.success(updateSuccess);
      dispatch(fetchUsersByType({ user_type: 2 })).then(() => {
        dispatch(clearMessages());
      });
    }
    if (updateError) {
      toast.error(updateError);
      dispatch(clearMessages());
    }
  }, [deleteSuccess, deleteError, updateSuccess, updateError, dispatch]);



  const handleDeleteClick = (user: { id: number; name: string; status: number }) => {
    setSelectedUser({
      ...user,
      email: "",
      mobile: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      created_by: "",
      created_userID: 0,
    });
    setIsDeleteModalOpen(true);
    setActiveMenu(null);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      dispatch(deleteEmployee(selectedUser.id));
    }
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };



   const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleFilter = (value: string) => {
    setFilterValue(value);
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


  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="relative min-h-screen">
      <PageBreadcrumbList
        pageTitle={`users Table`}
        pagePlacHolder="Filter users by name, mobile, email, city"
        onFilter={handleFilter}
      />

      {deleteSuccess && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md">
          {deleteSuccess}
        </div>
      )}
      {deleteError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {deleteError}
        </div>
      )}
       {updateSuccess && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md">{updateSuccess}</div>
      )}
      {updateError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{updateError}</div>
      )}
      <div className="space-y-6">
        <ComponentCard title={`users Table`}>
          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full ">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Sl.No</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">User</TableCell>
                      <>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mobile</TableCell>
                        {/* <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell> */}
                      </>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Address</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">City</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">State</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Pincode</TableCell>
                 
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Since</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{user.id}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3 " >
                          <div>
                            <span
                              className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 cursor-pointer hover:underline"
 
                            >
                              {user.name}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {userTypeMap[user.user_type] || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{user.mobile}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{user.address}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{user.city}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{user.state}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{user.pincode}</TableCell>

                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{formatDate(user.created_date)}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 0 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          user.status === 2 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                          user.status === 3 ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" :
                          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}>
                          {user.status === 0 ? "Active" :
                           user.status === 2 ? "Suspended" :
                           user.status === 3 ? "Deleted" :
                           user.status === null ? 'N/A' : "Inactive"}
                        </span>
                      </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                        <Button variant="outline" size="sm" onClick={() => toggleMenu(user.id)}>
                          <MoreVertical className="size-5 text-gray-500 dark:text-gray-400" />
                        </Button>
                        {activeMenu === user.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                            <div className="py-2">
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleEdit(user)}
                              >
                                Edit
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleDeleteClick(user)}
                              >
                                Delete
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                // onClick={() => handleStatusChangeClick(user)}
                              >
                                {user.status === 0 ? "Suspend" : "Activate"}
                              </button>
                            </div>
                          </div>
                        )}
                      </TableCell>

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
                {/* Previous Button */}
                <Button
                  variant={currentPage === 1 ? "outline" : "primary"}
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {/* Page Buttons */}
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

                {/* Next Button */}
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


           <EditUserModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
              setFormData({
            
                name: "",
                email: "",
                address: "",
                city: "",
                state: "",
                pincode: "",
                
                 
              });
              setFormErrors({});
            }}
            onSubmit={handleEditSubmit}
            formData={formData}
            formErrors={formErrors}
            onInputChange={handleInputChange}
            isLoading={updateLoading}
          />
            <ConfirmDeleteModal
            isOpen={isDeleteModalOpen}
            propertyName={selectedUser?.name || ""}
            onConfirm={confirmDelete}
            onCancel={() => {
              setIsDeleteModalOpen(false);
              setSelectedUser(null);
            }}
          />

         



        </ComponentCard>
      </div>
    </div>
  );
}