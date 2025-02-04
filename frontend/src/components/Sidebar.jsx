import { AiOutlineDashboard } from "react-icons/ai";
import { RiMenuUnfold4Line, RiMenuFold4Line } from "react-icons/ri";
import { GrUserManager } from "react-icons/gr";
import { LuClipboardList } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { IoAnalyticsSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { CiLogout } from "react-icons/ci";
import { RiAdminLine } from "react-icons/ri";
import { TbTruckDelivery } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { setSidebar, toggleSidebar } from "../redux/reducers/ sidebar";
import { BsPinMap } from "react-icons/bs";
import { useEffect, useState } from "react";
import LogoutUser from "./LogoutUser";
import { MdAttachMoney } from "react-icons/md";
import { GiReceiveMoney } from "react-icons/gi";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const user = useSelector((state) => state.userSlice.user.user);
  const showSideBar = useSelector((state) => state.sidebar.showSideBar);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)"); // Tailwind's `md` breakpoint
    const handleMediaChange = () => setIsSmallScreen(mediaQuery.matches);

    handleMediaChange(); // Initialize state on component mount
    mediaQuery.addEventListener("change", handleMediaChange); // Listen for screen size changes

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

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
      area: "Commissions",
      Icon: <MdAttachMoney size={20} className="mx-4" />,
      privileges: ["super admin", "admin"],
      route: "/commissions",
    },
    {
      area: "Inventory",
      Icon: <LuClipboardList size={20} className="mx-4" />,
      privileges: ["super admin", "admin", "manager"],
      route: "/inventory",
    },

    {
      area: "Sales",
      Icon: <GiReceiveMoney size={20} className="mx-4" />,
      privileges: ["super admin", "admin", "manager"],
      route: "/sales",
    },

    {
      area: "Regions",
      Icon: <BsPinMap size={20} className="mx-4" />,
      privileges: ["super admin", "admin"],
      route: "/regions",
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
      area: "Admins",
      Icon: <RiAdminLine size={20} className="mx-4" />,
      privileges: ["super admin"],
      route: "/admins",
    },
  ];

  const onHomeNavigate = () => {
    user.role === "manager" ? navigate("/inventory") : navigate("/");
    if (isSmallScreen) {
      dispatch(setSidebar(false));
    }
  };
  const onNavigate = (route) => {
    navigate(route);
    if (isSmallScreen) {
      dispatch(setSidebar(false));
    }
  };

  return (
    <div
      className={`${
        pathname === "/" ? "bg-slate-50" : "bg-slate-50"
      } shadow-md transition-all duration-300 ease-in-out flex flex-col justify-between flex-1 z-50 ${
        showSideBar ? "w-52 md:w-64" : "w-0 md:w-16"
      } h-full fixed left-0 top-0 z-50`}>
      <div className=" ">
        <div
          className={`bg-slate-50 border-b h-16 flex flex-col justify-center items-center relative transition-all duration-300 ease-in-out ${
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
          className={`relative  ${
            user.role === "manager" ? "hidden" : "flex"
          } flex-row py-4 items-center group cursor-pointer space-x-2 h-14 hover:bg-primary-200 ${
            pathname === "/"
              ? "border-primary-500 border-r-4 bg-primary-300"
              : ""
          }`}
          onClick={() => onHomeNavigate()}>
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
                  transition={{ duration: 0.3 }}
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
              onClick={() => onNavigate(area.route)}>
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
          onClick={() => onNavigate("/profile")}>
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
          onClick={() => setShowLogoutModal(true)}>
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
      <LogoutUser
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
      />
    </div>
  );
};

export default Sidebar;
