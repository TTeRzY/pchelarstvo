import { NextResponse } from 'next/server';
import { newsSample } from '@/data/news';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const item = newsSample.find((n) => n.id === params.id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

