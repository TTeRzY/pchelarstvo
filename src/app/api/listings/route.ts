import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, projectPath } from '../_lib/jsonStore';

type ListingType = 'sell' | 'buy';
type Listing = {
  id: string;
  createdAt: string;
  type: ListingType;
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
  secret?: string; // simple edit token returned on create
};

const STORE = projectPath('data', 'listings.json');

async function getAll(): Promise<Listing[]> {
  return readJsonFile<Listing[]>(STORE, []);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') as ListingType | null;
  const region = url.searchParams.get('region')?.toLowerCase();

  let items = await getAll();
  if (type) items = items.filter((l) => l.type === type);
  if (region) items = items.filter((l) => l.region.toLowerCase().includes(region));

  items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return NextResponse.json({ items, count: items.length });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const required = ['type', 'product', 'title', 'quantityKg', 'pricePerKg', 'region', 'contactName', 'phone'] as const;
    for (const k of required) {
      if (body[k] == null || String(body[k]).trim() === '') {
        return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
      }
    }

    const payload: Listing = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      type: body.type,
      product: String(body.product),
      title: String(body.title),
      quantityKg: Number(body.quantityKg),
      pricePerKg: Number(body.pricePerKg),
      region: String(body.region),
      city: body.city ? String(body.city) : undefined,
      contactName: String(body.contactName),
      phone: String(body.phone),
      email: body.email ? String(body.email) : undefined,
      description: body.description ? String(body.description) : undefined,
      status: 'active',
      secret: crypto.randomUUID(),
    };

    if (!(payload.quantityKg > 0) || !(payload.pricePerKg > 0)) {
      return NextResponse.json({ error: 'quantityKg and pricePerKg must be > 0' }, { status: 400 });
    }

    const list = await getAll();
    list.unshift(payload);
    await writeJsonFile(STORE, list);

    // Return the id and secret so the client can store for future edits
    return NextResponse.json({ id: payload.id, secret: payload.secret }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

