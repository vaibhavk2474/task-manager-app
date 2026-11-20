import { useState, type FormEvent } from "react";
import { Alert, Button, Link, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/useAuth";

export const SignUpPage = () => {
	const { signUp } = useAuth();
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault(); setError(""); setBusy(true);
		try { await signUp(name, email, password); navigate("/", { replace: true }); }
		catch (caught) { setError(caught instanceof Error ? caught.message : "Could not create your account."); }
		finally { setBusy(false); }
	};

	return (
		<AuthLayout title="Make room for what matters" subtitle="Create your account and start with one clear next step." footer={<Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>Already have an account? <Link component={RouterLink} to="/sign-in" underline="hover" sx={{ fontWeight: 700 }}>Sign in</Link></Typography>}>
			<Stack component="form" aria-busy={busy} spacing={2} onSubmit={submit}>
				{error && <Alert severity="error" role="alert">{error}</Alert>}
				<TextField label="Your name" autoComplete="name" required fullWidth value={name} onChange={(event) => setName(event.target.value)} />
				<TextField label="Email" type="email" autoComplete="email" required fullWidth value={email} onChange={(event) => setEmail(event.target.value)} />
				<TextField label="Password" type="password" autoComplete="new-password" required fullWidth slotProps={{ htmlInput: { minLength: 8, maxLength: 72 } }} helperText="Use at least 8 characters." value={password} onChange={(event) => setPassword(event.target.value)} />
				<Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? "Creating account…" : "Create account"}</Button>
			</Stack>
		</AuthLayout>
	);
};
