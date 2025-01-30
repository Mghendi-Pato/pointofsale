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
import { registerNewRegion } from "../services/services";

const NewRegion = ({ showAddRegion, setShowAddRegion }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [registerRegionLoading, setRegisterRegionLoading] = useState(false);
  const token = useSelector((state) => state.userSlice.user.token);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaChange = () => setIsSmallScreen(mediaQuery.matches);
    handleMediaChange();
    mediaQuery.addEventListener("change", handleMediaChange);
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
    name: yup.string("Enter your name").required("Name is required"),
    location: yup
      .string("Enter your location")
      .required("Location is required"),
  });

  const useRegisterRegion = () => {
    return useMutation(
      ({ regionData, token }) => registerNewRegion(regionData, token),
      {
        onMutate: () => {
          setRegisterRegionLoading(true);
        },
        onSuccess: () => {
          setRegisterRegionLoading(false);
          queryClient.invalidateQueries(["regions"]);
          toast.success("Region registered");
          formik.resetForm();
          if (isSmallScreen) {
            setShowAddRegion(false);
          } else {
            setShowAddRegion(false);
            dispatch(setSidebar(true));
          }
        },
        onError: (error) => {
          setRegisterRegionLoading(false);
          toast.error(error.message || "Failed to register region");
        },
      }
    );
  };

  const registerRegionMutation = useRegisterRegion();

  const formik = useFormik({
    initialValues: {
      name: "",
      location: "",
    },
    validationSchema,
    onSubmit: (values) => {
      registerRegionMutation.mutate({ regionData: values, token });
    },
  });

  const onCloseModal = () => {
    setShowAddRegion(false);
    formik.resetForm();
    if (!isSmallScreen) {
      dispatch(setSidebar(true));
    }
  };

  return (
    <AnimatePresence>
      {showAddRegion && (
        <motion.div
          {...animation}
          transition={{ duration: 0.5 }}
          className="absolute bottom-0 md:top-0 right-0 w-full h-[81%] md:h-full z-50 md:w-[50%] lg:w-[30%] bg-neutral-100 flex flex-col items-center p-2">
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
              <p className="font-roboto font-bold">Add Region</p>
            </div>
            <form
              onSubmit={formik.handleSubmit}
              className="space-y-5 px-2 pb-10 md:mt-5"
              autoComplete="off">
              <TextField
                variant="outlined"
                fullWidth
                id="name"
                name="name"
                label="Region"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
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
                id="location"
                name="location"
                label="Location"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.location && Boolean(formik.errors.location)
                }
                helperText={formik.touched.location && formik.errors.location}
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

              <div className="flex flex-row-reverse justify-between items-center">
                <button
                  type="submit"
                  className="p-2 bg-primary-500 transition-all duration-500 ease-in-out flex flex-row items-center justify-center h-12 w-full space-x-2">
                  {registerRegionLoading ? "Adding ..." : "Add region"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewRegion;
