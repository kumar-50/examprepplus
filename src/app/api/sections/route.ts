import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sections } from '@/db/schema';

export async function GET() {
  try {
    const allSections = await db
      .select({
        id: sections.id,
        name: sections.name,
      })
      .from(sections)
      .orderBy(sections.name);

    return NextResponse.json(allSections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}
