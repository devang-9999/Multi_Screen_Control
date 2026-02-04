"use client";
import {io} from "socket.io-client";
const socket = io("http://localhost:5000");
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Typography, Box } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchMeThunk, logoutThunk } from "../../redux/authSlice";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMeThunk());
  }, [dispatch]);

  useEffect(() => { 
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    socket.on('force_logout', () => {
      dispatch(logoutThunk());
      router.push("/login");
    });
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Welcome to me
      </Typography>

      {user && (
        <>
          <Typography>User ID: {user.userid}</Typography>
          <Typography>Email: {user.email}</Typography>
        </>
      )}

      <Button
        variant="contained"
        color="error"
        sx={{ mt: 3 }}
        onClick={handleLogout}
      >
        Logout
      </Button>

    </Box>
  );
}