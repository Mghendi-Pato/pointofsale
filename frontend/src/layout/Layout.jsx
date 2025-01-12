import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Layout = ({ children }) => {
  const [showSideBar, setShowSideBar] = useState(false);
  return (
    <div>
      <Navbar showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
      <Sidebar showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
      <div
        className={`${
          showSideBar ? "p-0 md:pl-64" : "p-0 md:pl-16"
        } pt-16 transition-all duration-1000 ease-in-out`}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
