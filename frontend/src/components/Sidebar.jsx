import { AiOutlineDashboard } from "react-icons/ai";
import { RiMenuUnfold4Line, RiMenuFold4Line } from "react-icons/ri";
import { GrUserManager } from "react-icons/gr";
import { LuClipboardList } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { IoAnalyticsSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineMonetizationOn } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { CiLogout } from "react-icons/ci";
import { AiOutlineShop } from "react-icons/ai";
import { RiAdminLine } from "react-icons/ri";
import { TbTruckDelivery } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/reducers/user";
import { toggleSidebar } from "../redux/reducers/ sidebar";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const user = useSelector((state) => state.userSlice.user.user);
  const showSideBar = useSelector((state) => state.sidebar.showSideBar);

  let role = "";

  switch (true) {
    case user.role === "super admin":
      role = "super admin";
      break;
    case user.role === "admin":
      role = "admin";
      break;
    case user.role === "manager":
      role = "manager";
      break;
    default:
      role = "guest";
  }

  const sideNavdAreas = [
    {
      area: "Inventory",
      Icon: <LuClipboardList size={20} className="mx-4" />,
      privileges: ["super admin", "admin", "manager"],
      route: "/inventory",
    },
    {
      area: "Sales",
      Icon: <MdOutlineMonetizationOn size={20} className="mx-4" />,
      privileges: ["super admin", "admin", "manager"],
      route: "/sales",
    },
    {
      area: "Shops",
      Icon: <AiOutlineShop size={20} className="mx-4" />,
      privileges: ["super admin", "admin"],
      route: "/shops",
    },
    {
      area: "Managers",
      Icon: <GrUserManager size={20} className="mx-4" />,
      privileges: ["super admin", "admin"],
      route: "/managers",
    },
    {
      area: "Suppliers",
      Icon: <TbTruckDelivery size={20} className="mx-4" />,
      privileges: ["super admin", "admin"],
      route: "/suppliers",
    },
    {
      area: "Reports",
      Icon: <IoAnalyticsSharp size={20} className="mx-4" />,
      privileges: ["super admin", "admin", "manager"],
      route: "/reports",
    },
    {
      area: "Admins",
      Icon: <RiAdminLine size={20} className="mx-4" />,
      privileges: ["super admin"],
      route: "/admins",
    },
  ];

  return (
    <div
      className={`bg-neutral-100 shadow-md transition-all duration-1000 ease-in-out flex flex-col justify-between flex-1 ${
        showSideBar ? "w-52 md:w-64" : "w-0 md:w-16"
      } h-full fixed left-0 top-0 z-10`}>
      <div className=" ">
        <div
          className={`bg-neutral-100 border-b b-neutral-300 h-16 flex flex-col justify-center items-center relative transition-all duration-1000 ease-in-out ${
            showSideBar ? "w-40 md:w-64" : "w-0"
          }`}>
          <div
            className="absolute p-5 -right-16 top-0 h-16 flex flex-row items-center justify-center cursor-pointer"
            onClick={() => dispatch(toggleSidebar())}>
            {showSideBar ? (
              <RiMenuUnfold4Line size={20} />
            ) : (
              <RiMenuFold4Line size={20} className="hidden md:flex" />
            )}
          </div>
          <AnimatePresence>
            {showSideBar && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.5 }}>
                <img
                  src="/Shuhari-Sidebar-logo.png"
                  alt="logo"
                  className="h-5 md:h-10"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className={`relative flex flex-row py-4 items-center group cursor-pointer space-x-2 h-14 hover:bg-primary-200 ${
            pathname === "/"
              ? "border-primary-500 border-r-4 bg-primary-300"
              : ""
          }`}
          onClick={() => navigate("/")}>
          <div className="hidden md:block">
            <AiOutlineDashboard size={20} className="mx-4" />
          </div>
          <AnimatePresence>
            {showSideBar && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="whitespace-nowrap text-black md:hidden ">
                <AiOutlineDashboard size={20} className="mx-4" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className={`overflow-hidden `}>
            <AnimatePresence>
              {showSideBar && (
                <motion.p
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="whitespace-nowrap text-black ">
                  Dashbaord
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div
            className={`absolute top-0 -right-32 h-14 p-2 bg-primary-500 justify-center items-center w-32 hidden ${
              !showSideBar && "md:group-hover:flex"
            }`}>
            <p className="font-roboto text-white">Dashboard</p>
          </div>
        </div>

        {sideNavdAreas
          .filter((area) => area.privileges.includes(role))
          .map((area, index) => (
            <div
              className={`relative flex flex-row py-4 items-center group cursor-pointer space-x-2 h-14 hover:bg-primary-200 ${
                pathname.startsWith(area.route)
                  ? "border-primary-500 border-r-4 bg-primary-300"
                  : ""
              }`}
              key={index}
              onClick={() => navigate(area.route)}>
              <div className="hidden md:block">{area.Icon}</div>
              <AnimatePresence>
                {showSideBar && (
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="whitespace-nowrap text-black md:hidden ">
                    {area.Icon}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className={`overflow-hidden `}>
                <AnimatePresence>
                  {showSideBar && (
                    <motion.p
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -100, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="whitespace-nowrap text-black ">
                      {area.area}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div
                className={`absolute top-0 -right-32 h-14 p-2 bg-primary-500 justify-center items-center w-32 hidden ${
                  !showSideBar && "md:group-hover:flex"
                }`}>
                <p className="font-roboto text-white">{area.area}</p>
              </div>
            </div>
          ))}

        <div
          className={`relative flex md:hidden flex-row py-4 items-center group cursor-pointer space-x-2 h-14 hover:bg-primary-200 ${
            pathname === "/profile"
              ? "border-primary-500 border-r-4 bg-primary-300"
              : ""
          }`}
          onClick={() => navigate("/profile")}>
          <div className="hidden md:block">
            <CgProfile size={20} className="mx-4" />
          </div>
          <AnimatePresence>
            {showSideBar && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="whitespace-nowrap text-black md:hidden ">
                <CgProfile size={20} className="mx-4" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className={`overflow-hidden `}>
            <AnimatePresence>
              {showSideBar && (
                <motion.p
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="whitespace-nowrap text-black ">
                  Profile
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div
            className={`absolute top-0 -right-32 h-14 p-2 bg-primary-500 justify-center items-center w-32 hidden ${
              !showSideBar && "md:group-hover:flex"
            }`}>
            <p className="font-roboto text-white">Profile</p>
          </div>
        </div>
      </div>
      <div className="py-4 border-t b-neutral-300 ">
        <div
          className={`relative flex flex-row py-4 items-center group cursor-pointer space-x-2 h-14 hover:bg-primary-200 mb-10    ${
            pathname === "/logout" ? " bg-primary-300" : ""
          }`}
          onClick={() => dispatch(logoutUser())}>
          <div className="hidden md:block">
            <CiLogout size={20} className="mx-4" />
          </div>
          <AnimatePresence>
            {showSideBar && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="whitespace-nowrap text-black md:hidden ">
                <CiLogout size={20} className="mx-4" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className={`overflow-hidden `}>
            <AnimatePresence>
              {showSideBar && (
                <motion.p
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="whitespace-nowrap text-black ">
                  Logout
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div
            className={`absolute top-0 -right-32 h-14 p-2 bg-primary-500 justify-center items-center w-32 hidden ${
              !showSideBar && "md:group-hover:flex"
            }`}>
            <p className="font-roboto text-white">Logout</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
