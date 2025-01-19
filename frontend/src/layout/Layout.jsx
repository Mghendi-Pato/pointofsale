import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Layout = ({ children }) => {
  const showSideBar = useSelector((state) => state.sidebar.showSideBar);
  return (
    <div>
      <Navbar />
      <Sidebar />
      <div
        className={`${
          showSideBar ? "p-2 md:pl-64" : "p-0 md:pl-16"
        } pt-16 transition-all duration-1000 ease-in-out`}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
