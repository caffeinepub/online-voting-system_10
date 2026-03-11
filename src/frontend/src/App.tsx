import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useSeedCandidates } from "./hooks/useSeedCandidates";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import HomePage from "./pages/HomePage";
import ResultsPage from "./pages/ResultsPage";
import VoterLoginPage from "./pages/VoterLoginPage";
import VotingPage from "./pages/VotingPage";

export type Page =
  | "home"
  | "admin-login"
  | "voter-login"
  | "admin-dashboard"
  | "voting"
  | "results";

export type UserRole = "admin" | "voter" | null;

export interface AppState {
  currentPage: Page;
  userRole: UserRole;
  voterId: string;
  navigate: (page: Page) => void;
  setVoterId: (id: string) => void;
  setUserRole: (role: UserRole) => void;
  logout: () => void;
}

const queryClient = new QueryClient();

function AppInner() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [voterId, setVoterId] = useState("");

  useSeedCandidates();

  const navigate = (page: Page) => setCurrentPage(page);

  const logout = () => {
    setCurrentPage("home");
    setUserRole(null);
    setVoterId("");
  };

  const appState: AppState = {
    currentPage,
    userRole,
    voterId,
    navigate,
    setVoterId,
    setUserRole,
    logout,
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage appState={appState} />;
      case "admin-login":
        return <AdminLoginPage appState={appState} />;
      case "voter-login":
        return <VoterLoginPage appState={appState} />;
      case "admin-dashboard":
        return <AdminDashboard appState={appState} />;
      case "voting":
        return <VotingPage appState={appState} />;
      case "results":
        return <ResultsPage appState={appState} />;
      default:
        return <HomePage appState={appState} />;
    }
  };

  return (
    <>
      {renderPage()}
      <Toaster richColors position="top-right" />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
