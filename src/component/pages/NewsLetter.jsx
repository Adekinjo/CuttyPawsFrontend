import { useState } from "react";
import ApiService from "../../service/ApiService";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Paper,
  IconButton,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import CloseIcon from "@mui/icons-material/Close";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();

    // Validate email format
    if (!isValidEmail(email)) {
        setMessage("Please enter a valid email address.");
        setIsError(true);
        setOpenSnackbar(true);
        return;
    }

    setIsLoading(true);
    try {
        const response = await ApiService.subscribeToNewsletter(email);
        setMessage(response.message || "Subscribed successfully!");
        setIsError(false);
        setOpenSnackbar(true);
        setEmail(""); // Clear the input field
    } catch (error) {
        if (error.message === "Email already subscribed.") {
            setMessage("This email is already subscribed.");
        } else {
            setMessage(error.response?.data?.message || "Subscription failed. Please try again.");
        }
        setIsError(true);
        setOpenSnackbar(true);
    } finally {
        setIsLoading(false);
    }
  };

  // Handle unsubscription
  const handleUnsubscribe = async (e) => {
    e.preventDefault();

    // Validate email format
    if (!isValidEmail(email)) {
      setMessage("Please enter a valid email address.");
      setIsError(true);
      setOpenSnackbar(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.unsubscribeFromNewsletter(email);
      setMessage(response.message || "Unsubscribed successfully!");
      setIsError(false);
      setOpenSnackbar(true);
      setEmail(""); // Clear the input field
    } catch (error) {
      setMessage(error.response?.data?.message || "Unsubscription failed. Please try again.");
      setIsError(true);
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f9fafb", 
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: { xs: 3, sm: 4 },
          borderRadius: 3,
          maxWidth: 450,
          width: "100%",
          textAlign: "center",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Custom shadow
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#1e293b" }}
        >
          Join Our Newsletter
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          gutterBottom
          sx={{ mb: 3 }}
        >
          Stay updated with the latest news and exclusive offers!
        </Typography>

        {/* Form */}
        <form onSubmit={handleSubscribe}>
          <TextField
            fullWidth
            label="Enter your email"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: "#64748b" }} />, // Add email icon
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                borderColor: "#cbd5e1",
              },
            }}
          />
          <Box sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{
                mb: 1,
                borderRadius: 50,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "bold",
                backgroundColor: "#3b82f6", // Vibrant blue
                "&:hover": {
                  backgroundColor: "#2563eb", // Darker blue on hover
                },
              }}
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
            <Button
              onClick={handleUnsubscribe}
              variant="outlined"
              color="secondary"
              fullWidth
              disabled={isLoading}
              sx={{
                borderRadius: 50,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "bold",
                borderColor: "#cbd5e1",
                color: "#475569",
                "&:hover": {
                  borderColor: "#94a3b8",
                  color: "#334155",
                },
              }}
            >
              {isLoading ? "Unsubscribing..." : "Unsubscribe"}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={isError ? "error" : "success"}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Newsletter;