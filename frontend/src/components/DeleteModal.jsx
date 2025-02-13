// DeleteConfirmationModal.jsx
import { Modal, Box, Typography, Fade, Backdrop } from "@mui/material";

export default function DeleteConfirmationModal({
  showDeleteModal,
  onClose,
  onDelete,
  title,
  message,
  action,
}) {
  return (
    <Modal
      open={showDeleteModal}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}>
      <Fade in={showDeleteModal}>
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
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {message}
          </Typography>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-rose-600 transition">
              {action ? action : "Delete"}
            </button>
            <button
              onClick={onClose}
              className="w-full border border-primary-500 text-primary-500 font-semibold py-2 px-4 rounded-lg hover:bg-primary-100 transition">
              Go Back
            </button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
