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
  revertSale,
} from "../../services/services";
import DateRangePicker from "../../components/DatePicker";
import dayjs from "dayjs";
import { HiOutlineDownload } from "react-icons/hi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { IoCheckmarkDone } from "react-icons/io5";
import { FaUndoAlt } from "react-icons/fa";
import DeleteConfirmationModal from "../../components/DeleteModal";
import { FiPrinter } from "react-icons/fi";
import ReceiptTemplate from "../../components/ReceiptTemplate";

const AdminSales = () => {
  const token = useSelector((state) => state.userSlice.user.token);
  const [searchQuery, setSearchQuery] = useState("");
  const [company, setcompany] = useState("shuhari");
  const queryClient = useQueryClient();
  const today = dayjs().endOf("day");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [revertSaleLoading, setRevertSaleLoading] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [revertPhoneId, setRevertPhoneId] = useState(null);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [reconcilePhoneId, setReconcilePhoneId] = useState(null);
  const [declareLostLoading, setDeclareLostLoading] = useState(false);
  const user = useSelector((state) => state.userSlice.user.user);
  const [receiptPhone, setReceiptPhone] = useState(null);
  const [showDownLoadReceiptModal, setShowDownLoadReceiptModal] =
    useState(false);

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
        (parseFloat(phone.sellingPrice) - parseFloat(phone.purchasePrice) || 0),
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
          Company: phone.company,
          Manager: phone.managerName,
          Location: phone.managerLocation,
          Model: phone.modelName,
          IMEI: phone.imei,
          Supplier: phone.supplierName,
          "Buying Price (Ksh)": parseFloat(phone.purchasePrice) || 0,
          "Selling Price (Ksh)": parseFloat(phone.sellingPrice) || 0,
          "Gross Profit (Ksh)":
            parseFloat(phone.sellingPrice) - parseFloat(phone.purchasePrice) ||
            0,
          "Agent Commission (Ksh)": parseFloat(phone.agentCommission) || 0,
          "Net Profit (Ksh)":
            parseFloat(phone.sellingPrice) -
              parseFloat(phone.purchasePrice) -
              (parseFloat(phone.agentCommission) || 0) || 0,
          "Receipt Number": parseFloat(phone.rcpNumber) || 0,
        };

        // If show === "reconcile", include formatted saleDate and reconcileDate
        if (show === "reconcile") {
          row["Sale Date"] = safeFormatDate(phone.saleDate);
          row["Reconcile Date"] = safeFormatDate(phone.reconcileDate);
        }

        return row;
      }),
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
        ...(show === "reconcile" && { "Sale Date": "", "Reconcile Date": "" }), // Empty totals for new columns
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

  const useRevertSale = () => {
    return useMutation(({ phoneId, token }) => revertSale(phoneId, token), {
      onMutate: () => {
        setRevertSaleLoading(true);
      },
      onSuccess: () => {
        setRevertSaleLoading(false);
        queryClient.invalidateQueries(["phones"]);
        toast.success("Phone sale successfully reverted");
      },
      onError: (error) => {
        setRevertSaleLoading(false);
        toast.error(error.message || "Failed to revert phone sale");
      },
    });
  };

  const revertSaleMutation = useRevertSale();

  const handleRevertPhone = (phone) => {
    setRevertPhoneId(phone);
    setShowRevertModal(true);
  };

  const handleRevert = () => {
    if (revertPhoneId) {
      revertSaleMutation.mutate({ phoneId: revertPhoneId, token });
    }
    setShowRevertModal(false);
  };

  const handleReconcilePhone = (phone) => {
    setReconcilePhoneId(phone);
    setShowReconcileModal(true);
  };

  const handleReconcile = () => {
    if (reconcilePhoneId) {
      declareReconciledMutation.mutate({
        phoneId: reconcilePhoneId,
        token,
      });
    }
    setShowRevertModal(false);
  };

  const handleReceiptDownload = (phone) => {
    setReceiptPhone(phone);
    setShowDownLoadReceiptModal(true);
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
                      className="px-2 border-r text-[14px] normal-case py-2 min-w-28">
                      Sale Date
                    </th>
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
                    {user?.role !== "manager" && show === "reconcile" && (
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Sale Date
                      </th>
                    )}
                    {user?.role !== "manager" && show === "reconcile" && (
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Reconcile Date
                      </th>
                    )}
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
                    {user.role !== "manager" && (
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Gross Profit
                      </th>
                    )}

                    <th
                      scope="col"
                      className="px-6 border-r text-[14px] normal-case py-2">
                      Agent Commission
                    </th>
                    {user.role !== "manager" && (
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Net Profit
                      </th>
                    )}

                    {show === "sold" && (
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Actions
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
                            {formatDate(new Date(phone.saleDate))}
                          </td>
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
                          {user.role !== "manager" && show === "reconcile" && (
                            <td className="px-6 border-r py-2">
                              {formatDate(new Date(phone.saleDate))}
                            </td>
                          )}
                          {user.role !== "manager" && show === "reconcile" && (
                            <td className="px-6 border-r py-2">
                              {formatDate(new Date(phone.reconcileDate))}
                            </td>
                          )}
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
                          {user.role && show === "sold" && (
                            <td className="px-6 py-2 flex flex-col md:flex-row items-center md:space-x-5 space-y-2 md:space-y-0 ">
                              {user.role === "super admin" && (
                                <button
                                  onClick={() => handleRevertPhone(phone.id)}
                                  aria-label={`Analyze ${phone?.name}`}
                                  className="flex flex-row justify-center items-center w-28  gap-2 p-1 rounded-xl border text-black border-amber-500 hover:bg-amber-300">
                                  <FaUndoAlt
                                    className="text-amber-500"
                                    size={10}
                                  />
                                  Revert
                                </button>
                              )}
                              {(user.role === "admin" ||
                                user.role === "super admin") && (
                                <button
                                  onClick={() => handleReconcilePhone(phone.id)}
                                  aria-label={`Analyze ${phone?.name}`}
                                  className="flex flex-row justify-center items-center w-28 text gap-2 p-1 rounded-xl border text-black border-green-500 hover:bg-green-300">
                                  <IoCheckmarkDone className="text-green-500" />
                                  Reconcile
                                </button>
                              )}
                              <button
                                onClick={() => handleReceiptDownload(phone)}
                                aria-label={`Analyze ${phone?.name}`}
                                className="flex flex-row justify-center items-center w-28 text gap-2 p-1 rounded-xl border text-black border-blue-500 hover:bg-blue-300">
                                <FiPrinter className="text-blue-500" />
                                Receipt
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100 font-bold text-gray-900 sticky bottom-0 z-10 border-t">
                      <td
                        className="px-2 py-2 border-r text-center"
                        colSpan={
                          company === "combined"
                            ? show === "reconcile"
                              ? 10
                              : 8
                            : show === "reconcile"
                            ? 9
                            : 7
                        }>
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

                      {show === "sold" && (
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
      <DeleteConfirmationModal
        action="Revert"
        showDeleteModal={showRevertModal}
        onClose={() => setShowRevertModal(false)}
        onDelete={handleRevert}
        admin={revertPhoneId}
        title={`Confirm Action!`}
        message="All the sales data for this phone will be lost"
      />
      <DeleteConfirmationModal
        action="Reconcile"
        showDeleteModal={showReconcileModal}
        onClose={() => setShowReconcileModal(false)}
        onDelete={handleReconcile}
        admin={reconcilePhoneId}
        title={`Confirm Action!`}
        message="Phone will be moved to reconciled"
      />
      <ReceiptTemplate
        phone={receiptPhone}
        setShowDownLoadReceiptModal={setShowDownLoadReceiptModal}
        showDownLoadReceiptModal={showDownLoadReceiptModal}
      />
    </div>
  );
};

export default AdminSales;
