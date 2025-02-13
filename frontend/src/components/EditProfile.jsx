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
import { useMutation, useQueryClient } from "react-query";
import { editUser } from "../services/services";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { LuEye } from "react-icons/lu";
import { LuEyeOff } from "react-icons/lu";

const EditProfile = ({
  showEditProfileModal,
  setShowEditProfileModal,
  user,
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = useSelector((state) => state.userSlice.user.token);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaChange = () => setIsSmallScreen(mediaQuery.matches);

    handleMediaChange();
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const useEditUser = () => {
    return useMutation(
      ({ userId, userData, token }) => editUser(userId, userData, token),
      {
        onMutate: () => {
          setEditUserLoading(true);
        },
        onSuccess: () => {
          setEditUserLoading(false);
          queryClient.invalidateQueries(["users"]);
          toast.success("Success! Logout to complete");
          formik.resetForm();
          if (isSmallScreen) {
            setShowEditProfileModal(false);
          } else {
            setShowEditProfileModal(false);
            dispatch(setSidebar(true));
          }
        },
        onError: (error) => {
          setEditUserLoading(false);
          toast.error(error.message || "Failed to update user details");
        },
      }
    );
  };

  const editUserMutation = useEditUser();

  const validationSchema = yup.object({
    firstName: yup
      .string("Enter your first name")
      .required("First name is required")
      .matches(
        /^[A-Za-z\s]+$/,
        "First name should contain only letters and spaces"
      ),

    lastName: yup
      .string("Enter your last name")
      .required("Last name is required")
      .matches(
        /^[A-Za-z\s]+$/,
        "Last name should contain only letters and spaces"
      ),

    email: yup
      .string("Enter your email")
      .email("Enter a valid email address")
      .required("Email is required"),

    phone: yup
      .string("Enter your phone number")
      .matches(
        /^\+?\d{10,15}$/,
        "Phone number should be 10-15 digits and may include a '+'"
      )
      .required("Phone number is required"),
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

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      password: "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      // Check for changed values
      const changedValues = Object.keys(values).reduce((acc, key) => {
        if (values[key] !== formik.initialValues[key]) {
          acc[key] = values[key];
        }
        return acc;
      }, {});

      if (Object.keys(changedValues).length > 0) {
        editUserMutation.mutate({
          userId: user.id,
          userData: changedValues,
          token,
        });
      } else {
        toast.info("No changes detected");
      }
    },
  });

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

  const onCloseModal = () => {
    setShowEditProfileModal(false);
    if (!isSmallScreen) {
      dispatch(setSidebar(true));
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <AnimatePresence>
      {showEditProfileModal && (
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
              <p className="font-roboto font-bold">Edit phone</p>
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
                    "& fieldset": { borderColor: "#ccc" },
                    "&:hover fieldset": { borderColor: "#2FC3D2" },
                    "&.Mui-focused fieldset": { borderColor: "#2FC3D2" },
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
                    "& fieldset": { borderColor: "#ccc" },
                    "&:hover fieldset": { borderColor: "#2FC3D2" },
                    "&.Mui-focused fieldset": { borderColor: "#2FC3D2" },
                  },
                  "& .MuiInputBase-input": { color: "#000" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2FC3D2" },
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
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#ccc" },
                    "&:hover fieldset": { borderColor: "#2FC3D2" },
                    "&.Mui-focused fieldset": { borderColor: "#2FC3D2" },
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
                label="Phone Number"
                type="tel"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#ccc" },
                    "&:hover fieldset": { borderColor: "#2FC3D2" },
                    "&.Mui-focused fieldset": { borderColor: "#2FC3D2" },
                  },
                  "& .MuiInputBase-input": { color: "#000" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2FC3D2" },
                }}
              />

              {user.role === "super admin" && (
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
              )}

              <div className="flex flex-row-reverse justify-between items-center">
                <button
                  type="submit"
                  className="p-2 bg-primary-500 transition-all duration-500 ease-in-out flex flex-row items-center justify-center h-12 w-full space-x-2">
                  {editUserLoading ? "Upadting..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProfile;
