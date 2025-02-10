import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  declarePhoneReconciled,
  fetchSoldPhones,
} from "../../services/services";
import DateRangePicker from "../../components/DatePicker";
import dayjs from "dayjs";
import { HiOutlineDownload } from "react-icons/hi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { IoCheckmarkDone } from "react-icons/io5";

const AdminSales = () => {
  const token = useSelector((state) => state.userSlice.user.token);
  const [searchQuery, setSearchQuery] = useState("");
  const [company, setcompany] = useState("shuhari");
  const queryClient = useQueryClient();
  const today = dayjs().endOf("day");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [declareLostLoading, setDeclareLostLoading] = useState(false);
  const user = useSelector((state) => state.userSlice.user.user);

  // Function to generate and download Excel file
  const handleDownload = () => {
    if (!filteredPhones?.length) return; // Exit if no data is available

    // Calculate totals
    const totalBuyingPrice = filteredPhones.reduce(
      (total, phone) => total + (parseFloat(phone.purchasePrice) || 0),
      0
    );
    const totalSellingPrice = filteredPhones.reduce(
      (total, phone) => total + (parseFloat(phone.sellingPrice) || 0),
      0
    );
    const totalGrossProfit = filteredPhones.reduce(
      (total, phone) =>
        total +
          (parseFloat(phone.sellingPrice) - parseFloat(phone.purchasePrice)) ||
        0,
      0
    );
    const totalAgentCommission = filteredPhones.reduce(
      (total, phone) => total + (parseFloat(phone.agentCommission) || 0),
      0
    );
    const totalNetProfit = filteredPhones.reduce(
      (total, phone) =>
        total +
        (parseFloat(phone.sellingPrice) -
          parseFloat(phone.purchasePrice) -
          (parseFloat(phone.agentCommission) || 0)),
      0
    );

    // Add a totals row at the end of the data
    const dataWithTotal = [
      ...filteredPhones.map((phone, index) => ({
        "#": index + 1,
        Company: phone.company,
        Manager: phone.managerName,
        Location: phone.managerLocation,
        Model: phone.modelName,
        IMEI: phone.imei,
        Supplier: phone.supplierName,
        "Buying Price (Ksh)": parseFloat(phone.purchasePrice) || 0,
        "Selling Price (Ksh)": parseFloat(phone.sellingPrice) || 0,
        "Gross Profit (Ksh)":
          parseFloat(phone.sellingPrice) - parseFloat(phone.purchasePrice) || 0,
        "Agent Commission (Ksh)": parseFloat(phone.agentCommission) || 0,
        "Net Profit (Ksh)":
          parseFloat(phone.sellingPrice) -
            parseFloat(phone.purchasePrice) -
            (parseFloat(phone.agentCommission) || 0) || 0,
      })),
      {
        "#": "Total",
        Company: "",
        Manager: "",
        Location: "",
        Model: "",
        IMEI: "",
        Supplier: "",
        "Buying Price (Ksh)": totalBuyingPrice,
        "Selling Price (Ksh)": totalSellingPrice,
        "Gross Profit (Ksh)": totalGrossProfit,
        "Agent Commission (Ksh)": totalAgentCommission,
        "Net Profit (Ksh)": totalNetProfit,
      },
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
      fetchSoldPhones({
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

  const useDeclarePhoneReconciled = () => {
    return useMutation(
      ({ phoneId, token }) => declarePhoneReconciled(phoneId, token),
      {
        onMutate: () => {
          setDeclareLostLoading(true);
        },
        onSuccess: () => {
          setDeclareLostLoading(false);

          queryClient.invalidateQueries(["phones"]);

          toast.success("Sale reconciled");
        },
        onError: (error) => {
          setDeclareLostLoading(false);
          toast.error(error.message || "Failed to reconcile sale");
        },
      }
    );
  };

  const declareReconciledMutation = useDeclarePhoneReconciled();

  const declareReconciledPhone = (phoneId) => {
    declareReconciledMutation.mutate({ phoneId, token });
  };

  return (
    <div className="p-5">
      <div className="">
        <div className="space-y-2">
          <p className="text-xl font-bold">Sales</p>
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
          />
          <div className="flex flex-col md:flex-row md:items-center md:space-x-2 md:pt-5">
            <TextField
              id="outlined-search"
              label="Search phone..."
              variant="outlined"
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
                  onChange={(e) => setcompany(e.target.value)}>
                  <FormControlLabel
                    value="shuhari"
                    control={<Radio />}
                    label="Shuhari"
                  />
                  <FormControlLabel
                    value="muchami"
                    control={<Radio />}
                    label="Muchami"
                  />
                  <FormControlLabel
                    value="combined"
                    control={<Radio />}
                    label="Combined"
                  />
                </RadioGroup>
              </FormControl>
              {user.role !== "manager" && (
                <div
                  className="p-2 hover:bg-neutral-200 rounded-full cursor-pointer transition-all duration-300 ease-in-out"
                  onClick={handleDownload}>
                  <HiOutlineDownload
                    size={25}
                    className="text-gray-500 hover:text-gray-700 transition-all duration-300 ease-in-out"
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
            <div className="max-h-[57vh]  overflow-y-auto " id="scrollableDiv">
              <table className="w-full text-sm text-left text-gray-500 sticky top-0 z-10">
                <thead className="text-xs text-gray-700 uppercase bg-neutral-100 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-2 border-r py-2">
                      #
                    </th>
                    {company === "combined" && (
                      <th
                        scope="col"
                        className="px-2 border-r text-[14px] normal-case py-2">
                        Company
                      </th>
                    )}
                    <th
                      scope="col"
                      className="px-2 border-r text-[14px] normal-case py-2">
                      Manger
                    </th>
                    <th
                      scope="col"
                      className="px-6 border-r text-[14px] normal-case py-2">
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-6 border-r text-[14px] normal-case py-2">
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
                    {user.role !== "manager" && (
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Buying Price (Ksh)
                      </th>
                    )}
                    <th
                      scope="col"
                      className="px-6 border-r text-[14px] normal-case py-2">
                      Selling Price (Ksh)
                    </th>
                    {user.role !== "manager" && (
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Gross Profit (Ksh)
                      </th>
                    )}

                    <th
                      scope="col"
                      className="px-6 border-r text-[14px] normal-case py-2">
                      Agent Commission (Ksh)
                    </th>
                    {user.role !== "manager" && (
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Net Profit (Ksh)
                      </th>
                    )}
                    {user?.role !== "manager" && show === "sold" && (
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Reconcile
                      </th>
                    )}
                  </tr>
                </thead>
                {isLoading ? (
                  <p className="p-2">Fetching sales data...</p>
                ) : isError || paginatedPhones?.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan="9" className="px-4 pt-2">
                        <p className="text-gray-500">
                          No sales found or error fetching data.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {paginatedPhones?.map((phone, index) => {
                      const grossProfit =
                        phone.sellingPrice - phone.purchasePrice;
                      const netProfit =
                        grossProfit - (phone.agentCommission || 0);

                      return (
                        <tr
                          key={phone.id}
                          className={`bg-white border-b hover:bg-blue-50 cursor-pointer`}>
                          <td className="px-2 py-2 border-r font-medium text-gray-900">
                            {index + 1}
                          </td>
                          {company === "combined" && (
                            <td className="px-2 border-r py-2 capitalize">
                              {phone.company}
                            </td>
                          )}
                          <td className="px-2 border-r py-2 capitalize">
                            {phone.managerName}
                          </td>
                          <td className="px-6 border-r py-2 capitalize">
                            {phone.managerLocation}
                          </td>
                          <td className="px-6 border-r py-2 capitalize">
                            {phone.modelName}
                          </td>
                          <td className="px-6 border-r py-2">{phone.imei}</td>
                          <td className="px-6 border-r py-2">
                            {phone.supplierName}
                          </td>
                          {user.role !== "manager" && (
                            <td className="px-6 border-r py-2">
                              {phone.purchasePrice.toLocaleString()}
                            </td>
                          )}
                          <td className="px-6 border-r py-2">
                            {phone.sellingPrice.toLocaleString()}
                          </td>
                          {user.role !== "manager" && (
                            <td className="px-6 border-r py-2">
                              {grossProfit.toLocaleString()}
                            </td>
                          )}

                          <td className="px-6 border-r py-2 capitalize">
                            {phone.agentCommission}
                          </td>
                          {user.role !== "manager" && (
                            <td className="px-6 border-r py-2">
                              {netProfit.toLocaleString()}
                            </td>
                          )}

                          {user.role !== "manager" && show === "sold" && (
                            <td className="px-6 border-r py-2 capitalize">
                              <button
                                onClick={() => declareReconciledPhone(phone.id)}
                                aria-label={`Analyze ${phone?.name}`}
                                className="flex flex-row justify-center items-center text w-20 gap-2 p-1 rounded-xl border text-black border-green-500 hover:bg-green-300">
                                <IoCheckmarkDone className="text-green-500" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100 font-bold text-gray-900 sticky bottom-0 z-10 border-t">
                      <td
                        className="px-2 py-2 border-r text-center"
                        colSpan={company === "combined" ? 7 : 6}>
                        Totals
                      </td>
                      {user.role !== "manager" && (
                        <td className="px-6 border-r py-2">
                          {paginatedPhones
                            .reduce(
                              (acc, phone) => acc + phone.purchasePrice,
                              0
                            )
                            .toLocaleString()}
                        </td>
                      )}
                      <td className="px-6 border-r py-2">
                        {paginatedPhones
                          .reduce((acc, phone) => acc + phone.sellingPrice, 0)
                          .toLocaleString()}
                      </td>
                      {user.role !== "manager" && (
                        <td className="px-6 border-r py-2">
                          {paginatedPhones
                            .reduce(
                              (acc, phone) =>
                                acc +
                                (phone.sellingPrice - phone.purchasePrice),
                              0
                            )
                            .toLocaleString()}
                        </td>
                      )}

                      <td className="px-6 border-r py-2">
                        {paginatedPhones
                          .reduce(
                            (acc, phone) =>
                              acc + (parseFloat(phone.agentCommission) || 0),
                            0
                          )
                          .toLocaleString()}
                      </td>
                      {user.role !== "manager" && (
                        <td className="px-6 py-2 border-r">
                          {paginatedPhones
                            .reduce(
                              (acc, phone) =>
                                acc +
                                (phone.sellingPrice -
                                  phone.purchasePrice -
                                  (phone.agentCommission || 0)),
                              0
                            )
                            .toLocaleString()}
                        </td>
                      )}

                      {user.role !== "manager" && show === "sold" && (
                        <td className="px-2 py-2 border-r text-center"></td>
                      )}
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSales;
