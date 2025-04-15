import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { CiSaveDown2 } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { setSidebar } from "../redux/reducers/ sidebar";
import { GrDownload } from "react-icons/gr";
import html2canvas from "html2canvas";

const ReceiptTemplate = ({
  phone,
  setShowDownLoadReceiptModal,
  showDownLoadReceiptModal,
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const dispatch = useDispatch();

  const receiptRef = useRef(null);
  const user = useSelector((state) => state.userSlice.user.user);

  const saleDate = phone?.saleDate ? new Date(phone.saleDate) : new Date();
  const formattedDate = `${saleDate.getDate().toString().padStart(2, "0")}/${(
    saleDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${saleDate.getFullYear().toString().slice(-2)}`;
  const formattedTime = saleDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

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

  console.log(phone);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaChange = () => setIsSmallScreen(mediaQuery.matches);

    handleMediaChange();
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const onCheckout = () => {
    downloadReceipt();
    onCloseModal();
  };

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
    setShowDownLoadReceiptModal(false);
    if (!isSmallScreen) {
      dispatch(setSidebar(true));
    }
  };

  return (
    <AnimatePresence>
      {showDownLoadReceiptModal && (
        <motion.div
          {...animation}
          transition={{ duration: 0.5 }}
          className="absolute md:top-0 right-0 w-full h-[92%]  md:h-full z-50 md:w-[40%] lg:w-[30%] bg-neutral-100 flex flex-col items-center">
          <div className="overflow-auto">
            <div className="relative w-full hidden md:flex">
              <MdOutlineCancel
                size={28}
                className="cursor-pointer text-red-500 hover:text-red-400 absolute top-0 right-0"
                onClick={() => onCloseModal()}
              />
            </div>
            <div className=" w-full  md:hidden relative">
              <div className="absolute right-0  p-1">
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
                  Print Phone Receipt
                </p>
              </div>

              <div className="py-5">
                <div className="flex flex-col justify-center items-center">
                  <div
                    ref={receiptRef}
                    className="p-5 border border-gray-500 h-full w-80  bg-white">
                    <div className="flex flex-col items-center">
                      {phone?.company === "shuhari" ? (
                        <img
                          alt="lgo"
                          src="/shuhari-logo1.png"
                          className="w-28"
                        />
                      ) : (
                        <img alt="lgo" src="/muchami.png" className="w-32" />
                      )}

                      {phone?.company === "muchami" ? (
                        <p className="font-roboto font-bold text-center uppercase text-sm pt-2">
                          Muchami phones and accesories
                        </p>
                      ) : (
                        <p className="font-roboto font-bold uppercase pt-2 text-lg">
                          Shuhari communication
                        </p>
                      )}
                      {phone?.company === "muchami" ? (
                        <p className="font-roboto font-bold text-center uppercase text-sm pt-2">
                          Kiembeni Next to Start Gardens
                        </p>
                      ) : (
                        <p className="font-roboto font-bold uppercase pt-2 text-lg">
                          Likoni Mall first floor -F21
                        </p>
                      )}
                      {phone?.company === "muchami" ? (
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
                        Rcpt: {phone?.rcpNumber}
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
                      Name: {phone.customerName}
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      Tel: {phone.customerPhn}
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      ID No: {phone.customerID}
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      NOK Name: {phone.nkName}
                    </p>
                    <p className="font-semibold text-sm text-neutral-700">
                      NOK Tel: {phone.nkPhn}
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
                    onClick={() => onCheckout()}
                    className="p-3 bg-primary-500 flex items-center justify-center text-white  hover:bg-primary-600 transition-all duration-300 ease-in-out w-full space-x-2">
                    <span className="text-sm md:text-base">Download</span>
                    <GrDownload size={20} className="md:ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReceiptTemplate;
