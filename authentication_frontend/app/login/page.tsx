/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
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
import { loginUserThunk, fetchMeThunk, resetAuthState } from "../../redux/authSlice";

const LoginSchema = z.object({
  email: z.string().email("Email is invalid"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export default function Login() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { loading, success, error } = useAppSelector(
    (state) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<"success" | "error">("success");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
  });

  const handleLogin = (data: LoginFormData) => {
    dispatch(loginUserThunk(data));
  };

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }

    if (success) {
      setSnackbarMessage("Login successful");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      dispatch(fetchMeThunk());

      reset();
      router.push("/dashboard");
    }

    return () => {
      dispatch(resetAuthState());
    };
  }, [success, error, dispatch, reset, router]);

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
