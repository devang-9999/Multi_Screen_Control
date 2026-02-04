"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Typography, Box } from "@mui/material";
import { useAppDispatch } from "../../redux/hooks";
import { logoutThunk } from "../../redux/authSlice";
import { connectSocket, disconnectSocket } from "@/app/lib/socket";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const sessionId = localStorage.getItem("sessionId");

    if (!token || !sessionId) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) return;

    const socket = connectSocket();

    socket.on("OTP_ALERT", (data) => {
      alert(` New login detected!\nOTP: ${data.otp}`);
    });

    socket.on("FORCE_LOGOUT", () => {
      alert("You have been logged out");
      dispatch(logoutThunk());
      localStorage.clear();
      router.push("/login");
    });

    return () => {
      disconnectSocket();
    };
  }, [dispatch, router]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Dashboard</Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        You are logged in on this screen.
      </Typography>

      <Button
        variant="contained"
        color="error"
        sx={{ mt: 3 }}
        onClick={() => {
          dispatch(logoutThunk());
          localStorage.clear();
          router.push("/login");
        }}
      >
        Logout
      </Button>
    </Box>
  );
}
