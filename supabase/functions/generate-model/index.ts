import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, phase } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";

    if (phase === "architecture") {
      systemPrompt = `You are an expert ML/AI architect. Given a user's description of an AI model they want to build, generate a detailed architecture specification. Return a JSON object with these fields:
- model_name: string (a clean name for the model)
- model_type: string (e.g. "transformer", "cnn", "rnn", "bert-fine-tune", etc.)
- base_model: string (e.g. "bert-base-uncased", "gpt2", "resnet50", etc. from Hugging Face)
- framework: "pytorch"
- task: string (e.g. "text-classification", "token-classification", "text-generation", etc.)
- layers: array of { name, type, params } objects describing the architecture
- input_shape: string
- output_shape: string
- estimated_params: string (e.g. "110M")
- description: string (2-3 sentences about the architecture)
Return ONLY valid JSON, no markdown.`;
    } else if (phase === "training") {
      systemPrompt = `You are an expert ML engineer. Given model architecture info and the user's original prompt, generate a training configuration. Return a JSON object with:
- optimizer: string
- learning_rate: number
- batch_size: number
- epochs: number
- loss_function: string
- dataset: string (suggest a Hugging Face dataset)
- dataset_size: string
- preprocessing: array of strings
- augmentation: array of strings (if applicable)
- early_stopping: boolean
- metrics: array of strings to track
- estimated_training_time: string
- hardware: string (e.g. "NVIDIA A100 x1")
Return ONLY valid JSON, no markdown.`;
    } else if (phase === "deployment") {
      systemPrompt = `You are an expert MLOps engineer. Given model architecture and training config, generate a Docker deployment configuration. Return a JSON object with:
- docker_image: string (base image)
- dockerfile: string (complete Dockerfile content for serving the model)
- port: number
- endpoint: string (API endpoint path)
- api_format: { input: object, output: object } (example request/response)
- environment_vars: array of strings
- scaling: { min_replicas: number, max_replicas: number, target_cpu: number }
- health_check: string
- estimated_inference_time: string
- model_size: string
Return ONLY valid JSON, no markdown.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    // Try to parse JSON from the response
    let parsed;
    try {
      // Strip potential markdown code fences
      const clean = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-model error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
