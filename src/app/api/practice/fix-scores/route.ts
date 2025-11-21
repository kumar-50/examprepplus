import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userTestAttempts } from '@/db/schema';
import { sql, isNull, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    // Update all records where score is null but correctAnswers exists
    const result = await db
      .update(userTestAttempts)
      .set({
        score: sql`${userTestAttempts.correctAnswers}`,
      })
      .where(
        sql`${userTestAttempts.score} IS NULL AND ${userTestAttempts.correctAnswers} IS NOT NULL`
      );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Scores updated successfully',
      result 
    });
  } catch (error) {
    console.error('Error fixing scores:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fix scores' },
      { status: 500 }
    );
  }
}
