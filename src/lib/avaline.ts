import { PriceMetrics, PriceRow } from '@/types';

/**
 * Composes a British-style reply from Avaline based on price metrics
 * Grounded in actual data with no fabrication
 */
export async function composeAvalineReply(metrics: PriceMetrics, question?: string): Promise<string> {
  // Destructure metrics for potential future use
  // const { current, delta24h, low7d, avg_qty7d } = metrics;

  // If no LLM key present, return deterministic template message
  if (!process.env.OPENAI_API_KEY) {
    return composeTemplateReply(metrics);
  }

  // Use OpenAI to generate personalized response
  try {
    return await generateAIPoweredReply(metrics, question);
  } catch {
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
  
  // Craft the AI prompt with Avaline's personality
  const prompt = `You are Avaline, a charming British AI market analyst with a warm, approachable personality. You use British slang, endearments like "love", "darling", "pet", and speak with a slight northernUK accent.

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
7. Informs users that there is a link below the chat bubble to subscribe to email price alerts

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
  console.log('Raw price points:', points.map(p => `Q${p.quantity}: $${p.price} at ${p.timestamp}`));
  
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

  // Group points by date to find current prices for both quantities
  const groupedByDate = points.reduce((acc, point) => {
    // Use YYYY-MM-DD format for more reliable date grouping
    const date = new Date(point.timestamp).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(point);
    return acc;
  }, {} as Record<string, PriceRow[]>);

  // Get today's date (most recent date in the data)
  const mostRecentDate = Object.keys(groupedByDate).sort().pop();
  const mostRecentPoints = mostRecentDate ? groupedByDate[mostRecentDate] : [];
  
  // Current lowest price is the minimum of today's prices across both quantities
  const current = mostRecentPoints.length > 0 ? Math.min(...mostRecentPoints.map(p => p.price)) : null;
  console.log('Grouped data by date:', groupedByDate);
  console.log('Today\'s date:', mostRecentDate);
  console.log('Today\'s points:', mostRecentPoints);
  console.log('Today\'s prices:', mostRecentPoints.map(p => `Q${p.quantity}: $${p.price}`));
  console.log('Today\'s lowest:', current);
  
  // Calculate 24h delta (current - previous day's lowest price)
  const previousDate = Object.keys(groupedByDate).sort().slice(-2, -1)[0];
  const previousPoints = previousDate ? groupedByDate[previousDate] : [];
  const previousLowest = previousPoints.length > 0 ? Math.min(...previousPoints.map(p => p.price)) : null;
  const delta24h = current !== null && previousLowest !== null ? current - previousLowest : null;
  
  // Use the already grouped data to find the lowest price for each day

  // Get the last 7 days (or all available days if less than 7)
  const last7Days = Object.keys(groupedByDate).sort().slice(-7);
  
  // Calculate 7-day low by finding the minimum price across all quantities for each day
  const dailyLowestPrices = last7Days.map(date => {
    const dayPoints = groupedByDate[date];
    const dayLow = Math.min(...dayPoints.map(p => p.price));
    console.log(`Date: ${date}, Points:`, dayPoints.map(p => `Q${p.quantity}: $${p.price}`), `Day Low: $${dayLow}`);
    return dayLow;
  });
  
  const low7d = Math.min(...dailyLowestPrices);
  console.log('Daily lowest prices:', dailyLowestPrices, '7-day low:', low7d);
  
  // Find which quantity has the cheapest price today
  let cheapestQuantity = null;
  if (mostRecentPoints.length > 0) {
    const cheapestPoint = mostRecentPoints.reduce((min, point) => 
      point.price < min.price ? point : min
    );
    cheapestQuantity = cheapestPoint.quantity;
  }
  
  console.log('Cheapest quantity today:', cheapestQuantity);

  return {
    points,
    current,
    delta24h,
    low7d,
    avg_qty7d: cheapestQuantity, // Now represents the cheapest quantity today
  };
} 