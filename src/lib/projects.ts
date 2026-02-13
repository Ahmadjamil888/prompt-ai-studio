import { supabase } from "@/integrations/supabase/client";

export interface PipelineProject {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  status: string;
  model_type: string | null;
  architecture: any;
  training_config: any;
  deployment_config: any;
  metrics: any;
  created_at: string;
  updated_at: string;
}

export async function fetchProjects(): Promise<PipelineProject[]> {
  const { data, error } = await supabase
    .from("pipeline_projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PipelineProject[];
}

export async function createProject(prompt: string, name: string): Promise<PipelineProject> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("pipeline_projects")
    .insert({ prompt, name, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as PipelineProject;
}

export async function updateProjectStatus(
  id: string,
  updates: Partial<Pick<PipelineProject, "status" | "architecture" | "training_config" | "deployment_config" | "metrics" | "model_type">>
) {
  const { error } = await supabase
    .from("pipeline_projects")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from("pipeline_projects")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
