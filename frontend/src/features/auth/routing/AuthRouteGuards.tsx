import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Loading = () => <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><CircularProgress /></Box>;

export const RequireAuth = () => {
	const { user, isLoading } = useAuth();
	if (isLoading) return <Loading />;
	return user ? <Outlet /> : <Navigate to="/sign-in" replace />;
};

export const RequireGuest = () => {
	const { user, isLoading } = useAuth();
	if (isLoading) return <Loading />;
	return user ? <Navigate to="/" replace /> : <Outlet />;
};
