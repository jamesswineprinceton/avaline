import { PriceMetrics, PriceRow } from '@/types';

/**
 * Composes a British-style reply from Avaline based on price metrics
 * Grounded in actual data with no fabrication
 */
export async function composeAvalineReply(metrics: PriceMetrics, question?: string): Promise<string> {
  const { current, delta24h, low7d, avg_qty7d } = metrics;

  // If no LLM key present, return deterministic template message
  if (!process.env.OPENAI_API_KEY) {
    return composeTemplateReply(metrics);
  }

  // Use OpenAI to generate personalized response
  try {
    return await generateAIPoweredReply(metrics, question);
  } catch (error) {
    console.error('AI generation failed, falling back to template');
    return composeTemplateReply(metrics);
  }
}

/**
 * Creates a deterministic template reply in British voice
 */
function composeTemplateReply(metrics: PriceMetrics): string {
  const { current, delta24h, low7d, avg_qty7d: _avg_qty7d } = metrics;

  if (current === null) {
    return "Blimey, no current pricing data available. Bit of a sticky wicket, that.";
  }

  let reply = `Today's floor is $${current}`;

  if (delta24h !== null) {
    const sign = delta24h >= 0 ? '+' : '';
    const absDelta = Math.abs(delta24h);
    reply += `, ${sign}$${absDelta} since yesterday`;
  }

  reply += '. ';

  if (low7d !== null) {
    reply += `The 7-day low is $${low7d}. `;
  }

  if (_avg_qty7d !== null) {
    reply += `Average quantity this week is ${_avg_qty7d}. `;
  }

  reply += "Keep calm and carry on watching.";

  return reply;
}

/**
 * Generates AI-powered personalized response using OpenAI
 */
async function generateAIPoweredReply(metrics: PriceMetrics, question?: string): Promise<string> {
  const { current, delta24h, low7d, avg_qty7d } = metrics;
  
  // Create rich context for the AI
  const marketContext = {
    currentPrice: current,
    priceChange24h: delta24h,
    weeklyLow: low7d,
    averageQuantity: avg_qty7d,
    priceTrend: delta24h && delta24h > 0 ? 'rising' : delta24h && delta24h < 0 ? 'falling' : 'stable',
    isGoodDeal: current && low7d ? current <= low7d * 1.1 : false, // Within 10% of weekly low
  };

  // Craft the AI prompt with Avaline's personality
  const prompt = `You are Avaline, a charming British AI market analyst with a warm, approachable personality. You use British slang, endearments like "love", "darling", "pet", and speak with a slight UK accent.

Current market data for East Rutherford Night 1:
- Current price: $${current || 'N/A'}
- 24h change: ${delta24h ? (delta24h > 0 ? '+' : '') + '$' + delta24h : 'N/A'}
- 7-day low: $${low7d || 'N/A'}
- Average quantity: ${avg_qty7d || 'N/A'}

${question ? `User asked: "${question}"` : 'This is a general market update.'}

Please provide a personalized, British-accented response that:
1. Acknowledges the current market situation
2. ${question ? 'Directly answers the user\'s question' : 'Gives market insights'}
3. Uses British expressions and endearments naturally
4. Provides practical, actionable advice based on the data
5. Shows personality and emotion about the prices
6. Keeps it conversational and friendly, not robotic

Make it sound like you're chatting with a friend over tea. Be warm, witty, and genuinely helpful.`;

  try {
    const requestBody = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are Avaline, a charming British AI market analyst. Always respond in character with British expressions and endearments.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.8, // Adds creativity while maintaining consistency
    };



    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('OpenAI API response not ok:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
}

/**
 * Calculates price metrics from raw price data
 */
export function calculatePriceMetrics(points: PriceRow[]): PriceMetrics {
  if (points.length === 0) {
    return {
      points: [],
      current: null,
      delta24h: null,
      low7d: null,
      avg_qty7d: null,
    };
  }

  if (points.length === 1) {
    const point = points[0];
    return {
      points,
      current: point.price,
      delta24h: null,
      low7d: point.price,
      avg_qty7d: point.quantity,
    };
  }

  // Get current (last) price
  const current = points[points.length - 1].price;
  
  // Calculate 24h delta (current - previous)
  const delta24h = points.length >= 2 ? current - points[points.length - 2].price : null;
  
  // Calculate 7-day low (min of last 7 points, or all if less than 7)
  const last7Points = points.slice(-7);
  const low7d = Math.min(...last7Points.map(p => p.price));
  
  // Calculate average quantity over last 7 points
  const avg_qty7d = last7Points.reduce((sum, p) => sum + p.quantity, 0) / last7Points.length;

  return {
    points,
    current,
    delta24h,
    low7d,
    avg_qty7d: Math.round(avg_qty7d * 100) / 100, // Round to 2 decimal places
  };
} 