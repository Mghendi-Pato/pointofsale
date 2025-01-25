// DeleteConfirmationModal.jsx
import { Modal, Box, Typography, Fade, Backdrop } from "@mui/material";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/reducers/user";

const LogoutUser = ({ showLogoutModal, setShowLogoutModal }) => {
  const dispatch = useDispatch();
  return (
    <Modal
      open={showLogoutModal}
      onClose={() => setShowLogoutModal(false)}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}>
      <Fade in={showLogoutModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 350, md: 400 },
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
            textAlign: "center",
          }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{ mb: 2, fontWeight: "bold" }}>
            Logout!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Are you sure you want to log out?
          </Typography>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <button
              onClick={() => {
                setShowLogoutModal(false);
                dispatch(logoutUser());
              }}
              className="w-full bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-rose-600 transition">
              Logout
            </button>
            <button
              onClick={() => setShowLogoutModal(false)}
              className="w-full border border-primary-500 text-primary-500 font-semibold py-2 px-4 rounded-lg hover:bg-primary-100 transition">
              Go Back
            </button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default LogoutUser;
