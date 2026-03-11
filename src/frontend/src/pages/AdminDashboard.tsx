import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Download,
  Loader2,
  LogOut,
  Pencil,
  Play,
  Plus,
  Search,
  Settings,
  Shield,
  Square,
  Trash2,
  Users,
  Vote,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppState } from "../App";
import type { Candidate } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface Props {
  appState: AppState;
}

interface CandidateForm {
  id: string;
  name: string;
  partyName: string;
  position: string;
}

interface VoterForm {
  voterId: string;
  name: string;
  email: string;
}

const DEMO_VOTERS: VoterForm[] = [
  { voterId: "VTR-001", name: "Alice Johnson", email: "alice@example.com" },
  { voterId: "VTR-002", name: "Bob Martinez", email: "bob@example.com" },
  { voterId: "VTR-003", name: "Carol Williams", email: "carol@example.com" },
];

export default function AdminDashboard({ appState }: Props) {
  const { logout, navigate } = appState;
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();

  const [candidateSearch, setCandidateSearch] = useState("");
  const [voterSearch, setVoterSearch] = useState("");

  const [candidateDialog, setCandidateDialog] = useState(false);
  const [voterDialog, setVoterDialog] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null,
  );
  const [editingVoter, setEditingVoter] = useState<VoterForm | null>(null);

  const [candidateForm, setCandidateForm] = useState<CandidateForm>({
    id: "",
    name: "",
    partyName: "",
    position: "",
  });
  const [voterForm, setVoterForm] = useState<VoterForm>({
    voterId: "",
    name: "",
    email: "",
  });

  const { data: candidates = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCandidates();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: isActive = false, isLoading: statusLoading } = useQuery({
    queryKey: ["election-status"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getElectionStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });

  const { data: summary } = useQuery({
    queryKey: ["election-summary"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getElectionSummary();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });

  const { data: results = [] } = useQuery({
    queryKey: ["results"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getResults();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });

  const addCandidateMut = useMutation({
    mutationFn: async (f: CandidateForm) => {
      if (!actor) throw new Error("No actor");
      return actor.addCandidate(BigInt(f.id), f.name, f.partyName, f.position);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate added successfully");
      setCandidateDialog(false);
      resetCandidateForm();
    },
    onError: () => toast.error("Failed to add candidate"),
  });

  const editCandidateMut = useMutation({
    mutationFn: async (f: CandidateForm) => {
      if (!actor) throw new Error("No actor");
      return actor.editCandidate(BigInt(f.id), f.name, f.partyName, f.position);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate updated");
      setCandidateDialog(false);
      resetCandidateForm();
    },
    onError: () => toast.error("Failed to update candidate"),
  });

  const deleteCandidateMut = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteCandidate(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate removed");
    },
    onError: () => toast.error("Failed to delete candidate"),
  });

  const addVoterMut = useMutation({
    mutationFn: async (f: VoterForm) => {
      if (!actor) throw new Error("No actor");
      return actor.addVoter(f.voterId, f.name, f.email);
    },
    onSuccess: () => {
      toast.success("Voter registered");
      setVoterDialog(false);
      resetVoterForm();
    },
    onError: () => toast.error("Failed to add voter"),
  });

  const updateVoterMut = useMutation({
    mutationFn: async (f: VoterForm) => {
      if (!actor) throw new Error("No actor");
      return actor.updateVoter(f.voterId, f.name, f.email);
    },
    onSuccess: () => {
      toast.success("Voter updated");
      setVoterDialog(false);
      resetVoterForm();
    },
    onError: () => toast.error("Failed to update voter"),
  });

  const deleteVoterMut = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteVoter(id);
    },
    onSuccess: () => toast.success("Voter removed"),
    onError: () => toast.error("Failed to delete voter"),
  });

  const startElectionMut = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.startElection();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["election-status"] });
      toast.success("Election started!");
    },
    onError: () => toast.error("Failed to start election"),
  });

  const endElectionMut = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.endElection();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["election-status"] });
      toast.success("Election ended.");
    },
    onError: () => toast.error("Failed to end election"),
  });

  const resetCandidateForm = () => {
    setCandidateForm({ id: "", name: "", partyName: "", position: "" });
    setEditingCandidate(null);
  };

  const resetVoterForm = () => {
    setVoterForm({ voterId: "", name: "", email: "" });
    setEditingVoter(null);
  };

  const openAddCandidate = () => {
    resetCandidateForm();
    setCandidateDialog(true);
  };

  const openEditCandidate = (c: Candidate) => {
    setEditingCandidate(c);
    setCandidateForm({
      id: c.id.toString(),
      name: c.name,
      partyName: c.partyName,
      position: c.position,
    });
    setCandidateDialog(true);
  };

  const openAddVoter = () => {
    resetVoterForm();
    setVoterDialog(true);
  };

  const openEditVoter = (v: VoterForm) => {
    setEditingVoter(v);
    setVoterForm({ ...v });
    setVoterDialog(true);
  };

  const handleCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCandidate) {
      editCandidateMut.mutate(candidateForm);
    } else {
      addCandidateMut.mutate(candidateForm);
    }
  };

  const handleVoterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVoter) {
      updateVoterMut.mutate(voterForm);
    } else {
      addVoterMut.mutate(voterForm);
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Party", "Position", "Votes", "Percentage"];
    const rows = results.map((r) => [
      r.name,
      r.partyName,
      r.position,
      r.voteCount.toString(),
      `${r.votePercentage.toFixed(1)}%`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `election-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Results exported as CSV");
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.partyName.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.position.toLowerCase().includes(candidateSearch.toLowerCase()),
  );

  const filteredVoters = DEMO_VOTERS.filter(
    (v) =>
      v.name.toLowerCase().includes(voterSearch.toLowerCase()) ||
      v.voterId.toLowerCase().includes(voterSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="election-gradient text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-tight">
                Admin Dashboard
              </h1>
              <p className="text-xs text-white/70">
                Election Management Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={`text-xs border ${
                isActive
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-white/10 text-white/70 border-white/20"
              }`}
            >
              {statusLoading
                ? "..."
                : isActive
                  ? "● Election Active"
                  : "● Election Inactive"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => navigate("results")}
              data-ocid="admin.results.link"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={logout}
              data-ocid="admin.logout.button"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-6">
          <div className="flex items-center gap-2 text-sm">
            <Vote className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Total Votes:</span>
            <span className="font-bold text-foreground">
              {summary?.totalVotes?.toString() ?? "0"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Candidates:</span>
            <span className="font-bold text-foreground">
              {candidates.length}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="bg-card border border-border shadow-xs">
            <TabsTrigger value="candidates" data-ocid="admin.candidates.tab">
              <Vote className="w-4 h-4 mr-2" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="voters" data-ocid="admin.voters.tab">
              <Users className="w-4 h-4 mr-2" />
              Voters
            </TabsTrigger>
            <TabsTrigger value="election" data-ocid="admin.election.tab">
              <Settings className="w-4 h-4 mr-2" />
              Election Control
            </TabsTrigger>
            <TabsTrigger value="results" data-ocid="admin.results.tab">
              <BarChart3 className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="animate-fade-in">
            <div className="bg-card rounded-xl border border-border shadow-xs">
              <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    className="pl-9"
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    data-ocid="admin.candidates.search_input"
                  />
                </div>
                <Button
                  className="election-gradient text-white border-0"
                  onClick={openAddCandidate}
                  data-ocid="admin.candidates.add.open_modal_button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Candidate
                </Button>
              </div>

              {candidatesLoading ? (
                <div
                  className="p-12 text-center"
                  data-ocid="admin.candidates.loading_state"
                >
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div
                  className="p-12 text-center text-muted-foreground"
                  data-ocid="admin.candidates.empty_state"
                >
                  <Vote className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No candidates found</p>
                  <p className="text-sm">
                    Add your first candidate to get started
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Votes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.map((c, idx) => (
                      <TableRow
                        key={c.id.toString()}
                        data-ocid={`admin.candidates.row.item.${idx + 1}`}
                      >
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {c.id.toString()}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {c.name}
                        </TableCell>
                        <TableCell>{c.partyName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{c.position}</Badge>
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          {c.voteCount.toString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditCandidate(c)}
                              data-ocid={`admin.candidates.edit_button.${idx + 1}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteCandidateMut.mutate(c.id)}
                              data-ocid={`admin.candidates.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Voters Tab */}
          <TabsContent value="voters" className="animate-fade-in">
            <div className="bg-card rounded-xl border border-border shadow-xs">
              <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search voters..."
                    className="pl-9"
                    value={voterSearch}
                    onChange={(e) => setVoterSearch(e.target.value)}
                    data-ocid="admin.voters.search_input"
                  />
                </div>
                <Button
                  className="election-gradient text-white border-0"
                  onClick={openAddVoter}
                  data-ocid="admin.voters.add.open_modal_button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Voter
                </Button>
              </div>

              {filteredVoters.length === 0 ? (
                <div
                  className="p-12 text-center text-muted-foreground"
                  data-ocid="admin.voters.empty_state"
                >
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No voters found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voter ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVoters.map((v, idx) => (
                      <TableRow
                        key={v.voterId}
                        data-ocid={`admin.voters.row.item.${idx + 1}`}
                      >
                        <TableCell className="font-mono text-sm">
                          {v.voterId}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {v.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {v.email}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditVoter(v)}
                              data-ocid={`admin.voters.edit_button.${idx + 1}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteVoterMut.mutate(v.voterId)}
                              data-ocid={`admin.voters.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Election Control Tab */}
          <TabsContent value="election" className="animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border shadow-xs p-6">
                <h3 className="font-display text-lg font-bold mb-1">
                  Election Status
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Start or stop the voting session
                </p>

                <div
                  className={`rounded-lg p-4 mb-6 text-center ${
                    isActive
                      ? "bg-green-50 border border-green-200"
                      : "bg-muted border border-border"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold mb-1 ${isActive ? "text-green-700" : "text-muted-foreground"}`}
                  >
                    {isActive ? "● ACTIVE" : "● INACTIVE"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isActive
                      ? "Voting is currently open"
                      : "Voting is currently closed"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={isActive || startElectionMut.isPending}
                    onClick={() => startElectionMut.mutate()}
                    data-ocid="admin.election.start.primary_button"
                  >
                    {startElectionMut.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Start Election
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={!isActive || endElectionMut.isPending}
                    onClick={() => endElectionMut.mutate()}
                    data-ocid="admin.election.end.delete_button"
                  >
                    {endElectionMut.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Square className="w-4 h-4 mr-2" />
                    )}
                    End Election
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border shadow-xs p-6">
                <h3 className="font-display text-lg font-bold mb-1">
                  Election Stats
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Current voting statistics
                </p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground text-sm">
                      Total Candidates
                    </span>
                    <span className="font-bold text-lg text-foreground">
                      {candidates.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground text-sm">
                      Total Votes Cast
                    </span>
                    <span className="font-bold text-lg text-primary">
                      {summary?.totalVotes?.toString() ?? "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-muted-foreground text-sm">
                      Registered Voters
                    </span>
                    <span className="font-bold text-lg text-foreground">
                      {DEMO_VOTERS.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="animate-fade-in">
            <div className="bg-card rounded-xl border border-border shadow-xs">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold">
                    Election Results
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Live vote counts and percentages
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={exportCSV}
                  data-ocid="admin.results.export.button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {results.length === 0 ? (
                <div
                  className="p-12 text-center text-muted-foreground"
                  data-ocid="admin.results.empty_state"
                >
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No results yet</p>
                  <p className="text-sm">
                    Results will appear once votes are cast
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Votes</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((r, idx) => (
                      <TableRow
                        key={r.id.toString()}
                        data-ocid={`admin.results.row.item.${idx + 1}`}
                      >
                        <TableCell>
                          <span
                            className={`font-bold text-lg ${idx === 0 ? "text-accent" : "text-muted-foreground"}`}
                          >
                            #{idx + 1}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {r.name}
                        </TableCell>
                        <TableCell>{r.partyName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{r.position}</Badge>
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          {r.voteCount.toString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-muted rounded-full h-2 max-w-24">
                              <div
                                className="h-2 rounded-full election-gradient"
                                style={{
                                  width: `${Math.min(r.votePercentage, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12">
                              {r.votePercentage.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Candidate Dialog */}
      <Dialog
        open={candidateDialog}
        onOpenChange={(o) => {
          if (!o) {
            setCandidateDialog(false);
            resetCandidateForm();
          }
        }}
      >
        <DialogContent data-ocid="admin.candidates.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingCandidate ? "Edit Candidate" : "Add Candidate"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCandidateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="cand-id">Candidate ID</Label>
              <Input
                id="cand-id"
                type="number"
                placeholder="e.g. 1"
                value={candidateForm.id}
                onChange={(e) =>
                  setCandidateForm((f) => ({ ...f, id: e.target.value }))
                }
                disabled={!!editingCandidate}
                data-ocid="admin.candidates.id.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cand-name">Full Name</Label>
              <Input
                id="cand-name"
                placeholder="e.g. Sarah Mitchell"
                value={candidateForm.name}
                onChange={(e) =>
                  setCandidateForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="admin.candidates.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cand-party">Political Party</Label>
              <Input
                id="cand-party"
                placeholder="e.g. Democratic Alliance"
                value={candidateForm.partyName}
                onChange={(e) =>
                  setCandidateForm((f) => ({ ...f, partyName: e.target.value }))
                }
                data-ocid="admin.candidates.party.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cand-position">Election Position</Label>
              <Input
                id="cand-position"
                placeholder="e.g. President, Mayor"
                value={candidateForm.position}
                onChange={(e) =>
                  setCandidateForm((f) => ({ ...f, position: e.target.value }))
                }
                data-ocid="admin.candidates.position.input"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCandidateDialog(false);
                  resetCandidateForm();
                }}
                data-ocid="admin.candidates.dialog.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="election-gradient text-white border-0"
                disabled={
                  addCandidateMut.isPending || editCandidateMut.isPending
                }
                data-ocid="admin.candidates.dialog.save_button"
              >
                {addCandidateMut.isPending || editCandidateMut.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {editingCandidate ? "Update" : "Add Candidate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Voter Dialog */}
      <Dialog
        open={voterDialog}
        onOpenChange={(o) => {
          if (!o) {
            setVoterDialog(false);
            resetVoterForm();
          }
        }}
      >
        <DialogContent data-ocid="admin.voters.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingVoter ? "Edit Voter" : "Register Voter"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVoterSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="voter-id-field">Voter ID</Label>
              <Input
                id="voter-id-field"
                placeholder="e.g. VTR-004"
                value={voterForm.voterId}
                onChange={(e) =>
                  setVoterForm((f) => ({ ...f, voterId: e.target.value }))
                }
                disabled={!!editingVoter}
                data-ocid="admin.voters.id.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="voter-name">Full Name</Label>
              <Input
                id="voter-name"
                placeholder="e.g. John Doe"
                value={voterForm.name}
                onChange={(e) =>
                  setVoterForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="admin.voters.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="voter-email">Email Address</Label>
              <Input
                id="voter-email"
                type="email"
                placeholder="john@example.com"
                value={voterForm.email}
                onChange={(e) =>
                  setVoterForm((f) => ({ ...f, email: e.target.value }))
                }
                data-ocid="admin.voters.email.input"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVoterDialog(false);
                  resetVoterForm();
                }}
                data-ocid="admin.voters.dialog.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="election-gradient text-white border-0"
                disabled={addVoterMut.isPending || updateVoterMut.isPending}
                data-ocid="admin.voters.dialog.save_button"
              >
                {addVoterMut.isPending || updateVoterMut.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {editingVoter ? "Update" : "Register Voter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
