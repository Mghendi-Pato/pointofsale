import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "react-query";

import dayjs from "dayjs";
import {
  deletePool,
  fetchAllPools,
  fetchSoldPhones,
} from "../services/services";
import DateRangePicker from "../components/DatePicker";
import NewPool from "../components/NewPool";
import { setSidebar } from "../redux/reducers/ sidebar";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import DeleteConfirmationModal from "../components/DeleteModal";
import { toast } from "react-toastify";
import EditPool from "../components/EditPoolModal";
import { useNavigate } from "react-router-dom";

// Skeleton components
const SkeletonPulse = () => (
  <div className="animate-pulse bg-gray-200 rounded-md h-full w-full" />
);

// Skeleton for a pool card header
const PoolHeaderSkeleton = () => (
  <div className="px-4 py-2 bg-gray-100 border-b flex justify-between items-center">
    <div>
      <div className="h-6 w-40 mb-2">
        <SkeletonPulse />
      </div>
      <div className="h-4 w-48">
        <SkeletonPulse />
      </div>
    </div>
    <div className="flex flex-row space-x-2">
      <div className="h-8 w-8 rounded-full">
        <SkeletonPulse />
      </div>
      <div className="h-8 w-8 rounded-full">
        <SkeletonPulse />
      </div>
    </div>
  </div>
);

// Skeleton for a single table row
const TableRowSkeleton = ({ highlight = false }) => (
  <tr className={highlight ? "bg-primary-100" : ""}>
    <td className="px-6 py-2 whitespace-nowrap">
      <div className="h-5 w-36">
        <SkeletonPulse />
      </div>
    </td>
    <td className="px-6 py-2 whitespace-nowrap">
      <div className="h-5 w-12">
        <SkeletonPulse />
      </div>
    </td>
    <td className="px-6 py-2 whitespace-nowrap">
      <div className="h-5 w-24">
        <SkeletonPulse />
      </div>
    </td>
    <td className="px-6 py-2 whitespace-nowrap">
      <div className="h-5 w-24">
        <SkeletonPulse />
      </div>
    </td>
    <td className="px-6 py-2 whitespace-nowrap">
      <div className="h-5 w-24">
        <SkeletonPulse />
      </div>
    </td>
  </tr>
);

// Skeleton for an entire pool card
const PoolCardSkeleton = () => (
  <div className="bg-white border shadow-sm overflow-hidden">
    <PoolHeaderSkeleton />
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th
              scope="col"
              className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sales Count
            </th>
            <th
              scope="col"
              className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Commission (KES)
            </th>
            <th
              scope="col"
              className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pool Commission (KES)
            </th>
            <th
              scope="col"
              className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total (KES)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Super Manager Row */}
          <TableRowSkeleton highlight={true} />
          {/* Pool Members Rows */}
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
          {/* Totals Row */}
          <tr className="bg-gray-50">
            <td className="px-6 py-2 whitespace-nowrap">
              <div className="h-5 w-16 font-bold">
                <SkeletonPulse />
              </div>
            </td>
            <td className="px-6 py-2 whitespace-nowrap">
              <div className="h-5 w-12 font-bold">
                <SkeletonPulse />
              </div>
            </td>
            <td className="px-6 py-2 whitespace-nowrap">
              <div className="h-5 w-24 font-bold">
                <SkeletonPulse />
              </div>
            </td>
            <td className="px-6 py-2 whitespace-nowrap">
              <div className="h-5 w-24 font-bold">
                <SkeletonPulse />
              </div>
            </td>
            <td className="px-6 py-2 whitespace-nowrap">
              <div className="h-5 w-24 font-bold">
                <SkeletonPulse />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// Skeleton for multiple pool cards
const PoolsSkeletonLoader = ({ count = 2 }) => (
  <div className="grid grid-cols-1 gap-3">
    {Array(count)
      .fill(0)
      .map((_, index) => (
        <PoolCardSkeleton key={index} />
      ))}
  </div>
);

