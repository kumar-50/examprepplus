import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/db';
import { questions, sections, topics } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET() {
  try {
    await requireAuth();

    // Get sections with question counts
    const sectionsWithCounts = await db
      .select({
        id: sections.id,
        name: sections.name,
        questionCount: sql<number>`COUNT(${questions.id})`,
      })
      .from(sections)
      .leftJoin(
        questions,
        and(
          eq(questions.sectionId, sections.id),
          eq(questions.isVerified, true),
          eq(questions.isActive, true),
          eq(questions.status, 'approved')
        )
      )
      .groupBy(sections.id, sections.name)
      .orderBy(sections.name);

    // Get topics with question counts
    const topicsWithCounts = await db
      .select({
        id: topics.id,
        name: topics.name,
        sectionId: topics.sectionId,
        questionCount: sql<number>`COUNT(${questions.id})`,
      })
      .from(topics)
      .leftJoin(
        questions,
        and(
          eq(questions.topicId, topics.id),
          eq(questions.isVerified, true),
          eq(questions.isActive, true),
          eq(questions.status, 'approved')
        )
      )
      .groupBy(topics.id, topics.name, topics.sectionId)
      .orderBy(topics.name);

    return NextResponse.json({
      sections: sectionsWithCounts.map(s => ({
        id: s.id,
        name: s.name,
        questionCount: Number(s.questionCount) || 0,
      })),
      topics: topicsWithCounts.map(t => ({
        id: t.id,
        name: t.name,
        sectionId: t.sectionId,
        questionCount: Number(t.questionCount) || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching available questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available questions' },
      { status: 500 }
    );
  }
}
