import prisma from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let interval: NodeJS.Timeout;
  const stream = new ReadableStream({
    async start(controller) {
      async function push() {
        const waiting = await prisma.reservation.findMany({
          where: { status: 'waiting' },
          orderBy: { id: 'asc' },
          select: { id: true, number: true },
        });
        const payload = {
          called: await prisma.reservation.findMany({
            where: { status: 'called' },
            orderBy: { id: 'desc' },
            select: { id: true, number: true, status: true },
          }),
          waiting,
          next: waiting[0] || null,
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      }
      await push();
      interval = setInterval(push, 2000);
    },
    cancel() {
      clearInterval(interval);
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
