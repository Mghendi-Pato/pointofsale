import { TextField, Switch, FormControlLabel } from "@mui/material";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQueryClient } from "react-query";
import { declarePhoneLost, deletePhone } from "../../services/services";
import { usePhoneData } from "../../hooks/usePhoneData";
import EditPhone from "../../components/EditPhone";
import PhoneCheckout from "../../components/PhoneCheckout";
import { toast } from "react-toastify";
import { HiOutlineDownload } from "react-icons/hi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { setSidebar } from "../../redux/reducers/ sidebar";
import OptimizedPhoneTable from "../../components/OptimizedPhoneTable";
import DeleteConfirmationModal from "../../components/DeleteModal";
import NewPhone from "../../components/NewPhone";

const AdminInventory = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.userSlice.user.token);
  const user = useSelector((state) => state.userSlice.user.user);

  const queryClient = useQueryClient();

  // UI State
  const [show, setShow] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterByDaysOnly, setFilterByDaysOnly] = useState(false);

  // Modal states
  const [showAddPhone, setShowAddPhone] = useState(false);
  const [editPhone, setEditPhone] = useState([]);
  const [showEditPhoneModal, setShowEditPhoneModal] = useState(false);
  const [showPhoneCheckout, setShowPhoneCheckout] = useState(false);
  const [checkoutPhone, setCheckoutPhone] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePhoneImei, setDeletePhoneImei] = useState(null);

  // Refs for focus management
  const searchInputRef = useRef(null);
  const [lastFocusTime, setLastFocusTime] = useState(Date.now());

  const navigate = useNavigate();

  // ✅ Use the optimized custom hook for phone data
  const activePhoneData = usePhoneData(
    "active",
    token,
    debouncedSearchQuery,
    filterByDaysOnly
  );
  const lostPhoneData = usePhoneData(
    "lost",
    token,
    debouncedSearchQuery,
    filterByDaysOnly
  );

  // Current data based on selected tab
  const currentData = show === "active" ? activePhoneData : lostPhoneData;

  // ✅ Debounced search with focus restoration
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);

      if (searchInputRef.current && Date.now() - lastFocusTime < 1000) {
        const currentValue = searchInputRef.current.value;
        if (currentValue === searchQuery) {
          searchInputRef.current.focus();
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, lastFocusTime]);

  // ✅ Optimized mutation for declaring phones lost
  const useDeclarePhoneLost = () => {
    return useMutation(
      ({ phoneId, token }) => declarePhoneLost(phoneId, token),
      {
        onSuccess: () => {
          // Just invalidate all phone queries
          queryClient.invalidateQueries(["phones"]);
          toast.success("Phone status updated successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update phone status");
        },
      }
    );
  };

  const declareLostMutation = useDeclarePhoneLost();

  // ✅ Optimized delete phone mutation
  const useDeletePhone = () => {
    return useMutation(({ imei, token }) => deletePhone(imei, token), {
      onSuccess: () => {
        // Just invalidate all phone queries
        queryClient.invalidateQueries(["phones"]);
        toast.success("Phone deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete phone");
      },
    });
  };

  const deletePhoneMutation = useDeletePhone();

  // ✅ Event handlers
  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearchQuery(value);
    setLastFocusTime(Date.now());
  }, []);

  const handleToggleFilterByDays = useCallback((event) => {
    setFilterByDaysOnly(event.target.checked);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setLastFocusTime(Date.now());
  }, []);

  const handleEditPhone = useCallback((phone) => {
    setEditPhone(phone);
    setShowEditPhoneModal(true);
  }, []);

  const handleCheckoutPhone = useCallback((phone) => {
    setCheckoutPhone(phone);
    setShowPhoneCheckout(true);
  }, []);

  const handleDeletePhoneAction = useCallback((imei) => {
    setDeletePhoneImei(imei);
    setShowDeleteModal(true);
  }, []);

  const handleDeclareLostPhone = useCallback(
    (phoneId) => {
      declareLostMutation.mutate({ phoneId, token });
    },
    [declareLostMutation, token]
  );

  const handleDelete = useCallback(() => {
    if (deletePhoneImei) {
      deletePhoneMutation.mutate({ imei: deletePhoneImei, token });
    }
    setShowDeleteModal(false);
  }, [deletePhoneImei, deletePhoneMutation, token]);

  // ✅ Optimized download function
  const handleDownload = useCallback(() => {
    if (!currentData.phones?.length) return;

    const dataWithTotal = currentData.phones.map((phone, index) => ({
      "#": index + 1,
      "*": phone?.daysSinceAssigned || 0,
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
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataWithTotal);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      data,
      `Inventory_Report_${show}_${dayjs().format("YYYY-MM-DD")}.xlsx`
    );
  }, [currentData.phones, show]);

  // ✅ Tab switching with data management
  const handleTabChange = useCallback((newShow) => {
    setShow(newShow);
    setSearchQuery(""); // Reset search when switching tabs
    setDebouncedSearchQuery("");
  }, []);

  // ✅ Sidebar management
  useEffect(() => {
    if (showEditPhoneModal || showPhoneCheckout || showAddPhone) {
      dispatch(setSidebar(false));
    }
  }, [showEditPhoneModal, showPhoneCheckout, showAddPhone, dispatch]);

  // ✅ Route protection
  useEffect(() => {
    if (
      !["super admin", "admin", "manager", "shop keeper"].includes(user?.role)
    ) {
      navigate("/404");
    }
  }, [user, navigate]);

  // ✅ Performance metrics display (development only)
  const showPerformanceMetrics = true;

  return (
    <div className="p-5">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-xl font-bold">Inventory</p>
          {showPerformanceMetrics && (
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Active: {activePhoneData.filteredCount}/
              {activePhoneData.totalCount} | Lost: {lostPhoneData.filteredCount}
              /{lostPhoneData.totalCount} | Compression:{" "}
              {currentData.performanceMetrics.compressionRatio.toFixed(1)}%
            </div>
          )}
        </div>

        <div className="flex flex-row items-center w-[66%]">
          <div
            className={`p-2 py-3 text-sm font-roboto font-bold w-[50%] md:w-36 text-center cursor-pointer transition-colors duration-200 ${
              show === "active"
                ? "bg-primary-400"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => handleTabChange("active")}>
            Available
          </div>
          <div
            className={`p-2 py-3 text-sm font-roboto font-bold w-[50%] md:w-36 text-center cursor-pointer transition-colors duration-200 ${
              show === "lost"
                ? "bg-primary-400"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => handleTabChange("lost")}>
            Lost
          </div>
        </div>
      </div>

      <div className="border border-gray-200">
        <div className="p-5 flex flex-col space-y-5">
          <div className="flex flex-col md:flex-row-reverse justify-between items-start md:items-center space-y-5 md:space-y-0">
            <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-5">
              <div className="flex flex-col md:flex-row justify-between md:items-center space-x-2 md:space-x-5 space-y-5 md:space-y-0">
                <button
                  className={`p-2 ${
                    currentData.isLoading
                      ? "bg-gray-400"
                      : "bg-primary-500 hover:scale-105"
                  } ${
                    user.role === "manager" ? "hidden" : "flex"
                  } flex-row items-center justify-center h-12 w-[280px] md:w-32 transition-all duration-300 ease-in-out`}
                  onClick={() => setShowAddPhone(!showAddPhone)}
                  disabled={currentData.isLoading}>
                  Add inventory
                </button>
                {["admin", "super admin"].includes(user.role) && (
                  <div
                    className={`p-2 ${
                      currentData.isLoading
                        ? "text-gray-400"
                        : "hover:bg-neutral-200 cursor-pointer text-gray-500"
                    } rounded-full transition-all duration-300 ease-in-out`}
                    onClick={
                      currentData.isLoading ? undefined : handleDownload
                    }>
                    <HiOutlineDownload
                      size={25}
                      className={
                        currentData.isLoading
                          ? "text-gray-400"
                          : "hover:text-gray-700 transition-all duration-300 ease-in-out"
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Search and Filter */}
            <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-5">
              <div className="flex flex-col md:flex-row justify-between md:items-center space-x-2 md:space-x-5 space-y-5 md:space-y-0">
                <TextField
                  ref={searchInputRef}
                  id="outlined-search"
                  label={
                    filterByDaysOnly ? "Filter by days ≥" : "Search phone..."
                  }
                  variant="outlined"
                  disabled={currentData.isLoading}
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
                  onFocus={handleSearchFocus}
                  type={filterByDaysOnly ? "number" : "text"}
                />

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
          <OptimizedPhoneTable
            phones={currentData.phones}
            isLoading={currentData.isLoading}
            userRole={user.role}
            show={show}
            searchQuery={debouncedSearchQuery}
            filterByDaysOnly={filterByDaysOnly}
            hasMorePhones={currentData.hasMorePhones}
            isLoadingMore={currentData.isLoadingMore}
            onFetchMore={currentData.fetchMorePhones}
            onEdit={handleEditPhone}
            onCheckout={handleCheckoutPhone}
            onDelete={handleDeletePhoneAction}
            onDeclareLost={handleDeclareLostPhone}
            useVirtualization={currentData.phones.length > 5000}
            usePagination={currentData.phones.length > 100}
          />
        </div>
      </div>

      {/* Modals */}
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
