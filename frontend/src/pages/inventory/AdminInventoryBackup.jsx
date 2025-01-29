import { TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TablePagination from "@mui/material/TablePagination";
import { setSidebar } from "../../redux/reducers/ sidebar";
import { useQuery } from "react-query";
import {
  fetchActivePhones,
  fetchSuspendedPhones,
} from "../../services/services";
import { BiCartAdd } from "react-icons/bi";
import { BiEdit } from "react-icons/bi";
import NewPhone from "../../components/NewPhone";

const AdminInventory = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [show, setShow] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPhone, setShowAddPhone] = useState(false);

  const dispatch = useDispatch();

  const token = useSelector((state) => state.userSlice.user.token);

  const { data: activePhones, isLoading: activePhonesLoading } = useQuery(
    ["phones", { status: "active", page: page + 1, limit: rowsPerPage }],
    ({ queryKey, signal }) => fetchActivePhones({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: show === "active" && !!token,
    }
  );

  const { data: suspendedPhones, isLoading: suspendedPhonesLoading } = useQuery(
    ["phones", { status: "suspended", page: page + 1, limit: rowsPerPage }],
    ({ queryKey, signal }) => fetchSuspendedPhones({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: show === "suspended" && !!token,
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

  // Filtered, sorted, and paginated phones
  const filteredPhones = useMemo(() => {
    const dataToFilter =
      show === "active" ? activePhones?.phones : suspendedPhones?.phones;

    return (
      dataToFilter
        ?.filter((phone) => {
          return searchQuery
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean)
            .every((part) =>
              [
                phone?.model?.toLowerCase(),
                phone?.imei,
                phone?.supplierName?.toLowerCase(),
                phone?.managerName?.toLowerCase(),
                phone?.managerLocation?.toLowerCase(),
              ].some((field) => field.includes(part))
            );
        })
        ?.sort((a, b) => {
          // Sorting by createdAt in descending order to get the latest phones first
          const dateA = new Date(a?.createdAt);
          const dateB = new Date(b?.createdAt);
          return dateB - dateA; // Ensures that the latest phone comes first
        }) || []
    );
  }, [activePhones?.phones, suspendedPhones?.phones, searchQuery, show]);

  const paginatedPhones = filteredPhones;

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

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
    if (showAddPhone) {
      dispatch(setSidebar(false));
    }
  }, [showAddPhone, dispatch]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, show]);

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
            Active
          </div>
          <div
            className={`p-2 py-3 text-sm font-roboto font-bold md:w-36 text-center cursor-pointer border-l border-r w-[50%] ${
              show === "inactive" ? "bg-primary-400" : "text-gray-600"
            }`}
            onClick={() => setShow("inactive")}>
            Suspended
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
            <div className="flex flex-col md:flex-row-reverse justify-between space-y-5 md:space-y-0">
              <button
                className="p-2 bg-primary-500 hover:scale-105 flex flex-row items-center justify-center h-12 w-[280px] md:w-32 transition-all duration-500 ease-in-out"
                onClick={() => setShowAddPhone(!showAddPhone)}>
                Add inventory
              </button>

              <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-5">
                <div className="flex flex-row justify-between items-center space-x-2 md:space-x-5">
                  <TextField
                    id="outlined-search"
                    label="Search phone..."
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
                      Supplier
                    </th>
                    <th
                      scope="col"
                      className="px-6 border-r text-[14px] normal-case py-2">
                      Supply date
                    </th>
                    <th
                      scope="col"
                      className="px-6 border-r text-[14px] normal-case py-2">
                      Buying price
                    </th>
                    <th
                      scope="col"
                      className="px-6 border-r text-[14px] normal-case py-2">
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-6 border-r text-[14px] normal-case py-2">
                      Manager
                    </th>
                    <th
                      scope="col"
                      className="px-6 text-[14px] normal-case py-2">
                      Actions
                    </th>
                  </tr>
                </thead>
                {(activePhonesLoading && !activePhones && show === "active") ||
                (suspendedPhonesLoading &&
                  !suspendedPhones &&
                  show !== "active") ? (
                  <p className="p-2">Fetching phone data...</p>
                ) : paginatedPhones.length === 0 ||
                  paginatedPhones.filter((phone) =>
                    show === "active"
                      ? phone.status === "active"
                      : phone.status !== "active"
                  ).length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan="9" className="px-4 pt-2">
                        <p className="text-gray-500">
                          No {show === "active" ? "active" : "suspended"} phones
                          found.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {paginatedPhones
                      ?.filter((phone) =>
                        show === "active"
                          ? phone.status === "active"
                          : phone.status !== "active"
                      )
                      .map((phone, index) => (
                        <tr
                          key={phone.id}
                          className="bg-white border-b hover:bg-blue-50">
                          <td className="px-2 py-2 border-r font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-2 border-r py-2 capitalize">
                            {phone.model}
                          </td>
                          <td className="px-6 border-r py-2">{phone.imei}</td>
                          <td className="px-6 border-r py-2">
                            {phone.supplierName}
                          </td>
                          <td className="px-6 border-r py-2">
                            {formatDate(new Date(phone.buyDate))}
                          </td>
                          <td className="px-6 border-r py-2">
                            Ksh {phone.purchasePrice}
                          </td>
                          <td className="px-6 border-r py-2">
                            {phone.managerLocation}
                          </td>
                          <td className="px-6 border-r py-2">
                            {phone.managerName}
                          </td>

                          <td className="px-6 py-2 flex flex-col md:flex-row items-center md:space-x-5 space-y-2 md:space-y-0">
                            <button
                              aria-label={`Analyze ${phone.name}`}
                              className="flex flex-row justify-center  items-center gap-2 px-2 py-1 rounded-xl border text-black border-amber-500 hover:bg-amber-300">
                              <BiEdit />
                              Reasign
                            </button>

                            <button
                              aria-label={`Analyze ${phone.name}`}
                              className="flex flex-row justify-center items-center w-20 gap-2 px-2 py-1 rounded-xl border text-black border-green-500 hover:bg-green-300">
                              <BiCartAdd />
                              Sale
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
                show === "active" ? activePhones?.total : suspendedPhones?.total
              }
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </div>
      </div>
      <NewPhone showAddPhone={showAddPhone} setShowAddPhone={setShowAddPhone} />
    </div>
  );
};

export default AdminInventory;
