import { OpenAI } from "openai";
import { streamText } from "ai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// IMPORTANT! Set the runtime to edge: https://vercel.com/docs/functions/edge-functions/edge-runtime
export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  // Check if the OPENAI_API_KEY is set, if not return 400
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "") {
    return new Response("Missing OPENAI_API_KEY - make sure to add it to your .env file.", {
      status: 400,
    });
  }
  
  // Rate limiting implementation
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { Ratelimit } = await import("@upstash/ratelimit");
      const { kv } = await import("@vercel/kv");
      
      const ip = req.headers.get("x-forwarded-for");
      const ratelimit = new Ratelimit({
        redis: kv,
        limiter: Ratelimit.slidingWindow(50, "1 d"),
      });

      const { success, limit, reset, remaining } = await ratelimit.limit(`novel_ratelimit_${ip}`);

      if (!success) {
        return new Response("You have reached your request limit for the day.", {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        });
      }
    } catch (error) {
      console.error("Rate limiting error:", error);
      // Continue without rate limiting if there's an error
    }
  }

  const { prompt, option, command } = await req.json();
  
  // Define messages based on option
  let messages: ChatCompletionMessageParam[] = [];
  
  switch (option) {
    case "continue":
      messages = [
        {
          role: "system",
          content:
            "You are an AI writing assistant that continues existing text based on context from prior text. " +
            "Give more weight/priority to the later characters than the beginning ones. " +
            "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
            "Use Markdown formatting when appropriate.",
        },
        {
          role: "user",
          content: prompt,
        },
      ];
      break;
    case "improve":
      messages = [
        {
          role: "system",
          content:
            "You are an AI writing assistant that improves existing text. " +
            "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
            "Use Markdown formatting when appropriate.",
        },
        {
          role: "user",
          content: `The existing text is: ${prompt}`,
        },
      ];
      break;
    case "shorter":
      messages = [
        {
          role: "system",
          content:
            "You are an AI writing assistant that shortens existing text. " + 
            "Use Markdown formatting when appropriate.",
        },
        {
          role: "user",
          content: `The existing text is: ${prompt}`,
        },
      ];
      break;
    case "longer":
      messages = [
        {
          role: "system",
          content:
            "You are an AI writing assistant that lengthens existing text. " +
            "Use Markdown formatting when appropriate.",
        },
        {
          role: "user",
          content: `The existing text is: ${prompt}`,
        },
      ];
      break;
    case "fix":
      messages = [
        {
          role: "system",
          content:
            "You are an AI writing assistant that fixes grammar and spelling errors in existing text. " +
            "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
            "Use Markdown formatting when appropriate.",
        },
        {
          role: "user",
          content: `The existing text is: ${prompt}`,
        },
      ];
      break;
    case "zap":
      messages = [
        {
          role: "system",
          content:
            "You are an AI writing assistant that generates text based on a prompt. " +
            "You take an input from the user and a command for manipulating the text. " +
            "Use Markdown formatting when appropriate.",
        },
        {
          role: "user",
          content: `For this text: ${prompt}. You have to respect the command: ${command}`,
        },
      ];
      break;
    default:
      return new Response("Invalid option specified", { status: 400 });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 4096,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: content })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
