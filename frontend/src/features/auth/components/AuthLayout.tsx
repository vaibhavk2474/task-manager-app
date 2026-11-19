import type { ReactNode } from "react";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { alpha } from "@mui/material/styles";

export const AuthLayout = ({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) => (
	<Box sx={(theme) => ({ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, py: 5, bgcolor: "background.default", backgroundImage: `radial-gradient(circle at 15% 10%, ${alpha(theme.palette.secondary.main, 0.22)}, transparent 27%), radial-gradient(circle at 90% 90%, ${alpha(theme.palette.primary.main, 0.13)}, transparent 30%)` })}>
		<Container maxWidth="xs">
			<Stack spacing={3}>
				<Stack spacing={1.25} sx={{ alignItems: "center" }}>
					<Box sx={{ display: "grid", placeItems: "center", width: 54, height: 54, borderRadius: 3, bgcolor: "primary.main", color: "primary.contrastText", boxShadow: "0 12px 28px rgba(39,105,93,.22)" }}>
						<CheckRoundedIcon fontSize="large" />
					</Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>Daymark</Typography>
				</Stack>
				<Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderColor: "divider", boxShadow: "0 24px 70px rgba(24,49,41,.08)" }}>
					<Stack spacing={2.75}>
						<Box>
							<Typography variant="h4" component="h1" gutterBottom>{title}</Typography>
							<Typography color="text.secondary">{subtitle}</Typography>
						</Box>
						{children}
						{footer}
					</Stack>
				</Paper>
				<Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>A little clarity for what comes next.</Typography>
			</Stack>
		</Container>
	</Box>
);