const Payments = () => {
  const token = useSelector((state) => state.userSlice.user.token);
  const user = useSelector((state) => state.userSlice.user.user);

  const [company, setcompany] = useState("shuhari");
  const queryClient = useQueryClient();
  const today = dayjs().endOf("day");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [showAddPool, setShowAddPool] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [poolToDelete, setPoolToDelete] = useState(null);
  const [editPool, setEditpool] = useState(null);
  const dispatch = useDispatch();
  const [showEditPoolModal, setShowEditPoolModal] = useState();

  const navigate = useNavigate();

  // Helper function to determine user role and access
  const getUserRole = () => {
    if (!user) return { role: "unknown", canManagePools: false };

    // Assuming you have role information in user object
    // Adjust these conditions based on your actual user structure
    if (user.designation === "cfo" || user.role === "admin") {
      return { role: "admin", canManagePools: true };
    } else if (user.role === "super_manager" || user.isSuperManager) {
      return { role: "super_manager", canManagePools: false };
    } else if (user.role === "manager" || user.designation === "manager") {
      return { role: "manager", canManagePools: false };
    }

    return { role: "unknown", canManagePools: false };
  };

  const userRole = getUserRole();

  const isQueryEnabled =
    company !== undefined &&
    startDate !== undefined &&
    endDate !== undefined &&
    !!token;

  const {
    data: salesData,
    isLoading: salesLoading,
    isError: salesError,
    refetch,
  } = useQuery(
    ["phones", { company, startDate, endDate }],
    () =>
      fetchSoldPhones({
        company,
        startDate,
        endDate,
        token,
      }),
    {
      enabled: isQueryEnabled,
      onSuccess: (data) => {
        queryClient.setQueryData(
          ["phones", { company, startDate, endDate }],
          data
        );
      },
      onError: (error) => {
        console.error(`Error fetching sales:`, error.message);
      },
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: poolsData,
    isLoading: poolsLoading,
    isError: poolsError,
  } = useQuery(
    ["pools", { limit: 1000 }],
    ({ queryKey, signal }) => fetchAllPools({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  const isLoading = poolsLoading || salesLoading;

  console.log(user);

  // Filter pools based on user role
  const getFilteredPools = () => {
    if (!poolsData?.pools) return [];

    switch (userRole.role) {
      case "super admin":
        // Admin/CFO can see all pools
        return poolsData.pools;

      case "super_manager":
        // Super manager can only see pools where they are the super manager
        return poolsData.pools.filter(
          (pool) => pool.superManager?.id === user.id
        );

      case "manager":
        // Regular manager can only see pools where they are a member
        return poolsData.pools.filter(
          (pool) =>
            pool.poolMembers?.some((member) => member.id === user.id) ||
            pool.superManager?.id === user.id
        );

      default:
        return [];
    }
  };

  // Filter individual manager data for regular managers
  const getManagerSpecificData = (pool) => {
    if (userRole.role !== "manager") return null;

    // Check if user is the super manager
    if (pool.superManager?.id === user.id) {
      return {
        type: "super_manager",
        data: pool.superManager,
        poolCommission: 0, // Super manager doesn't get pool commission deducted
      };
    }

    // Check if user is a pool member
    const memberData = pool.poolMembers?.find(
      (member) => member.id === user.id
    );
    if (memberData) {
      return {
        type: "member",
        data: memberData,
        poolCommission: pool.poolCommission || 0,
      };
    }

    return null;
  };

  useEffect(() => {
    if (isQueryEnabled) {
      refetch();
    }
  }, [company, startDate, endDate, refetch, isQueryEnabled]);

  const handleDateChange = (startDate, endDate) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  useEffect(() => {
    const allowed =
      user?.designation?.toLowerCase().trim() === "cfo" ||
      ["super admin", "manager"].includes(user?.role?.toLowerCase().trim());

    if (!allowed) {
      navigate("/404");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (showAddPool || showEditPoolModal) {
      dispatch(setSidebar(false));
    }
  }, [showAddPool, showEditPoolModal, dispatch]);

  // Function to calculate manager's sales and commissions
  const calculateManagerData = (managerId, managerCommission = 0) => {
    if (!salesData) return { salesCount: 0, totalCommission: 0 };

    const managerSales = salesData.filter(
      (sale) => sale.managerId === managerId
    );
    const salesCount = managerSales.length;

    // Use the manager's commission rate from pool data
    const totalCommission = salesCount * managerCommission;

    return { salesCount, totalCommission };
  };

  // Function to calculate pool totals
  const calculatePoolTotals = (poolMembers, superManager, poolCommission) => {
    if (!poolMembers || !superManager)
      return {
        totalSales: 0,
        totalCommission: 0,
        totalPoolCommission: 0,
        grandTotal: 0,
      };

    let totalSales = 0;
    let totalCommission = 0;
    let totalPoolCommission = 0;

    // Calculate super manager's data
    const superManagerData = calculateManagerData(
      superManager?.id,
      superManager?.commission || 0
    );
    totalSales += superManagerData.salesCount;
    totalCommission += superManagerData.totalCommission;

    // Calculate pool members' data
    if (Array.isArray(poolMembers)) {
      poolMembers.forEach((member) => {
        if (!member) return;

        const { salesCount, totalCommission: memberCommission } =
          calculateManagerData(member.id, member.commission || 0);
        totalSales += salesCount;
        totalCommission += memberCommission;

        // Pool commission (super manager's cut from each member's sales)
        totalPoolCommission += salesCount * (poolCommission || 0);
      });
    }

    const grandTotal = totalCommission + totalPoolCommission;

    return { totalSales, totalCommission, totalPoolCommission, grandTotal };
  };

  // Pool delete mutation hook
  const useDeletePool = () => {
    const queryClient = useQueryClient();

    return useMutation(({ poolId, token }) => deletePool(poolId, token), {
      onSuccess: () => {
        queryClient.invalidateQueries(["pools"]);
        toast.success("Pool deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete pool");
      },
    });
  };

  const deletePoolMutation = useDeletePool();

  const handleDeletePool = (pool) => {
    console.log(pool);
    setPoolToDelete(pool);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (poolToDelete) {
      deletePoolMutation.mutate({ poolId: poolToDelete, token });
    }
    setShowDeleteModal(false);
  };

  const onEditPool = (pool) => {
    setEditpool(pool);
    setShowEditPoolModal(true);
  };

  const filteredPools = getFilteredPools();

  // Render individual manager view
  const renderManagerView = (pool) => {
    const managerData = getManagerSpecificData(pool);
    if (!managerData) return null;

    const { salesCount, totalCommission } = calculateManagerData(
      managerData.data.id,
      managerData.data.commission || 0
    );

    const poolCommissionAmount =
      managerData.type === "member"
        ? salesCount * managerData.poolCommission
        : 0;

    const finalAmount =
      managerData.type === "super_manager"
        ? totalCommission +
          (pool.poolMembers?.reduce((acc, member) => {
            const memberSales = calculateManagerData(
              member.id,
              member.commission || 0
            );
            return acc + memberSales.salesCount * (pool.poolCommission || 0);
          }, 0) || 0)
        : totalCommission;

    return (
      <div key={pool.id} className="bg-white border shadow-sm overflow-hidden">
        <div className="px-4 py-2 bg-gray-100 border-b">
          <h3 className="text-lg font-bold">
            Your Payment Details - {pool?.name || "Unnamed Pool"}
          </h3>
          <p className="text-sm text-gray-600">
            {managerData.type === "super_manager"
              ? "Super Manager"
              : "Pool Member"}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Count
                </th>
                <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission (KES)
                </th>
                <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {managerData.type === "super_manager"
                    ? "Pool Earnings (KES)"
                    : "Pool Commission (KES)"}
                </th>
                <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total (KES)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="bg-primary-100">
                <td className="px-6 py-2 whitespace-nowrap font-medium capitalize">
                  {managerData.data.firstName} {managerData.data.lastName}
                  <span className="text-xs font-normal text-gray-500 block">
                    (
                    {managerData.type === "super_manager"
                      ? "Super Manager"
                      : "Pool Member"}
                    )
                  </span>
                </td>
                <td className="px-6 py-2 whitespace-nowrap">{salesCount}</td>
                <td className="px-6 py-2 whitespace-nowrap">
                  {totalCommission.toLocaleString()}
                </td>
                <td className="px-6 py-2 whitespace-nowrap">
                  {managerData.type === "super_manager"
                    ? (finalAmount - totalCommission).toLocaleString()
                    : poolCommissionAmount.toLocaleString()}
                </td>
                <td className="px-6 py-2 whitespace-nowrap font-bold text-green-600">
                  {finalAmount.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-5 flex flex-col h-full">
      <div className="flex-none">
        <div className="flex flex-row justify-between">
          <div className="space-y-2">
            <p className="text-xl font-bold">
              {userRole.role === "manager" ? "My Payments" : "Payments"}
            </p>
          </div>
          {userRole.canManagePools && (
            <div
              onClick={
                isLoading ? undefined : () => setShowAddPool(!showAddPool)
              }
              className={`p-2 py-3 text-sm font-roboto font-bold w-full md:w-36 text-center cursor-pointer ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-primary-400"
              }`}>
              New Pool
            </div>
          )}
        </div>

        <div className="border">
          <div className="flex flex-col md:flex-row items-center justify-between py-2">
            <DateRangePicker
              onDateChange={handleDateChange}
              setToDate={setStartDate}
              setFromDate={setEndDate}
              toDate={endDate}
              fromDate={startDate}
              disabled={isLoading}
            />
            <div className="flex flex-col md:pt-5">
              <div className="flex flex-row justify-between items-center">
                <FormControl sx={{ px: { md: 5 } }}>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    value={company}
                    onChange={(e) => setcompany(e.target.value)}
                    disabled={isLoading}>
                    <FormControlLabel
                      value="shuhari"
                      control={<Radio disabled={isLoading} />}
                      label="Shuhari"
                    />
                    <FormControlLabel
                      value="muchami"
                      control={<Radio disabled={isLoading} />}
                      label="Muchami"
                    />
                    <FormControlLabel
                      value="combined"
                      control={<Radio disabled={isLoading} />}
                      label="Combined"
                    />
                  </RadioGroup>
                </FormControl>
              </div>
            </div>
          </div>
          <div className="flex flex-col border py-2">
            {/* Scrollable Container for Tables */}
            <div
              className="flex-grow overflow-y-auto mt-6"
              style={{ maxHeight: "calc(100vh - 350px)" }}>
              {isLoading ? (
                <PoolsSkeletonLoader count={2} />
              ) : poolsError || salesError ? (
                <div className="text-red-500 text-center py-5">
                  Error loading data. Please try again later.
                </div>
              ) : !filteredPools || filteredPools.length === 0 ? (
                <div className="text-center py-5">
                  {userRole.role === "manager"
                    ? "You are not assigned to any pools."
                    : "No pools found."}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredPools.map((pool) => {
                    // Show individual manager view for regular managers
                    if (userRole.role === "manager") {
                      return renderManagerView(pool);
                    }

                    // Show full pool view for admin and super managers
                    const {
                      totalSales,
                      totalCommission,
                      totalPoolCommission,
                      grandTotal,
                    } = calculatePoolTotals(
                      pool?.poolMembers,
                      pool?.superManager,
                      pool?.poolCommission
                    );

                    return (
                      <div
                        key={pool.id}
                        className="bg-white border shadow-sm overflow-hidden">
                        <div className="px-4 py-2 bg-gray-100 border-b flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-bold">
                              {pool?.name || "Unnamed Pool"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Pool Commission Rate: KES{" "}
                              {pool?.poolCommission || 0} per sale
                            </p>
                          </div>
                          {userRole.canManagePools && (
                            <div className="flex flex-row space-x-2">
                              <div
                                className="p-2 py-2 text-sm font-roboto font-bold rounded-full hover:bg-neutral-200 text-center cursor-pointer flex flex-row justify-center"
                                onClick={() => onEditPool(pool)}>
                                <AiOutlineEdit
                                  size={20}
                                  className="text-green-400"
                                />
                              </div>
                              <div
                                className="p-2 py-2 text-sm font-roboto font-bold rounded-full hover:bg-neutral-200 text-center cursor-pointer flex flex-row justify-center"
                                onClick={() => handleDeletePool(pool.id)}>
                                <MdOutlineDelete
                                  size={20}
                                  className="text-rose-400"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th
                                  scope="col"
                                  className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Sales Count
                                </th>
                                <th
                                  scope="col"
                                  className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Commission (KES)
                                </th>
                                <th
                                  scope="col"
                                  className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Pool Commission (KES)
                                </th>
                                <th
                                  scope="col"
                                  className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total (KES)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {/* Super Manager Row */}
                              {pool?.superManager && (
                                <tr className="bg-primary-100">
                                  <td className="px-6 py-2 whitespace-nowrap font-medium capitalize">
                                    {pool.superManager.firstName}{" "}
                                    {pool.superManager.lastName}{" "}
                                    <span className="text-xs font-normal text-gray-500">
                                      (Super Manager)
                                    </span>
                                  </td>
                                  <td className="px-6 py-2 whitespace-nowrap">
                                    {
                                      calculateManagerData(
                                        pool.superManager.id,
                                        pool.superManager.commission || 0
                                      ).salesCount
                                    }
                                  </td>
                                  <td className="px-6 py-2 whitespace-nowrap">
                                    {calculateManagerData(
                                      pool.superManager.id,
                                      pool.superManager.commission || 0
                                    ).totalCommission.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-2 whitespace-nowrap">
                                    N/A
                                  </td>
                                  <td className="px-6 py-2 whitespace-nowrap font-medium">
                                    {(
                                      calculateManagerData(
                                        pool.superManager.id,
                                        pool.superManager.commission || 0
                                      ).totalCommission + totalPoolCommission
                                    ).toLocaleString()}
                                  </td>
                                </tr>
                              )}

                              {/* Pool Members Rows */}
                              {Array.isArray(pool?.poolMembers) &&
                                pool.poolMembers.map((member) => {
                                  if (!member) return null;

                                  const { salesCount, totalCommission } =
                                    calculateManagerData(
                                      member.id,
                                      member.commission || 0
                                    );
                                  const poolCommissionAmount =
                                    salesCount * (pool?.poolCommission || 0);

                                  return (
                                    <tr key={member.id}>
                                      <td className="px-6 py-2 whitespace-nowrap capitalize">
                                        {member.firstName} {member.lastName}
                                      </td>
                                      <td className="px-6 py-2 whitespace-nowrap">
                                        {salesCount}
                                      </td>
                                      <td className="px-6 py-2 whitespace-nowrap">
                                        {totalCommission.toLocaleString()}
                                      </td>
                                      <td className="px-6 py-2 whitespace-nowrap">
                                        {poolCommissionAmount.toLocaleString()}
                                      </td>
                                      <td className="px-6 py-2 whitespace-nowrap font-medium">
                                        {totalCommission.toLocaleString()}
                                      </td>
                                    </tr>
                                  );
                                })}

                              {/* Totals Row */}
                              <tr className="bg-gray-50">
                                <td className="px-6 py-2 whitespace-nowrap font-bold">
                                  Totals
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap font-bold">
                                  {totalSales}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap font-bold">
                                  {totalCommission.toLocaleString()}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap font-bold">
                                  {totalPoolCommission.toLocaleString()}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap font-bold">
                                  {grandTotal.toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Only show modals for users who can manage pools */}
      {userRole.canManagePools && (
        <>
          <DeleteConfirmationModal
            showDeleteModal={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onDelete={handleDelete}
            title={`Confirm Deletion!`}
            message="Deleted pool cannot be retrieved"
          />
          <EditPool
            setEditPool={setEditpool}
            pool={editPool}
            showEditPoolModal={showEditPoolModal}
            setShowEditPoolModal={setShowEditPoolModal}
          />
          <NewPool showAddPool={showAddPool} setShowAddPool={setShowAddPool} />
        </>
      )}
    </div>
  );
};

export default Payments;
