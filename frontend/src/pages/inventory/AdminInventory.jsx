import { TextField, Switch, FormControlLabel } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSidebar } from "../../redux/reducers/ sidebar";
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import {
  declarePhoneLost,
  deletePhone,
  fetchActivePhones,
  fetchLostPhones,
} from "../../services/services";
import { BiCartAdd } from "react-icons/bi";
import { BiEdit } from "react-icons/bi";
import NewPhone from "../../components/NewPhone";
import InfiniteScroll from "react-infinite-scroll-component";
import EditPhone from "../../components/EditPhone";
import PhoneCheckout from "../../components/PhoneCheckout";
import { MdDeleteOutline, MdSettingsBackupRestore } from "react-icons/md";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "../../components/DeleteModal";
import { HiOutlineDownload } from "react-icons/hi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

// Skeleton components
const SkeletonPulse = () => (
  <div className="animate-pulse bg-gray-200 rounded-md h-full w-full" />
);

const TableSkeletonRow = ({ userRole }) => {
  return (
    <tr className="bg-white border-b border-l-4 border-l-gray-300">
      <td className="px-2 py-3 border-r">
        <div className="h-4 w-4">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-2 py-3 border-r">
        <div className="h-4 w-4">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-2 py-3 border-r">
        <div className="h-4 w-20">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-24">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-16">
          <SkeletonPulse />
        </div>
      </td>
      {userRole !== "manager" && (
        <>
          <td className="px-6 py-3 border-r">
            <div className="h-4 w-20">
              <SkeletonPulse />
            </div>
          </td>
          <td className="px-6 py-3 border-r">
            <div className="h-4 w-24">
              <SkeletonPulse />
            </div>
          </td>
        </>
      )}
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-24">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-16">
          <SkeletonPulse />
        </div>
      </td>
      {userRole !== "manager" && (
        <>
          <td className="px-6 py-3 border-r">
            <div className="h-4 w-20">
              <SkeletonPulse />
            </div>
          </td>
          <td className="px-6 py-3 border-r">
            <div className="h-4 w-24">
              <SkeletonPulse />
            </div>
          </td>
        </>
      )}
      <td className="px-6 py-3 flex flex-row space-x-2">
        <div className="h-8 w-20 rounded-xl">
          <SkeletonPulse />
        </div>
        {userRole !== "manager" && (
          <div className="h-8 w-20 rounded-xl">
            <SkeletonPulse />
          </div>
        )}
        {userRole === "super admin" && (
          <div className="h-8 w-20 rounded-xl">
            <SkeletonPulse />
          </div>
        )}
      </td>
    </tr>
  );
};

