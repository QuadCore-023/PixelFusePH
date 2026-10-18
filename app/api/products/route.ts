import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [products, completedOrders] = await Promise.all([
      prisma.product.findMany(),
      prisma.order.findMany({
        where: {
          status: { in: ['Done', 'Shipping'] },
        },
        select: {
          items: true,
          createdAt: true,
        },
      }),
    ]);

    const allTimeCounts: Record<string, number> = {};
    const recentCounts: Record<string, number> = {};
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

    for (const order of completedOrders) {
      let itemsList: any[] = [];
      try {
        itemsList = JSON.parse(order.items || '[]');
      } catch {
        itemsList = [];
      }
      const isRecent = new Date(order.createdAt).getTime() >= fourteenDaysAgo;

      for (const item of itemsList) {
        if (!item?.id || String(item.id).startsWith('custom-')) continue;
        const qty = Number(item.quantity) || 1;
        allTimeCounts[item.id] = (allTimeCounts[item.id] || 0) + qty;
        if (isRecent) {
          recentCounts[item.id] = (recentCounts[item.id] || 0) + qty;
        }
      }
    }

    // Top 3 all-time -> Best Seller
    const bestSellerIds = new Set(
      Object.entries(allTimeCounts)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => id)
    );

    // Top 3 last 14 days -> Popular
    const popularIds = new Set(
      Object.entries(recentCounts)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => id)
    );

    const enrichedProducts = products.map((p) => {
      const autoRibbons: string[] = [];
      if (bestSellerIds.has(p.id)) autoRibbons.push('Best Seller');
      if (popularIds.has(p.id)) autoRibbons.push('Popular');
      return {
        ...p,
        autoRibbons,
        soldCount: allTimeCounts[p.id] || 0,
        recentSoldCount: recentCounts[p.id] || 0,
      };
    });

    return NextResponse.json(enrichedProducts);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, salePrice, description, image, category, isAvailable, ribbons } = body;
    
    const parsedSalePrice =
      salePrice !== undefined && salePrice !== "" && salePrice !== null
        ? parseFloat(salePrice)
        : null;

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        salePrice: parsedSalePrice && !isNaN(parsedSalePrice) ? parsedSalePrice : null,
        description,
        image,
        category,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        ribbons: ribbons !== undefined ? String(ribbons) : "",
      },
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, price, salePrice, description, image, category, isAvailable, ribbons } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (salePrice !== undefined) {
      const parsedSale = salePrice !== "" && salePrice !== null ? parseFloat(salePrice) : null;
      updateData.salePrice = parsedSale && !isNaN(parsedSale) ? parsedSale : null;
    }
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (category !== undefined) updateData.category = category;
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);
    if (ribbons !== undefined) updateData.ribbons = String(ribbons);

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
