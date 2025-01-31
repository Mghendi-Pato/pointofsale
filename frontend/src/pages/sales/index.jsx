import { useSelector } from "react-redux";
import AdminSales from "./AdminSales";
import ManagerSales from "./ManagerSales";

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
      return <AdminSales />;
    case "admin":
      return <AdminSales />;
    case "manager":
      return <ManagerSales />;
    default:
      return <div>Unauthorized</div>;
  }
};

export default Index;
