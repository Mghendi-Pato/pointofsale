import { TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PiUserCheck } from "react-icons/pi";
import TablePagination from "@mui/material/TablePagination";
import { MdDeleteOutline } from "react-icons/md";
import { setSidebar } from "../../redux/reducers/ sidebar";
import { toast } from "react-toastify";
import {
  initializeUserDeleteState,
  initializeUserStatusUpdateState,
} from "../../redux/reducers/user";
import NewManager from "../../components/NewManager";
import { useQuery } from "react-query";
import {
  deleteQueryUser,
  fetchManagers,
  toggleQueryUserStatus,
} from "../../services/services";
import { useMutation, useQueryClient } from "react-query";

const Managers = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [updatingManager, setupdatingManager] = useState(null);
  const [show, setShow] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddManager, setShowAddManager] = useState(false);
  const dispatch = useDispatch();
  const successNotify = (message) => toast.success(message);
  const errorNotify = (message) => toast.error(message || "Login failed");

  const useToggleStatus = () => {
    const queryClient = useQueryClient();
    return useMutation(
      ({ userId, token }) => toggleQueryUserStatus(userId, token),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["managers"]);
          toast.success("Manager status updated successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update manager status");
        },
      }
    );
  };

  const toggleStatusMutation = useToggleStatus();

  const handleStatusToggle = (userId) => {
    toggleStatusMutation.mutate({ userId, token });
  };

  const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation(({ userId, token }) => deleteQueryUser(userId, token), {
      onSuccess: () => {
        queryClient.invalidateQueries(["managers"]);
        toast.success("Manager deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete manager");
      },
    });
  };

  const deleteUserMutation = useDeleteUser();

  const handleDeleteUser = (userId) => {
    deleteUserMutation.mutate({ userId, token });
  };

  const token = useSelector((state) => state.userSlice.user.token);
  const {
    userStatusUpdateError,
    userStatusUpdateLoading,
    userStatusUpdateSuccess,
    userDeleteError,
    userDeleteLoading,
    userDeleteSuccess,
  } = useSelector((state) => state.userSlice);

  const { data, isLoading, error } = useQuery(
    ["managers", page + 1, rowsPerPage],
    ({ queryKey, signal }) => fetchManagers({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  // Handles page change
  const handleChangePage = (event, newPage) => setPage(newPage);

  // Handles rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handles search query change
  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  // Filtered, sorted, and paginated exams
  const filterdManager = useMemo(() => {
    return (
      data?.managers
        ?.filter((manager) => {
          return searchQuery
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean)
            .every((part) =>
              [
                manager?.name?.toLowerCase(),
                manager?.status?.toLowerCase(),
              ].some((field) => field.includes(part))
            );
        })
        ?.sort((a, b) => {
          const nameA = a?.name?.toLowerCase() || "";
          const nameB = b?.name?.toLowerCase() || "";
          return nameA.localeCompare(nameB);
        }) || []
    );
  }, [data?.managers, searchQuery]);

  const paginatedManagers = filterdManager;
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);
  console.log("Paginated managers..", data);
  console.log("Managers data", paginatedManagers);

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
    if (showAddManager) {
      dispatch(setSidebar(false));
    }
  }, [showAddManager, dispatch]);

  useEffect(() => {
    if (userStatusUpdateSuccess) {
      successNotify("Manager status updated successfully");
      dispatch(initializeUserStatusUpdateState());
    }
  }, [dispatch, userStatusUpdateSuccess]);

  useEffect(() => {
    if (userStatusUpdateError) {
      errorNotify(userStatusUpdateError);
      dispatch(initializeUserStatusUpdateState());
    }
  }, [dispatch, userStatusUpdateError]);

  useEffect(() => {
    if (userDeleteSuccess) {
      successNotify("Manager deleted successfully");
      dispatch(initializeUserDeleteState());
    }
  }, [dispatch, userDeleteSuccess]);

  useEffect(() => {
    if (userDeleteError) {
      errorNotify(userDeleteError);
      dispatch(initializeUserStatusUpdateState());
      dispatch(initializeUserDeleteState());
    }
  }, [dispatch, userDeleteError]);

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const visibleManagers = paginatedManagers
    .filter((manager) =>
      show === "active"
        ? manager.status === "active"
        : manager.status !== "active"
    )
    .slice(startIndex, endIndex);

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
              show === "inactive" ? "bg-primary-400" : "text-gray-600"
            }`}
            onClick={() => setShow("inactive")}>
            Suspended
          </div>
        </div>
      </div>
      <div className="border border-gray-200">
        <div className="">
          <div className="p-5 flex flex-col space-y-5">
            <p className="text-xl font-bold">All managers</p>
            <div className="flex flex-col md:flex-row-reverse justify-between space-y-5 md:space-y-0">
              <button
                className="p-2 bg-primary-500 hover:scale-105 flex flex-row items-center justify-center h-12 w-[280px] md:w-32 transition-all duration-500 ease-in-out"
                onClick={() => setShowAddManager(!showAddManager)}>
                New Manager
              </button>

              <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-5">
                <div className="flex flex-row justify-between items-center space-x-2 md:space-x-5">
                  <TextField
                    id="outlined-search"
                    label="Search by admin name, or status"
                    variant="outlined"
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
            <div className="max-h-[57vh] overflow-y-auto">
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
                {isLoading ? (
                  <p className="p-2">Fetching manager data...</p>
                ) : visibleManagers.length === 0 ||
                  visibleManagers.filter((manager) =>
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
                    {visibleManagers
                      ?.filter((manager) =>
                        show === "active"
                          ? manager.status === "active"
                          : manager.status !== "active"
                      )
                      .map((manager, index) => (
                        <tr
                          key={index}
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
                          <td className="px-6 border-r py-2">{manager.ID}</td>
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
                            {manager.status === "active" ? (
                              <button
                                aria-label={`Manage ${manager.name}`}
                                className="flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-xl border text-black border-amber-500 hover:bg-amber-300"
                                onClick={() =>
                                  handleStatusToggle(manager.id, manager.status)
                                }
                                disabled={
                                  manager.id === updatingManager &&
                                  userStatusUpdateLoading
                                }>
                                <PiUserCheck />
                                {manager.id === updatingManager &&
                                userStatusUpdateLoading
                                  ? "Updating..."
                                  : "Suspend"}
                              </button>
                            ) : (
                              <button
                                aria-label={`Manage ${manager.name}`}
                                className="flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-xl border text-black border-green-500 hover:bg-green-300"
                                onClick={() =>
                                  handleStatusToggle(manager.id, manager.status)
                                }
                                disabled={
                                  manager.id === updatingManager &&
                                  userStatusUpdateLoading
                                }>
                                <PiUserCheck />
                                {manager.id === updatingManager &&
                                userStatusUpdateLoading
                                  ? "Updating..."
                                  : "Activate"}
                              </button>
                            )}
                            <button
                              disabled={
                                manager.id === updatingManager &&
                                userDeleteLoading
                              }
                              onClick={() => handleDeleteUser(manager.id)}
                              aria-label={`Analyze ${manager.name}`}
                              className="flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-xl border text-black border-rose-500 hover:bg-rose-300">
                              <MdDeleteOutline />
                              {manager.id === updatingManager &&
                              userDeleteLoading
                                ? "Updating..."
                                : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                )}
                {error && error.message}
              </table>
            </div>
            <TablePagination
              rowsPerPageOptions={[5, 10]}
              component="div"
              count={
                paginatedManagers.filter((manager) =>
                  show === "active"
                    ? manager.status === "active"
                    : manager.status !== "active"
                ).length
              }
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </div>
      </div>
      <NewManager
        showAddManager={showAddManager}
        setShowAddManager={setShowAddManager}
      />
    </div>
  );
};

export default Managers;
