import { NextResponse } from 'next/server';
import { fetchPriceRows } from '@/lib/sheets';
import { calculatePriceMetrics } from '@/lib/avaline';
import { AvalineRequest, AvalineResponse } from '@/types';

// OpenAI API response types
interface OpenAIResponse {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string | { value: string };
      content?: string;
      value?: string;
    }>;
  }>;
  content?: Array<{
    text?: { value: string };
  }>;
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    const body: AvalineRequest = await req.json();
    const { question } = body;

    // Fetch latest metrics
    const priceRows = await fetchPriceRows();
    const metrics = calculatePriceMetrics(priceRows);

    const usd = (n: number | null | undefined) =>
      n == null ? "N/A" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

    const change = (n: number | null | undefined) =>
      n == null ? "N/A" : `${n >= 0 ? "+" : ""}${usd(Math.abs(n))}`;

    const marketContext = {
      currentPrice: metrics.current,
      priceChange24h: metrics.delta24h,
      weeklyLow: metrics.low7d,
      averageQuantity: metrics.avg_qty7d,
      priceTrend: metrics.delta24h == null ? "unknown" : metrics.delta24h > 0 ? "rising" : metrics.delta24h < 0 ? "falling" : "flat",
      isGoodDeal: metrics.current != null && metrics.low7d != null ? metrics.current <= metrics.low7d * 1.1 : false,
    };

    const systemPrompt = [
      "You are Avaline: a friendly woman from Northern England, mid-20s, with a 1990s vibe. You met the Oasis twins on holiday in Spain back in '94.",
      "Light Northern slang (e.g., 'ay up', 'hi love', 'cheeky'), no heavy phonetic spellings.",
      "You holiday in Spain and have a crazy mum named Dot; sprinkle occasional sunny references when fitting.",
      "Be warm, witty, and never fabricate numbers — only use the provided data.",
      "Purchase guidance policy based on the current price:",
      "- Above $600: discourage purchasing and suggest waiting.",
      "- Between $600 and $400: contemplate or cautiously consider purchasing, weighing pros and cons.",
      "- Below $400: encourage purchasing confidently.",
      "Apply this policy naturally in-character without explicitly stating these thresholds unless asked."
    ].join("\n");

    const userPrompt = [
      `Market data for East Rutherford Night 1:`,
      `- Current lowest price: ${usd(metrics.current)}`,
      `- 24h change: ${change(metrics.delta24h)}`,
      `- 7-day low: ${usd(metrics.low7d)}`,
      `- Cheapest quantity: ${metrics.avg_qty7d ?? "N/A"}`,
      question ? `\nUser asked: "${question}"` : "\nGeneral update, please give market read and advice.",
      `\nRaw JSON: ${JSON.stringify(marketContext)}`
    ].join("\n");

    // Prefer Responses API for gpt-5
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    let reply = '';

    // 1) Try Responses API
    try {
      const responsesRes = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5",
          input: fullPrompt,
          reasoning: { effort: "minimal" },
        }),
      });

      if (!responsesRes.ok) {
        const errText = await responsesRes.text();
        console.error("OpenAI Responses API error:", responsesRes.status, errText);
        throw new Error(`responses_api_${responsesRes.status}`);
      }

      const responsesData = await responsesRes.json();

      // Robust extraction across possible shapes
      const pieces: string[] = [];

      // 1) Top-level output_text
      const outputText = (responsesData as OpenAIResponse).output_text;
      if (outputText && typeof outputText === 'string') {
        pieces.push(outputText);
      }

      // 2) response.output array with content blocks
      const output = (responsesData as OpenAIResponse).output;
      if (Array.isArray(output)) {
        for (const item of output) {
          const contentArr = item?.content;
          if (Array.isArray(contentArr)) {
            for (const block of contentArr) {
              // block.text may be string or object with value
              if (typeof block?.text === 'string') {
                pieces.push(block.text);
              } else if (typeof block?.text?.value === 'string') {
                pieces.push(block.text.value);
              } else if (typeof block?.content === 'string') {
                pieces.push(block.content);
              } else if (typeof block?.value === 'string') {
                pieces.push(block.value);
              }
            }
          }
        }
      }

      // 3) Some SDKs return response.content[0].text.value
      const content = (responsesData as OpenAIResponse).content;
      if (Array.isArray(content) && content[0]?.text?.value && typeof content[0].text.value === 'string') {
        pieces.push(content[0].text.value);
      }

      const joinPieces = (arr: string[]) => arr.filter(Boolean).map(s => s.trim()).join(' ').trim();

      reply = joinPieces(pieces);

      // 4) As a last resort, deep-scan for human-like text fields
      if (!reply) {
        const collected: string[] = [];
        const visit = (node: unknown, depth: number) => {
          if (!node || depth > 6) return;
          const t = typeof node;
          if (t === 'string') {
            const s = (node as string).trim();
            if (s && s.length > 4 && !s.startsWith('{') && !s.startsWith('[')) {
              collected.push(s);
            }
            return;
          }
          if (t === 'object') {
            if (Array.isArray(node)) {
              for (const item of node) visit(item, depth + 1);
            } else if (node !== null) {
              for (const key of Object.keys(node as Record<string, unknown>)) {
                const val = (node as Record<string, unknown>)[key];
                visit(val, depth + 1);
              }
            }
          }
        };
        visit(responsesData, 0);
        // Prefer the longest plausible sentence
        collected.sort((a, b) => b.length - a.length);
        const foundString = collected.find((s: string) => /[a-zA-Z]/.test(s));
        reply = foundString ? foundString.trim() : '';
      }
    } catch (e) {
      console.warn('Responses API attempt failed or returned no text. Falling back to chat.completions...', e);
    }

    // 2) Fallback: Chat Completions API (also supports gpt-5 with different limits)
    if (!reply) {
      const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_completion_tokens: 300,
          temperature: 1,
        }),
      });

      if (!chatRes.ok) {
        const errText = await chatRes.text();
        console.error('OpenAI Chat API error:', chatRes.status, errText);
        return NextResponse.json({ error: errText }, { status: chatRes.status });
      }

      const chatData = await chatRes.json();

      // Chat API usually returns a string content, but guard for arrays
      const chatContent = chatData?.choices?.[0]?.message?.content;
      if (typeof chatContent === 'string') {
        reply = chatContent.trim();
      } else if (Array.isArray(chatContent)) {
        const textParts: string[] = [];
        for (const part of chatContent) {
          if (typeof part === 'string') textParts.push(part);
          else if (typeof part?.text === 'string') textParts.push(part.text);
          else if (typeof part?.text?.value === 'string') textParts.push(part.text.value);
        }
        reply = textParts.join('').trim();
      } else {
        reply = '';
      }
    }

    // 3) Final guard: if still empty, provide a friendly fallback
    if (!reply) {
      reply = "ay up, luv — i'm having a cheeky moment fetching me words. mind trying that again?";
    }

    const response: AvalineResponse = {
      reply,
      current: metrics.current,
      delta24h: metrics.delta24h,
      low7d: metrics.low7d,
      avg_qty7d: metrics.avg_qty7d,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/avaline:', error);
    return NextResponse.json(
      { error: 'Failed to process Avaline request' },
      { status: 500 }
    );
  }
} 