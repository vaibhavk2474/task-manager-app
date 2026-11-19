import { useState, type FormEvent } from "react";
import { Alert, Button, Link, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/useAuth";

export const SignInPage = () => {
	const { signIn } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault(); setError(""); setBusy(true);
		try { await signIn(email, password); navigate("/", { replace: true }); }
		catch (caught) { setError(caught instanceof Error ? caught.message : "Could not sign in."); }
		finally { setBusy(false); }
	};

	return (
		<AuthLayout title="Welcome back" subtitle="Pick up where you left off." footer={<Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>New to Daymark? <Link component={RouterLink} to="/sign-up" underline="hover" sx={{ fontWeight: 700 }}>Create an account</Link></Typography>}>
			<Stack component="form" spacing={2} onSubmit={submit}>
				{error && <Alert severity="error">{error}</Alert>}
				<TextField label="Email" type="email" autoComplete="email" required fullWidth value={email} onChange={(event) => setEmail(event.target.value)} />
				<TextField label="Password" type="password" autoComplete="current-password" required fullWidth value={password} onChange={(event) => setPassword(event.target.value)} />
				<Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
			</Stack>
		</AuthLayout>
	);
};
