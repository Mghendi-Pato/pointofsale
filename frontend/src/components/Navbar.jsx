import { RxAvatar } from "react-icons/rx";
import { CiSearch } from "react-icons/ci";
import { useLocation, useNavigate } from "react-router-dom";
import { RiMenuFold4Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { searchPhonesByIMEI } from "../services/services";

const Navbar = () => {
  const user = useSelector((state) => state.userSlice.user.user);
  const showSideBar = useSelector((state) => state.sidebar.showSideBar);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const token = useSelector((state) => state.userSlice.user.token);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setSearchTerm(""); // Close dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search function
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim() === "") {
        setResults([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const phones = await searchPhonesByIMEI({ imei: searchTerm, token });
        setResults(phones || []);
      } catch (err) {
        console.log(err);
        setError(err.response.data.message || "Failed to fetch results");
      } finally {
        setIsLoading(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, token]);

  // Handle click on a search result
  const handleResultClick = (imei) => {
    setSearchTerm("");
    navigate(`/phone/${imei}`);
  };

  return (
    <div
      className={`flex z-50 flex-row justify-between items-center md:p-2 md:px-20 transition-all duration-300 ease-in-out ${
        showSideBar ? "md:pl-80" : "md:pl-20"
      } shadow-sm w-full fixed top-0 left-0 bg-white h-16`}>
      <div className="mx-2 flex md:hidden">
        <RiMenuFold4Line size={20} />
      </div>
      <div className="relative" ref={dropdownRef}>
        <div
          className={` ${
            ["admin", "super admin"].includes(user.role) ? "flex" : "hidden"
          } items-center`}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by IMEI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 h-10 w-64"
          />
          <button className="bg-primary-500 text-white px-4 py-2 h-10 rounded-r-lg hover:bg-primary-600 focus:outline-none flex items-center justify-center">
            <CiSearch size={20} />
          </button>
        </div>
        {searchTerm && (
          <div className="absolute w-64 bg-white border shadow-lg z-10 max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="p-2 text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="p-2 text-center text-red-500">{error}</div>
            ) : results.length === 0 ? (
              <div className="p-2 text-center text-gray-500">
                No matching phone found
              </div>
            ) : (
              results.slice(0, 7).map((phone) => (
                <div
                  key={phone.imei}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleResultClick(phone.imei)}>
                  <p className="font-medium">{phone.model}</p>
                  <p className="text-sm text-gray-500">{phone.imei}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div className="flex flex-row md:flex-row-reverse w-full md:w-auto md:mr-10 items-center justify-center">
        <div className="flex flex-row items-center md:space-x-2">
          <div
            className="hidden md:flex flex-row justify-between items-center cursor-pointer"
            onClick={() => navigate("/profile")}>
            <div>
              <RxAvatar
                size={30}
                className={`mx-4 ${
                  showSideBar && pathname === "/profile"
                    ? "text-primary-500"
                    : ""
                }`}
              />
            </div>
            <div>
              <p className="text-black font-bold">
                {user?.firstName} {user.lastName}
              </p>
              <p className="text-neutral-500 text-xs md:text-base capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
