import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { CiSaveDown2 } from "react-icons/ci";
import { useFormik } from "formik";
import * as yup from "yup";
import TextField from "@mui/material/TextField";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setSidebar } from "../redux/reducers/ sidebar";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { editUser, fetchAllRegions } from "../services/services";
import { LuEye } from "react-icons/lu";
import { LuEyeOff } from "react-icons/lu";
import { useLocation } from "react-router-dom";

const EditManagerModal = ({
  showEditUserModal,
  setShowEditUserModal,
  user,
  setEditUser,
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = useSelector((state) => state.userSlice.user.token);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { pathname } = useLocation();

  const formatNumber = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Format with commas
  };

  const handlePriceChange = (fieldName) => (event) => {
    let rawValue = event.target.value.replace(/,/g, ""); // Remove commas
    if (!/^\d*$/.test(rawValue)) return; // Ensure it's numeric

    formik.setFieldValue(fieldName, rawValue); // Store only numeric value
  };

  // Format value for display
  const getFormattedValue = (value) => (value ? formatNumber(value) : "");

  const { data: regions } = useQuery(
    ["regions", { page: 1, limit: 100 }],
    ({ queryKey, signal }) => fetchAllRegions({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)"); // Tailwind's `md` breakpoint
    const handleMediaChange = () => setIsSmallScreen(mediaQuery.matches);

    handleMediaChange(); // Initialize state on component mount
    mediaQuery.addEventListener("change", handleMediaChange); // Listen for screen size changes

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  // Define animations based on screen size
  const smallScreenAnimation = {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 },
  };

  const largeScreenAnimation = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
  };

  const animation = isSmallScreen ? smallScreenAnimation : largeScreenAnimation;

  const validationSchema = yup.object({
    firstName: yup
      .string("Enter your first name")
      .required("First name is required"),
    lastName: yup
      .string("Enter your last name")
      .required("Last name is required"),
    email: yup
      .string("Enter your email")
      .email("Enter a valid email")
      .required("Email is required"),
    ID: yup
      .string("Enter your ID")
      .matches(/^\d+$/, "ID should be numeric")
      .required("ID is required"),
    phone: yup
      .string("Enter your phone number")
      .matches(
        /^(\+\d{1,3}[- ]?)?\d{10}$/,
        "Enter a valid phone number with 10 digits"
      )
      .required("Phone number is required"),
    region: yup.number("Location must be a valid ID").nullable(),
    status: yup
      .string()
      .oneOf(["active", "suspended"], "Status must be 'active' or 'suspended'")
      .required("Status is required"),
    poolCommission: yup
      .number("Enter the commission")
      .positive("Commission must be a positive number"),
    role: yup
      .string()
      .oneOf(["admin", "shop keeper", "collection officer", ""], "Invalid role")
      .nullable()
      .notRequired(),
    password: yup
      .string("Enter your password")
      .nullable()
      .notRequired()
      .min(8, "Password must be at least 8 characters long")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(
        /[@$!%*?&]/,
        "Password must contain at least one special character (@$!%*?&)"
      ),
  });

  const useEditUser = () => {
    return useMutation(
      ({ userId, userData, token }) => editUser(userId, userData, token),
      {
        onMutate: () => {
          setEditUserLoading(true);
        },
        onSuccess: () => {
          setEditUserLoading(false);
          {
            user?.role === "manager"
              ? queryClient.invalidateQueries(["managers"])
              : queryClient.invalidateQueries(["admins"]);
          }

          toast.success("User updated");
          formik.resetForm();
          setEditUser([]);
          if (isSmallScreen) {
            setShowEditUserModal(false);
          } else {
            setShowEditUserModal(false);
            dispatch(setSidebar(true));
          }
        },
        onError: (error) => {
          setEditUserLoading(false);
          toast.error(error.message || "Failed to update user");
        },
      }
    );
  };
  const editUserMutation = useEditUser();
  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      ID: user?.ID || "",
      phone: user?.phone || "",
      region: user?.regionId || "",
      status: user?.status || "",
      password: "",
      commission: user?.commission || "",
      role: user?.role || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      console.log(values);
      const updatedFields = Object.keys(values).reduce((acc, key) => {
        if (values[key] !== formik.initialValues[key]) {
          acc[key] = values[key];
        }
        return acc;
      }, {});
      if ("region" in updatedFields) {
        updatedFields.regionId = updatedFields.region;
        delete updatedFields.region;
      }

      if (Object.keys(updatedFields).length > 0) {
        editUserMutation.mutate({
          token,
          userData: updatedFields,
          userId: user.id,
        });
      } else {
        toast.info("No changes detected");
      }
    },
  });

  const onCloseModal = () => {
    setShowEditUserModal(false);
    setEditUser([]);
    if (!isSmallScreen) {
      dispatch(setSidebar(true));
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <AnimatePresence>
      {showEditUserModal && (
        <motion.div
          {...animation}
          transition={{ duration: 0.5 }}
          className="absolute bottom-0 md:top-0 right-0 w-full h-[85%] md:h-full z-50 md:w-[40%] lg:w-[30%] bg-neutral-100 flex flex-col items-center p-2">
          <div className="relative w-full hidden md:flex">
            <MdOutlineCancel
              size={28}
              className="cursor-pointer text-red-500 hover:text-red-400 absolute top-0 right-0"
              onClick={() => onCloseModal()}
            />
          </div>
          <div className=" w-full  md:hidden relative">
            <div className="absolute  -top-10 right-0  p-1">
              <CiSaveDown2
                size={28}
                className="cursor-pointer text-red-500  hover:text-red-400"
                onClick={() => onCloseModal()}
              />
            </div>
          </div>

          <div className="w-full">
            <div className="w-full text-center text-lg py-2">
              <p className="font-roboto font-bold">Edit User</p>
            </div>
            <form
              onSubmit={formik.handleSubmit}
              className="space-y-5 px-2 pb-10 md:mt-5"
              autoComplete="off">
              <TextField
                variant="outlined"
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ccc",
                    },
                    "&:hover fieldset": {
                      borderColor: "#2FC3D2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2FC3D2",
                    },
                  },
                  "& .MuiInputBase-input": { color: "#000" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2FC3D2" },
                }}
              />

              <TextField
                variant="outlined"
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ccc", // Default border color
                    },
                    "&:hover fieldset": {
                      borderColor: "#2FC3D2", // Hover state color
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2FC3D2", // Focused state color
                    },
                  },
                  "& .MuiInputBase-input": { color: "#000" }, // Input text color
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2FC3D2" }, // Focused label color
                }}
              />

              <TextField
                variant="outlined"
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="email"
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ccc", // Default border color
                    },
                    "&:hover fieldset": {
                      borderColor: "#2FC3D2", // Hover state color
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2FC3D2", // Focused state color
                    },
                  },
                  "& .MuiInputBase-input": { color: "#000" }, // Input text color
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2FC3D2" }, // Focused label color
                }}
              />
              <TextField
                variant="outlined"
                fullWidth
                id="ID"
                name="ID"
                label="ID"
                value={formik.values.ID}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.ID && Boolean(formik.errors.ID)}
                helperText={formik.touched.ID && formik.errors.ID}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ccc",
                    },
                    "&:hover fieldset": {
                      borderColor: "#2FC3D2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2FC3D2",
                    },
                  },
                  "& .MuiInputBase-input": { color: "#000" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2FC3D2" },
                }}
              />
              <TextField
                variant="outlined"
                fullWidth
                id="phone"
                name="phone"
                label="Phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ccc",
                    },
                    "&:hover fieldset": {
                      borderColor: "#2FC3D2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2FC3D2",
                    },
                  },
                  "& .MuiInputBase-input": { color: "#000" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2FC3D2" },
                }}
              />
              {user?.role === "manager" ? (
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="region-label">Location</InputLabel>
                  <Select
                    labelId="region-label"
                    id="region"
                    name="region"
                    value={formik.values.region || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.region && Boolean(formik.errors.region)
                    }
                    label="Location"
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200,
                          overflowY: "auto",
                        },
                      },
                    }}>
                    {[...regions.regions]
                      .sort((a, b) => a.location.localeCompare(b.location))
                      .map((region) => (
                        <MenuItem key={region.id} value={region.id}>
                          {region.location}
                        </MenuItem>
                      ))}
                  </Select>
                  {formik.touched.region && formik.errors.region && (
                    <div style={{ color: "red", fontSize: "0.875rem" }}>
                      {formik.errors.region}
                    </div>
                  )}
                </FormControl>
              ) : (
                ""
              )}
              <FormControl fullWidth variant="outlined">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                  label="Status"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                        overflowY: "auto",
                      },
                    },
                  }}>
                  {["active", "suspended"].map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <div style={{ color: "red", fontSize: "0.875rem" }}>
                    {formik.errors.status}
                  </div>
                )}
              </FormControl>

              {pathname === "/managers" && (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="commission"
                  name="commission"
                  label="Commission"
                  value={getFormattedValue(formik.values.commission)}
                  onChange={handlePriceChange("commission")}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.commission &&
                    Boolean(formik.errors.commission)
                  }
                  helperText={
                    formik.touched.commission && formik.errors.commission
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#ccc" },
                      "&:hover fieldset": { borderColor: "#2FC3D2" },
                      "&.Mui-focused fieldset": { borderColor: "#2FC3D2" },
                    },
                    "& .MuiInputBase-input": { color: "#000" },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#2FC3D2",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">KSh</InputAdornment>
                    ),
                  }}
                />
              )}
              {pathname === "/admins" && (
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="role-label">Role (optional)</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={formik.values.role || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.role && Boolean(formik.errors.role)}
                    label="Role (optional)"
                    displayEmpty
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200,
                          overflowY: "auto",
                        },
                      },
                    }}>
                    <MenuItem value="">
                      <em>Unchanged</em>
                    </MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="shop keeper">Shop Keeper</MenuItem>
                    <MenuItem value="collection officer">
                      Collection Officer
                    </MenuItem>
                  </Select>
                  {formik.touched.role && formik.errors.role && (
                    <div style={{ color: "red", fontSize: "0.875rem" }}>
                      {formik.errors.role}
                    </div>
                  )}
                </FormControl>
              )}

              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end">
                        {showPassword ? <LuEyeOff /> : <LuEye />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
                {formik.touched.password && formik.errors.password && (
                  <div style={{ color: "red", fontSize: "0.875rem" }}>
                    {formik.errors.password}
                  </div>
                )}
              </FormControl>

              <div className="flex flex-row-reverse justify-between items-center">
                <button
                  type="submit"
                  className="p-2 bg-primary-500 transition-all duration-500 ease-in-out flex flex-row items-center justify-center h-12 w-full space-x-2">
                  {editUserLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditManagerModal;
