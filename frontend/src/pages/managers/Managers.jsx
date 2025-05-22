import { TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdDeleteOutline } from "react-icons/md";
import { setSidebar } from "../../redux/reducers/ sidebar";
import { toast } from "react-toastify";
import NewManager from "../../components/NewManager";
import { BiEdit } from "react-icons/bi";
import { useInfiniteQuery } from "react-query";
import {
  deleteQueryUser,
  fetchActiveManagers,
  fetchSuspendedManagers,
} from "../../services/services";
import { useMutation, useQueryClient } from "react-query";
import DeleteConfirmationModal from "../../components/DeleteModal";
import EditUserModal from "../../components/EditUserModal";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";

// Skeleton components
const SkeletonPulse = () => (
  <div className="animate-pulse bg-gray-200 rounded-md h-full w-full" />
);

const TableSkeletonRow = () => (
  <tr className="bg-white border-b">
    <td className="px-2 py-3 border-r">
      <div className="h-4 w-4">
        <SkeletonPulse />
      </div>
    </td>
    <td className="px-2 py-3 border-r">
      <div className="h-4 w-32">
        <SkeletonPulse />
      </div>
    </td>
    <td className="px-6 py-3 border-r">
      <div className="h-4 w-48">
        <SkeletonPulse />
      </div>
    </td>
    <td className="px-6 py-3 border-r">
      <div className="h-4 w-24">
        <SkeletonPulse />
      </div>
    </td>
    <td className="px-6 py-3 border-r">
      <div className="h-4 w-24">
        <SkeletonPulse />
      </div>
    </td>
    <td className="px-6 py-3 border-r">
      <div className="h-4 w-32">
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
    <td className="px-6 py-3 flex flex-row space-x-2">
      <div className="h-8 w-20 rounded-xl">
        <SkeletonPulse />
      </div>
      <div className="h-8 w-20 rounded-xl">
        <SkeletonPulse />
      </div>
    </td>
  </tr>
);

const TableSkeleton = () => (
  <div className="max-h-[57vh] overflow-y-auto" id="scrollableDiv">
    <table className="w-full text-sm text-left text-gray-500 relative">
      <thead className="text-xs text-gray-700 uppercase bg-neutral-100 border-b border-gray-200">
        <tr>
          <th scope="col" className="px-2 border-r py-2">
            #
          </th>
          <th
            scope="col"
            className="px-2 border-r text-[14px] normal-case py-2">
            Name
          </th>
          <th
            scope="col"
            className="px-6 border-r text-[14px] normal-case py-2">
            Email
          </th>
          <th
            scope="col"
            className="px-6 border-r text-[14px] normal-case py-2">
            ID
          </th>
          <th
            scope="col"
            className="px-6 border-r text-[14px] normal-case py-2">
            Phone
          </th>
          <th
            scope="col"
            className="px-6 border-r text-[14px] normal-case py-2">
            Location
          </th>
          <th
            scope="col"
            className="px-6 border-r text-[14px] normal-case py-2">
            Last login
          </th>
          <th
            scope="col"
            className="px-6 border-r text-[14px] normal-case py-2">
            Status
          </th>
          <th scope="col" className="px-6 text-[14px] normal-case py-2">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <TableSkeletonRow key={index} />
          ))}
      </tbody>
    </table>
  </div>
);

