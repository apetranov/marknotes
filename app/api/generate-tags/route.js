import { InferenceClient } from "@huggingface/inference";
import { NextResponse } from "next/server";

const hf = new InferenceClient(process.env.HF_TOKEN);

export async function POST(request) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    const response = await hf.chatCompletion({
      model: "Qwen/Qwen3-4B-Instruct-2507",
      messages: [
        {
          role: "system",
          content:
            "You generate concise tags for notes. Return only a JSON array of lowercase tag strings. Generate between 3 and 6 relevant tags. Do not include explanations.",
        },
        {
          role: "user",
          content: `Generate tags for this note:\n\n${content}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.2,
    });

    const text = response.choices[0]?.message?.content ?? "";

    return NextResponse.json({ tags: text });
  } catch (error) {
    console.error("Tag generation error:", error);

    return NextResponse.json(
      { error: "Failed to generate tags" },
      { status: 500 }
    );
  }
}