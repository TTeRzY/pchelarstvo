import { NextResponse } from 'next/server';
import { calendarMonths, type MonthKey } from '@/data/calendar';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const month = url.searchParams.get('month') as MonthKey | null;
  if (month && (calendarMonths as any)[month]) {
    return NextResponse.json((calendarMonths as any)[month]);
  }
  return NextResponse.json(calendarMonths);
}

