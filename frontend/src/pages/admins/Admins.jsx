import { TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TablePagination from "@mui/material/TablePagination";
import { MdDeleteOutline } from "react-icons/md";
import NewAdmin from "../../components/NewAdmin";
import { setSidebar } from "../../redux/reducers/ sidebar";
import { toast } from "react-toastify";
import { useQuery } from "react-query";
import { BiEdit } from "react-icons/bi";
import {
  deleteQueryUser,
  fetchActiveAdmins,
  fetchDormantAdmins,
} from "../../services/services";
import { useMutation, useQueryClient } from "react-query";
import DeleteConfirmationModal from "../../components/DeleteModal";
import EditUserModal from "../../components/EditUserModal";
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

const TableSkeleton = ({ rowsPerPage = 10 }) => (
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
          <th scope="col" className="px-6 text-[14px] normal-case py-2">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {Array(rowsPerPage)
          .fill(0)
          .map((_, index) => (
            <TableSkeletonRow key={index} />
          ))}
      </tbody>
    </table>
  </div>
);

const PaginationSkeleton = () => (
  <div className="flex justify-end items-center p-4">
    <div className="h-10 w-80">
      <SkeletonPulse />
    </div>
  </div>
);

const Admins = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddAdmin, setShowAdmin] = useState(false);
  const [deleteAdmin, setDeleteAdmin] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [show, setShow] = useState("active");
  const [editUser, setEditUser] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.userSlice.user.token);
  const user = useSelector((state) => state.userSlice.user.user);

  const { data: activeAdminsData, isLoading: activeAdminsLoading } = useQuery(
    ["admins", { status: "active", page: page + 1, limit: rowsPerPage }],
    ({ queryKey, signal }) => fetchActiveAdmins({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: show === "active" && !!token,
    }
  );

  const { data: dormantAdminsData, isLoading: dormantAdminsLoading } = useQuery(
    ["admins", { status: "dormant", page: page + 1, limit: rowsPerPage }],
    ({ queryKey, signal }) => fetchDormantAdmins({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: show === "dormant" && !!token,
    }
  );

  const isLoading =
    (show === "active" && activeAdminsLoading) ||
    (show === "dormant" && dormantAdminsLoading);

  // Handles page change
  const handleChangePage = (event, newPage) => setPage(newPage);

  // Handles rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handles search query change
  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  // Filtered, sorted, and paginated admins
  const filteredAdmins = useMemo(() => {
    const dataToFilter =
      show === "active" ? activeAdminsData?.admins : dormantAdminsData?.admins;
    return (
      dataToFilter
        ?.filter((admin) => {
          return searchQuery
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean)
            .every((part) =>
              [
                admin?.name?.toLowerCase(),
                admin?.ID?.toLowerCase(),
                admin?.phone?.toLowerCase(),
                admin?.email?.toLowerCase(),
              ].some((field) => field.includes(part))
            );
        })
        ?.sort((a, b) => {
          const nameA = a?.name?.toLowerCase() || "";
          const nameB = b?.name?.toLowerCase() || "";
          return nameA.localeCompare(nameB);
        }) || []
    );
  }, [activeAdminsData?.admins, dormantAdminsData?.admins, searchQuery, show]);

  const paginatedAdmins = filteredAdmins;

  const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation(({ userId, token }) => deleteQueryUser(userId, token), {
      onSuccess: () => {
        queryClient.invalidateQueries(["admins"]);
        toast.success("Admin deleted");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete admin");
      },
    });
  };

  const deleteUserMutation = useDeleteUser();

  const handleDeleteUser = (admin) => {
    setDeleteAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (deleteAdmin) {
      deleteUserMutation.mutate({ userId: deleteAdmin, token });
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
    if (user?.role !== "super admin") {
      navigate("/404");
    }
  }, [user, navigate]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  useEffect(() => {
    if (showAddAdmin || showEditUserModal) {
      dispatch(setSidebar(false));
    }
  }, [showAddAdmin, showEditUserModal, dispatch]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, show]);

  const onEditAdmin = (admin) => {
    setEditUser(admin);
    setShowEditUserModal(true);
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
              show === "dormant" ? "bg-primary-400" : "text-gray-600"
            }`}
            onClick={() => setShow("dormant")}>
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
                onClick={() => setShowAdmin(!showAddAdmin)}>
                New Admin
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
              <>
                <TableSkeleton rowsPerPage={rowsPerPage} />
                <PaginationSkeleton />
              </>
            ) : (
              <>
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
                          className="px-6 border-r text-[14px] normal-case py-2">
                          Role
                        </th>
                        <th
                          scope="col"
                          className="px-6 text-[14px] normal-case py-2">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    {paginatedAdmins.length === 0 ||
                    paginatedAdmins.filter((admin) =>
                      show === "active"
                        ? admin.status === "active"
                        : admin.status !== "active"
                    ).length === 0 ? (
                      <tbody>
                        <tr>
                          <td colSpan="9" className="px-4 pt-2">
                            <p className="text-gray-500">
                              No {show === "active" ? "active" : "suspended"}{" "}
                              admins found.
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody>
                        {paginatedAdmins
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
                              <td className="px-2 border-r py-2 capitalize">
                                {admin.name}
                              </td>
                              <td className="px-6 border-r py-2">
                                {admin.email}
                              </td>
                              <td className="px-6 border-r py-2">{admin.ID}</td>
                              <td className="px-6 border-r py-2">
                                {admin.phone}
                              </td>
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
                              <td className="px-6 border-r py-2">
                                {admin.role}
                              </td>
                              <td className="px-6 py-2 flex flex-col md:flex-row items-center md:space-x-5 space-y-2 md:space-y-0">
                                <button
                                  aria-label={`Manage ${admin.name}`}
                                  className="flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-xl border text-black border-amber-500 hover:bg-amber-300"
                                  onClick={() => onEditAdmin(admin)}>
                                  Edit
                                  <BiEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(admin.id)}
                                  aria-label={`Analyze ${admin.name}`}
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
                    show === "active"
                      ? activeAdminsData?.total || 0
                      : dormantAdminsData?.total || 0
                  }
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
      <EditUserModal
        setEditUser={setEditUser}
        user={editUser}
        showEditUserModal={showEditUserModal}
        setShowEditUserModal={setShowEditUserModal}
      />
      <NewAdmin showAddAdmin={showAddAdmin} setShowAdmin={setShowAdmin} />
      <DeleteConfirmationModal
        showDeleteModal={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        admin={deleteAdmin}
        title={`Confirm Deletion!`}
        message="Deleted Admin cannot be retrieved"
      />
    </div>
  );
};

export default Admins;
