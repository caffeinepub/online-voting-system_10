import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogOut,
  Users,
  Vote,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppState } from "../App";
import { useActor } from "../hooks/useActor";

interface Props {
  appState: AppState;
}

export default function VotingPage({ appState }: Props) {
  const { logout, voterId, navigate } = appState;
  const { actor, isFetching } = useActor();
  const [selectedId, setSelectedId] = useState<bigint | null>(null);
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCandidates();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: isActive = true } = useQuery({
    queryKey: ["election-status"],
    queryFn: async () => {
      if (!actor) return true;
      return actor.getElectionStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });

  const handleVote = async () => {
    if (!selectedId) {
      toast.error("Please select a candidate to vote for.");
      return;
    }
    if (!actor) {
      toast.error("Not connected. Please refresh.");
      return;
    }
    setSubmitting(true);
    try {
      const success = await actor.castVote(voterId, selectedId, "123456");
      if (success) {
        setVoted(true);
        toast.success("Your vote has been recorded!");
      } else {
        toast.error("Unable to cast vote. You may have already voted.");
      }
    } catch {
      toast.error("Failed to submit vote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (voted) {
    return (
      <div className="min-h-screen election-gradient flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-2xl border-0 p-10 max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Vote Submitted!
          </h2>
          <p className="text-muted-foreground mb-2">
            Your vote has been securely recorded.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Voter ID:{" "}
            <span className="font-mono font-semibold text-foreground">
              {voterId}
            </span>
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("results")}
              data-ocid="voting.results.button"
            >
              View Results
            </Button>
            <Button
              className="flex-1 election-gradient text-white border-0"
              onClick={logout}
              data-ocid="voting.done.button"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="election-gradient text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold">Voting Booth</h1>
              <p className="text-xs text-white/70">Voter ID: {voterId}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={logout}
            data-ocid="voting.logout.button"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!isActive && (
          <div
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-3"
            data-ocid="voting.inactive.error_state"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-amber-800 text-sm font-medium">
              The election is currently not active. Please check back later.
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">
            Cast Your Vote
          </h2>
          <p className="text-muted-foreground">
            Select one candidate and submit your vote. This action cannot be
            undone.
          </p>
        </div>

        {isLoading ? (
          <div
            className="flex justify-center py-16"
            data-ocid="voting.candidates.loading_state"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : candidates.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="voting.candidates.empty_state"
          >
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No candidates registered</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {candidates.map((c, idx) => {
              const isSelected = selectedId === c.id;
              return (
                <button
                  key={c.id.toString()}
                  type="button"
                  className={`text-left rounded-xl border-2 p-5 transition-all duration-200 bg-card ${
                    isSelected
                      ? "border-primary shadow-election ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedId(c.id)}
                  data-ocid={`voting.candidate.item.${idx + 1}`}
                >
                  <div className="w-16 h-16 rounded-full election-gradient flex items-center justify-center mb-4 mx-auto">
                    <span className="text-white font-display text-xl font-bold">
                      {c.name.charAt(0)}
                    </span>
                  </div>

                  <div className="text-center">
                    <h3 className="font-display text-lg font-bold text-foreground mb-0.5">
                      {c.name}
                    </h3>
                    <p className="text-sm font-medium text-primary mb-1">
                      {c.partyName}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {c.position}
                    </Badge>
                  </div>

                  {isSelected && (
                    <div className="mt-4 flex items-center justify-center gap-1.5 text-primary text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {candidates.length > 0 && (
          <div className="flex justify-center">
            <Button
              size="lg"
              className="election-gradient text-white border-0 px-12 hover:opacity-90"
              onClick={handleVote}
              disabled={!selectedId || submitting || !isActive}
              data-ocid="voting.submit.primary_button"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Vote className="w-5 h-5 mr-2" />
                  Submit Vote
                </>
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
