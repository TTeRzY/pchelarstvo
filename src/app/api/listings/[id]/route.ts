import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, projectPath } from '../../_lib/jsonStore';

type Listing = {
  id: string;
  createdAt: string;
  type: 'sell' | 'buy';
  product: string;
  title: string;
  quantityKg: number;
  pricePerKg: number;
  region: string;
  city?: string;
  contactName: string;
  phone: string;
  email?: string;
  description?: string;
  status?: 'active' | 'completed';
  secret?: string;
};

const STORE = projectPath('data', 'listings.json');

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const all = await readJsonFile<Listing[]>(STORE, []);
  const item = all.find((l) => l.id === id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null) as Partial<Listing> & { secret?: string } | null;
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const all = await readJsonFile<Listing[]>(STORE, []);
  const idx = all.findIndex((l) => l.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existing = all[idx];

  // Simple protection: require secret to update
  if (!body.secret || body.secret !== existing.secret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated: Listing = {
    ...existing,
    title: body.title != null ? String(body.title) : existing.title,
    city: body.city != null ? String(body.city) : existing.city,
    description: body.description != null ? String(body.description) : existing.description,
    status: body.status === 'completed' ? 'completed' : existing.status,
  };

  all[idx] = updated;
  await writeJsonFile(STORE, all);
  return NextResponse.json({ ok: true });
}

