import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, Loader2, RefreshCw, Vote } from "lucide-react";
import { useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AppState } from "../App";
import { useActor } from "../hooks/useActor";

interface Props {
  appState: AppState;
}

const CHART_COLORS = [
  "oklch(0.28 0.1 264)",
  "oklch(0.76 0.17 75)",
  "oklch(0.55 0.15 264)",
  "oklch(0.65 0.12 200)",
  "oklch(0.7 0.15 160)",
];

export default function ResultsPage({ appState }: Props) {
  const { navigate, userRole } = appState;
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["results"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getResults();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });

  const { data: summary } = useQuery({
    queryKey: ["election-summary"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getElectionSummary();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });

  const { data: isActive = false } = useQuery({
    queryKey: ["election-status"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getElectionStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });

  useEffect(() => {
    document.title = "Live Results — ElectVote";
    return () => {
      document.title = "ElectVote";
    };
  }, []);

  const chartData = results.map((r) => ({
    name: r.name.split(" ")[0],
    fullName: r.name,
    votes: Number(r.voteCount),
    percentage: r.votePercentage,
    party: r.partyName,
  }));

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["results"] });
    qc.invalidateQueries({ queryKey: ["election-summary"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="election-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-white/80 hover:text-white transition-colors mr-1"
              onClick={() =>
                navigate(userRole === "admin" ? "admin-dashboard" : "home")
              }
              data-ocid="results.back.button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold">
                Election Results
              </h1>
              <p className="text-xs text-white/70">Live vote tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={`text-xs border ${
                isActive
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-white/10 text-white/70 border-white/20"
              }`}
            >
              {isActive ? "● Live" : "● Closed"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={refresh}
              data-ocid="results.refresh.button"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border shadow-xs p-5">
            <p className="text-xs text-muted-foreground mb-1">Total Votes</p>
            <p className="font-display text-3xl font-bold text-primary">
              {summary?.totalVotes?.toString() ?? "0"}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-xs p-5">
            <p className="text-xs text-muted-foreground mb-1">Candidates</p>
            <p className="font-display text-3xl font-bold text-foreground">
              {results.length}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-xs p-5 col-span-2 md:col-span-1">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p
              className={`font-display text-2xl font-bold ${isActive ? "text-green-600" : "text-muted-foreground"}`}
            >
              {isActive ? "Active" : "Closed"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div
            className="flex justify-center py-16"
            data-ocid="results.loading_state"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : results.length === 0 ? (
          <div
            className="text-center py-20 text-muted-foreground"
            data-ocid="results.empty_state"
          >
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="font-display text-xl font-bold mb-2">
              No Results Yet
            </p>
            <p className="text-sm">Results will appear once votes are cast</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-card rounded-xl border border-border shadow-xs p-6">
              <h3 className="font-display text-lg font-bold mb-5">
                Votes by Candidate
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={chartData}
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.88 0.02 260)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "oklch(0.52 0.03 264)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "oklch(0.52 0.03 264)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid oklch(0.88 0.02 260)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    formatter={(
                      value: number,
                      _name: string,
                      props: { payload?: { fullName?: string } },
                    ) => [`${value} votes`, props.payload?.fullName ?? ""]}
                  />
                  <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={entry.fullName}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        data-ocid={`results.bar.chart_point.${index + 1}`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border shadow-xs p-6">
                <h3 className="font-display text-lg font-bold mb-5">
                  Vote Share
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="votes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={entry.fullName}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          data-ocid={`results.pie.chart_point.${index + 1}`}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid oklch(0.88 0.02 260)",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      formatter={(value: number) => [`${value} votes`]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-xl border border-border shadow-xs p-6">
                <h3 className="font-display text-lg font-bold mb-5">
                  Rankings
                </h3>
                <div className="space-y-3">
                  {results.map((r, idx) => (
                    <div
                      key={r.id.toString()}
                      className="flex items-center gap-3"
                      data-ocid={`results.rankings.item.${idx + 1}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          idx === 0
                            ? "gold-gradient text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm truncate">
                            {r.name}
                          </span>
                          <span className="text-sm font-bold text-primary ml-2 shrink-0">
                            {r.voteCount.toString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(r.votePercentage, 100)}%`,
                                background:
                                  CHART_COLORS[idx % CHART_COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {r.votePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {r.partyName}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-xs p-6">
              <h3 className="font-display text-lg font-bold mb-5">
                Complete Results
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left pb-3 text-muted-foreground font-medium">
                        Rank
                      </th>
                      <th className="text-left pb-3 text-muted-foreground font-medium">
                        Candidate
                      </th>
                      <th className="text-left pb-3 text-muted-foreground font-medium">
                        Party
                      </th>
                      <th className="text-left pb-3 text-muted-foreground font-medium">
                        Position
                      </th>
                      <th className="text-right pb-3 text-muted-foreground font-medium">
                        Votes
                      </th>
                      <th className="text-right pb-3 text-muted-foreground font-medium">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {results.map((r, idx) => (
                      <tr
                        key={r.id.toString()}
                        data-ocid={`results.table.row.item.${idx + 1}`}
                      >
                        <td className="py-3">
                          <span
                            className={`font-bold ${idx === 0 ? "text-accent" : "text-muted-foreground"}`}
                          >
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3 font-semibold">{r.name}</td>
                        <td className="py-3 text-muted-foreground">
                          {r.partyName}
                        </td>
                        <td className="py-3">
                          <Badge variant="secondary" className="text-xs">
                            {r.position}
                          </Badge>
                        </td>
                        <td className="py-3 text-right font-bold text-primary">
                          {r.voteCount.toString()}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {r.votePercentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="election-gradient text-white/70 text-center text-sm py-5 mt-8">
        <div className="flex items-center justify-center gap-2">
          <Vote className="w-4 h-4 text-accent" />
          <span>
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-accent hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
