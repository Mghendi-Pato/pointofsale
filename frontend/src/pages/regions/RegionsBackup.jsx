import { useEffect, useState } from "react";
import { RiShoppingBagLine } from "react-icons/ri";
import { GiReceiveMoney } from "react-icons/gi";
import { TbTruckDelivery } from "react-icons/tb";
import { MdChevronRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoTrashBinOutline } from "react-icons/io5";
import { TfiStatsDown } from "react-icons/tfi";
import { TfiStatsUp } from "react-icons/tfi";
import { IoIosStarOutline } from "react-icons/io";

const Regions = () => {
  const [show, setShow] = useState("active");
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)"); // Tailwind's `md` breakpoint
    const handleMediaChange = () => setIsSmallScreen(mediaQuery.matches);
    handleMediaChange(); // Initialize state on component mount
    mediaQuery.addEventListener("change", handleMediaChange); // Listen for screen size changes
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);
  return (
    <div className="p-5 ">
      <div className="flex flex-row items-center space-x-5 shadow">
        <div
          className={`p-2 py-3 text-sm font-roboto font-bold w-[50%] md:w-36 text-center cursor-pointer ${
            show === "active" ? "bg-primary-300 text-black" : "text-gray-600"
          }`}
          onClick={() => setShow("active")}>
          Active
        </div>
        <div
          className={`p-2 py-3 text-sm font-roboto font-bold w-[50%]  md:w-36 text-center cursor-pointer   ${
            show === "inactive" ? "bg-primary-300 text-black " : "text-gray-600"
          }`}
          onClick={() => setShow("inactive")}>
          Inactive
        </div>
      </div>
      <div className="py-5 ">
        <p className="py-2 font-roboto text-neutral-900 text-sm">
          All stats within past 24 hours
        </p>
        <div className="flex flex-col md:flex-row justify-between items-center bg-white shadow-sm rounded-sm p-4 border border-neutral-200">
          <div className="flex flex-wrap items-center gap-6 md:gap-12">
            <div className="flex flex-row items-center w-40 space-x-4 cursor-pointer hover:bg-neutral-100 p-2 rounded-md transition">
              <RiShoppingBagLine
                size={isSmallScreen ? 22 : 32}
                className="text-primary-500"
              />
              <div>
                <p className="font-roboto font-bold text-base text-neutral-800">
                  120
                </p>
                <p className="text-sm text-neutral-500">
                  Total orders completed
                </p>
              </div>
            </div>

            <div className="flex flex-row items-center w-40 space-x-4 cursor-pointer hover:bg-neutral-100 p-2 rounded-md transition">
              <GiReceiveMoney
                size={isSmallScreen ? 22 : 32}
                className="text-primary-500"
              />
              <div>
                <p className="font-roboto font-bold text-base text-neutral-800">
                  Ksh 456,000
                </p>
                <p className="text-sm text-neutral-500">Income earned</p>
              </div>
            </div>

            <div className="flex flex-row items-center w-40 space-x-4 cursor-pointer hover:bg-neutral-100 p-2 rounded-md transition">
              <TbTruckDelivery
                size={isSmallScreen ? 22 : 32}
                className="text-primary-500"
              />
              <div>
                <p className="font-roboto font-bold text-base text-neutral-800">
                  170
                </p>
                <p className="text-sm text-neutral-500">New phones received</p>
              </div>
            </div>

            <div className="flex flex-row items-center w-40 space-x-4 cursor-pointer hover:bg-neutral-100 p-2 rounded-md transition">
              <IoTrashBinOutline
                size={isSmallScreen ? 22 : 30}
                className="text-primary-500"
              />
              <div>
                <p className="font-roboto font-bold text-base text-neutral-800">
                  2
                </p>
                <p className="text-sm text-neutral-500">Phones lost</p>
              </div>
            </div>
          </div>

          <div
            className="flex flex-row items-center space-x-3 mt-4 md:mt-0 cursor-pointer text-primary-500 hover:text-primary-700 transition"
            onClick={() => navigate("/reports")}>
            <p className="font-roboto font-medium text-sm md:text-base">
              Click for details
            </p>
            {isSmallScreen ? (
              <MdKeyboardArrowDown size={30} />
            ) : (
              <MdChevronRight size={30} />
            )}
          </div>
        </div>

        <p className="py-5 font-roboto text-neutral-900 text-sm">
          Regional perfomance past 24 hours
        </p>
        <div className="flex flex-row flex-wrap items-center gap-5 md:space-x-5">
          <div className="p-6 bg-white rounded-sm shadow-sm border border-neutral-200">
            <div className="p-2 bg-primary-100 inline-flex items-center space-x-3 rounded-md">
              <TfiStatsDown size={18} className="text-primary-500" />
              <p className="text-sm font-medium text-neutral-700">
                20% less sales
              </p>
            </div>

            <div className="flex flex-row items-center space-x-3 py-4">
              <p className="font-roboto font-semibold text-sm md:text-base text-neutral-800">
                Mombasa
              </p>
              <MdChevronRight size={24} className="text-primary-500" />
            </div>

            <div className="flex flex-row items-center space-x-4">
              <IoIosStarOutline size={18} className="text-primary-500" />
              <div>
                <p className="font-roboto font-semibold text-sm text-neutral-800">
                  Ksh 160,000
                </p>
                <p className="text-xs text-neutral-500">Average income today</p>
              </div>
            </div>

            <hr className="my-4 border-neutral-200" />

            <div className="flex flex-row items-center space-x-4">
              <IoIosStarOutline size={18} className="text-primary-500" />
              <div>
                <p className="font-roboto font-semibold text-sm text-neutral-800">
                  6
                </p>
                <p className="text-xs text-neutral-500">Completed orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Regions;
