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
  Autocomplete,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  declarePhoneLost,
  editPhoneDetails,
  fetchActiveManagers,
  fetchAllModels,
  fetchAllRegions,
  fetchAllSuppliers,
} from "../services/services";

const EditPhone = ({
  showEditPhoneModal,
  setShowEditPhoneModal,
  phone,
  setEditPhone,
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [editPhoneLoading, setEditPhoneLoading] = useState(false);
  const [declareLostLoading, setDeclareLostLoading] = useState(false);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = useSelector((state) => state.userSlice.user.token);
  const user = useSelector((state) => state.userSlice.user.user);
  const [selectedRegion, setSelectedRegion] = useState(phone?.regionId);

  useEffect(() => {
    if (phone?.regionId) {
      setSelectedRegion(phone.regionId);
    }
  }, [phone?.regionId]);

  const { data: activeData } = useQuery(
    ["managers", { status: "active", limit: 1000 }],
    ({ queryKey, signal }) => fetchActiveManagers({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)"); // Tailwind's `md` breakpoint
    const handleMediaChange = () => setIsSmallScreen(mediaQuery.matches);

    handleMediaChange(); // Initialize state on component mount
    mediaQuery.addEventListener("change", handleMediaChange); // Listen for screen size changes

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const useEditPhone = () => {
    return useMutation(
      ({ phoneId, phoneData, token }) =>
        editPhoneDetails(phoneId, phoneData, token),
      {
        onMutate: () => {
          setEditPhoneLoading(true);
        },
        onSuccess: () => {
          setEditPhoneLoading(false);
          queryClient.invalidateQueries(["phones"]);
          toast.success("Phone details updated");
          formik.resetForm();
          setEditPhone([]);
          if (isSmallScreen) {
            setShowEditPhoneModal(false);
          } else {
            setShowEditPhoneModal(false);
            dispatch(setSidebar(true));
          }
        },
        onError: (error) => {
          setEditPhoneLoading(false);
          toast.error(error.message || "Failed to update phone details");
        },
      }
    );
  };

  const editPhoneMutation = useEditPhone();

  const useDeclarePhoneLost = () => {
    return useMutation(
      ({ phoneId, token }) => declarePhoneLost(phoneId, token),
      {
        onMutate: () => {
          setDeclareLostLoading(true);
        },
        onSuccess: () => {
          setDeclareLostLoading(false);

          queryClient.invalidateQueries(["phones"]);
          if (isSmallScreen) {
            setShowEditPhoneModal(false);
          } else {
            setShowEditPhoneModal(false);
            dispatch(setSidebar(true));
          }
          toast.success("Phone declared lost");
        },
        onError: (error) => {
          setDeclareLostLoading(false);
          toast.error(error.message || "Failed to declare phone lost");
        },
      }
    );
  };

  const declareLostMutation = useDeclarePhoneLost();

  const validationSchema = yup.object({
    model: yup.string("Enter the phone model").required("Model is required"),
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
      .number("Enter the capacity")
      .positive("Capacity must be a positive number")
      .required("Capacity is required"),
  });

  const formik = useFormik({
    initialValues: {
      model: phone?.modelId || "",
      imei: phone?.imei || "",
      supplier: phone?.supplierId || null,
      manager: phone?.managerId || null,
      buyingPrice: phone?.purchasePrice || "",
      sellingPrice: phone?.sellingPrice || "",
      capacity: phone?.capacity || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      console.log(values);
      const fieldMapping = {
        supplier: "supplierId",
        manager: "managerId",
        buyingPrice: "purchasePrice",
      };

      const changedValues = Object.keys(values).reduce((acc, key) => {
        const mappedKey = fieldMapping[key] || key;
        if (values[key] !== formik.initialValues[key]) {
          acc[mappedKey] = values[key];
        }
        return acc;
      }, {});

      if (Object.keys(changedValues).length > 0) {
        editPhoneMutation.mutate({
          phoneId: phone.id,
          phoneData: changedValues,
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
    setShowEditPhoneModal(false);
    setEditPhone([]);
    if (!isSmallScreen) {
      dispatch(setSidebar(true));
    }
  };

  const declareLostPhone = (phoneId) => {
    declareLostMutation.mutate({ phoneId, token });
  };
  return (
    <AnimatePresence>
      {showEditPhoneModal && (
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
              <p className="font-roboto font-bold">Edit Phone</p>
            </div>
            <form
              onSubmit={formik.handleSubmit}
              className="space-y-5 px-2 pb-10 md:mt-5"
              autoComplete="off">
              <FormControl
                fullWidth
                error={formik.touched.model && Boolean(formik.errors.model)}
                sx={{
                  "& .MuiInputBase-input": { color: "#000" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#2FC3D2" },
                }}>
                <InputLabel id="model-label">Model</InputLabel>
                <Select
                  labelId="model-label"
                  id="model"
                  name="model"
                  value={formik.values.model}
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
                  {models?.models?.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.model}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.model && formik.errors.model && (
                  <div style={{ color: "red", fontSize: "0.875rem" }}>
                    {formik.errors.model}
                  </div>
                )}
              </FormControl>

              {user.role === "super admin" && (
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
              )}

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
                    formik.touched.supplier && Boolean(formik.errors.supplier)
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
                  formik.setFieldValue("manager", newValue ? newValue.id : "");
                }}
                onBlur={formik.handleBlur}
                disabled={!selectedRegion}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Manager"
                    variant="outlined"
                    error={
                      formik.touched.manager && Boolean(formik.errors.manager)
                    }
                    helperText={formik.touched.manager && formik.errors.manager}
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
                helperText={formik.touched.capacity && formik.errors.capacity}
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

              <div className="flex flex-row-reverse justify-between items-center">
                <button
                  type="submit"
                  className="p-2 bg-primary-500 transition-all duration-500 ease-in-out flex flex-row items-center justify-center h-12 w-full space-x-2">
                  {editPhoneLoading ? "Updating device ..." : "Update device"}
                </button>
                <button
                  onClick={() => declareLostPhone(phone.id)}
                  type="button"
                  className="p-2 bg-amber-500 transition-all duration-500 ease-in-out flex flex-row items-center justify-center h-12 w-full space-x-2">
                  {declareLostLoading ? "Updating device ..." : "Declare lost"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditPhone;
