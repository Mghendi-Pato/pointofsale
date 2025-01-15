import { useSelector } from "react-redux";
import AdminDashboard from "./AdminDashboard";
import SuperAdminDashbord from "./SuperAdminDashbord";
import ManagerDashboard from "./ManagerDashboard";

const Index = () => {
  const user = useSelector((state) => state.userSlice.user.user);

  let userRole = "";

  switch (true) {
    case user.role === "super admin":
      userRole = "super admin";
      break;
    case user.role === "admin":
      userRole = "admin";
      break;
    case user.role === "manager":
      userRole = "manager";
      break;
    default:
      userRole = "guest";
  }

  switch (userRole) {
    case "super admin":
      return <SuperAdminDashbord />;
    case "admin":
      return <AdminDashboard />;
    case "manager":
      return <ManagerDashboard />;
    default:
      return <div>Unauthorized</div>;
  }
};

export default Index;
