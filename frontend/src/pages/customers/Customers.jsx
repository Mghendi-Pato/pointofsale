import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "react-query";
import { fetchCustomerInformation } from "../../services/services";
import DateRangePicker from "../../components/DatePicker";
import dayjs from "dayjs";
import { HiOutlineDownload } from "react-icons/hi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

// Skeleton components
const SkeletonPulse = () => (
  <div className="animate-pulse bg-gray-200 rounded-md h-full w-full" />
);

const TableSkeletonRow = ({ userRole }) => {
  return (
    <tr className="bg-white border-b">
      <td className="px-2 py-3 border-r">
        <div className="h-4 w-4">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-2 py-3 border-r">
        <div className="h-4 w-28">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-2 py-3 border-r">
        <div className="h-4 w-20">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-2 py-3 border-r">
        <div className="h-4 w-28">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-28">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-28">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-32">
          <SkeletonPulse />
        </div>
      </td>
      {userRole !== "manager" && (
        <td className="px-6 py-3 border-r">
          <div className="h-4 w-24">
            <SkeletonPulse />
          </div>
        </td>
      )}
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-20">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-16">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-16">
          <SkeletonPulse />
        </div>
      </td>
      {userRole !== "manager" && (
        <td className="px-6 py-3 border-r">
          <div className="h-4 w-24">
            <SkeletonPulse />
          </div>
        </td>
      )}
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-24">
          <SkeletonPulse />
        </div>
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
            <th
              scope="col"
              className="px-2 border-r text-[14px] normal-case py-2 min-w-28">
              Customer
            </th>
            <th
              scope="col"
              className="px-2 border-r text-[14px] normal-case py-2 min-w-28">
              ID
            </th>
            <th
              scope="col"
              className="px-2 border-r text-[14px] normal-case py-2">
              Phn
            </th>
            <th
              scope="col"
              className="px-6 border-r text-[14px] normal-case py-2">
              N.K Name
            </th>
            <th
              scope="col"
              className="px-6 border-r text-[14px] normal-case py-2">
              N.K Phn
            </th>
            <th
              scope="col"
              className="px-6 border-r text-[14px] normal-case py-2">
              IMEI
            </th>
            {userRole !== "manager" && (
              <th
                scope="col"
                className="px-6 border-r text-[14px] normal-case py-2">
                Sale Date
              </th>
            )}
            <th
              scope="col"
              className="px-6 border-r text-[14px] normal-case py-2">
              Model
            </th>
            <th
              scope="col"
              className="px-6 border-r text-[14px] normal-case py-2">
              Capacity
            </th>
            <th
              scope="col"
              className="px-6 border-r text-[14px] normal-case py-2">
              RAM
            </th>
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

const Customers = () => {
  const token = useSelector((state) => state.userSlice.user.token);
  const [searchQuery, setSearchQuery] = useState("");
  const [company, setcompany] = useState("shuhari");
  const queryClient = useQueryClient();
  const today = dayjs().endOf("day");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const user = useSelector((state) => state.userSlice.user.user);
  const navigate = useNavigate();

  // Function to generate and download Excel file
  const handleDownload = () => {
    if (!filteredPhones?.length) return; // Exit if no data is available

    // Function to safely format dates
    const safeFormatDate = (date) => {
      if (!date) return ""; // Return empty string if date is missing
      const parsedDate = new Date(date);
      return isNaN(parsedDate) ? "" : formatDate(parsedDate);
    };

    // Add a totals row at the end of the data
    const dataWithTotal = [
      ...filteredPhones.map((phone, index) => {
        const row = {
          "#": index + 1,
          IMEI: phone?.imei,
          Model: phone?.modelName,
          Capacity: phone?.capacity,
          RAM: phone?.ram,
          "Buying Price": phone?.purchasePrice,
          "Selling Price": phone?.sellingPrice,
          "Purchase Date": safeFormatDate(phone?.buyDate),
          "Sale Date": safeFormatDate(phone?.saleDate),
          Supplier: phone?.supplierName,
          Manager: phone?.managerName,
          "Agent Commission": phone?.agentCommission,
          Company: phone?.company,
          Location: phone?.managerLocation,
          Customer: phone?.customerName,
          "Customer ID": phone?.customerID,
          "Customer Phone": phone?.customerPhn,
          "Next of Kin": phone?.nkName,
          "Next of Kin Phone": phone?.nkPhn,
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

  const [show, setShow] = useState("sold");

  const isQueryEnabled =
    company !== undefined &&
    startDate !== undefined &&
    endDate !== undefined &&
    !!token;

  const {
    data: phonesData,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    ["phones", { company, startDate, endDate, show }],
    () =>
      fetchCustomerInformation({
        company,
        startDate,
        endDate,
        token,
        status: show,
      }),
    {
      enabled: isQueryEnabled,
      onSuccess: (data) => {
        queryClient.setQueryData(
          ["phones", { company, startDate, endDate, show }],
          data
        );
      },
      onError: (error) => {
        console.error(`Error fetching ${show} phones:`, error.message);
      },
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (isQueryEnabled) {
      refetch();
    }
  }, [company, startDate, endDate, refetch, isQueryEnabled, show]);

  const filteredPhones = useMemo(() => {
    const dataToFilter = phonesData;
    return dataToFilter?.filter((phone) =>
      searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((part) =>
          [
            phone?.modelName?.toLowerCase() || "",
            phone?.customerName?.toLowerCase() || "",
            phone?.customerID?.toLowerCase() || "",
            phone?.customerPhn?.toLowerCase() || "",
            phone?.nkName?.toLowerCase() || "",
            phone?.nkPhn?.toLowerCase() || "",
            phone?.nkPhn?.toLowerCase() || "",
            phone?.imei || "",
            phone?.supplierName?.toLowerCase() || "",
            phone?.managerName?.toLowerCase() || "",
            phone?.managerLocation?.toLowerCase() || "",
          ].some((field) => field.includes(part))
        )
    );
  }, [searchQuery, phonesData]);

  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  const paginatedPhones = filteredPhones;

  const handleDateChange = (startDate, endDate) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

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

  useEffect(() => {
    if (!["super admin", "admin"].includes(user?.role)) {
      navigate("/inventory");
    }
  }, [user, navigate]);

  return (
    <div className="p-5">
      <div className="">
        <div className="space-y-2">
          <p className="text-xl font-bold">Customer Data</p>
          <div className="flex flex-row items-center w-[66%]">
            <div
              className={`p-2 py-3 text-sm font-roboto font-bold w-[50%] md:w-36 text-center cursor-pointer ${
                show === "sold" ? "bg-primary-400" : "text-gray-600"
              }`}
              onClick={() => setShow("sold")}>
              Sold
            </div>
            <div
              className={`p-2 py-3 text-sm font-roboto font-bold w-[50%] md:w-36 text-center cursor-pointer ${
                show === "reconcile" ? "bg-primary-400" : "text-gray-600"
              }`}
              onClick={() => setShow("reconcile")}>
              Reconciled
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between py-2 border ">
          <DateRangePicker
            onDateChange={handleDateChange}
            setToDate={setStartDate}
            setFromDate={setEndDate}
            toDate={endDate}
            fromDate={startDate}
            disabled={isLoading}
          />
          <div className="flex flex-col md:flex-row md:items-center md:space-x-2 md:pt-5">
            <TextField
              id="outlined-search"
              label="Search phone..."
              variant="outlined"
              disabled={isLoading}
              sx={{
                minWidth: { xs: "320px", md: "330px" },
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
              {user.role !== "manager" && (
                <div
                  className={`p-2 ${
                    isLoading
                      ? "text-gray-400"
                      : "hover:bg-neutral-200 cursor-pointer text-gray-500 hover:text-gray-700"
                  } rounded-full transition-all duration-300 ease-in-out`}
                  onClick={isLoading ? undefined : handleDownload}>
                  <HiOutlineDownload
                    size={25}
                    className={
                      isLoading
                        ? "text-gray-400"
                        : "transition-all duration-300 ease-in-out"
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border border-gray-200">
        <div className="">
          <div className="overflow-x-auto">
            <div className="max-h-[57vh] overflow-y-auto" id="scrollableDiv">
              {isLoading ? (
                <TableSkeleton userRole={user.role} />
              ) : (
                <table className="w-full text-sm text-left text-gray-500 sticky top-0 z-10">
                  <thead className="text-xs text-gray-700 uppercase bg-neutral-100 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-2 border-r py-2">
                        #
                      </th>
                      <th
                        scope="col"
                        className="px-2 border-r text-[14px] normal-case py-2 min-w-28">
                        Customer
                      </th>
                      <th
                        scope="col"
                        className="px-2 border-r text-[14px] normal-case py-2 min-w-28">
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-2 border-r text-[14px] normal-case py-2">
                        Phn
                      </th>
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        N.K Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        N.K Phn
                      </th>
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        IMEI
                      </th>
                      {user.role !== "manager" && (
                        <th
                          scope="col"
                          className="px-6 border-r text-[14px] normal-case py-2">
                          Sale Date
                        </th>
                      )}
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Model
                      </th>

                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Capacity
                      </th>
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        RAM
                      </th>
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
                    </tr>
                  </thead>
                  {isError ||
                  !paginatedPhones ||
                  paginatedPhones.length === 0 ? (
                    <tbody>
                      <tr>
                        <td
                          colSpan={user.role !== "manager" ? 13 : 11}
                          className="px-4 py-8 text-center">
                          <p className="text-gray-500">
                            {isError
                              ? "Error fetching data. Please try again."
                              : "No customer data found for the selected criteria."}
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {paginatedPhones.map((phone, index) => {
                        return (
                          <tr
                            key={phone.id}
                            className={`bg-white border-b hover:bg-blue-50 cursor-pointer`}>
                            <td className="px-2 py-2 border-r font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-2 border-r py-2 capitalize">
                              {phone?.customerName}
                            </td>
                            <td className="px-2 border-r py-2 capitalize">
                              {phone?.customerID}
                            </td>
                            <td className="px-2 border-r py-2 capitalize">
                              {phone?.customerPhn}
                            </td>
                            <td className="px-2 border-r py-2 capitalize">
                              {phone?.nkName}
                            </td>
                            <td className="px-2 border-r py-2 capitalize">
                              {phone?.nkPhn}
                            </td>
                            <td className="px-2 border-r py-2 capitalize">
                              {phone?.imei}
                            </td>
                            {user.role !== "manager" && (
                              <td className="px-2 border-r py-2 capitalize">
                                {formatDate(new Date(phone.saleDate))}
                              </td>
                            )}
                            <td className="px-2 border-r py-2 capitalize">
                              {phone?.modelName}
                            </td>
                            <td className="px-2 border-r py-2 capitalize">
                              {phone?.capacity}
                            </td>
                            <td className="px-2 border-r py-2 capitalize">
                              {phone?.ram} GB
                            </td>
                            {user.role !== "manager" && (
                              <td className="px-2 border-r py-2 capitalize">
                                {phone?.purchasePrice}
                              </td>
                            )}
                            <td className="px-2 border-r py-2 capitalize">
                              {phone?.sellingPrice}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  )}
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
