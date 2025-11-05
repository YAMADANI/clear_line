import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET: 待ち番号リスト取得API（管理画面用）
export async function GET() {
  const all = await prisma.reservation.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, number: true, status: true },
  });
  return NextResponse.json(all);
}
