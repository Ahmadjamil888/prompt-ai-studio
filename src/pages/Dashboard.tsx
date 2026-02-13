import { useRequireAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, createProject, deleteProject, type PipelineProject } from "@/lib/projects";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, LogOut, Trash2, Loader2, Zap, Box, Brain, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";

const Dashboard = () => {
  const { user, signOut } = useRequireAuth();
  const [prompt, setPrompt] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const createMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const name = prompt.length > 50 ? prompt.slice(0, 50) + "..." : prompt;
      return createProject(prompt, name);
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setPrompt("");
      setShowCreate(false);
      navigate(`/project/${project.id}`);
      toast.success("Pipeline initialized!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    createMutation.mutate(prompt.trim());
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "initializing": return <Zap className="h-4 w-4" />;
      case "designing": return <Brain className="h-4 w-4" />;
      case "training": return <Box className="h-4 w-4" />;
      case "deploying": case "deployed": return <Rocket className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Pipeline</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Create section */}
        <div className="mb-8">
          {!showCreate ? (
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" /> New Model
            </Button>
          ) : (
            <form onSubmit={handleCreate} className="pipeline-card p-4 animate-slide-up">
              <p className="text-sm text-muted-foreground mb-3">
                Describe the AI model you want to create
              </p>
              <div className="flex gap-3">
                <Input
                  placeholder='e.g. "Create a sentiment analysis AI model"'
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-secondary border-border flex-1"
                  autoFocus
                />
                <Button type="submit" disabled={createMutation.isPending || !prompt.trim()}>
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Projects list */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Your Models
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Brain className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No models yet. Create your first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="pipeline-card p-4 cursor-pointer flex items-center justify-between group"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-muted-foreground">{statusIcon(project.status)}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{project.prompt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={project.status} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(project.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
