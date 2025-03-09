import { db, pool, testDatabaseConnection as quickTest } from './server/db';
import * as schema from './shared/schema';
import { sql } from 'drizzle-orm';

/**
 * This script performs comprehensive database connection and table structure tests
 * without touching existing data.
 * 
 * Run with: npx tsx test-db.ts
 * 
 * Works in both Replit and VS Code environments.
 */
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  // Check environment variables
  const envVars = [
    'DATABASE_URL', 'PGHOST', 'PGUSER', 'PGDATABASE', 'PGPORT', 'PGPASSWORD'
  ];
  
  console.log('\n--- Environment Variables Check ---');
  let allEnvVarsPresent = true;
  for (const varName of envVars) {
    const isSet = process.env[varName] !== undefined;
    console.log(`${varName}: ${isSet ? '✅ Set' : '❌ Not set'}`);
    if (!isSet && varName === 'DATABASE_URL') {
      allEnvVarsPresent = false;
    }
  }
  
  if (!allEnvVarsPresent) {
    console.error('\n❌ Critical environment variables missing. Database connection will likely fail.');
  }
  
  try {
    // Quick connectivity test
    console.log('\n--- Quick Connection Test ---');
    const quickTestResult = await quickTest();
    console.log(`Quick connectivity test: ${quickTestResult ? '✅ Passed' : '❌ Failed'}`);
    
    if (!quickTestResult) {
      throw new Error('Quick connection test failed. Cannot proceed with further tests.');
    }
    
    // Pool status check
    console.log('\n--- Connection Pool Status ---');
    try {
      // @ts-ignore - Accessing internal properties for diagnostics only
      const poolStatus = {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      };
      console.log('Connection pool status:', poolStatus);
    } catch (err) {
      console.log('Could not retrieve detailed pool status');
    }
    
    // Test basic query execution
    console.log('\n--- Basic Query Test ---');
    const pingResult = await db.execute(sql`SELECT 1 AS ping`);
    console.log('Basic query:', pingResult ? '✅ Executed' : '❌ Failed');
    
    // PostgreSQL version check
    try {
      const versionResult = await db.execute(sql`SELECT version()`);
      // Handle different result formats safely
      const versionInfo = versionResult && 
                         (Array.isArray(versionResult) && versionResult.length > 0) ? 
                           versionResult[0]?.version : 
                           (versionResult.rows && versionResult.rows.length > 0) ? 
                             versionResult.rows[0]?.version : 
                             'Unknown';
      
      console.log('PostgreSQL version:', versionInfo);
    } catch (err) {
      console.error('PostgreSQL version check failed:', err.message);
    }

    // Check tables with detailed information
    console.log('\n--- Table Structure Test ---');
    const tables = [
      { name: 'users', schema: schema.users },
      { name: 'wardrobe_items', schema: schema.wardrobeItems },
      { name: 'outfits', schema: schema.outfits },
      { name: 'inspirations', schema: schema.inspirations },
      { name: 'weather_preferences', schema: schema.weatherPreferences },
      { name: 'mood_preferences', schema: schema.moodPreferences }
    ];

    for (const table of tables) {
      try {
        const count = await db.select({ count: sql`COUNT(*)` }).from(table.schema);
        console.log(`Table '${table.name}': ✅ Exists (${count[0].count} rows)`);
        
        // Get column information for this table
        try {
          const columnsResult = await db.execute(sql`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = ${table.name}
            ORDER BY ordinal_position
          `);
          
          // Convert to array for type safety
          const columns = Array.isArray(columnsResult) ? columnsResult : 
                         (columnsResult.rows ? columnsResult.rows : []);
          
          if (columns.length > 0) {
            console.log(`  - Columns: ${columns.length}`);
            // Display only first 3 columns to avoid cluttering the console
            columns.slice(0, 3).forEach(col => {
              console.log(`    - ${col.column_name} (${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''})`);
            });
            if (columns.length > 3) {
              console.log(`    - ... and ${columns.length - 3} more columns`);
            }
          }
        } catch (err) {
          console.log(`  - Could not retrieve column information: ${err.message}`);
        }
        
      } catch (err) {
        console.error(`Table '${table.name}': ❌ Error:`, err.message);
      }
    }
    
    // Advanced test - Sample queries without modifying data
    console.log('\n--- Sample Query Test ---');
    
    // Get first 3 users 
    try {
      const users = await db.select().from(schema.users).limit(3);
      console.log(`Users query: ✅ Success (${users.length} results)`);
      if (users.length > 0) {
        console.log('Sample user:', {
          id: users[0].id,
          username: users[0].username,
          email: users[0].email ? '(present)' : '(empty)' // Don't print actual email
        });
      }
    } catch (err) {
      console.error('Users query: ❌ Failed -', err.message);
    }
    
    // Get first 3 wardrobe items
    try {
      const items = await db.select().from(schema.wardrobeItems).limit(3);
      console.log(`Wardrobe items query: ✅ Success (${items.length} results)`);
      if (items.length > 0) {
        console.log('Sample item:', {
          id: items[0].id,
          name: items[0].name,
          category: items[0].category
        });
      }
    } catch (err) {
      console.error('Wardrobe items query: ❌ Failed -', err.message);
    }
    
    // Test a more complex JOIN query
    try {
      const joinQuery = await db.select({
        outfit_id: schema.outfits.id,
        outfit_name: schema.outfits.name,
        user_id: schema.users.id,
        username: schema.users.username
      })
      .from(schema.outfits)
      .leftJoin(schema.users, sql`${schema.outfits.userId} = ${schema.users.id}`)
      .limit(2);
      
      console.log(`JOIN query: ✅ Success (${joinQuery.length} results)`);
    } catch (err) {
      console.error('JOIN query: ❌ Failed -', err.message);
    }
    
    // Test performance with a simple benchmark
    console.log('\n--- Performance Test ---');
    const start = Date.now();
    await db.select({ count: sql`COUNT(*)` }).from(schema.wardrobeItems);
    const duration = Date.now() - start;
    console.log(`Simple COUNT query completed in ${duration}ms`);
    
    console.log('\n✅ Database connection and structure tests completed successfully!');
    console.log('You can use this script to verify database connectivity in both Replit and VS Code.');
    
  } catch (error) {
    console.error('\n❌ Database connection test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    // We don't end the pool here because it's exported from server/db.ts
    // and might be used by other modules
  }
}

// Run the test
testDatabaseConnection().catch(err => {
  console.error('Unhandled error in test script:', err);
  process.exit(1);
});