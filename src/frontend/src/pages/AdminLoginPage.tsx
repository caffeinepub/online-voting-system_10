import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppState } from "../App";
import { useActor } from "../hooks/useActor";

interface Props {
  appState: AppState;
}

export default function AdminLoginPage({ appState }: Props) {
  const { navigate, setUserRole } = appState;
  const { actor } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let isAdmin = false;
      if (actor) {
        isAdmin = await actor.isCallerAdmin();
      }
      if (isAdmin || username === "admin") {
        setUserRole("admin");
        navigate("admin-dashboard");
        toast.success("Welcome, Administrator!");
      } else {
        // Demo fallback: any credentials work
        setUserRole("admin");
        navigate("admin-dashboard");
        toast.success("Welcome, Administrator!");
      }
    } catch {
      setUserRole("admin");
      navigate("admin-dashboard");
      toast.success("Welcome, Administrator!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen election-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <button
          type="button"
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors text-sm"
          onClick={() => navigate("home")}
          data-ocid="admin-login.back.button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 election-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="font-display text-2xl">
              Admin Portal
            </CardTitle>
            <CardDescription>
              Sign in to access the election management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  data-ocid="admin-login.username.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  data-ocid="admin-login.password.input"
                />
              </div>

              {error && (
                <div
                  className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-md p-3"
                  data-ocid="admin-login.error_state"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full election-gradient text-white border-0 hover:opacity-90"
                disabled={loading}
                data-ocid="admin-login.submit_button"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Demo: any username + password grants admin access
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
