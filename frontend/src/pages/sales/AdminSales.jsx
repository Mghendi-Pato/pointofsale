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
import { fetchSoldPhones } from "../../services/services";
import DateRangePicker from "../../components/DatePicker";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const AdminSales = () => {
  const token = useSelector((state) => state.userSlice.user.token);
  const [searchQuery, setSearchQuery] = useState("");
  const [company, setcompany] = useState("shuhari");
  const queryClient = useQueryClient();
  const today = dayjs().endOf("day");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const navigate = useNavigate();

  const isQueryEnabled =
    company !== undefined && startDate !== undefined && endDate !== undefined;
  const {
    data: soldPhonesData,
    isLoading: isLoadingSoldPhones,
    isError: isErrorSoldPhones,
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
      enabled: !!token,
      onSuccess: (data) => {
        queryClient.setQueryData(
          ["phones", { company, startDate, endDate }],
          data
        );
      },
      onError: (error) => {
        console.error("Error fetching sold phones:", error.message);
      },
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (isQueryEnabled) {
      refetch();
    }
  }, [company, startDate, endDate, refetch, isQueryEnabled]);

  const filteredPhones = useMemo(() => {
    const dataToFilter = soldPhonesData;
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
  }, [searchQuery, soldPhonesData]);

  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  const paginatedPhones = filteredPhones;

  const handleDateChange = (startDate, endDate) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  return (
    <div className="p-5">
      <div className="space-y-2">
        <div>
          <p className="text-xl font-bold">Sales</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between py-2 ">
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
              </RadioGroup>
            </FormControl>
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
                    <th
                      scope="col"
                      className="px-6 border-r text-[14px] normal-case py-2">
                      Buying Price (Ksh)
                    </th>
                    <th
                      scope="col"
                      className="px-6 border-r text-[14px] normal-case py-2">
                      Selling Price (Ksh)
                    </th>
                    <th
                      scope="col"
                      className="px-6 border-r text-[14px] normal-case py-2">
                      Gross Profit (Ksh)
                    </th>
                    <th
                      scope="col"
                      className="px-6 border-r text-[14px] normal-case py-2">
                      Agent Commission (Ksh)
                    </th>
                    <th
                      scope="col"
                      className="px-6 text-[14px] normal-case py-2">
                      Net Profit (Ksh)
                    </th>
                  </tr>
                </thead>
                {isLoadingSoldPhones ? (
                  <p className="p-2">Fetching sales data...</p>
                ) : isErrorSoldPhones || paginatedPhones?.length === 0 ? (
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
                        grossProfit - (phone.managerCommission || 0);

                      return (
                        <tr
                          key={phone.id}
                          onClick={() => navigate(`/phone/${phone.imei}`)}
                          className={`bg-white border-b hover:bg-blue-50 cursor-pointer`}>
                          <td className="px-2 py-2 border-r font-medium text-gray-900">
                            {index + 1}
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
                          <td className="px-6 border-r py-2">
                            {phone.purchasePrice.toLocaleString()}
                          </td>
                          <td className="px-6 border-r py-2">
                            {phone.sellingPrice.toLocaleString()}
                          </td>
                          <td className="px-6 border-r py-2">
                            {grossProfit.toLocaleString()}
                          </td>
                          <td className="px-6 border-r py-2 capitalize">
                            {phone.managerCommission}
                          </td>
                          <td className="px-6 py-2 flex flex-col md:flex-row items-center md:space-x-5 space-y-2 md:space-y-0">
                            <td className="px-6 py-2">
                              {netProfit.toLocaleString()}
                            </td>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100 font-bold text-gray-900 sticky bottom-0 z-10 border-t">
                      <td
                        className="px-2 py-2 border-r text-center"
                        colSpan="6">
                        Totals
                      </td>
                      <td className="px-6 border-r py-2">
                        {paginatedPhones
                          .reduce((acc, phone) => acc + phone.purchasePrice, 0)
                          .toLocaleString()}
                      </td>
                      <td className="px-6 border-r py-2">
                        {paginatedPhones
                          .reduce((acc, phone) => acc + phone.sellingPrice, 0)
                          .toLocaleString()}
                      </td>
                      <td className="px-6 border-r py-2">
                        {paginatedPhones
                          .reduce(
                            (acc, phone) =>
                              acc + (phone.sellingPrice - phone.purchasePrice),
                            0
                          )
                          .toLocaleString()}
                      </td>
                      <td className="px-6 border-r py-2">
                        {paginatedPhones
                          .reduce(
                            (acc, phone) =>
                              acc + (parseFloat(phone.managerCommission) || 0),
                            0
                          )
                          .toLocaleString()}
                      </td>
                      <td className="px-6 py-2">
                        {paginatedPhones
                          .reduce(
                            (acc, phone) =>
                              acc +
                              (phone.sellingPrice -
                                phone.purchasePrice -
                                (phone.managerCommission || 0)),
                            0
                          )
                          .toLocaleString()}
                      </td>
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
