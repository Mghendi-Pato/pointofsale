import { TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TablePagination from "@mui/material/TablePagination";
import { MdDeleteOutline } from "react-icons/md";
import { setSidebar } from "../../redux/reducers/ sidebar";
import { toast } from "react-toastify";
import NewManager from "../../components/NewManager";
import { BiEdit } from "react-icons/bi";
import { useQuery } from "react-query";
import {
  deleteQueryUser,
  fetchActiveManagers,
  fetchSuspendedManagers,
} from "../../services/services";
import { useMutation, useQueryClient } from "react-query";
import DeleteConfirmationModal from "../../components/DeleteModal";
import EditUserModal from "../../components/EditUserModal";

const Managers = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [show, setShow] = useState("active");
  const [managerToDelete, setManagerToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddManager, setShowAddManager] = useState(false);
  const [editUser, setEditUser] = useState([]);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const dispatch = useDispatch();

  const token = useSelector((state) => state.userSlice.user.token);

  const { data: activeData, isLoading: activeLoading } = useQuery(
    ["managers", { status: "active", page: page + 1, limit: rowsPerPage }],
    ({ queryKey, signal }) => fetchActiveManagers({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: show === "active" && !!token,
    }
  );

  const { data: suspendedData, isLoading: suspendedLoading } = useQuery(
    ["managers", { status: "suspended", page: page + 1, limit: rowsPerPage }],
    ({ queryKey, signal }) =>
      fetchSuspendedManagers({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: show === "inactive" && !!token,
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
  const filteredManagers = useMemo(() => {
    const dataToFilter =
      show === "active" ? activeData?.managers : suspendedData?.managers;
    return (
      dataToFilter
        ?.filter((manager) => {
          return searchQuery
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean)
            .every((part) =>
              [
                manager?.name?.toLowerCase(),
                manager?.status?.toLowerCase(),
                manager?.region?.location.toLowerCase(),
                manager?.ID?.toLowerCase(),
                manager?.phone?.toLowerCase(),
              ].some((field) => field.includes(part))
            );
        })
        ?.sort((a, b) => {
          const nameA = a?.name?.toLowerCase() || "";
          const nameB = b?.name?.toLowerCase() || "";
          return nameA.localeCompare(nameB);
        }) || []
    );
  }, [activeData?.managers, suspendedData?.managers, searchQuery, show]);

  const paginatedManagers = filteredManagers;

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

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

  useEffect(() => {
    setPage(0);
  }, [searchQuery, show]);

  const onEditManger = (manager) => {
    setEditUser(manager);
    setShowEditUserModal(true);
  };

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
                {(activeLoading && !activeData && show === "active") ||
                (suspendedLoading && !suspendedData && show !== "active") ? (
                  <p className="p-2">Fetching manager data...</p>
                ) : paginatedManagers.length === 0 ||
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
                            <button
                              onClick={() => onEditManger(manager)}
                              aria-label={`Manage ${manager.name}`}
                              className="flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-xl border text-black border-amber-500 hover:bg-amber-300">
                              Edit
                              <BiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(manager.id)}
                              aria-label={`Analyze ${manager.name}`}
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
            <TablePagination
              rowsPerPageOptions={[5, 10]}
              component="div"
              count={
                show === "active" ? activeData?.total : suspendedData?.total
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
