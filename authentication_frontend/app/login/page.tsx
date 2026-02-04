/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { any, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import "./login.css";

import {
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { loginUserThunk, resetAuthState } from "../../redux/authSlice";

const LoginSchema = z.object({
  email: z.string().email("Email is invalid"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export default function Login() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<"success" | "error">("success");


  const { loading, success, error, otpRequired, otpUserId } =
    useAppSelector((state) => state.auth);


  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
  });

 const verifyOtp = async () => {
  try {
    const res = await fetch("http://localhost:5000/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: otpUserId,
        otp,
      }),
    });

    if (!res.ok) {
      throw new Error("Invalid OTP");
    }

    const data = await res.json();

    localStorage.setItem("token", data.token);
    localStorage.setItem("sessionId", data.sessionId);

    router.push("/");
  } catch (err ) {
    setSnackbarMessage("Invalid OTP");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};



  const handleLogin = (data: LoginFormData) => {
    dispatch(loginUserThunk(data));
  };

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }

    if (success && !otpRequired) {
      setSnackbarMessage("Login successful");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      reset();
      router.push("/");
    }


    return () => {
      dispatch(resetAuthState());
    };
  }, [success, error, dispatch, reset, router,otpRequired]);

  return (
    <>
      <div className="Container">
        <div className="Sidebar">
          <h1>Login</h1>
        </div>

        <div className="DesignLogin">
          <form onSubmit={handleSubmit(handleLogin)}>
            <TextField
              sx={{ mb: 2 }}
              fullWidth
              label="Email Address"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <FormControl fullWidth error={!!errors.password}>
              <InputLabel>Password</InputLabel>
              <OutlinedInput
                sx={{ mb: 2 }}
                type={showPassword ? "text" : "password"}
                {...register("password")}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              <FormHelperText>{errors.password?.message}</FormHelperText>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {otpRequired && (
              <>
                <TextField
                  fullWidth
                  label="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  sx={{ mt: 2 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={verifyOtp}
                >
                  Verify OTP
                </Button>
              </>
            )}


            <Typography
              align="center"
              sx={{
                mt: 2,
                color: "rgba(40, 116, 240)",
                fontWeight: "bold",
              }}
            >
              New user?{" "}
              <Link
                href="/register"
                style={{
                  textDecoration: "none",
                  color: "rgba(40, 116, 240)",
                }}
              >
                Create an account
              </Link>
            </Typography>
          </form>
        </div>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
}
