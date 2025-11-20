import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/db';
import { topics } from '@/db/schema';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Fetch all topics
    const allTopics = await db
      .select({
        id: topics.id,
        name: topics.name,
        sectionId: topics.sectionId,
      })
      .from(topics);

    // You might want to join with sections to get section names
    // For now, we'll return topics with placeholder section names
    const topicsWithSections = allTopics.map(topic => ({
      id: topic.id,
      name: topic.name,
      sectionName: 'General', // You'd fetch this from sections table
    }));

    return NextResponse.json(topicsWithSections);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
