import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/db'
import { users, userTestAttempts, userGoals } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST() {
  try {
    console.log('📤 Export data request started')
    
    const user = await getCurrentUser()
    if (!user) {
      console.log('❌ No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    // Fetch all user data
    console.log('📊 Fetching user data...')
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (!userData) {
      console.log('❌ User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('📊 Fetching test attempts...')
    const testData = await db
      .select()
      .from(userTestAttempts)
      .where(eq(userTestAttempts.userId, user.id))

    console.log('📊 Fetching goals...')
    const goalsData = await db
      .select()
      .from(userGoals)
      .where(eq(userGoals.userId, user.id))

    console.log(`✅ Data fetched: ${testData.length} tests, ${goalsData.length} goals`)

    const exportData = {
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.fullName,
        created_at: userData.createdAt,
      },
      metadata: user.user_metadata,
      test_attempts: testData,
      goals: goalsData,
      exported_at: new Date().toISOString(),
    }

    console.log('✅ Export data prepared successfully')

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="examprepplus-data-${user.id}.json"`,
      },
    })
  } catch (error) {
    console.error('❌ Error exporting data:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { 
        error: 'Failed to export data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
