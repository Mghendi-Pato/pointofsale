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
import { editSupplierService } from "../services/services";
import { useMutation, useQueryClient } from "react-query";

const EditSupplier = ({
  showEditSupplier,
  setShowEditSupplier,
  editSupplier,
  setEditSupplier,
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [editSupplierLoading, setEditSupplierLoading] = useState(false);
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
    phone: yup
      .string("Enter your phone number")
      .matches(
        /^(\+\d{1,3}[- ]?)?\d{10}$/,
        "Enter a valid phone number with 10 digits"
      )
      .required("Phone number is required"),
  });

  const useEditSupplier = () => {
    return useMutation(
      ({ supplierId, supplierData, token }) =>
        editSupplierService(supplierId, supplierData, token),
      {
        onMutate: () => {
          setEditSupplierLoading(true);
        },
        onSuccess: () => {
          setEditSupplierLoading(false);
          queryClient.invalidateQueries(["suppliers"]);
          toast.success("Supplier updated successfully");
          formik.resetForm();
          setEditSupplier(null);
          if (isSmallScreen) {
            setShowEditSupplier(false);
          } else {
            setShowEditSupplier(false);
            dispatch(setSidebar(true));
          }
        },
        onError: (error) => {
          setEditSupplierLoading(false);
          toast.error(error.message || "Failed to update supplier");
        },
      }
    );
  };

  const editSupplierMutation = useEditSupplier();

  const formik = useFormik({
    initialValues: {
      name: editSupplier?.name || "",
      phone: editSupplier?.contact || editSupplier?.phone || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      if (editSupplier?.id) {
        editSupplierMutation.mutate({
          supplierId: editSupplier.id,
          supplierData: values,
          token,
        });
      }
    },
  });

  const onCloseModal = () => {
    setShowEditSupplier(false);
    setEditSupplier(null);
    formik.resetForm();
    if (!isSmallScreen) {
      dispatch(setSidebar(true));
    }
  };

  return (
    <AnimatePresence>
      {showEditSupplier && (
        <motion.div
          {...animation}
          transition={{ duration: 0.5 }}
          className="absolute bottom-0 md:top-0 right-0 w-full h-[81%] md:h-full z-50 md:min-w-[40%] lg:w-[30%] bg-neutral-100 flex flex-col items-center p-2">
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
              <p className="font-roboto font-bold">Edit Supplier</p>
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
                label="Name"
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
                      borderColor: "#3B82F6", // Hover state color
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3B82F6", // Focused state color
                    },
                  },
                  "& .MuiInputBase-input": { color: "#000" }, // Input text color
                  "& .MuiInputLabel-root.Mui-focused": { color: "#3B82F6" }, // Focused label color
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
                      borderColor: "#ccc", // Default border color
                    },
                    "&:hover fieldset": {
                      borderColor: "#3B82F6", // Hover state color
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3B82F6", // Focused state color
                    },
                  },
                  "& .MuiInputBase-input": { color: "#000" }, // Input text color
                  "& .MuiInputLabel-root.Mui-focused": { color: "#3B82F6" }, // Focused label color
                }}
              />

              <div className="flex flex-row-reverse justify-between items-center">
                <button
                  type="submit"
                  disabled={
                    editSupplierLoading ||
                    (() => {
                      const originalPhone =
                        editSupplier?.contact || editSupplier?.phone || "";
                      return (
                        formik.values.name === editSupplier?.name &&
                        formik.values.phone === originalPhone
                      );
                    })()
                  }
                  className={`p-2 ${
                    editSupplierLoading ||
                    (() => {
                      const originalPhone =
                        editSupplier?.contact || editSupplier?.phone || "";
                      return (
                        formik.values.name === editSupplier?.name &&
                        formik.values.phone === originalPhone
                      );
                    })()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary-700"
                  } text-white transition-all duration-500 ease-in-out flex flex-row items-center justify-center h-12 w-full space-x-2`}>
                  {editSupplierLoading ? "Updating ..." : "Update Supplier"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditSupplier;