const Managers = () => {
  const [show, setShow] = useState("active");
  const [managerToDelete, setManagerToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddManager, setShowAddManager] = useState(false);
  const [editUser, setEditUser] = useState([]);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.userSlice.user.token);
  const user = useSelector((state) => state.userSlice.user.user);

  const {
    data: activeData,
    fetchNextPage: fetchNextActiveManagers,
    hasNextPage: hasMoreActiveManagers,
    isFetchingNextPage: isLoadingMoreActiveManagers,
    isLoading: isLoadingActiveManagers,
  } = useInfiniteQuery(
    ["managers", { status: "active" }],
    ({ pageParam = 1, signal }) =>
      fetchActiveManagers({ pageParam, signal, token }),
    {
      getNextPageParam: (lastPage) => {
        const { page, total, limit } = lastPage;
        return page * limit < total ? page + 1 : undefined;
      },
      enabled: show === "active" && !!token,
    }
  );

  const {
    data: suspendedData,
    fetchNextPage: fetchNextSuspendedManagers,
    hasNextPage: hasMoreSuspendedManagers,
    isFetchingNextPage: isLoadingMoreSuspendedManagers,
    isLoading: isLoadingSuspendedManagers,
  } = useInfiniteQuery(
    ["managers", { status: "suspended" }],
    ({ pageParam = 1, signal }) =>
      fetchSuspendedManagers({ pageParam, signal, token }),
    {
      getNextPageParam: (lastPage) => {
        const { page, total, limit } = lastPage;
        return page * limit < total ? page + 1 : undefined;
      },
      enabled: show === "suspended" && !!token,
    }
  );

  const isLoading =
    (show === "active" && isLoadingActiveManagers) ||
    (show === "suspended" && isLoadingSuspendedManagers);

  // Handles search query change
  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  // Filtered, sorted, and paginated exams
  const activeManagers = useMemo(() => {
    return activeData?.pages?.flatMap((page) => page.managers) || [];
  }, [activeData?.pages]);

  const suspendedManagers = useMemo(() => {
    return suspendedData?.pages?.flatMap((page) => page.managers) || [];
  }, [suspendedData?.pages]);

  const filteredManagers = useMemo(() => {
    const dataToFilter =
      show === "active"
        ? activeManagers
        : show === "suspended"
        ? suspendedManagers
        : [];

    return dataToFilter
      .filter((manager) =>
        searchQuery
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean)
          .every((part) =>
            [
              manager?.name?.toLowerCase(),
              manager?.status?.toLowerCase(),
              manager?.region?.location?.toLowerCase(),
              manager?.ID?.toLowerCase(),
              manager?.phone?.toLowerCase(),
            ].some((field) => field?.includes(part))
          )
      )
      .sort((a, b) =>
        (a?.name?.toLowerCase() || "").localeCompare(
          b?.name?.toLowerCase() || ""
        )
      );
  }, [activeManagers, suspendedManagers, searchQuery, show]);

  const paginatedManagers = filteredManagers;

  const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation(({ userId, token }) => deleteQueryUser(userId, token), {
      onSuccess: () => {
        queryClient.invalidateQueries(["managers"]);
        toast.success("Manager deleted");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete manager");
      },
    });
  };

  const deleteUserMutation = useDeleteUser();

  const handleDeleteUser = (manager) => {
    setManagerToDelete(manager);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (managerToDelete) {
      deleteUserMutation.mutate({ userId: managerToDelete, token });
    }
    setShowDeleteModal(false);
  };

  function formatDate(date) {
    const options = { day: "numeric", month: "short", year: "numeric" };
    const formattedDate = new Intl.DateTimeFormat("en-GB", options).format(
      date
    );

    // Extract the day and add the ordinal suffix
    const day = date.getDate();
    const ordinalSuffix = getOrdinalSuffix(day);

    // Combine day with ordinal suffix and the rest of the date
    return formattedDate.replace(day, `${day}${ordinalSuffix}`);
  }

  function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return "th"; // Covers 4-20
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  useEffect(() => {
    if (showAddManager || showEditUserModal) {
      dispatch(setSidebar(false));
    }
  }, [showAddManager, showEditUserModal, dispatch]);

  const onEditManger = (manager) => {
    setEditUser(manager);
    setShowEditUserModal(true);
  };

  useEffect(() => {
    if (!["super admin", "admin"].includes(user?.role)) {
      navigate("/404");
    }
  }, [user, navigate]);

  return (
    <div className="p-5">
      <div className="space-y-5">
        <p className="text-xl font-bold">Managers</p>
        <div className="flex flex-row items-center space-x-5 w-[66%]">
          <div
            className={`p-2 py-3 text-sm font-roboto font-bold w-[50%] md:w-36 text-center cursor-pointer ${
              show === "active" ? "bg-primary-400" : "text-gray-600"
            }`}
            onClick={() => setShow("active")}>
            Active
          </div>
          <div
            className={`p-2 py-3 text-sm font-roboto font-bold md:w-36 text-center cursor-pointer w-[50%] ${
              show === "suspended" ? "bg-primary-400" : "text-gray-600"
            }`}
            onClick={() => setShow("suspended")}>
            Suspended
          </div>
        </div>
      </div>
      <div className="border border-gray-200">
        <div className="">
          <div className="p-5 flex flex-col space-y-5">
            <div className="flex flex-col md:flex-row-reverse justify-between space-y-5 md:space-y-0">
              <button
                className={`p-2 ${
                  isLoading ? "bg-gray-400" : "bg-primary-500 hover:scale-105"
                } flex flex-row items-center justify-center h-12 w-[280px] md:w-32 transition-all duration-500 ease-in-out`}
                disabled={isLoading}
                onClick={() => setShowAddManager(!showAddManager)}>
                New Manager
              </button>

              <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-5">
                <div className="flex flex-row justify-between items-center space-x-2 md:space-x-5">
                  <TextField
                    id="outlined-search"
                    label="Search by admin name, or status"
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
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <InfiniteScroll
                dataLength={filteredManagers.length}
                next={() => {
                  if (
                    show === "active" &&
                    hasMoreActiveManagers &&
                    !isLoadingMoreActiveManagers
                  ) {
                    fetchNextActiveManagers();
                  } else if (
                    show === "suspended" &&
                    hasMoreSuspendedManagers &&
                    !isLoadingMoreSuspendedManagers
                  ) {
                    fetchNextSuspendedManagers();
                  }
                }}
                hasMore={
                  show === "active"
                    ? hasMoreActiveManagers
                    : hasMoreSuspendedManagers
                }
                loader={
                  <div className="flex justify-center py-4">
                    <p>Loading more users...</p>
                  </div>
                }
                scrollableTarget="scrollableDiv">
                <div
                  className="max-h-[57vh] overflow-y-auto"
                  id="scrollableDiv">
                  <table className="w-full text-sm text-left text-gray-500 relative">
                    <thead className="text-xs text-gray-700 uppercase bg-neutral-100 border-b border-gray-200">
                      <tr>
                        <th scope="col" className="px-2 border-r py-2">
                          #
                        </th>
                        <th
                          scope="col"
                          className="px-2 border-r text-[14px] normal-case py-2">
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 border-r text-[14px] normal-case py-2">
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 border-r text-[14px] normal-case py-2">
                          ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 border-r text-[14px] normal-case py-2">
                          Phone
                        </th>
                        <th
                          scope="col"
                          className="px-6 border-r text-[14px] normal-case py-2">
                          Location
                        </th>
                        <th
                          scope="col"
                          className="px-6 border-r text-[14px] normal-case py-2">
                          Last login
                        </th>
                        <th
                          scope="col"
                          className="px-6 border-r text-[14px] normal-case py-2">
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 text-[14px] normal-case py-2">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    {paginatedManagers.length === 0 ||
                    paginatedManagers.filter((manager) =>
                      show === "active"
                        ? manager.status === "active"
                        : manager.status !== "active"
                    ).length === 0 ? (
                      <tbody>
                        <tr>
                          <td colSpan="9" className="px-4 pt-2">
                            <p className="text-gray-500">
                              No {show === "active" ? "active" : "suspended"}{" "}
                              managers found.
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody>
                        {paginatedManagers
                          ?.filter((manager) =>
                            show === "active"
                              ? manager.status === "active"
                              : manager.status !== "active"
                          )
                          .map((manager, index) => (
                            <tr
                              key={manager.id}
                              className="bg-white border-b hover:bg-blue-50">
                              <td className="px-2 py-2 border-r font-medium text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-2 border-r py-2 capitalize">
                                {manager.name}
                              </td>
                              <td className="px-6 border-r py-2">
                                {manager.email}
                              </td>
                              <td className="px-6 border-r py-2">
                                {manager.ID}
                              </td>
                              <td className="px-6 border-r py-2">
                                {manager.phone}
                              </td>
                              <td className="px-6 border-r py-2">
                                {manager?.region?.location}
                              </td>
                              <td className="px-6 border-r py-2">
                                {formatDate(new Date(manager.lastLogin))}
                              </td>
                              <td className="px-6 border-r py-2">
                                {manager.status === "active" ? (
                                  <p className="text-green-500 capitalize">
                                    {manager.status}
                                  </p>
                                ) : (
                                  <p className="text-amber-500 capitalize">
                                    {manager.status}
                                  </p>
                                )}
                              </td>
                              <td className="px-6 py-2 flex flex-col md:flex-row items-center md:space-x-5 space-y-2 md:space-y-0">
                                <button
                                  onClick={() => onEditManger(manager)}
                                  aria-label={`Edit ${manager.name}`}
                                  className="flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-xl border text-black border-amber-500 hover:bg-amber-300">
                                  Edit
                                  <BiEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(manager.id)}
                                  aria-label={`Delete ${manager.name}`}
                                  className="flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-xl border text-black border-rose-500 hover:bg-rose-300">
                                  <MdDeleteOutline />
                                  Delete
                                </button>
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
      <NewManager
        showAddManager={showAddManager}
        setShowAddManager={setShowAddManager}
      />
      <EditUserModal
        setEditUser={setEditUser}
        user={editUser}
        showEditUserModal={showEditUserModal}
        setShowEditUserModal={setShowEditUserModal}
      />
      <DeleteConfirmationModal
        showDeleteModal={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        manager={managerToDelete}
        title={`Confirm Deletion!`}
        message="Deleted manager cannot be retrieved"
      />
    </div>
  );
};

export default Managers;
