import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Connect from "./pages/Connect";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Tournaments from "./pages/Tournaments";
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { SomniaWalletProvider } from "@/context/somnia-wallet-context";
import { DataStreamsProvider } from "@/context/data-streams-context";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<SomniaWalletProvider>
				<DataStreamsProvider>
					<BrowserRouter>
						<Routes>
							<Route path="/" element={<Landing />} />
							<Route path="/connect" element={<Connect />} />
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/leaderboard" element={<Leaderboard />} />
							<Route path="/tournaments" element={<Tournaments />} />
							<Route path="/achievements" element={<Achievements />} />
							<Route path="/profile" element={<Profile />} />
							<Route path="/profile/:walletAddress" element={<Profile />} />
							{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
							<Route path="*" element={<NotFound />} />
						</Routes>
					</BrowserRouter>
				</DataStreamsProvider>
			</SomniaWalletProvider>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
