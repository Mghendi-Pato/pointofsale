import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { useSelector } from "react-redux";

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const user = useSelector((state) => state?.userSlice?.user?.user);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      if (!user) {
        navigate("/login");
      } else {
        switch (user.role) {
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
      }
    }
  }, [countdown, navigate, user]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-5">
      <div className="max-w-lg w-full flex flex-col items-center">
        {/* Logo */}
        <img
          src="/shuhari-logo2.png"
          alt="Shuhari Communications"
          className="h-16 mb-8"
        />

        {/* Animated 404 */}
        <div className="relative mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-[150px] font-bold text-primary-500 leading-none">
            404
          </motion.div>

          {/* Animated dots */}
          <div className="absolute -bottom-6 left-0 right-0 flex justify-center space-x-2">
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1, 0] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 2,
                  delay: dot * 0.4,
                }}
                className="h-3 w-3 rounded-full bg-primary-400"
              />
            ))}
          </div>
        </div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!user) {
                  navigate("/login");
                } else {
                  switch (user.role) {
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
                }
              }}
              className="flex items-center justify-center gap-2 bg-primary-500 text-white py-3 px-6 rounded-md shadow-md hover:bg-primary-600 transition-all duration-300">
              <BiArrowBack size={18} />
              Return Home
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition-all duration-300">
              Go Back
            </motion.button>
          </div>

          {/* Countdown */}
          <p className="text-sm text-gray-500 mt-8">
            Redirecting to homepage in {countdown} seconds
          </p>
        </motion.div>
      </div>

      {/* Animated device illustration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-10">
        <DeviceIllustration />
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-5 text-sm text-gray-500">
        © {new Date().getFullYear()} Shuhari Communications
      </div>
    </div>
  );
};

// Animated device illustration component
const DeviceIllustration = () => {
  return (
    <svg
      width="200"
      height="120"
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      {/* Base */}
      <motion.rect
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        x="50"
        y="100"
        width="100"
        height="10"
        rx="2"
        fill="#2FC3D2"
      />

      {/* Stand */}
      <motion.rect
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        x="95"
        y="80"
        width="10"
        height="20"
        rx="1"
        fill="#2FC3D2"
        style={{ transformOrigin: "center bottom" }}
      />

      {/* Screen */}
      <motion.rect
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.7 }}
        x="60"
        y="20"
        width="80"
        height="60"
        rx="3"
        fill="#f0f0f0"
        stroke="#2FC3D2"
        strokeWidth="2"
        style={{ transformOrigin: "center bottom" }}
      />

      {/* Question mark */}
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        d="M100 30 C95 30 90 33 90 38 C90 43 95 45 100 45 L100 55 M100 60 L100 65"
        stroke="#2FC3D2"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default NotFound;
