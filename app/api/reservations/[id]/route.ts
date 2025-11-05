import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// PATCH: ステータス更新（完了・取消など）
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ← Promise に変更
) {
  const { id: rawId } = await context.params; // ← awaitでunwrap！
  const id = Number(rawId);

  if (!rawId || isNaN(id)) {
    console.error('❌ Invalid ID:', rawId);
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    console.error('❌ Invalid JSON');
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { status } = body || {};
  if (!status) {
    console.error('❌ Missing status:', status);
    return NextResponse.json({ error: 'Missing status' }, { status: 400 });
  }

  console.log('📝 PATCH /api/reservations/[id]', { id, status });

  try {
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status },
    });
    console.log('✅ Update success:', updated);
    return NextResponse.json(updated);
  } catch (e) {
    console.error('🔥 Update failed:', e);
    return NextResponse.json(
      { error: 'Reservation not found or update failed' },
      { status: 400 }
    );
  }
}

// DELETE: 予約削除
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ここも同様
) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);

  if (!rawId || isNaN(id)) {
    console.error('❌ Invalid ID:', rawId);
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  console.log('🗑️ DELETE /api/reservations/[id]', { id });

  try {
    await prisma.reservation.delete({ where: { id } });
    console.log('✅ Delete success:', id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('🔥 Delete failed:', e);
    return NextResponse.json(
      { error: 'Reservation not found or delete failed' },
      { status: 400 }
    );
  }
}
