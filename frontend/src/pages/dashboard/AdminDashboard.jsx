import { RxAvatar } from "react-icons/rx";
import { IoArrowUpSharp } from "react-icons/io5";
import { FaArrowDown } from "react-icons/fa6";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { fetchPhoneSummaries } from "../../services/services";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";

const AdminDashboard = () => {
  const token = useSelector((state) => state.userSlice.user.token);

  const { data: phoneSummaries } = useQuery(
    ["phones"],
    ({ queryKey, signal }) => fetchPhoneSummaries({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  const highestSales = Math.max(
    ...(phoneSummaries?.topManagers?.map((manager) => manager.totalIncome) || [
      0,
    ])
  );

  const stats = [
    {
      name: "Phones Sold",
      value: phoneSummaries?.soldThisMonth?.total,
      percentage: phoneSummaries?.soldThisMonth?.percentagePhonesSold,
    },
    {
      name: "Total Income",
      value: phoneSummaries?.soldThisMonth?.totalIncome,
      percentage: phoneSummaries?.soldThisMonth?.percentageIncome,
    },
    {
      name: "Total Profits",
      value: phoneSummaries?.soldThisMonth?.totalProfit,
      percentage: phoneSummaries?.soldThisMonth?.percentageProfit,
    },
    {
      name: "Mangers' Commission",
      value: phoneSummaries?.soldThisMonth?.totalCommission,
      percentage: phoneSummaries?.soldThisMonth?.percentageCommission,
    },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between bg-slate-50 h-[calc(100vh-72px)] p-5 space-y-5 md:space-y-0 md:space-x-5">
      <div className="flex-1 space-y-5">
        <div>
          <p className="text-2xl font-bold">Dashboard</p>
          <p className="text-gray-500">Here is a monthly dashboard overview</p>
        </div>
        {/* Updated cards container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((item, index) => (
            <div
              className="bg-white p-5 rounded-md shadow-sm border space-y-3 cursor-pointer hover:shadow-md transition-shadow min-w-[200px] flex-1"
              key={index}>
              <p className="text-md text-gray-500">{item.name}</p>
              <p className="text-lg font-bold">
                {item.name !== "Phones Sold" && "Ksh"}
                {item?.value?.toLocaleString()}
              </p>
              <div className="flex items-center space-x-2">
                <p
                  className={`flex items-center ${
                    item?.percentage?.startsWith("+") ||
                    Number(item.percentage) >= 0
                      ? "bg-green-100 text-green-500"
                      : "bg-red-100 text-red-500"
                  } px-2 py-1 rounded-sm text-sm`}>
                  {item.percentage?.startsWith("+") ? (
                    <IoArrowUpSharp className="mr-1" />
                  ) : (
                    <FaArrowDown className="mr-1" />
                  )}

                  {item.percentage}
                </p>
                <p className="text-sm text-gray-500">Than last month</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white shadow-sm rounded-md border p-2 md:p-5">
          <p className="font-bold text-lg mb-5">Company Sales Performance</p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={phoneSummaries?.dailySales}
              margin={{ top: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Muchami"
                stroke="#F59E0B"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Shuhari"
                stroke="#22C55E"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="w-full md:w-[400px] lg:w-[500px] space-y-5">
        <div className="bg-white shadow-sm rounded-md border p-5">
          <p className="font-bold text-lg mb-5">Overall Top Managers</p>
          {phoneSummaries?.topManagers
            .sort((a, b) => b.totalIncome - a.totalIncome)
            .map((manager, index) => {
              const salesPercentage =
                (manager.totalIncome / highestSales) * 100;
              return (
                <div
                  key={index}
                  className="group flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer relative">
                  <RxAvatar size={30} className="text-gray-700" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-800 font-medium capitalize">
                        {manager.name}
                      </p>
                      <p className="text-gray-600">
                        ksh {manager.totalIncome?.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-2 bg-amber-300 rounded-md w-full mt-1">
                      <div
                        className="h-full bg-green-500 rounded-md transition-all duration-500"
                        style={{ width: `${salesPercentage}%` }}></div>
                    </div>
                  </div>
                  <div className="absolute -top-8 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {manager.region} region
                  </div>
                </div>
              );
            })}
        </div>
        <div className="bg-white shadow-sm rounded-md border p-5">
          <p className="font-bold text-lg mb-5">Regional Sales Performance</p>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart outerRadius={150} data={phoneSummaries?.regionSales}>
              <PolarGrid />
              <PolarAngleAxis dataKey="region" />
              <PolarRadiusAxis angle={30} domain={[0, 5000]} />
              <Radar
                name="Sales"
                dataKey="sales"
                stroke="#F59E0B"
                fill="#22C55E"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
