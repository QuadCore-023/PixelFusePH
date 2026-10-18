import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('email')?.trim(); // can be email, phone, or order ID

    let orders;
    if (query) {
      orders = await prisma.order.findMany({
        where: { 
          OR: [
            { customerEmail: { equals: query, mode: 'insensitive' } },
            { customerPhone: query },
            { id: { startsWith: query } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }
    
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Failed to fetch orders:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Safely extract and fallback values
    const customerName = body.customerName || 'Guest';
    const customerEmail = body.customerEmail || 'no-email@example.com';
    const customerPhone = body.customerPhone || null;
    const facebookName = body.facebookName || null;
    const facebookUrl = body.facebookUrl || null;
    const address = body.address || 'N/A';
    const deliveryFee = Number(body.deliveryFee) || 0;
    const totalAmount = Number(body.totalAmount) || 0;
    const paymentMethod = body.paymentMethod || 'cash';
    const proofOfPayment = body.proofOfPayment || null;
    
    // Explicitly stringify the items payload for SQLite
    let itemsList: any[] = [];
    let itemsString = '[]';
    if (body.items) {
      if (typeof body.items === 'string') {
        itemsString = body.items;
        try { itemsList = JSON.parse(body.items); } catch {}
      } else if (Array.isArray(body.items)) {
        itemsList = body.items;
        itemsString = JSON.stringify(body.items);
      }
    }

    // Verify none of the ordered database products are marked unavailable
    const productIds = itemsList
      .map((item: any) => item.id)
      .filter((id: any) => typeof id === 'string' && !id.startsWith('custom-'));

    if (productIds.length > 0) {
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });
      const unavailableItem = dbProducts.find((p) => p.isAvailable === false);
      if (unavailableItem) {
        return NextResponse.json(
          { error: `"${unavailableItem.name}" is currently unavailable and cannot be ordered.` },
          { status: 400 }
        );
      }
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        facebookName,
        facebookUrl,
        address,
        deliveryFee,
        items: itemsString,
        totalAmount,
        paymentMethod,
        proofOfPayment,
        status: 'Pending',
      },
    });
    
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Order API Error Details:", error);
    // Explicitly extract the error message to avoid empty {} serialization
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Failed to update order:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to delete order:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
