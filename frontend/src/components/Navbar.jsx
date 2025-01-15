import { CgProfile } from "react-icons/cg";
import { FaRegBell } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { IoIosMore } from "react-icons/io";
import { RiMenuFold4Line } from "react-icons/ri";

const Navbar = ({ showSideBar, setShowSideBar }) => {
  return (
    <div
      className={`flex flex-row justify-between items-center md:p-2 md:px-20 transition-all duration-1000 ease-in-out ${
        showSideBar ? "md:pl-80" : "md:pl-20"
      } shadow-sm w-full fixed top-0 left-0 bg-white h-16`}>
      <div className="mx-2 flex md:hidden">
        <RiMenuFold4Line size={20} />
      </div>
      <div className="flex items-center ">
        <input
          type="text"
          placeholder="Search..."
          className="border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 h-10"
        />
        <button className="bg-primary-500 text-white px-4 py-2 h-10 rounded-r-lg hover:bg-primary-600 focus:outline-none flex items-center justify-center">
          <CiSearch size={20} />
        </button>
      </div>
      <div className="flex flex-row md:flex-row-reverse w-full md:w-auto md:mr-10 items-center justify-center">
        <div className="flex flex-row items-center md:space-x-2">
          <div className="relative cursor-pointer h-16 flex flex-col justify-center items-center group">
            <div className="relative">
              <FaRegBell size={20} />
              <div className="h-3 w-3 bg-green-500 absolute rounded-full -top-1 -right-2 shadow-xl shadow-black border-white border-2 flex items-center justify-center"></div>
            </div>
          </div>
          <div className="hidden md:flex flex-row justify-between items-center">
            <div>
              <CgProfile size={30} className="mx-4" />
            </div>
            <div>
              <p className="text-black font-bold">John Doe</p>
              <p className="text-neutral-500 text-xs md:text-base">
                Administrator
              </p>
            </div>
            <div>
              <IoIosMore size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
