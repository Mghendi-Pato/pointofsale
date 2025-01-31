import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({ onDateChange }) => {
  const today = new Date();
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  return (
    <div className=" bg-white flex items-center flex-row space-x-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          From Date
        </label>
        <div className="mt-1 relative">
          <DatePicker
            selected={fromDate}
            onChange={(date) => {
              setFromDate(date);
              onDateChange(date, toDate);
            }}
            selectsStart
            startDate={fromDate}
            endDate={toDate}
            popperClassName="z-50"
            className="w-full p-2 border border-gray-300"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          To Date
        </label>
        <div className="mt-1 relative">
          <DatePicker
            selected={toDate}
            onChange={(date) => {
              setToDate(date);
              onDateChange(fromDate, date);
            }}
            selectsEnd
            startDate={fromDate}
            endDate={toDate}
            minDate={fromDate}
            className="w-full p-2 border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
