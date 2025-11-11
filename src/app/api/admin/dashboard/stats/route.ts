import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, questions, tests } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get total users count
    const userCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    // Get question counts by status
    const questionStats = await db
      .select({
        total: sql<number>`count(*)::int`,
        approved: sql<number>`count(CASE WHEN ${questions.status} = 'approved' AND ${questions.isVerified} = true THEN 1 END)::int`,
        pending: sql<number>`count(CASE WHEN ${questions.status} = 'pending' THEN 1 END)::int`,
        rejected: sql<number>`count(CASE WHEN ${questions.status} = 'rejected' THEN 1 END)::int`,
      })
      .from(questions);

    // Get test counts
    const testStats = await db
      .select({
        total: sql<number>`count(*)::int`,
        published: sql<number>`count(CASE WHEN ${tests.isPublished} = true THEN 1 END)::int`,
        draft: sql<number>`count(CASE WHEN ${tests.isPublished} = false THEN 1 END)::int`,
        free: sql<number>`count(CASE WHEN ${tests.isFree} = true THEN 1 END)::int`,
      })
      .from(tests);

    return NextResponse.json({
      users: {
        total: userCount[0]?.count || 0,
      },
      questions: {
        total: questionStats[0]?.total || 0,
        approved: questionStats[0]?.approved || 0,
        pending: questionStats[0]?.pending || 0,
        rejected: questionStats[0]?.rejected || 0,
      },
      tests: {
        total: testStats[0]?.total || 0,
        published: testStats[0]?.published || 0,
        draft: testStats[0]?.draft || 0,
        free: testStats[0]?.free || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
