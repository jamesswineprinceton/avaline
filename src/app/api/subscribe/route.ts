import { NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/sheets';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Add subscriber to Google Sheets
    await addSubscriber(email);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
} 