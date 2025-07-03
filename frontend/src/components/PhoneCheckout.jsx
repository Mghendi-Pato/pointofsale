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
import { IoIosArrowBack } from "react-icons/io";
import { MdOutlineNavigateNext } from "react-icons/md";
import html2canvas from "html2canvas";
import { FormControl } from "@mui/material";
import { useMutation, useQueryClient } from "react-query";
import { sellPhone } from "../services/services";

const PhoneCheckout = ({
  showPhoneCheckout,
  setShowPhoneCheckout,
  phone,
  setPhone,
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    nkFirstName: "",
    nkLastName: "",
    ID: "",
    nkPhone: "",
    phone: "",
  });
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = useSelector((state) => state.userSlice.user.token);
  const [step, setStep] = useState(0);
  const [sellingCompany, setSellingCompany] = useState("shuhari");
  const steps = ["Customer details", "Chose company", "Confirm details"];
  const receiptRef = useRef(null);
  const user = useSelector((state) => state.userSlice.user.user);
  const [sellingPhoneLoading, setSellingPhoneLoading] = useState(false);
  const date = new Date();
  const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`;
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const receiptNumber = Math.floor(100000 + Math.random() * 900000);

  const downloadReceipt = async () => {
    if (receiptRef.current) {
      const canvas = await html2canvas(receiptRef.current, { scale: 2 });
      const image = canvas.toDataURL("image/png");

      // Create a download link
      const link = document.createElement("a");
      link.href = image;
      link.download = `${phone.imei}.png`;
      link.click();
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaChange = () => setIsSmallScreen(mediaQuery.matches);

    handleMediaChange();
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const useSellPhone = () => {
    return useMutation(
      ({ customerDetails, token }) => sellPhone(customerDetails, token),
      {
        onMutate: () => {
          setSellingPhoneLoading(true);
        },
        onSuccess: () => {
          setSellingPhoneLoading(false);
          queryClient.invalidateQueries(["phones"]);
          if (isSmallScreen) {
            setShowPhoneCheckout(false);
          } else {
            setShowPhoneCheckout(false);
            dispatch(setSidebar(true));
          }
          toast.success("Phone checkout successful");
          setPhone([]);
          setStep(0);
          downloadReceipt();
        },
        onError: (error) => {
          setSellingPhoneLoading(false);
          toast.error(error.message || "Failed to sell phone");
        },
      }
    );
  };

  const sellPhoneMutation = useSellPhone();

  const onCheckout = () => {
    const updatedCustomerDetails = {
      ...customerDetails,
      phoneNumber: customerDetails.phone,
      phoneId: phone.id,
      company: sellingCompany,
      agentCommission: phone.managerCommission,
      rcpNumber: receiptNumber,
    };
    const { ...finalCustomerDetails } = updatedCustomerDetails;

    console.log(finalCustomerDetails);
    sellPhoneMutation.mutate({
      customerDetails: finalCustomerDetails,
      token,
    });
  };

  const validationSchema = yup.object({
    ID: yup
      .number("ID must be a number")
      .positive("ID must be a positive number")
      .integer("ID must be an integer")
      .required("ID is required"),
    firstName: yup
      .string("Enter the first name")
      .required("First name is required"),
    middleName: yup.string("Enter the middle name"),
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
      .required("Phone number is required"),
  });

  const formik = useFormik({
    initialValues: customerDetails,
    validationSchema,
    onSubmit: (values) => {
      setCustomerDetails(values);
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
          className="fixed bottom-0 md:top-0 right-0 w-full h-[90vh] md:h-full z-50 md:full-w-[40%] lg:w-[30%] bg-neutral-100 flex flex-col">
          {/* Fixed header section */}
          <div className="sticky top-0 bg-neutral-100 z-10 p-2">
            <div className="relative w-full hidden md:flex">
              <MdOutlineCancel
                size={28}
                className="cursor-pointer text-red-500 hover:text-red-400 absolute top-0 right-0"
                onClick={() => onCloseModal()}
              />
            </div>
            <div className="w-full md:hidden relative">
              <div className="absolute right-0 p-1">
                <CiSaveDown2
                  size={28}
                  className="cursor-pointer text-red-500 hover:text-red-400"
                  onClick={() => onCloseModal()}
                />
              </div>
            </div>
            <div className="w-full">
              <div className="w-full text-lg py-2">
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
            </div>
          </div>

          {/* Scrollable content area - with extra bottom padding for footer buttons */}
          <div className="flex-1 overflow-y-auto pb-[76px]">
            {/* Customer details form step */}
            {step === 0 && (
              <div className="w-full px-4 pt-4">
                <form
                  onSubmit={formik.handleSubmit}
                  className="space-y-5"
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
                      formik.touched.firstName &&
                      Boolean(formik.errors.firstName)
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
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#2FC3D2",
                      },
                    }}
                  />

                  <TextField
                    variant="outlined"
                    fullWidth
                    id="middleName"
                    name="middleName"
                    label="Middle Name"
                    value={formik.values.middleName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.middleName &&
                      Boolean(formik.errors.middleName)
                    }
                    helperText={
                      formik.touched.middleName && formik.errors.middleName
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
                    helperText={
                      formik.touched.lastName && formik.errors.lastName
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
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#2FC3D2",
                      },
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
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#2FC3D2",
                      },
                    }}
                  />

                  <TextField
                    variant="outlined"
                    fullWidth
                    id="ID"
                    name="ID"
                    label="ID"
                    type="number"
                    value={formik.values.ID}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.ID && Boolean(formik.errors.ID)}
                    helperText={formik.touched.ID && formik.errors.ID}
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
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#2FC3D2",
                      },
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
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#2FC3D2",
                      },
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
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#2FC3D2",
                      },
                    }}
                  />
                </form>
              </div>
            )}

            {/* Company selection step */}
            {step === 1 && (
              <div className="w-full px-4 py-6">
                <FormControl sx={{ width: "100%" }}>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    value={sellingCompany}
                    onChange={(e) => setSellingCompany(e.target.value)}
                    sx={{ justifyContent: "center" }}>
                    <FormControlLabel
                      value="shuhari"
                      control={<Radio />}
                      label="Shuhari"
                    />
                    <FormControlLabel
                      value="muchami"
                      control={<Radio />}
                      label="Muchami"
                    />
                  </RadioGroup>
                </FormControl>
                <div className="h-44 flex justify-center items-center mt-4">
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
              </div>
            )}

            {/* Confirmation step */}
            {step === 2 && (
              <div className="w-full px-4 py-5">
                <div className="flex flex-col justify-center items-center">
                  <div
                    ref={receiptRef}
                    className="p-5 border border-gray-500 h-full w-80 bg-white">
                    <div className="flex flex-col items-center">
                      {sellingCompany === "shuhari" ? (
                        <img
                          alt="lgo"
                          src="/shuhari-logo1.png"
                          className="w-28"
                        />
                      ) : (
                        <img alt="lgo" src="/muchami.png" className="w-32" />
                      )}

                      {sellingCompany === "muchami" ? (
                        <p className="font-roboto font-bold text-center uppercase text-sm pt-2">
                          Muchami phones and accesories
                        </p>
                      ) : (
                        <p className="font-roboto font-bold uppercase pt-2 text-lg">
                          Shuhari communication
                        </p>
                      )}
                      {sellingCompany === "muchami" ? (
                        <p className="font-roboto font-bold text-center uppercase text-sm pt-2">
                          Kiembeni Next to Start Gardens
                        </p>
                      ) : (
                        <p className="font-roboto font-bold uppercase pt-2 text-lg">
                          Likoni Mall first floor -F21
                        </p>
                      )}
                      {sellingCompany === "muchami" ? (
                        <p className="font-roboto font-bold text-center uppercase text-sm pt-2">
                          Tel: +254 720 3900 41 /+254 780 3900 41
                        </p>
                      ) : (
                        <p className="font-roboto font-bold uppercase pt-2 text-lg">
                          Tel: +254 746 435869
                        </p>
                      )}
                    </div>

                    <hr className="my-2 w-full bg-black h-1" />
                    <div className="flex flex-row justify-between items-center">
                      <p className="font-semibold text-sm text-neutral-700">
                        Rcpt: {receiptNumber}
                      </p>
                      <p className="font-semibold text-sm text-neutral-700">
                        Date: {formattedDate}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                      <p className="font-semibold text-sm text-neutral-700">
                        Served by: {user?.firstName}
                      </p>
                      <p className="font-semibold text-sm text-neutral-700">
                        Time: {formattedTime}
                      </p>
                    </div>
                    <p className="font-semibold text-sm text-neutral-700">
                      Location: {phone?.managerLocation}
                    </p>
                    <hr className="my-2 w-full bg-black h-1" />
                    <p className="font-semibold text-sm text-neutral-700">
                      Name: {customerDetails?.firstName}{" "}
                      {customerDetails?.middleName} {customerDetails?.lastName}
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      Tel: {customerDetails?.phone}
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      ID No: {customerDetails?.ID}
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      NOK Name: {customerDetails?.nkFirstName}{" "}
                      {customerDetails?.nkLastName}
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      NOK Tel: {customerDetails?.nkPhone}
                    </p>
                    <hr className="my-2 w-full bg-black h-1" />
                    <p className="font-bold uppercase text-center">
                      Phone description
                    </p>
                    <hr className="my-2 w-full bg-black h-1" />
                    <p className="font-semibold text-sm text-neutral-700">
                      Phone model: {phone?.modelName}
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      Capacity: {phone?.capacity} GB
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      RAM: {phone?.ram} GB
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      IMEI: {phone?.imei}
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      Waranty: 2 years
                    </p>
                    <hr className="my-2 w-full bg-black h-1" />
                    <p className="font-roboto text-center uppercase font-semibold mb-2">
                      Gross total: {phone?.sellingPrice}/=
                    </p>
                    <div className="p-2 flex flex-row items-center border border-neutral-500 rounded-md">
                      <div className="w-[50%]">
                        <img
                          alt="buy now pay later"
                          src="/buynow-logo.png"
                          className="w-32"
                        />
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
                          className="w-16"
                        />
                      </div>
                    </div>
                    <p className="text-sm italic text-neutral-700 text-center">
                      Thank you for shopping with us
                    </p>
                    <p className="italic text-sm text-neutral-700 text-center">
                      Goods Once Sold Cannot be Re-accepted
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fixed footer buttons - absolute positioned at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-neutral-100 w-full py-3 px-4 z-10 border-t border-gray-200">
            {step === 0 && (
              <button
                type="submit"
                onClick={formik.handleSubmit}
                className="p-2 bg-primary-500 text-white transition-all duration-500 ease-in-out flex flex-row items-center justify-center h-12 w-full space-x-2">
                Proceed
              </button>
            )}

            {step === 1 && (
              <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                <button
                  className="p-3 bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-all duration-300 ease-in-out w-full md:w-32 space-x-2"
                  onClick={() => setStep(0)}>
                  <IoIosArrowBack size={20} className="md:mr-2" />
                  <span className="text-sm md:text-base">Back</span>
                </button>
                <button
                  className="p-3 bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-all duration-300 ease-in-out w-full md:w-32 space-x-2"
                  onClick={() => setStep(2)}>
                  <span className="text-sm md:text-base">Proceed</span>
                  <MdOutlineNavigateNext size={20} className="md:ml-2" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                <button
                  className="p-3 bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-all duration-300 ease-in-out w-full md:w-32 space-x-2"
                  onClick={() => setStep(1)}>
                  <IoIosArrowBack size={20} className="md:mr-2" />
                  <span className="text-sm md:text-base">Back</span>
                </button>
                <button
                  onClick={() => onCheckout()}
                  disabled={sellingPhoneLoading}
                  className={`p-3 ${
                    sellingPhoneLoading
                      ? "bg-gray-400"
                      : "bg-primary-500 hover:bg-primary-600"
                  } text-white flex items-center justify-center transition-all duration-300 ease-in-out w-full md:w-32 space-x-2`}>
                  <span className="text-sm md:text-base">
                    {sellingPhoneLoading ? "Processing..." : "Checkout"}
                  </span>
                  {!sellingPhoneLoading && (
                    <MdOutlineNavigateNext size={20} className="md:ml-2" />
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhoneCheckout;
