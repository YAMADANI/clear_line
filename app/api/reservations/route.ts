import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST: 待ち番号を登録（numberは自動採番）
export async function POST(req: NextRequest) {
  // 直近の最大番号を取得
  const last = await prisma.reservation.findFirst({
    orderBy: { number: 'desc' },
    select: { number: true },
  });
  const nextNumber = last ? last.number + 1 : 1;
  const created = await prisma.reservation.create({
    data: { number: nextNumber, status: 'waiting' },
  });
  return NextResponse.json({ id: created.id, number: created.number });
}

// PATCH: 次に呼ぶ番号を更新
export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  if (typeof id !== 'number') {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  const newStatus = status === 'waiting' ? 'waiting' : status === 'done' ? 'done' : 'called';
  const updated = await prisma.reservation.updateMany({
    where: { id },
    data: { status: newStatus },
  });
  if (updated.count === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  return NextResponse.json({ id, status: newStatus });
}
