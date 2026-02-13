import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Box, Brain, Rocket, Zap } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) navigate("/dashboard");
  }, [loading, session, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <span className="text-lg font-semibold text-foreground tracking-tight">Pipeline</span>
        <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
          Sign In
        </Button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight mb-6">
            Zero-config AI infrastructure
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Describe an AI model in plain English. Pipeline designs the architecture, trains it, and deploys to Docker — in seconds.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-border px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Zap, title: "Prompt-to-Model", desc: "Describe what you need, AI handles the rest" },
            { icon: Brain, title: "Hugging Face", desc: "Import any model from the HF ecosystem" },
            { icon: Box, title: "PyTorch", desc: "Architecture designed with PyTorch under the hood" },
            { icon: Rocket, title: "Docker Deploy", desc: "Containerized deployment in one click" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="pipeline-card p-5">
              <Icon className="h-5 w-5 text-accent mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">Zehanx Technologies — Pipeline</p>
      </footer>
    </div>
  );
};

export default Index;
