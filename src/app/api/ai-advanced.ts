import { NextRequest, NextResponse } from 'next/server';
import { advancedAIPipeline } from '@/ai/advanced';

// POST /api/ai-advanced
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid query' }, { status: 400 });
    }
    const result = await advancedAIPipeline(query);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
} 