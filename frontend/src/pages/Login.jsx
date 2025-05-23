import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser, logoutUser } from "../redux/reducers/user";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { LuEye } from "react-icons/lu";
import { LuEyeOff } from "react-icons/lu";
import { IconButton, InputAdornment } from "@mui/material";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, error, user } = useSelector((state) => state.userSlice);
  // Notifications
  const loginNotify = () => toast.success("Logged in successfully!");
  const errorNotify = (message) => toast.error(message || "Login failed");

  useEffect(() => {
    if (user) {
      loginNotify();

      console.log(user);

      const role = user?.user?.role;

      switch (role) {
        case "manager":
        case "shop keeper":
          navigate("/inventory");
          break;
        case "collection officer":
          navigate("/customers");
          break;
        default:
          navigate("/");
      }
    } else if (error) {
      errorNotify(error || "Login failed");
      dispatch(logoutUser());
    }
  }, [user, error, navigate, dispatch]);

  const validationSchema = yup.object({
    email: yup
      .string("Enter your email")
      .email("Enter a valid email")
      .required("Email is required"),

    password: yup
      .string("Enter your password")
      .min(8, "Password should be at least 8 characters long")
      .required("Password is required"),
  });
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      dispatch(loginUser(values));
    },
  });

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="bg-gradient-to-br from-slate-200 via-primary-300 to-green-400 flex flex-col justify-center items-center h-screen">
      <div className=" bg-white md:rounded-lg p-5 py-10 flex flex-col justify-between items-center">
        <img
          src="shuhari-logo2.png"
          alt="logo"
          className="h-20 md:h-24 mb-10 transition-all duration-1000 ease-in-out"
        />
        <p className="text-2xl lg:text-2xl font-roboto font-bold text-slate-700 transition-all duration-1000 ease-in-out">
          Welcome Back
        </p>
        <p className="text-md text-neutral-500 font-roboto mt-2">
          Enter your credentials to access your account
        </p>
        <form
          onSubmit={formik.handleSubmit}
          className="space-y-5 md:px-5 py-10 transition-all duration-1000 ease-in-out w-full md:w-[550px]">
          <TextField
            variant="outlined"
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            autoComplete="email"
            InputLabelProps={{
              shrink: Boolean(formik.values.email || formik.touched.email),
            }}
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
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            autoComplete="new-password"
            InputLabelProps={{
              shrink: Boolean(
                formik.values.password || formik.touched.password
              ),
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <LuEyeOff /> : <LuEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-sm md:rounded-md min-h-10 p-1 md:p-2 bg-primary-500 font-bold text-white hover:bg-primary-600 transition-colors">
            {isLoading ? "Authenticating..." : "Login"}
          </button>
        </form>
        <p className="cursor-pointer mt-10 text-md text-slate-800 font-roboto font-bold">
          Forgort password?
          <span className="text-primary-500 font-roboto font-bold hover:text-primary-600 pl-2">
            Contact your administrator
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
