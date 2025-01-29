import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { CiSaveDown2 } from "react-icons/ci";
import { useFormik } from "formik";
import * as yup from "yup";
import TextField from "@mui/material/TextField";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setSidebar } from "../redux/reducers/ sidebar";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import { IoIosArrowBack } from "react-icons/io";
import { BiCartAlt } from "react-icons/bi";
import { MdOutlineNavigateNext } from "react-icons/md";
import html2canvas from "html2canvas";

import {
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
  fetchAllSuppliers,
  registerNewPhone,
} from "../services/services";

const PhoneCheckout = ({ showPhoneCheckout, setShowPhoneCheckout }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    firstName: "",
    lastName: "",
    nkFirstName: "",
    nkLastName: "",
    nkPhone: "",
    phone: "",
  });
  const [registerPhoneLoading, setRegisterPhoneLoading] = useState(false);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = useSelector((state) => state.userSlice.user.token);
  const [step, setStep] = useState(2);
  const [sellingCompany, setSellingCompany] = useState("muchami");

  const steps = ["Customer details", "Chose company", "Confirm details"];
  const receiptRef = useRef(null);

  const downloadReceipt = async () => {
    if (receiptRef.current) {
      const canvas = await html2canvas(receiptRef.current, { scale: 2 });
      const image = canvas.toDataURL("image/png");

      // Create a download link
      const link = document.createElement("a");
      link.href = image;
      link.download = "receipt.png";
      link.click();
    }
  };

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
          toast.success("Phone registered successfully");
          formik.resetForm();
          if (isSmallScreen) {
            setShowPhoneCheckout(false);
          } else {
            setShowPhoneCheckout(false);
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
    firstName: yup
      .string("Enter the first name")
      .required("First name is required"),
    lastName: yup
      .string("Enter the last name")
      .required("Last name is required"),
    nkFirstName: yup
      .string("Enter the first name")
      .required("First name is required"),
    nkLastName: yup
      .string("Enter the last name")
      .required("Last name is required"),
    nkPhone: yup
      .string("Enter the phone number")
      .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
      .required("Phone number is required"),
    phone: yup
      .string("Enter the secondary phone number")
      .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
      .required(" Phone number is required"),
  });

  const formik = useFormik({
    initialValues: customerDetails,

    validationSchema,
    onSubmit: (values) => {
      setCustomerDetails(values);
      console.log(values);
      setStep(1);
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
    setShowPhoneCheckout(false);
    if (!isSmallScreen) {
      dispatch(setSidebar(true));
    }
  };

  return (
    <AnimatePresence>
      {showPhoneCheckout && (
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
            <div className="w-full  text-lg py-2">
              <p className="font-roboto text-center font-bold">
                Phone Checkout
              </p>
            </div>
            <Box sx={{ width: "100%" }}>
              <Stepper activeStep={step} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
            {step === 0 && (
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
                  helperText={
                    formik.touched.firstName && formik.errors.firstName
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
                  label="Phone Number"
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

                <TextField
                  variant="outlined"
                  fullWidth
                  id="nkFirstName"
                  name="nkFirstName"
                  label="Next of Kin First Name"
                  value={formik.values.nkFirstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.nkFirstName &&
                    Boolean(formik.errors.nkFirstName)
                  }
                  helperText={
                    formik.touched.nkFirstName && formik.errors.nkFirstName
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
                />

                <TextField
                  variant="outlined"
                  fullWidth
                  id="nkLastName"
                  name="nkLastName"
                  label="Next of Kin Last Name"
                  value={formik.values.nkLastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.nkLastName &&
                    Boolean(formik.errors.nkLastName)
                  }
                  helperText={
                    formik.touched.nkLastName && formik.errors.nkLastName
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
                />

                <TextField
                  variant="outlined"
                  fullWidth
                  id="nkPhone"
                  name="nkPhone"
                  label="Next of Kin Phone Number"
                  value={formik.values.nkPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.nkPhone && Boolean(formik.errors.nkPhone)
                  }
                  helperText={formik.touched.nkPhone && formik.errors.nkPhone}
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

                <div className="flex flex-row-reverse justify-between items-center">
                  <button
                    type="submit"
                    className="p-2 bg-primary-500 transition-all duration-500 ease-in-out flex flex-row items-center justify-center h-12 w-full space-x-2">
                    Proceed
                  </button>
                </div>
              </form>
            )}

            {step === 1 && (
              <div className="py-10">
                <FormControl sx={{ px: { md: 5 } }}>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    value={sellingCompany}
                    onChange={(e) => setSellingCompany(e.target.value)}>
                    <FormControlLabel
                      value="muchami"
                      control={<Radio />}
                      label="Muchami"
                    />
                    <FormControlLabel
                      value="shuhari"
                      control={<Radio />}
                      label="Shuhari"
                    />
                  </RadioGroup>
                </FormControl>
                <div className="h-44 md:px-10">
                  {sellingCompany === "muchami" && (
                    <img
                      alt="muchami logo"
                      src="/muchami.png"
                      className="w-60 h-32"
                    />
                  )}
                  {sellingCompany === "shuhari" && (
                    <img
                      alt="shuhari logo"
                      src="/shuhari-logo2.png"
                      className="h-40 p-5 bg-white"
                    />
                  )}
                </div>
                <div className="py-5 w-full flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                  <button
                    className="p-3 bg-primary-500 flex items-center justify-center text-white  hover:bg-primary-600 transition-all duration-300 ease-in-out w-full md:w-32 space-x-2"
                    onClick={() => setStep(0)}>
                    <IoIosArrowBack size={20} className="md:mr-2" />
                    <span className="text-sm md:text-base">Back</span>
                  </button>
                  <button
                    className="p-3 bg-primary-500 flex items-center justify-center text-white  hover:bg-primary-600 transition-all duration-300 ease-in-out w-full md:w-32 space-x-2"
                    onClick={() => setStep(2)}>
                    <span className="text-sm md:text-base">Proceed</span>
                    <MdOutlineNavigateNext size={20} className="md:ml-2" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="py-5">
                <div className="flex flex-col justify-center items-center">
                  <div
                    ref={receiptRef}
                    className="p-5 border border-gray-500 h-full w-80  bg-white">
                    <div className="flex flex-col items-center">
                      <img
                        alt="lgo"
                        src="/shuhari-logo1.png"
                        className="w-40"
                      />
                      <p className="font-roboto font-bold uppercase pt-2 text-lg">
                        Shuhari communication
                      </p>
                      <p className="font-roboto font-medium uppercase text-sm">
                        Likoni Mall first floor -F21
                      </p>
                      <p className="font-roboto font-medium uppercase text-xs">
                        Tel: +254 720 3900 41 /+254 780 3900 41
                      </p>
                    </div>

                    <hr className="my-2 w-full bg-black h-1" />
                    <div className="flex flex-row justify-between items-center">
                      <p className="font-semibold text-sm text-neutral-700">
                        Rcpt: 001
                      </p>
                      <p className="font-semibold text-sm text-neutral-700">
                        Date: 02/01/2025
                      </p>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                      <p className="font-semibold text-sm text-neutral-700">
                        Served by: Amos
                      </p>
                      <p className="font-semibold text-sm text-neutral-700">
                        Time: 05:22 pm
                      </p>
                    </div>
                    <p className="font-semibold text-sm text-neutral-700">
                      Location: Mombasa
                    </p>
                    <hr className="my-2 w-full bg-black h-1" />
                    <p className="font-semibold text-sm text-neutral-700">
                      Name: Emmanuel Joseph
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      Tel: +254798989489
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      ID No: 67746684
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      NOK Name: Mary Luke
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      NOK Tel: +254787894849
                    </p>
                    <hr className="my-2 w-full bg-black h-1" />
                    <p className="font-bold uppercase text-center">
                      Phone description
                    </p>
                    <hr className="my-2 w-full bg-black h-1" />
                    <p className="font-semibold text-sm text-neutral-700">
                      Phone model: A05
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      Capacity: 64GB
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      IMEI: 787884747
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      Waranty: 2 years
                    </p>
                    <hr className="my-2 w-full bg-black h-1" />
                    <p className="font-roboto text-center uppercase font-semibold mb-2">
                      Gross total: 15,000/=
                    </p>
                    <div className="p-2 flex flex-row items-center border border-neutral-500 rounded-md">
                      <div className="w-[50%]">
                        <img alt="buy now pay later" src="/buynow-logo.png" />
                      </div>
                      <div className="flex flex-col w-[50%]">
                        <img
                          alt="samsung logo"
                          src="/samsung-logo.png"
                          className="w-20"
                        />
                        <img
                          alt="watu logo"
                          src="/watu-logo1.png"
                          className="w-20"
                        />
                      </div>
                    </div>
                    <p className=" text-sm italic text-neutral-700 text-center">
                      Thank you for shopping with us
                    </p>
                    <p className=" italic text-sm text-neutral-700 text-center">
                      Goods Once Sold Cannot be Re-accepted
                    </p>
                  </div>
                </div>

                <div className="py-5 w-full flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                  <button
                    className="p-3 bg-primary-500 flex items-center justify-center text-white  hover:bg-primary-600 transition-all duration-300 ease-in-out w-full md:w-32 space-x-2"
                    onClick={() => setStep(1)}>
                    <IoIosArrowBack size={20} className="md:mr-2" />
                    <span className="text-sm md:text-base">Back</span>
                  </button>
                  <button
                    onClick={downloadReceipt}
                    className="p-3 bg-primary-500 flex items-center justify-center text-white  hover:bg-primary-600 transition-all duration-300 ease-in-out w-full md:w-32 space-x-2">
                    <span className="text-sm md:text-base">Checkout</span>
                    <MdOutlineNavigateNext size={20} className="md:ml-2" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhoneCheckout;
