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
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  fetchPhonesByRegion,
  fetchPhoneSummaries,
} from "../../services/services";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Switch } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Skeleton components
const SkeletonPulse = () => (
  <div className="animate-pulse bg-gray-200 rounded-md h-full w-full" />
);

const SkeletonStat = () => (
  <div className="bg-white p-5 rounded-md shadow-sm border space-y-3 min-w-[200px] flex-1">
    <div className="h-4 w-24">
      <SkeletonPulse />
    </div>
    <div className="h-6 w-32">
      <SkeletonPulse />
    </div>
    <div className="flex items-center space-x-2">
      <div className="h-6 w-14 rounded-sm">
        <SkeletonPulse />
      </div>
      <div className="h-4 w-28">
        <SkeletonPulse />
      </div>
    </div>
  </div>
);

const SkeletonChart = ({ height = 400 }) => (
  <div style={{ height: `${height}px` }} className="w-full">
    <SkeletonPulse />
  </div>
);

const SkeletonManager = () => (
  <div className="flex items-center space-x-2 p-2">
    <div className="h-8 w-8 rounded-full">
      <SkeletonPulse />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center">
        <div className="h-4 w-24">
          <SkeletonPulse />
        </div>
        <div className="h-4 w-16">
          <SkeletonPulse />
        </div>
      </div>
      <div className="h-2 rounded-md w-full mt-2">
        <SkeletonPulse />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const token = useSelector((state) => state.userSlice.user.token);
  const user = useSelector((state) => state.userSlice.user.user);
  const [show, setShow] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaChange = () => setIsSmallScreen(mediaQuery.matches);
    handleMediaChange();
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const { data: phoneSummaries, isLoading: isLoadingPhoneSummaries } = useQuery(
    ["phones"],
    ({ queryKey, signal }) => fetchPhoneSummaries({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  const { data: phonesByRegion, isLoading: isLoadingPhonesByRegion } = useQuery(
    ["phonesByRegion"],
    ({ signal }) => fetchPhonesByRegion({ signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  const isLoading = isLoadingPhoneSummaries || isLoadingPhonesByRegion;

  const highestSales = Math.max(
    ...(phoneSummaries?.topManagers?.map((manager) => manager.totalIncome) || [
      0,
    ])
  );

  const COLORS = [
    "#4ADE80",
    "#FACC15",
    "#7DD3FC",
    "#A5B4FC",
    "#FCA5A5",
    "#86EFAC",
    "#F87171",
    "#67E8F9",
    "#FACC15",
    "#4ADE80",
    "#C4B5FD",
    "#FB7185",
    "#22D3EE",
    "#EAB308",
    "#16A34A",
    "#818CF8",
    "#EF4444",
    "#06B6D4",
    "#CA8A04",
    "#15803D",
    "#6366F1",
    "#DC2626",
    "#0891B2",
    "#B45309",
    "#166534",
    "#4F46E5",
    "#B91C1C",
    "#0E7490",
    "#A16207",
    "#065F46",
    "#4338CA",
    "#991B1B",
    "#155E75",
    "#854D0E",
    "#064E3B",
    "#3730A3",
    "#9F1239",
    "#1E3A8A",
    "#713F12",
    "#1E293B",
    "#312E81",
    "#BE185D",
    "#1E40AF",
    "#78350F",
    "#334155",
    "#5B21B6",
    "#E11D48",
    "#2563EB",
    "#92400E",
    "#475569",
    "#7E22CE",
  ];

  const stats = isLoading
    ? []
    : [
        {
          name: "Phones Sold",
          value: phoneSummaries?.soldThisMonth?.total,
          percentage: phoneSummaries?.soldThisMonth?.percentagePhonesSold,
        },
        {
          name: "Gross Profit",
          value: phoneSummaries?.soldThisMonth?.totalIncome,
          percentage: phoneSummaries?.soldThisMonth?.percentageIncome,
        },
        {
          name: "Mangers' Commission",
          value: phoneSummaries?.soldThisMonth?.totalCommission,
          percentage: phoneSummaries?.soldThisMonth?.percentageCommission,
        },
        {
          name: "Net Profit",
          value: phoneSummaries?.soldThisMonth?.totalProfit,
          percentage: phoneSummaries?.soldThisMonth?.percentageProfit,
        },
      ];

  useEffect(() => {
    if (!["super admin", "admin"].includes(user?.role)) {
      navigate("/404");
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col md:flex-row justify-between bg-slate-50 md:h-[calc(100vh-72px)] p-5 space-y-2 md:space-y-0 md:space-x-5">
      <div className="flex-1 space-y-2 md:space-y-3">
        <div>
          <p className="text-2xl font-bold">Dashboard</p>
          <p className="text-gray-500">Here is a monthly dashboard overview</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-5">
          {isLoading ? (
            // Skeleton loading state for stats cards
            <>
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
            </>
          ) : (
            stats.map((item, index) => (
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
            ))
          )}
        </div>
        <div className="bg-white shadow-sm rounded-md border p-2 md:p-5">
          <p className="font-bold text-lg mb-5">Company Sales Performance</p>
          {isLoading ? (
            // Using the SkeletonChart component
            <SkeletonChart height={400} />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={phoneSummaries?.dailySales}
                margin={{ top: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                {isSmallScreen ? (
                  <YAxis />
                ) : (
                  <>
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                  </>
                )}

                <Tooltip />
                <Legend />

                {isSmallScreen ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="Muchami"
                      stroke="#F59E0B"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="Shuhari" stroke="#22C55E" />
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="w-full md:w-[400px] lg:w-[500px] space-y-2 md:space-y-3">
        <div className="bg-white shadow-sm rounded-md border p-5">
          <p className="font-bold text-lg mb-5">
            Overall Managers' Performance
          </p>
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              // Skeleton loading state for managers list
              <>
                <SkeletonManager />
                <SkeletonManager />
                <SkeletonManager />
                <SkeletonManager />
                <SkeletonManager />
              </>
            ) : (
              phoneSummaries?.topManagers
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
                          <p className="text-gray-800 text-sm font-medium capitalize">
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
                })
            )}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-md border flex flex-col items-center">
          <div className="flex flex-col md:flex-row justify-between items-center p-5">
            <p className="font-bold text-lg mx-2">Regional Stats</p>
            <div className="flex flex-row items-center space-x-2">
              <p>Performance</p>
              <Switch
                checked={show}
                onChange={() => setShow(!show)}
                disabled={isLoading}
              />
              <p>Phones Left</p>
            </div>
          </div>

          {isLoading ? (
            // Using the SkeletonChart component
            <div className="w-full px-4 pb-4">
              <SkeletonChart height={300} />
            </div>
          ) : (
            <>
              {show &&
                phonesByRegion &&
                (phonesByRegion.every((region) => region.phones === 0) ? (
                  <p className="text-red-500 py-5 font-roboto">
                    All regions have no phones left
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={phonesByRegion}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="phones" fill="#8884d8">
                        {phonesByRegion.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ))}

              {!show && (
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart
                    outerRadius={isSmallScreen ? 120 : 150}
                    data={phoneSummaries?.regionSales}>
                    <PolarGrid />
                    <PolarAngleAxis
                      dataKey="region"
                      tick={{
                        fontSize: isSmallScreen ? 12 : 14,
                        textAnchor: "middle",
                      }}
                    />
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
