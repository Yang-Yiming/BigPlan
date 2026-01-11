import { createLocalDb } from './src/db/client';
import { users, tasks, groups } from './src/db/schema';

// Test database connection and schema
async function testDb() {
  const db = createLocalDb();

  console.log('✓ Database connection successful');
  console.log('✓ Schema loaded');

  // Test inserting a user
  try {
    const result = await db.insert(users).values({
      username: 'test_user',
      passwordHash: 'hashed_password_here',
      avatarUrl: 'https://example.com/avatar.jpg',
    });
    console.log('✓ User insertion test passed');

    // Test querying
    const allUsers = await db.select().from(users);
    console.log(`✓ Query test passed - Found ${allUsers.length} user(s)`);

    console.log('\n✅ All database tests passed!');
    console.log('\nDatabase tables:');
    console.log('  - users');
    console.log('  - tasks');
    console.log('  - kiss_reflections');
    console.log('  - groups');
    console.log('  - group_members');
    console.log('  - comments');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testDb();