const TableSkeleton = ({ userRole }) => {
  return (
    <div className="max-h-[57vh] overflow-y-auto" id="scrollableDiv">
      <table className="w-full text-sm text-left text-gray-500 sticky top-0 z-10">
        <thead className="text-xs text-gray-700 uppercase bg-neutral-100 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-2 border-r py-2">
              #
            </th>
            <th scope="col" className="px-2 border-r py-2">
              *
            </th>
            <th
              scope="col"
              className="px-2 border-r text-[14px] normal-case py-2">
              Model
            </th>
            <th
              scope="col"
              className="px-6 border-r text-[14px] normal-case py-2">
              IMEI
            </th>
            <th
              scope="col"
              className="px-6 border-r text-[14px] normal-case py-2">
              Capacity
            </th>
            {userRole !== "manager" && (
              <th
                scope="col"
                className="px-6 border-r text-[14px] normal-case py-2">
                Supplier
              </th>
            )}
            {userRole !== "manager" && (
              <th
                scope="col"
                className="px-6 border-r text-[14px] normal-case py-2">
                Buying Price
              </th>
            )}
            <th
              scope="col"
              className="px-6 border-r text-[14px] normal-case py-2">
              Selling Price
            </th>
            <th
              scope="col"
              className="px-6 border-r text-[14px] normal-case py-2">
              Manager Commission
            </th>
            {userRole !== "manager" && (
              <th
                scope="col"
                className="px-6 border-r text-[14px] normal-case py-2">
                Location
              </th>
            )}
            {userRole !== "manager" && (
              <th
                scope="col"
                className="px-6 border-r text-[14px] normal-case py-2">
                Manager
              </th>
            )}
            <th scope="col" className="px-6 text-[14px] normal-case py-2">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(8)].map((_, index) => (
            <TableSkeletonRow key={index} userRole={userRole} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdminInventory = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.userSlice.user.token);
  const [showAddPhone, setShowAddPhone] = useState(false);
  const [show, setShow] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [editPhone, setEditPhone] = useState([]);
  const [showEditPhoneModal, setShowEditPhoneModal] = useState(false);
  const [showPhoneCheckout, setShowPhoneCheckout] = useState(false);
  const [checkoutPhone, setCheckoutPhone] = useState(null);
  const [declareLostLoading, setDeclareLostLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePhoneImei, setDeletePhoneImei] = useState(null);
  const user = useSelector((state) => state.userSlice.user.user);
  // New state for the days filter toggle
  const [filterByDaysOnly, setFilterByDaysOnly] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: activePhonesData,
    fetchNextPage: fetchNextActivePhones,
    hasNextPage: hasMoreActivePhones,
    isFetchingNextPage: isLoadingMoreActivePhones,
    isLoading: isLoadingActivePhones,
  } = useInfiniteQuery(
    ["phones", { status: "active" }],
    ({ pageParam = 1 }) =>
      fetchActivePhones({
        queryKey: ["phones", { page: pageParam, limit: 2000 }],
        token,
      }),
    {
      getNextPageParam: (lastPage) => {
        const { page, total, limit } = lastPage;
        return page * limit < total ? page + 1 : undefined;
      },
      enabled: show === "active" && !!token,
    }
  );

  const {
    data: lostPhonesData,
    fetchNextPage: fetchNextLostPhones,
    hasNextPage: hasMoreLostPhones,
    isFetchingNextPage: isLoadingMoreLostPhones,
    isLoading: isLoadingLostPhones,
  } = useInfiniteQuery(
    ["phones", { status: "lost" }],
    ({ pageParam = 1 }) =>
      fetchLostPhones({
        queryKey: ["phones", { page: pageParam, limit: 20 }],
        token,
      }),
    {
      getNextPageParam: (lastPage) => {
        const { page, total, limit } = lastPage;
        return page * limit < total ? page + 1 : undefined;
      },
      enabled: show === "lost" && !!token,
    }
  );

  const isLoading =
    (show === "active" && isLoadingActivePhones) ||
    (show === "lost" && isLoadingLostPhones);

  const useDeclarePhoneLost = () => {
    return useMutation(
      ({ phoneId, token }) => declarePhoneLost(phoneId, token),
      {
        onMutate: () => {
          setDeclareLostLoading(true);
        },
        onSuccess: () => {
          setDeclareLostLoading(false);

          queryClient.invalidateQueries(["phones"]);

          toast.success("Phone restored");
        },
        onError: (error) => {
          setDeclareLostLoading(false);
          toast.error(error.message || "Failed to restore phone");
        },
      }
    );
  };

  const declareLostMutation = useDeclarePhoneLost();

  const calculateDaysFromDate = (dateString) => {
    const givenDate = new Date(dateString);
    const today = new Date();

    const differenceInMilliseconds = today - givenDate;
    const differenceInDays = Math.floor(
      differenceInMilliseconds / (1000 * 60 * 60 * 24)
    );

    return differenceInDays;
  };

  const activePhones = useMemo(() => {
    return activePhonesData?.pages?.flatMap((page) => page.phones) || [];
  }, [activePhonesData?.pages]);

  const lostPhones = useMemo(() => {
    return lostPhonesData?.pages?.flatMap((page) => page.phones) || [];
  }, [lostPhonesData?.pages]);

  const filteredPhones = useMemo(() => {
    const dataToFilter =
      show === "active" ? activePhones : show === "lost" ? lostPhones : [];

    // If no search query, return all data
    if (!searchQuery.trim()) {
      return dataToFilter;
    }

    return dataToFilter.filter((phone) => {
      // If filtering by days only and the query is a number
      if (filterByDaysOnly && !isNaN(searchQuery.trim())) {
        const searchDays = parseInt(searchQuery.trim(), 10);
        const daysSinceAssigned = calculateDaysFromDate(
          phone?.dateAssigned || phone?.createdAt
        );

        // Return true if days since assigned is >= the search days
        return daysSinceAssigned >= searchDays;
      }

      // Otherwise use the regular search logic
      const searchParts = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      return searchParts.every((part) => {
        return [
          phone?.modelName?.toLowerCase(),
          phone?.imei,
          phone?.supplierName?.toLowerCase(),
          phone?.managerName?.toLowerCase(),
          phone?.managerLocation?.toLowerCase(),
        ].some((field) => field?.includes(part));
      });
    });
  }, [activePhones, lostPhones, searchQuery, show, filterByDaysOnly]);

  // Handles search query change
  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  // Handle toggle change for days filter
  const handleToggleFilterByDays = (event) => {
    setFilterByDaysOnly(event.target.checked);
  };

  const paginatedPhones = filteredPhones;

  useEffect(() => {
    if (showAddPhone || showEditPhoneModal || showPhoneCheckout) {
      dispatch(setSidebar(false));
    }
  }, [showAddPhone, showEditPhoneModal, showPhoneCheckout, dispatch]);

  const onEditPhone = (phone) => {
    setEditPhone(phone);
    setShowEditPhoneModal(true);
  };

  const onCheckoutPhone = (phone) => {
    setCheckoutPhone(phone);
    setShowPhoneCheckout(true);
  };

  const declareLostPhone = (phoneId) => {
    declareLostMutation.mutate({ phoneId, token });
  };

  const useDeletePhone = () => {
    const queryClient = useQueryClient();

    return useMutation(({ imei, token }) => deletePhone(imei, token), {
      onSuccess: () => {
        queryClient.invalidateQueries(["phones"]);
        toast.success("Phone deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete phone");
      },
    });
  };

  const deletePhoneMutation = useDeletePhone();

  const handleDeletePhone = (phone) => {
    setDeletePhoneImei(phone);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (deletePhoneImei) {
      deletePhoneMutation.mutate({ imei: deletePhoneImei, token });
    }
    setShowDeleteModal(false);
  };

  // Function to generate and download Excel file
  const handleDownload = () => {
    if (!filteredPhones?.length) return; // Exit if no data is available

    // Add a totals row at the end of the data
    const dataWithTotal = [
      ...filteredPhones.map((phone, index) => {
        const row = {
          "#": index + 1,
          "*": calculateDaysFromDate(phone?.dateAssigned || phone?.createdAt),
          Model: phone?.modelName,
          IMEI: phone?.imei,
          Capacity: phone?.capacity,
          RAM: phone?.ram,
          "Buying Price": phone?.purchasePrice,
          "Selling Price": phone?.sellingPrice,
          "Manager Commission": phone?.managerCommission,
          Supplier: phone?.supplierName,
          Location: phone?.managerLocation,
          Manager: phone?.managerName,
        };
        return row;
      }),
    ];

    // Convert JSON data to a worksheet for Excel
    const worksheet = XLSX.utils.json_to_sheet(dataWithTotal);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Data");

    // Convert workbook to binary and create a downloadable Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Trigger download
    saveAs(data, `Sales_Report_${dayjs().format("YYYY-MM-DD")}.xlsx`);
  };

  useEffect(() => {
    if (
      !["super admin", "admin", "manager", "shop keeper"].includes(user?.role)
    ) {
      navigate("/404");
    }
  }, [user, navigate]);

  return (
    <div className="p-5">
      <div className="space-y-2">
        <p className="text-xl font-bold">Inventory</p>
        <div className="flex flex-row items-center w-[66%]">
          <div
            className={`p-2 py-3 text-sm font-roboto font-bold w-[50%] md:w-36 text-center cursor-pointer ${
              show === "active" ? "bg-primary-400" : "text-gray-600"
            }`}
            onClick={() => setShow("active")}>
            Available
          </div>
          <div
            className={`p-2 py-3 text-sm font-roboto font-bold w-[50%] md:w-36 text-center cursor-pointer ${
              show === "lost" ? "bg-primary-400" : "text-gray-600"
            }`}
            onClick={() => setShow("lost")}>
            Lost
          </div>
        </div>
      </div>
      <div className="border border-gray-200">
        <div className="">
          <div className="p-5 flex flex-col space-y-5">
            <div
              className={`flex flex-col ${
                user.role === "manager" ? "md:flex-row" : "md:flex-row-reverse"
              } justify-between space-y-5 md:space-y-0`}>
              <div className="flex flex-row space-x-5">
                <button
                  className={`p-2 ${
                    isLoading ? "bg-gray-400" : "bg-primary-500 hover:scale-105"
                  } ${
                    user.role === "manager" ? "hidden" : "flex"
                  } flex-row items-center justify-center h-12 w-[280px] md:w-32 transition-all duration-300 ease-in-out`}
                  onClick={() => setShowAddPhone(!showAddPhone)}
                  disabled={isLoading}>
                  Add inventory
                </button>

                {["admin", "super admin"].includes(user.role) && (
                  <div
                    className={`p-2 ${
                      isLoading
                        ? "text-gray-400"
                        : "hover:bg-neutral-200 cursor-pointer text-gray-500"
                    } rounded-full transition-all duration-300 ease-in-out`}
                    onClick={isLoading ? undefined : handleDownload}>
                    <HiOutlineDownload
                      size={25}
                      className={
                        isLoading
                          ? "text-gray-400"
                          : "hover:text-gray-700 transition-all duration-300 ease-in-out"
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-5">
                <div className="flex flex-row justify-between items-center space-x-2 md:space-x-5">
                  {/* Search input */}
                  <TextField
                    id="outlined-search"
                    label={
                      filterByDaysOnly ? "Filter by days ≥" : "Search phone..."
                    }
                    variant="outlined"
                    disabled={isLoading}
                    sx={{
                      minWidth: { xs: "280px", md: "300px" },
                      "& .MuiInputLabel-root": {
                        "&.Mui-focused": {
                          color: "#2FC3D2",
                        },
                      },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#2FC3D2",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#2FC3D2",
                        },
                      },
                    }}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    type={filterByDaysOnly ? "number" : "text"}
                  />

                  {/* Days filter toggle switch */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filterByDaysOnly}
                        onChange={handleToggleFilterByDays}
                        color="primary"
                        size="small"
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#2FC3D2",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: "#2FC3D2",
                            },
                        }}
                      />
                    }
                    label={
                      <span className="text-xs md:text-sm">Filter by days</span>
                    }
                    labelPlacement="end"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <TableSkeleton userRole={user.role} />
            ) : (
              <InfiniteScroll
                dataLength={filteredPhones.length}
                next={() => {
                  if (
                    show === "active" &&
                    hasMoreActivePhones &&
                    !isLoadingMoreActivePhones
                  ) {
                    fetchNextActivePhones();
                  } else if (
                    show === "lost" &&
                    hasMoreLostPhones &&
                    !isLoadingMoreLostPhones
                  ) {
                    fetchNextLostPhones();
                  }
                }}
                hasMore={
                  show === "active" ? hasMoreActivePhones : hasMoreLostPhones
                }
                loader={
                  <div className="flex justify-center py-4">
                    <p>Loading more phones...</p>
                  </div>
                }
                scrollableTarget="scrollableDiv">
                <div
                  className="max-h-[57vh] overflow-y-auto"
                  id="scrollableDiv">
                  <table className="w-full text-sm text-left text-gray-500 sticky top-0 z-10">
                    <thead className="text-xs text-gray-700 uppercase bg-neutral-100 border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="px-2 border-r py-2">
                          #
                        </th>
                        <th scope="col" className="px-2 border-r py-2">
                          *
                        </th>
                        <th
                          scope="col"
                          className="px-2 border-r text-[14px] normal-case py-2">
                          Model
                        </th>
                        <th
                          scope="col"
                          className="px-6 border-r text-[14px] normal-case py-2">
                          IMEI
                        </th>
                        <th
                          scope="col"
                          className="px-6 border-r text-[14px] normal-case py-2">
                          Capacity
                        </th>
                        {user.role !== "manager" && (
                          <th
                            scope="col"
                            className="px-6 border-r text-[14px] normal-case py-2">
                            Supplier
                          </th>
                        )}
                        {user.role !== "manager" && (
                          <th
                            scope="col"
                            className="px-6 border-r text-[14px] normal-case py-2">
                            Buying Price
                          </th>
                        )}

                        <th
                          scope="col"
                          className="px-6 border-r text-[14px] normal-case py-2">
                          Selling Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 border-r text-[14px] normal-case py-2">
                          Manager Commission
                        </th>
                        {user.role !== "manager" && (
                          <th
                            scope="col"
                            className="px-6 border-r text-[14px] normal-case py-2">
                            Location
                          </th>
                        )}
                        {user.role !== "manager" && (
                          <th
                            scope="col"
                            className="px-6 border-r text-[14px] normal-case py-2">
                            Manager
                          </th>
                        )}
                        <th
                          scope="col"
                          className={`px-6 text-[14px] normal-case py-2 ${
                            user.role === "shop keeper" && "hidden"
                          }`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    {paginatedPhones.length === 0 ||
                    paginatedPhones.filter((phone) =>
                      show === "active"
                        ? phone.status === "active"
                        : phone.status !== "active"
                    ).length === 0 ? (
                      <tbody>
                        <tr>
                          <td colSpan="12" className="px-4 py-4 text-center">
                            <p className="text-gray-500">
                              {filterByDaysOnly && searchQuery
                                ? `No phones found that are ${searchQuery} days or older.`
                                : `No ${
                                    show === "active" ? "active" : "lost"
                                  } phones found.`}
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody>
                        {paginatedPhones
                          ?.filter((phone) =>
                            show === "active"
                              ? phone?.status === "active"
                              : phone?.status !== "active"
                          )
                          .map((phone, index) => (
                            <tr
                              key={phone?.id}
                              className={`bg-white border-b hover:bg-blue-50 border-l-4 ${
                                calculateDaysFromDate(
                                  phone?.dateAssigned || phone.createdAt
                                ) < 5 && phone?.status !== "lost"
                                  ? "border-l-green-500"
                                  : calculateDaysFromDate(
                                      phone?.dateAssigned || phone?.createdAt
                                    ) >= 5 &&
                                    calculateDaysFromDate(
                                      phone?.dateAssigned || phone?.createdAt
                                    ) < 7
                                  ? "border-l-amber-500"
                                  : "border-l-red-500"
                              }`}>
                              <td className="px-2 py-2 border-r font-medium text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-2 border-r py-2 capitalize">
                                {calculateDaysFromDate(
                                  phone?.dateAssigned || phone?.createdAt
                                )}
                              </td>
                              <td className="px-2 border-r py-2 capitalize">
                                {phone?.modelName}
                              </td>
                              <td className="px-6 border-r py-2 capitalize">
                                {phone?.imei}
                              </td>
                              <td className="px-6 border-r py-2 capitalize">
                                {phone?.capacity}GB
                              </td>
                              {user.role !== "manager" && (
                                <td className="px-6 border-r py-2">
                                  {phone?.supplierName}
                                </td>
                              )}
                              {user.role !== "manager" && (
                                <td className="px-6 border-r py-2">
                                  Ksh {phone?.purchasePrice}
                                </td>
                              )}

                              <td className="px-6 border-r py-2">
                                Ksh {phone?.sellingPrice}
                              </td>
                              <td className="px-6 border-r py-2">
                                {phone?.managerCommission}
                              </td>
                              {user.role !== "manager" && (
                                <td className="px-6 border-r py-2 capitalize">
                                  {phone?.managerLocation}
                                </td>
                              )}
                              {user.role !== "manager" && (
                                <td className="px-6 border-r py-2 capitalize">
                                  {phone?.managerName}
                                </td>
                              )}
                              <td
                                className={`px-6 py-2 flex flex-col md:flex-row items-center md:space-x-5 space-y-2 md:space-y-0 ${
                                  user.role === "shop keeper" && "hidden"
                                }`}>
                                {phone?.status === "lost" ? (
                                  <button
                                    onClick={() => declareLostPhone(phone?.id)}
                                    aria-label={`Analyze ${phone?.name}`}
                                    className={` ${
                                      user.role === "manager"
                                        ? "hidden"
                                        : "flex"
                                    } flex-row justify-center w-32 items-center gap-2 p-1 rounded-xl border text-black border-green-500 hover:bg-green-300`}>
                                    <MdSettingsBackupRestore />
                                    Activate
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => onCheckoutPhone(phone)}
                                      aria-label={`Sale ${phone?.name}`}
                                      className="flex flex-row justify-center items-center w-20 gap-2 p-1 rounded-xl border text-black border-green-500 hover:bg-green-300">
                                      <BiCartAdd />
                                      Sale
                                    </button>
                                    <button
                                      onClick={() => onEditPhone(phone)}
                                      aria-label={`Edit ${phone?.name}`}
                                      className={` ${
                                        user.role === "manager"
                                          ? "hidden"
                                          : "flex"
                                      } flex-row justify-center w-20 items-center gap-2 p-1 rounded-xl border text-black border-amber-500 hover:bg-amber-300`}>
                                      <BiEdit />
                                      Edit
                                    </button>
                                    {user.role === "super admin" && (
                                      <button
                                        onClick={() =>
                                          handleDeletePhone(phone?.imei)
                                        }
                                        aria-label={`Delete ${phone?.name}`}
                                        className="flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-xl border text-black border-rose-500 hover:bg-rose-300">
                                        <MdDeleteOutline />
                                        Delete
                                      </button>
                                    )}
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    )}
                  </table>
                </div>
              </InfiniteScroll>
            )}
          </div>
        </div>
      </div>
      <NewPhone showAddPhone={showAddPhone} setShowAddPhone={setShowAddPhone} />
      <EditPhone
        showEditPhoneModal={showEditPhoneModal}
        setShowEditPhoneModal={setShowEditPhoneModal}
        phone={editPhone}
        setEditPhone={setEditPhone}
      />
      <PhoneCheckout
        phone={checkoutPhone}
        setPhone={setCheckoutPhone}
        showPhoneCheckout={showPhoneCheckout}
        setShowPhoneCheckout={setShowPhoneCheckout}
      />
      <DeleteConfirmationModal
        showDeleteModal={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        admin={deletePhone}
        title={`Confirm Deletion!`}
        message="Deleted phone cannot be retrieved"
      />
    </div>
  );
};

export default AdminInventory;
