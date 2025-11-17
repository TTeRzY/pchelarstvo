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
  status?: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'flagged';
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
  const q = url.searchParams.get('q')?.toLowerCase();
  const product = url.searchParams.get('product');
  const minPrice = url.searchParams.get('minPrice');
  const maxPrice = url.searchParams.get('maxPrice');
  const sort = url.searchParams.get('sort') || 'newest';
  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = parseInt(url.searchParams.get('perPage') || '20');

  let items = await getAll();

  // Filter out non-public listings (only show approved/active/completed)
  items = items.filter((l) => 
    l.status === 'approved' || 
    l.status === 'active' || 
    l.status === 'completed' || 
    !l.status // backward compatibility for listings without status
  );

  // Apply filters
  if (type) items = items.filter((l) => l.type === type);
  if (region) items = items.filter((l) => l.region.toLowerCase().includes(region));
  if (q) {
    items = items.filter((l) => 
      l.title.toLowerCase().includes(q) ||
      l.product.toLowerCase().includes(q) ||
      l.region.toLowerCase().includes(q)
    );
  }
  if (product) items = items.filter((l) => l.product === product);
  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) {
      items = items.filter((l) => l.pricePerKg >= min);
    }
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) {
      items = items.filter((l) => l.pricePerKg <= max);
    }
  }

  // Sort
  switch (sort) {
    case 'priceAsc':
      items.sort((a, b) => a.pricePerKg - b.pricePerKg);
      break;
    case 'priceDesc':
      items.sort((a, b) => b.pricePerKg - a.pricePerKg);
      break;
    case 'newest':
    default:
      items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      break;
  }

  // Apply pagination
  const total = items.length;
  const start = (page - 1) * perPage;
  const paginatedItems = items.slice(start, start + perPage);

  return NextResponse.json({ 
    items: paginatedItems, 
    total,
    page,
    perPage,
    count: paginatedItems.length
  });
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

