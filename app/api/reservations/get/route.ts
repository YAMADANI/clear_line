import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET: 待ち番号リスト取得API（管理画面用）
export async function GET() {
  const waiting = await prisma.reservation.findMany({
    where: { status: 'waiting' },
    orderBy: { id: 'asc' },
    select: { id: true, number: true },
  });
  return NextResponse.json(waiting);
}
