import { TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdmin } from "../../redux/reducers/admin";
import { PiUserCheck } from "react-icons/pi";
import TablePagination from "@mui/material/TablePagination";
import { MdDeleteOutline } from "react-icons/md";
import NewAdmin from "../../components/NewAdmin";
import { setSidebar } from "../../redux/reducers/ sidebar";
import { toast } from "react-toastify";
import {
  deleteUser,
  initializeUserDeleteState,
  initializeUserStatusUpdateState,
  toggleUserStatus,
} from "../../redux/reducers/user";

const Admins = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddAdmin, setShowAdmin] = useState(false);
  const [updatingAdmin, setUpdatingAdmin] = useState(null);
  const [unfilterdAdmins, setUnfilterdAdmins] = useState();
  const [show, setShow] = useState("active");
  const dispatch = useDispatch();
  const successNotify = (message) => toast.success(message);
  const errorNotify = (message) => toast.error(message || "Login failed");

  const { admins, error, loading } = useSelector((state) => state.adminSlice);

  const {
    userStatusUpdateError,
    userStatusUpdateLoading,
    userStatusUpdateSuccess,
    userDeleteError,
    userDeleteLoading,
    userDeleteSuccess,
  } = useSelector((state) => state.userSlice);
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
  const filteredAdmin = useMemo(() => {
    return (
      unfilterdAdmins
        ?.filter((admin) => {
          return searchQuery
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean)
            .every((part) =>
              [admin?.name?.toLowerCase(), admin?.status?.toLowerCase()].some(
                (field) => field.includes(part)
              )
            );
        })
        ?.sort((a, b) => {
          const nameA = a?.name?.toLowerCase() || "";
          const nameB = b?.name?.toLowerCase() || "";
          return nameA.localeCompare(nameB);
        }) || []
    );
  }, [unfilterdAdmins, searchQuery]);

  const paginatedAdmin = useMemo(() => {
    return filteredAdmin.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredAdmin, page, rowsPerPage]);

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
    setUnfilterdAdmins(admins?.admins);
  }, [admins?.admins]);

  useEffect(() => {
    dispatch(fetchAdmin());
  }, [dispatch]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, admins]);

  useEffect(() => {
    if (showAddAdmin) {
      dispatch(setSidebar(false));
    }
  }, [showAddAdmin, dispatch]);

  useEffect(() => {
    if (userStatusUpdateSuccess) {
      successNotify("Admin status updated successfully");
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
      successNotify("Admin deleted successfully");
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

  const handleStatusToggle = async (adminId, currentStatus) => {
    try {
      setUpdatingAdmin(adminId);
      const response = await dispatch(toggleUserStatus(adminId)).unwrap();
      if (
        (currentStatus === "active" && response.user.status === "suspended") ||
        (currentStatus === "suspended" && response.user.status === "active")
      ) {
        setUnfilterdAdmins((prevAdmins) =>
          prevAdmins.map((admin) =>
            admin.id === adminId
              ? { ...admin, status: response.user.status }
              : admin
          )
        );
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    } finally {
      setUpdatingAdmin(null); // Reset updating state
    }
  };

  const handleDeleteUser = async (adminId) => {
    try {
      setUpdatingAdmin(adminId);
      const response = await dispatch(deleteUser(adminId)).unwrap();
      if (response.message) {
        setUnfilterdAdmins((prevAdmins) =>
          prevAdmins.filter((admin) => admin.id !== adminId)
        );
        console.log(unfilterdAdmins);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setUpdatingAdmin(null);
    }
  };

  return (
    <div className="p-5">
      <div className="space-y-5">
        <p className="text-xl font-bold">Admins</p>
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
            <p className="text-xl font-bold">All admin data</p>
            <div className="flex flex-col md:flex-row-reverse justify-between space-y-5 md:space-y-0">
              <button
                className="p-2 bg-primary-500 hover:scale-105 flex flex-row items-center justify-center h-12 w-[280px] md:w-32 transition-all duration-500 ease-in-out"
                onClick={() => setShowAdmin(!showAddAdmin)}>
                New Admin
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
              <table className="w-full text-sm text-left text-gray-500">
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
                      Joined
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
                {admins.length === 0 && (
                  <p className="p-2">No admin records found</p>
                )}
                {loading ? (
                  <p className="p-2">Fetching admin data...</p>
                ) : (
                  <tbody>
                    {paginatedAdmin
                      ?.filter((admin) =>
                        show === "active"
                          ? admin.status === "active"
                          : admin.status !== "active"
                      )
                      .map((admin, index) => (
                        <tr
                          key={index}
                          className="bg-white border-b hover:bg-blue-50">
                          <td className="px-2 py-2 border-r font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-2 border-r py-2">{admin.name}</td>
                          <td className="px-6 border-r py-2">{admin.email}</td>
                          <td className="px-6 border-r py-2">{admin.ID}</td>
                          <td className="px-6 border-r py-2">{admin.phone}</td>
                          <td className="px-6 border-r py-2">
                            {formatDate(new Date(admin.createdAt))}
                          </td>
                          <td className="px-6 border-r py-2">
                            {formatDate(new Date(admin.lastLogin))}
                          </td>
                          <td className="px-6 border-r py-2">
                            {admin.status === "active" ? (
                              <p className="text-green-500 capitalize">
                                {admin.status}
                              </p>
                            ) : (
                              <p className="text-amber-500 capitalize">
                                {admin.status}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-2 flex flex-col md:flex-row items-center md:space-x-5 space-y-2 md:space-y-0">
                            {admin.status === "active" ? (
                              <button
                                aria-label={`Manage ${admin.name}`}
                                className="flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-xl border text-black border-amber-500 hover:bg-amber-300"
                                onClick={() =>
                                  handleStatusToggle(admin.id, admin.status)
                                }
                                disabled={
                                  admin.id === updatingAdmin &&
                                  userStatusUpdateLoading
                                }>
                                <PiUserCheck />
                                {admin.id === updatingAdmin &&
                                userStatusUpdateLoading
                                  ? "Updating..."
                                  : "Suspend"}
                              </button>
                            ) : (
                              <button
                                aria-label={`Manage ${admin.name}`}
                                className={`flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-xl border text-black border-green-500 hover:bg-green-300`}
                                onClick={() =>
                                  handleStatusToggle(admin.id, admin.status)
                                }
                                disabled={
                                  admin.id === updatingAdmin &&
                                  userStatusUpdateLoading
                                }>
                                <PiUserCheck />
                                {admin.id === updatingAdmin &&
                                userStatusUpdateLoading
                                  ? "Updating..."
                                  : "Activate"}
                              </button>
                            )}
                            <button
                              disabled={
                                admin.id === updatingAdmin && userDeleteLoading
                              }
                              onClick={() => handleDeleteUser(admin.id)}
                              aria-label={`Analyze ${admin.name}`}
                              className="flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-xl border text-black border-rose-500 hover:bg-rose-300">
                              <MdDeleteOutline />
                              {admin.id === updatingAdmin && userDeleteLoading
                                ? "Updating..."
                                : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    {paginatedAdmin?.filter((admin) =>
                      show === "active"
                        ? admin.status === "active"
                        : admin.status !== "active"
                    ).length === 0 && (
                      <tr>
                        <td colSpan="9" className=" px-4 pt-2">
                          No {show === "active" ? "active" : "suspended"} admins
                          found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                )}
                {error && error.message}
              </table>
            </div>
            <TablePagination
              rowsPerPageOptions={[5, 10]}
              component="div"
              count={filteredAdmin?.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </div>
      </div>
      <NewAdmin showAddAdmin={showAddAdmin} setShowAdmin={setShowAdmin} />
    </div>
  );
};

export default Admins;
