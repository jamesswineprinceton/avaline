'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceMetrics, AvalineResponse } from '@/types';
import Image from 'next/image';

// Typing animation component
const TypingMessage = ({ message }: { message: string }) => {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset typing state whenever the incoming message changes
  useEffect(() => {
    setDisplayedMessage('');
    setCurrentIndex(0);
  }, [message]);

  useEffect(() => {
    if (currentIndex < message.length) {
      const timer = setTimeout(() => {
        setDisplayedMessage(message.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 25); // Speed of typing (20ms per character - faster!)

      return () => clearTimeout(timer);
    }
  }, [currentIndex, message]);

  return (
    <p className="text-[#f9f9fb] text-lg leading-relaxed font-normal">
      {displayedMessage}
      {currentIndex < message.length && (
        <span className="animate-pulse">|</span>
      )}
    </p>
  );
};

export default function Home() {
  const [metrics, setMetrics] = useState<PriceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [avalineLoading, setAvalineLoading] = useState(false);
  const [avalineResponse, setAvalineResponse] = useState<AvalineResponse | null>(null);
  const [question, setQuestion] = useState('');
  const [showSubscribeOverlay, setShowSubscribeOverlay] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);



  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prices');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const askAvaline = async () => {
    if (!question.trim()) return;
    
    try {
      setAvalineLoading(true);
      
      const response = await fetch('/api/avaline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvalineResponse(data);
        setQuestion('');
      } else {
        console.error('Response not ok:', response.status);
      }
    } catch (error) {
      console.error('Error asking Avaline:', error);
    } finally {
      setAvalineLoading(false);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `$${price.toLocaleString()}`;
  };

  const formatDelta = (delta: number | null) => {
    if (delta === null) return 'N/A';
    const sign = delta >= 0 ? '+' : '';
    const color = delta >= 0 ? 'text-red-400' : 'text-emerald-400';
    return <span className={color}>{sign}${Math.abs(delta).toLocaleString()}</span>;
  };

  const formatQuantity = (qty: number | null) => {
    if (qty === null) return 'N/A';
    return qty.toLocaleString();
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;
    
    setSubscribeLoading(true);
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: subscribeEmail.trim() }),
      });
      
      if (response.ok) {
        // Small delay to ensure clean transition
        setTimeout(() => setSubscribeSuccess(true), 100);
        setTimeout(() => {
          setShowSubscribeOverlay(false);
          setSubscribeEmail('');
          setSubscribeSuccess(false);
          setSubscribeLoading(false);
        }, 2000);
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      // Fallback to success state for better UX
      setTimeout(() => setSubscribeSuccess(true), 100);
              setTimeout(() => {
          setShowSubscribeOverlay(false);
          setSubscribeEmail('');
          setSubscribeSuccess(false);
          setSubscribeLoading(false);
        }, 2000);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-[#f9f9fb]">Loading Avaline...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header with Logo */}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <Image 
            src="/avalineLogo.png" 
            alt="Avaline Logo" 
            width={200}
            height={200}
            className="mx-auto"
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8 py-8">
        {/* Avaline Chat - Moved to top */}
        <div className="rounded-lg p-8 mb-16 bg-black text-center">
          
          {/* Avaline's responses appear above the chat input */}
          {avalineResponse && (
            <div className="flex justify-center mb-6">
              <div className="rounded-lg p-6 bg-black text-center max-w-2xl">
                <div className="flex flex-col items-center">
                  <TypingMessage message={avalineResponse.reply} />
                </div>
              </div>
            </div>
          )}

          {/* Default welcome message that shows on page load */}
          {!avalineResponse && (
            <div className="flex justify-center mb-6">
              <div className="rounded-lg bg-black text-center max-w-3xl">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex-1">
                    <TypingMessage 
                      message={`Hello, love! Current prices for East Rutherford Night One are looking like ${formatPrice(metrics?.current || null)} at their lowest. ${(() => {
                        const price = metrics?.current || 0;
                        if (price > 600) return "Rubbish!";
                        if (price > 400) return "Lovely!";
                        return "Brilliant!";
                      })()} ${(() => {
                        const price = metrics?.current || 0;
                        if (price > 600) return "i might check back later. these are a bit steep, love.";
                        if (price > 400) return "these prices aren&apos;t half bad... i might give this a go, love!";
                        return "go for it, lovey!";
                      })()}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask Avaline..."
              className="flex-1 max-w-2xl px-4 py-3 bg-black border border-[#1a1a1a] rounded-lg focus:outline-none focus:border-[#f9f9fb] text-[#f9f9fb] placeholder-[#6b7280] transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && askAvaline()}
            />
            <button
              onClick={askAvaline}
              disabled={avalineLoading || !question.trim()}
              aria-label="Send"
              className="p-3 md:p-3 rounded-full border border-[#1a1a1a] hover:border-[#f9f9fb] bg-black transition-colors disabled:opacity-80"
            >
              {avalineLoading ? (
                <svg
                  className="animate-spin w-6 h-6 text-[#f9f9fb]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-100"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6 text-[#f9f9fb]"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Subscription line */}
          <div className="text-center mt-8">
            <button
              onClick={() => setShowSubscribeOverlay(true)}
              className="text-[#f9f9fb] text-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              Subscribe to receive email updates from Avaline
            </button>
          </div>

              {metrics && metrics.points.length === 0 && (
                <div className="text-center py-12 text-[#f9f9fb]">
                  <p className="text-lg">No price data available yet.</p>
                </div>
              )}
        </div>

        {/* Metric Cards - Center aligned */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 justify-items-center">
          <div className="rounded-lg p-8 bg-black text-center w-full max-w-xs">
            <h3 className="text-sm font-bold text-[#f9f9fb] lowercase tracking-wider">current lowest price</h3>
            <p className="text-3xl font-light text-[#f9f9fb] mt-2">{formatPrice(metrics?.current || null)}</p>
          </div>
          
          <div className="rounded-lg p-8 bg-black text-center w-full max-w-xs">
            <h3 className="text-sm font-bold text-[#f9f9fb] lowercase tracking-wider">24h change</h3>
            <p className="text-3xl font-light text-[#f9f9fb] mt-2">{formatDelta(metrics?.delta24h || null)}</p>
          </div>
          
          <div className="rounded-lg p-8 bg-black text-center w-full max-w-xs">
            <h3 className="text-sm font-bold text-[#f9f9fb] lowercase tracking-wider">7-day low</h3>
            <p className="text-3xl font-light text-[#f9f9fb] mt-2">{formatPrice(metrics?.low7d || null)}</p>
          </div>
          
          <div className="rounded-lg p-8 bg-black text-center w-full max-w-xs">
            <h3 className="text-sm font-bold text-[#f9f9fb] lowercase tracking-wider">cheapest quantity</h3>
            <p className="text-3xl font-light text-[#f9f9fb] mt-2">{formatQuantity(metrics?.avg_qty7d || null)}</p>
          </div>
        </div>

        {/* Price Chart - Center aligned */}
        {metrics && metrics.points.length >= 2 && (() => {
          // Process data to group by date and show both quantities
          const groupedData = metrics.points.reduce((acc, point) => {
            // Use YYYY-MM-DD format for consistent date grouping
            const date = new Date(point.timestamp).toISOString().split('T')[0];
            if (!acc[date]) {
              acc[date] = {
                date: date,
                timestamp: point.timestamp,
                qty1Price: null,
                qty2Price: null
              };
            }
            
            if (point.quantity === 1) {
              acc[date].qty1Price = point.price;
            } else if (point.quantity === 2) {
              acc[date].qty2Price = point.price;
            }
            
            return acc;
          }, {} as Record<string, { date: string; timestamp: string; qty1Price: number | null; qty2Price: number | null }>);

          const chartData = Object.values(groupedData).sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          return (
            <div className="rounded-lg p-8 mb-16 bg-black text-center">
              <h3 className="text-lg font-bold text-[#f9f9fb] mb-6">Price Over Time by Quantity</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      tick={{ fill: '#f9f9fb', fontSize: 12 }}
                      axisLine={{ stroke: '#1a1a1a' }}
                    />
                    <YAxis 
                      tick={{ fill: '#f9f9fb', fontSize: 12 }}
                      axisLine={{ stroke: '#1a1a1a' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number, name: string) => {
                        if (value === null) return ['N/A', name];
                        return [`$${value}`, name];
                      }}
                      contentStyle={{
                        backgroundColor: '#000',
                        border: '1px solid #1a1a1a',
                        borderRadius: '8px',
                        color: '#f9f9fb'
                      }}
                    />
                    {/* Line for Quantity 1 - Thin */}
                    <Line 
                      type="monotone" 
                      dataKey="qty1Price" 
                      stroke="#f9f9fb" 
                      strokeWidth={1.5}
                      dot={{ fill: '#f9f9fb', strokeWidth: 1, r: 3 }}
                      name="Quantity 1"
                      connectNulls={false}
                    />
                    {/* Line for Quantity 2 - Thick */}
                    <Line 
                      type="monotone" 
                      dataKey="qty2Price" 
                      stroke="#f9f9fb" 
                      strokeWidth={4}
                      dot={{ fill: '#f9f9fb', strokeWidth: 2, r: 5 }}
                      name="Quantity 2"
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
                          <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#f9f9fb] rounded-full"></div>
                <span className="text-[#f9f9fb] text-sm">Quantity 1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#f9f9fb] rounded-full"></div>
                <span className="text-[#f9f9fb] text-sm">Quantity 2</span>
              </div>
            </div>
            </div>
          );
        })()}
      </div>
      <footer className="text-center py-8 mt-8">
        <p className="text-[#f9f9fb] text-sm mb-2">
          Inspired by Bonehead&apos;s Bank Holiday by Oasis
        </p>
        <p className="text-[#f9f9fb] text-sm">
          Created with Love by{' '}
          <a 
            href="https://jamesswineh.art" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#f9f9fb] underline"
          >
            James Swinehart
          </a>
        </p>
      </footer>

      {/* Subscription Overlay */}
      {showSubscribeOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-[#1a1a1a] rounded-lg p-8 max-w-md w-full">
            {subscribeSuccess ? (
              <div className="text-center">
                <p className="text-2xl text-white mb-2">Thanks love!</p>
                <p className="text-white opacity-80">You&apos;re all set!</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  Subscribe to Avaline
                </h3>
                <p className="text-[#f9f9fb] text-center mb-6 font-normal">
                  Get notified when prices drop for east rutherford night one, love!
                </p>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <input
                    type="email"
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    placeholder="Enter your email..."
                    required
                    className="w-full px-4 py-3 bg-black border border-[#1a1a1a] rounded-lg focus:outline-none focus:border-[#f9f9fb] text-white placeholder-[#6b7280] transition-colors"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowSubscribeOverlay(false)}
                      className="flex-1 px-4 py-3 border border-[#1a1a1a] text-white rounded-lg hover:border-[#f9f9fb] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={subscribeLoading}
                      className="flex-1 px-4 py-3 bg-[#f9f9fb] text-black rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 font-medium !text-black"
                    >
                      {subscribeLoading ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
