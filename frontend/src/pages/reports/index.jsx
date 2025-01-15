import { useSelector } from "react-redux";
import SuperAdminReports from "./SuperAdminReports";
import AdminReports from "./AdminReports";
import ManagerReports from "./ManagerReports";

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
      return <SuperAdminReports />;
    case "admin":
      return <AdminReports />;
    case "manager":
      return <ManagerReports />;
    default:
      return <div>Unauthorized</div>;
  }
};

export default Index;
