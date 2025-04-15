import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "react-query";

import dayjs from "dayjs";
import { fetchSoldPhones } from "../services/services";
import DateRangePicker from "../components/DatePicker";

const Payments = () => {
  const token = useSelector((state) => state.userSlice.user.token);

  const [company, setcompany] = useState("shuhari");
  const queryClient = useQueryClient();
  const today = dayjs().endOf("day");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

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

  const handleDateChange = (startDate, endDate) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  return (
    <div className="p-5">
      <div className="">
        <div className="space-y-2">
          <p className="text-xl font-bold">Payments</p>
          <div className="flex flex-row items-center w-[66%]">
            <div
              className={`p-2 py-3 text-sm font-roboto font-bold w-[50%] md:w-36 text-center cursor-pointer ${
                show === "sold" ? "bg-primary-400" : "text-gray-600"
              }`}
              onClick={() => setShow("sold")}>
              Invoice
            </div>
            <div
              className={`p-2 py-3 text-sm font-roboto font-bold w-[50%] md:w-36 text-center cursor-pointer ${
                show === "reconcile" ? "bg-primary-400" : "text-gray-600"
              }`}
              onClick={() => setShow("reconcile")}>
              Manage Mangers
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
            </div>
          </div>
        </div>
      </div>
      <div className="border border-gray-200">
        <div className="">
          <div className="overflow-x-auto">
            <div
              className="max-h-[57vh]  overflow-y-auto "
              id="scrollableDiv"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
