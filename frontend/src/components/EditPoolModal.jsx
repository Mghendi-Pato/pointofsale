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
  editPool,
  fetchActiveManagers,
  fetchAllRegions,
} from "../services/services";

const EditPool = ({
  setEditPool,
  pool,
  showEditPoolModal,
  setShowEditPoolModal,
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [editPoolLoading, setEditPoolLoading] = useState(false);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = useSelector((state) => state.userSlice.user.token);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const formatNumber = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Format with commas
  };

  console.log("Pool", pool);

  const handlePriceChange = (fieldName) => (event) => {
    let rawValue = event.target.value.replace(/,/g, ""); // Remove commas
    if (!/^\d*$/.test(rawValue)) return; // Ensure it's numeric

    formik.setFieldValue(fieldName, rawValue); // Store only numeric value
  };

  // Format value for display
  const getFormattedValue = (value) => (value ? formatNumber(value) : "");

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
    name: yup.string().required("Pool name is required"),
    superManager: yup
      .number("Manager must be a valid ID")
      .nullable()
      .required("Manager is required"),
    poolCommission: yup
      .number("Enter the commission")
      .positive("Commission must be a positive number")
      .required("Commission is required"),
    poolManagers: yup
      .array()
      .of(yup.number().typeError("Manager ID must be a number"))
      .min(1, "Select at least one pool manager")
      .required("Pool managers are required"),
  });

  const useEditPool = () => {
    return useMutation(
      ({ poolId, poolData, token }) => editPool(poolId, poolData, token),
      {
        onMutate: () => {
          setEditPoolLoading(true);
        },
        onSuccess: () => {
          setEditPoolLoading(false);
          queryClient.invalidateQueries(["pools"]);
          toast.success("Pool details updated successfully");
          formik.resetForm();
          setEditPool([]);
          if (isSmallScreen) {
            setShowEditPoolModal(false);
          } else {
            setShowEditPoolModal(false);
            dispatch(setSidebar(true));
          }
        },
        onError: (error) => {
          setEditPoolLoading(false);
          toast.error(error.message || "Failed to update pool details");
        },
      }
    );
  };

  const editPoolMutation = useEditPool();

  const formik = useFormik({
    initialValues: {
      name: pool?.name || "",
      superManager: pool?.superManagerId || null,
      poolCommission: pool?.poolCommission || "",
      poolManagers: pool?.members || [],
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      if (!pool) return;
      editPoolMutation.mutate({ token, poolData: values, poolId: pool.id });
    },
  });

  const onCloseModal = () => {
    setShowEditPoolModal(false);
    setEditPool([]);
    if (!isSmallScreen) {
      dispatch(setSidebar(true));
    }
  };

  const { data: regions } = useQuery(
    ["regions", { page: 1, limit: 100 }],
    ({ queryKey, signal }) => fetchAllRegions({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  const { data: activeData } = useQuery(
    ["managers", { status: "active", limit: 1000 }],
    ({ queryKey, signal }) => fetchActiveManagers({ queryKey, signal, token }),
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

  return (
    <AnimatePresence>
      {showEditPoolModal && (
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
              <p className="font-roboto font-bold">Edit Pool</p>
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

              <FormControl fullWidth variant="outlined">
                <InputLabel id="region-label">Location</InputLabel>
                <Select
                  labelId="region-label"
                  id="region"
                  value={selectedRegion}
                  onChange={(event) => {
                    setSelectedRegion(event.target.value);
                  }}
                  label="Location"
                  MenuProps={{
                    PaperProps: {
                      style: { maxHeight: 200, overflowY: "auto" },
                    },
                  }}>
                  <MenuItem value="">All Locations</MenuItem>
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
                    (m) => m.id === formik.values.superManager
                  ) || null
                }
                onChange={(event, newValue) => {
                  formik.setFieldValue(
                    "superManager",
                    newValue ? newValue.id : ""
                  );
                }}
                onBlur={formik.handleBlur}
                disabled={!selectedRegion}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Super Manager"
                    variant="outlined"
                    error={
                      formik.touched.superManager &&
                      Boolean(formik.errors.superManager)
                    }
                    helperText={
                      formik.touched.superManager && formik.errors.superManager
                    }
                  />
                )}
              />

              <TextField
                variant="outlined"
                fullWidth
                id="poolCommission"
                name="poolCommission"
                label="Pool Commission"
                value={getFormattedValue(formik.values.poolCommission)}
                onChange={handlePriceChange("poolCommission")}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.poolCommission &&
                  Boolean(formik.errors.poolCommission)
                }
                helperText={
                  formik.touched.poolCommission && formik.errors.poolCommission
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

              <Autocomplete
                fullWidth
                multiple
                options={
                  selectedRegion ? filteredManagers : activeData?.managers || []
                }
                getOptionLabel={(option) =>
                  `${option.name} (${option.location || "Unknown"})`
                }
                value={formik.values.poolManagers
                  .map(
                    (id) =>
                      activeData?.managers?.find(
                        (manager) => manager.id === id
                      ) || null
                  )
                  .filter(Boolean)}
                onChange={(event, newValues) => {
                  formik.setFieldValue(
                    "poolManagers",
                    newValues.map((manager) => manager.id)
                  );
                }}
                onBlur={formik.handleBlur}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pool Managers"
                    placeholder={
                      formik.values.poolManagers.length === 0
                        ? "Select managers"
                        : ""
                    }
                    variant="outlined"
                    error={
                      formik.touched.poolManagers &&
                      Boolean(formik.errors.poolManagers)
                    }
                    helperText={
                      (formik.touched.poolManagers &&
                        formik.errors.poolManagers) ||
                      "You can select managers from different locations"
                    }
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div className="flex justify-between w-full">
                      <span>{option.name}</span>
                      <span className="text-xs text-gray-500">
                        {option.location || "Unknown"}
                        {formik.values.superManager === option.id &&
                          " (Super Manager)"}
                      </span>
                    </div>
                  </li>
                )}
                limitTags={3}
                filterSelectedOptions
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#ccc" },
                    "&:hover fieldset": { borderColor: "#2FC3D2" },
                    "&.Mui-focused fieldset": { borderColor: "#2FC3D2" },
                  },
                }}
              />

              <div className="flex flex-row-reverse justify-between items-center">
                <button
                  type="submit"
                  className="p-2 bg-primary-500 transition-all duration-500 ease-in-out flex flex-row items-center justify-center h-12 w-full space-x-2">
                  {editPoolLoading ? "Updating Pool ..." : "Edit Pool"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditPool;
