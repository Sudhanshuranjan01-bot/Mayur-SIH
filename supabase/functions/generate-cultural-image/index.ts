Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "A text prompt is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server is not properly configured." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const secretResponse = await fetch(
      `${supabaseUrl}/rest/v1/app_secrets?select=key_value&key_name=eq.GEMINI_API_KEY&limit=1`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!secretResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Could not retrieve AI service credentials." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const secretData = await secretResponse.json();
    const apiKey = secretData?.[0]?.key_value;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI image generation key is not configured." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedPrompt = prompt.slice(0, 480);

    // Use gemini-2.5-flash-image (Nano Banana) via generateContent with IMAGE output modality
    const imageModels = [
      "gemini-2.5-flash-image",
      "gemini-3.1-flash-image",
      "gemini-3-pro-image",
    ];

    let lastError = "";

    for (const model of imageModels) {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Generate an image: ${sanitizedPrompt}` }] }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          }),
        }
      );

      if (geminiResponse.ok) {
        const data = await geminiResponse.json();
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find((p: { inlineData?: { data?: string } }) => p.inlineData?.data);

        if (imagePart?.inlineData?.data) {
          const mimeType = imagePart.inlineData.mimeType || "image/png";
          return new Response(
            JSON.stringify({ image: `data:${mimeType};base64,${imagePart.inlineData.data}` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        lastError = "The AI returned a response but no image was included.";
      } else {
        const errorData = await geminiResponse.json().catch(() => null);
        const errorMsg = errorData?.error?.message || `Status ${geminiResponse.status}`;
        const errorCode = errorData?.error?.code;

        // 429 = quota exhausted — try next model, but save the quota message
        // 404 = model not found — try next model
        if (errorCode === 404 || errorCode === 429) {
          lastError = errorMsg;
          continue;
        }
        // Other errors — return immediately
        return new Response(
          JSON.stringify({ error: `Image generation failed: ${errorMsg.slice(0, 200)}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // All models failed — provide a helpful message
    const isQuotaError = lastError.toLowerCase().includes("quota") || lastError.toLowerCase().includes("billing");
    const helpfulError = isQuotaError
      ? "The AI image generation quota has been exceeded. The Gemini API key needs billing enabled in Google Cloud to generate images. Please enable billing at https://ai.google.dev and try again."
      : lastError || "Image generation is currently unavailable. Please try again later.";

    return new Response(
      JSON.stringify({ error: helpfulError }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
