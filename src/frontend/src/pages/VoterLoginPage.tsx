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
import { AlertCircle, ArrowLeft, Loader2, Mail, Vote } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppState } from "../App";
import { useActor } from "../hooks/useActor";

interface Props {
  appState: AppState;
}

type Step = "credentials" | "otp";

export default function VoterLoginPage({ appState }: Props) {
  const { navigate, setUserRole, setVoterId } = appState;
  const { actor } = useActor();
  const [step, setStep] = useState<Step>("credentials");
  const [localVoterId, setLocalVoterId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localVoterId.trim()) {
      setError("Please enter your Voter ID.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (actor) {
        await actor.login(localVoterId.trim());
      }
      setStep("otp");
      toast.success("OTP generated! Check your registered contact.");
    } catch {
      setStep("otp");
      toast.info("Demo mode: OTP is 123456");
    } finally {
      setLoading(false);
    }
  };

  const handleOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let verified = false;
      if (actor) {
        verified = await actor.verifyOTP(localVoterId.trim(), otp.trim());
      } else if (otp === "123456") {
        verified = true;
      }
      if (verified) {
        setVoterId(localVoterId.trim());
        setUserRole("voter");
        navigate("voting");
        toast.success("Verified! You may now cast your vote.");
      } else if (otp === "123456") {
        setVoterId(localVoterId.trim());
        setUserRole("voter");
        navigate("voting");
        toast.success("Verified! You may now cast your vote.");
      } else {
        setError("Invalid OTP. Demo OTP is 123456.");
      }
    } catch {
      if (otp === "123456") {
        setVoterId(localVoterId.trim());
        setUserRole("voter");
        navigate("voting");
        toast.success("Verified! You may now cast your vote.");
      } else {
        setError("Invalid OTP. Demo OTP is 123456.");
      }
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
          onClick={() =>
            step === "otp" ? setStep("credentials") : navigate("home")
          }
          data-ocid="voter-login.back.button"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === "otp" ? "Back" : "Back to Home"}
        </button>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              {step === "otp" ? (
                <Mail className="w-8 h-8 text-white" />
              ) : (
                <Vote className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="font-display text-2xl">
              {step === "otp" ? "OTP Verification" : "Voter Login"}
            </CardTitle>
            <CardDescription>
              {step === "otp"
                ? `OTP sent to your registered contact for Voter ID: ${localVoterId}`
                : "Enter your Voter ID to receive a one-time password"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-7 h-7 rounded-full election-gradient text-white text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <span
                  className={`text-sm ${step === "credentials" ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                >
                  Voter ID
                </span>
              </div>
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-2 flex-1 justify-end">
                <span
                  className={`text-sm ${step === "otp" ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                >
                  Verify OTP
                </span>
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                    step === "otp"
                      ? "election-gradient text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  2
                </div>
              </div>
            </div>

            {step === "credentials" ? (
              <form onSubmit={handleCredentials} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="voter-id">Voter ID</Label>
                  <Input
                    id="voter-id"
                    placeholder="e.g. VTR-001"
                    value={localVoterId}
                    onChange={(e) => setLocalVoterId(e.target.value)}
                    autoComplete="username"
                    data-ocid="voter-login.voter-id.input"
                  />
                </div>

                {error && (
                  <div
                    className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-md p-3"
                    data-ocid="voter-login.credentials.error_state"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gold-gradient text-white border-0 hover:opacity-90"
                  disabled={loading}
                  data-ocid="voter-login.credentials.submit_button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOTP} className="space-y-4">
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Demo OTP (would be sent via SMS/Email)
                  </p>
                  <p className="font-display text-3xl font-bold text-primary tracking-[0.3em]">
                    123456
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    data-ocid="voter-login.otp.input"
                  />
                </div>

                {error && (
                  <div
                    className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-md p-3"
                    data-ocid="voter-login.otp.error_state"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gold-gradient text-white border-0 hover:opacity-90"
                  disabled={loading}
                  data-ocid="voter-login.otp.submit_button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Vote"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
