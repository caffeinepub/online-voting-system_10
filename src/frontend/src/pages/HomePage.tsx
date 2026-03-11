import { Button } from "@/components/ui/button";
import { BarChart3, Shield, Users, Vote } from "lucide-react";
import { motion } from "motion/react";
import type { AppState } from "../App";

interface Props {
  appState: AppState;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage({ appState }: Props) {
  const { navigate } = appState;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="election-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold leading-tight">
                ElectVote
              </h1>
              <p className="text-xs text-white/70">Secure Digital Elections</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            onClick={() => navigate("results")}
            data-ocid="nav.results.link"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Live Results
          </Button>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-white/90 mb-6 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Secure &amp; Transparent Voting Platform
            </div>
            <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Your Voice,
              <br />
              <span className="text-accent">Your Vote</span>
            </h2>
            <p className="text-lg text-white/75 max-w-xl mx-auto">
              A modern election portal built for transparency, security, and
              democratic participation.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 -mt-10 pb-16 w-full">
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Admin Card */}
          <motion.div variants={item}>
            <div className="bg-card rounded-xl shadow-election border border-border p-8 flex flex-col items-center text-center h-full">
              <div className="w-16 h-16 election-gradient rounded-2xl flex items-center justify-center mb-5 shadow-md">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Admin Portal
              </h3>
              <p className="text-muted-foreground text-sm mb-6 flex-1">
                Manage candidates, voters, and election sessions. Monitor live
                results and export data.
              </p>
              <Button
                className="w-full election-gradient text-white border-0 hover:opacity-90"
                onClick={() => navigate("admin-login")}
                data-ocid="home.admin.primary_button"
              >
                Admin Login
              </Button>
            </div>
          </motion.div>

          {/* Voter Card */}
          <motion.div variants={item}>
            <div className="bg-card rounded-xl shadow-election border border-border p-8 flex flex-col items-center text-center h-full">
              <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center mb-5 shadow-md">
                <Vote className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Voter Portal
              </h3>
              <p className="text-muted-foreground text-sm mb-6 flex-1">
                Cast your vote securely. OTP verification ensures one person,
                one vote.
              </p>
              <Button
                className="w-full gold-gradient text-white border-0 hover:opacity-90"
                onClick={() => navigate("voter-login")}
                data-ocid="home.voter.primary_button"
              >
                Voter Login
              </Button>
            </div>
          </motion.div>

          {/* Results Card */}
          <motion.div variants={item}>
            <div className="bg-card rounded-xl shadow-election border border-border p-8 flex flex-col items-center text-center h-full">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-5 shadow-md border border-border">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Live Results
              </h3>
              <p className="text-muted-foreground text-sm mb-6 flex-1">
                View real-time election results with visual charts, vote counts,
                and percentages.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("results")}
                data-ocid="home.results.primary_button"
              >
                View Results
              </Button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {[
            {
              icon: Shield,
              label: "OTP Verified",
              desc: "2-factor voter auth",
            },
            {
              icon: Vote,
              label: "One Vote Only",
              desc: "Duplicate prevention",
            },
            {
              icon: Users,
              label: "Multi-Role",
              desc: "Admin, Candidate, Voter",
            },
            {
              icon: BarChart3,
              label: "Live Charts",
              desc: "Real-time analytics",
            },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-card rounded-lg border border-border p-4 flex items-start gap-3"
            >
              <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-sm text-foreground">
                  {label}
                </div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="election-gradient text-white/70 text-center text-sm py-5">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-accent hover:text-white transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
