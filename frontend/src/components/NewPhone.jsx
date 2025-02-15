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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {
  Autocomplete,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  fetchActiveManagers,
  fetchAllModels,
  fetchAllRegions,
  fetchAllSuppliers,
  registerNewPhone,
} from "../services/services";

const NewPhone = ({ showAddPhone, setShowAddPhone }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [registerPhoneLoading, setRegisterPhoneLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = useSelector((state) => state.userSlice.user.token);

  const { data: activeData } = useQuery(
    ["managers", { status: "active", limit: 1000 }],
    ({ queryKey, signal }) => fetchActiveManagers({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  const { data: regions } = useQuery(
    ["regions", { page: 1, limit: 100 }],
    ({ queryKey, signal }) => fetchAllRegions({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  const filteredManagers = selectedRegion
    ? activeData?.managers?.filter(
        (manager) => manager.regionId === selectedRegion
      )
    : [];

  const { data: suppliers } = useQuery(
    ["suppliers", { limit: 100 }],
    ({ queryKey, signal }) => fetchAllSuppliers({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  const { data: models } = useQuery(
    ["models", { page: 1, limit: 100 }],
    ({ queryKey, signal }) => fetchAllModels({ queryKey, signal, token }),
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

  const useRegisterPhone = () => {
    return useMutation(
      ({ phoneData, token }) => registerNewPhone(phoneData, token),
      {
        onMutate: () => {
          setRegisterPhoneLoading(true);
        },
        onSuccess: () => {
          setRegisterPhoneLoading(false);
          queryClient.invalidateQueries(["phones"]);
          toast.success("Phone registered");
          formik.resetForm();
          if (isSmallScreen) {
            setShowAddPhone(false);
          } else {
            setShowAddPhone(false);
            dispatch(setSidebar(true));
          }
        },
        onError: (error) => {
          setRegisterPhoneLoading(false);
          toast.error(error.message || "Failed to register phone");
        },
      }
    );
  };

  const registerPhoneMutation = useRegisterPhone();

  const validationSchema = yup.object({
    modelId: yup.string("Enter the phone model").required("Model is required"),
    imei: yup
      .string("Enter the phone IMEI")
      .matches(/^\d+$/, "IMEI should be numeric")
      .required("IMEI is required"),
    supplier: yup
      .number("Supplier must be a valid ID")
      .nullable()
      .required("Supplier is required"),
    manager: yup
      .number("Manager must be a valid ID")
      .nullable()
      .required("Manager is required"),
    buyingPrice: yup
      .number("Enter the buying price")
      .positive("Buying price must be a positive number")
      .required("Buying price is required"),
    sellingPrice: yup
      .number("Enter the selling price")
      .positive("Selling price must be a positive number")
      .required("Selling price is required"),
    capacity: yup
      .number("Enter the phone capacity")
      .positive("Capacity must be a positive number")
      .required("Capacity is required"),
    supplyDate: yup
      .date("Enter the supply date")
      .max(new Date(), "Supply date cannot be later than today")
      .required("Supply date is required"),
  });

  const formik = useFormik({
    initialValues: {
      modelId: "",
      imei: "",
      supplier: null,
      manager: null,
      buyingPrice: "",
      sellingPrice: "",
      capacity: "",
      supplyDate: dayjs().format("YYYY-MM-DD"),
    },

    validationSchema,
    onSubmit: (values) => {
      const phoneData = { ...values, make: "samsung" };
      registerPhoneMutation.mutate({ token, phoneData });
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
    setShowAddPhone(false);
    if (!isSmallScreen) {
      dispatch(setSidebar(true));
    }
  };

  return (
    <AnimatePresence>
      {showAddPhone && (
        <motion.div
          {...animation}
          transition={{ duration: 0.5 }}
          className="absolute bottom-0 md:top-0 right-0 w-full h-[85%] md:h-full z-50 md:w-[40%] lg:w-[30%] bg-neutral-100 flex flex-col items-center p-2 max-h-screen">
          <div className=" w-full  md:hidden relative">
            <div className="absolute -top-10 right-2 p-1">
              <CiSaveDown2
                size={28}
                className="cursor-pointer text-red-500  hover:text-red-400"
                onClick={() => onCloseModal()}
              />
            </div>
          </div>
          <div className="overflow-auto">
            <div className="relative w-full hidden md:flex">
              <MdOutlineCancel
                size={28}
                className="cursor-pointer text-red-500 hover:text-red-400 absolute top-0 right-0"
                onClick={() => onCloseModal()}
              />
            </div>

            <div className="w-full">
              <div className="w-full text-center text-lg py-2 font-roboto font-bold">
                New phone
              </div>
              <div className="w-full h-full md:h-auto overflow-y-auto px-2 pb-10">
                <form
                  onSubmit={formik.handleSubmit}
                  className="space-y-5 px-2 py-2 pb-10 md:mt-5"
                  autoComplete="off">
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.modelId && Boolean(formik.errors.modelId)
                    }
                    sx={{
                      "& .MuiInputBase-input": { color: "#000" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#2FC3D2" },
                    }}>
                    <InputLabel id="model-label">Model</InputLabel>
                    <Select
                      labelId="model-label"
                      id="model"
                      name="modelId"
                      value={formik.values.modelId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Model"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200,
                            overflowY: "auto",
                          },
                        },
                      }}
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
                      }}>
                      {models?.models?.length > 0 &&
                        models?.models?.map((model) => (
                          <MenuItem key={model.id} value={model.id}>
                            {model.model}
                          </MenuItem>
                        ))}
                    </Select>
                    {formik.touched.modelId && formik.errors.modelId && (
                      <div style={{ color: "red", fontSize: "0.875rem" }}>
                        {formik.errors.modelId}
                      </div>
                    )}
                  </FormControl>

                  <TextField
                    variant="outlined"
                    fullWidth
                    id="imei"
                    name="imei"
                    label="IMEI"
                    value={formik.values.imei}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.imei && Boolean(formik.errors.imei)}
                    helperText={formik.touched.imei && formik.errors.imei}
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

                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="supplier-label">Supplier</InputLabel>
                    <Select
                      labelId="supplier-label"
                      id="supplier"
                      name="supplier"
                      value={formik.values.supplier || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.supplier &&
                        Boolean(formik.errors.supplier)
                      }
                      label="Supplier"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200,
                            overflowY: "auto",
                          },
                        },
                      }}>
                      {suppliers?.suppliers?.map((supplier) => (
                        <MenuItem key={supplier.id} value={supplier.id}>
                          <p className="capitalize">{supplier.name}</p>
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.supplier && formik.errors.supplier && (
                      <div style={{ color: "red", fontSize: "0.875rem" }}>
                        {formik.errors.supplier}
                      </div>
                    )}
                  </FormControl>

                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="region-label">Location</InputLabel>
                    <Select
                      labelId="region-label"
                      id="region"
                      value={selectedRegion}
                      onChange={(event) => {
                        setSelectedRegion(event.target.value);
                        formik.setFieldValue("manager", ""); // Reset manager when region changes
                      }}
                      label="Location"
                      MenuProps={{
                        PaperProps: {
                          style: { maxHeight: 200, overflowY: "auto" },
                        },
                      }}>
                      {regions?.regions?.map((region) => (
                        <MenuItem key={region.id} value={region.id}>
                          {region.location}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Autocomplete
                    fullWidth
                    options={filteredManagers}
                    getOptionLabel={(option) => option.name}
                    value={
                      filteredManagers.find(
                        (m) => m.id === formik.values.manager
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      formik.setFieldValue(
                        "manager",
                        newValue ? newValue.id : ""
                      );
                    }}
                    onBlur={formik.handleBlur}
                    disabled={!selectedRegion}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Manager"
                        variant="outlined"
                        error={
                          formik.touched.manager &&
                          Boolean(formik.errors.manager)
                        }
                        helperText={
                          formik.touched.manager && formik.errors.manager
                        }
                      />
                    )}
                  />
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="buyingPrice"
                    name="buyingPrice"
                    label="Buying Price"
                    value={formik.values.buyingPrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.buyingPrice &&
                      Boolean(formik.errors.buyingPrice)
                    }
                    helperText={
                      formik.touched.buyingPrice && formik.errors.buyingPrice
                    }
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">KSh</InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    variant="outlined"
                    fullWidth
                    id="sellingPrice"
                    name="sellingPrice"
                    label="Selling Price"
                    value={formik.values.sellingPrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.sellingPrice &&
                      Boolean(formik.errors.sellingPrice)
                    }
                    helperText={
                      formik.touched.sellingPrice && formik.errors.sellingPrice
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#ccc" },
                        "&:hover fieldset": { borderColor: "#2FC3D2" },
                        "&.Mui-focused fieldset": { borderColor: "#2FC3D2" },
                      },
                      "& .MuiInputBase-input": { color: "#000" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#2FC3D2" },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">KSh</InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    variant="outlined"
                    type="number"
                    fullWidth
                    id="capacity"
                    name="capacity"
                    label="Capacity"
                    value={formik.values.capacity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.capacity && Boolean(formik.errors.capacity)
                    }
                    helperText={
                      formik.touched.capacity && formik.errors.capacity
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#ccc" },
                        "&:hover fieldset": { borderColor: "#2FC3D2" },
                        "&.Mui-focused fieldset": { borderColor: "#2FC3D2" },
                      },
                      "& .MuiInputBase-input": { color: "#000" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#2FC3D2" },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">GB</InputAdornment>
                      ),
                    }}
                  />

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div className="w-full">
                      <DatePicker
                        label="Date Supplied"
                        value={
                          formik.values.supplyDate
                            ? dayjs(formik.values.supplyDate)
                            : null
                        }
                        onChange={(newValue) => {
                          formik.setFieldValue(
                            "supplyDate",
                            newValue ? newValue.format("YYYY-MM-DD") : ""
                          );
                        }}
                        onBlur={formik.handleBlur}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth // Ensures the input field takes full width
                            error={
                              formik.touched.supplyDate &&
                              Boolean(formik.errors.supplyDate)
                            }
                            helperText={
                              formik.touched.supplyDate &&
                              formik.errors.supplyDate
                            }
                          />
                        )}
                        sx={{
                          width: "100%", // Ensures DatePicker takes full width
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: "#ccc" },
                            "&:hover fieldset": { borderColor: "#2FC3D2" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#2FC3D2",
                            },
                          },
                          "& .MuiInputBase-input": { color: "#000" },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#2FC3D2",
                          },
                        }}
                      />
                    </div>
                  </LocalizationProvider>
                  <div className="flex flex-row-reverse justify-between items-center">
                    <button
                      type="submit"
                      className="p-2 bg-primary-500 transition-all duration-500 ease-in-out flex flex-row items-center justify-center h-12 w-full space-x-2">
                      {registerPhoneLoading
                        ? "Registering device ..."
                        : "Register device"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewPhone;
