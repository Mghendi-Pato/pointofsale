import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const DateRangePicker = ({
  onDateChange,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}) => {
  const today = dayjs().endOf("day");

  // Handle from date change
  const handleFromDateChange = (newDate) => {
    setFromDate(newDate);
    onDateChange(newDate, toDate);
  };

  // Handle to date change
  const handleToDateChange = (newDate) => {
    setToDate(newDate);
    onDateChange(fromDate, newDate);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex flex-col md:flex-row items-center md:space-x-4 bg-white p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <DatePicker
            value={fromDate}
            onChange={handleFromDateChange}
            maxDate={today}
            className="w-full p-2 border border-gray-300"
            sx={{
              minWidth: { xs: "320px", md: "300px" },
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <DatePicker
            value={toDate}
            onChange={handleToDateChange}
            maxDate={today}
            minDate={fromDate}
            className="w-full p-2 border border-gray-300"
            sx={{
              minWidth: { xs: "320px", md: "300px" },
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
          />
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
