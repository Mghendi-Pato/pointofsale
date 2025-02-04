import { useSelector } from "react-redux";
import AdminInventory from "./AdminInventory";
import ManagerInventory from "./ManagerInventory";

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
      return <AdminInventory />;
    case "admin":
      return <AdminInventory />;
    case "manager":
      return <AdminInventory />;
    default:
      return <div>Unauthorized</div>;
  }
};

export default Index;
