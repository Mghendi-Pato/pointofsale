import { useSelector } from "react-redux";
import AdminInventory from "./AdminInventory";

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
    case user.role === "shop keeper":
      userRole = "shop keeper";
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
    case "shop keeper":
      return <AdminInventory />;
    default:
      return <div>Unauthorized</div>;
  }
};

export default Index;
