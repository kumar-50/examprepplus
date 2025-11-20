// seed-rrb-sections-topics.js
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

// Define sections and topics data
const sectionsData = [
  {
    name: 'Mathematics',
    description: 'Mathematical and Arithmetic Ability covering numerical calculations, algebra, geometry, and data interpretation',
    displayOrder: 1,
    examType: 'RRB_NTPC',
    topics: [
      { name: 'Number System', description: 'Basic number theory, divisibility, prime numbers, and number properties' },
      { name: 'Decimals', description: 'Decimal operations, conversions, and applications' },
      { name: 'Fractions', description: 'Fraction operations, simplifications, and conversions' },
      { name: 'LCM & HCF', description: 'Least Common Multiple and Highest Common Factor calculations' },
      { name: 'Ratio and Proportion', description: 'Direct and inverse proportions, ratio applications' },
      { name: 'Percentage', description: 'Percentage calculations, increase/decrease, and applications' },
      { name: 'Mensuration', description: 'Area, volume, perimeter of 2D and 3D geometric shapes' },
      { name: 'Time and Work', description: 'Work efficiency, time-based problems, and pipe-cistern problems' },
      { name: 'Time and Distance', description: 'Speed, distance, time calculations, relative speed, trains' },
      { name: 'Simple and Compound Interest', description: 'Interest calculations, principal, rate, time relationships' },
      { name: 'Profit and Loss', description: 'Commercial mathematics, discount, marked price, cost price' },
      { name: 'Elementary Algebra', description: 'Basic algebraic expressions, equations, and identities' },
      { name: 'Geometry and Trigonometry', description: 'Geometric theorems, angles, triangles, and trigonometric ratios' },
      { name: 'Elementary Statistics', description: 'Mean, median, mode, range, and standard deviation' },
      { name: 'Data Interpretation', description: 'Analysis of charts, graphs, tables, and data sets' }
    ]
  },
  {
    name: 'General Intelligence and Reasoning',
    description: 'Logical reasoning, analytical ability, and problem-solving skills covering various reasoning patterns',
    displayOrder: 2,
    examType: 'RRB_NTPC',
    topics: [
      { name: 'Analogies', description: 'Pattern recognition, relationships, and analogical reasoning' },
      { name: 'Number Series', description: 'Number sequence completion and pattern identification' },
      { name: 'Alphabet Series', description: 'Letter sequence completion and alphabetical patterns' },
      { name: 'Coding and Decoding', description: 'Coding patterns, cipher techniques, and symbolic representation' },
      { name: 'Mathematical Operations', description: 'Symbol substitution, BODMAS, and operational relationships' },
      { name: 'Similarities and Differences', description: 'Identifying odd one out and classification' },
      { name: 'Blood Relations', description: 'Family relationship problems and kinship analysis' },
      { name: 'Analytical Reasoning', description: 'Logical analysis, deduction, and critical thinking' },
      { name: 'Syllogism', description: 'Logical statements, conclusions, and deductive reasoning' },
      { name: 'Jumbling', description: 'Word rearrangement and sentence ordering' },
      { name: 'Venn Diagrams', description: 'Set theory, logical grouping, and visual logic' },
      { name: 'Puzzles', description: 'Seating arrangements, floor puzzles, scheduling problems' },
      { name: 'Data Sufficiency', description: 'Determining sufficiency of given information' },
      { name: 'Statement and Conclusion', description: 'Logical inference and conclusion drawing' },
      { name: 'Decision Making', description: 'Choosing best course of action based on given data' },
      { name: 'Maps and Graph Interpretation', description: 'Direction sense, map reading, and visual data analysis' }
    ]
  },
  {
    name: 'General Awareness',
    description: 'General Knowledge covering current affairs, science, history, geography, polity, economy, and culture',
    displayOrder: 3,
    examType: 'RRB_NTPC',
    topics: [
      { name: 'Current Affairs', description: 'National and international current events, important news' },
      { name: 'Games and Sports', description: 'Sports personalities, tournaments, awards, and records' },
      { name: 'Art and Culture', description: 'Indian art, music, dance, festivals, and cultural heritage' },
      { name: 'Indian Literature', description: 'Authors, books, literary works, and literary movements' },
      { name: 'Monuments and Places', description: 'Historical places, landmarks, UNESCO sites' },
      { name: 'General Science', description: 'Physics, Chemistry, Biology up to 10th CBSE standard' },
      { name: 'History of India', description: 'Ancient, medieval, and modern Indian history' },
      { name: 'Freedom Struggle', description: 'Independence movement, freedom fighters, and national movements' },
      { name: 'Physical Geography', description: 'Landforms, climate, natural resources, and physical features' },
      { name: 'Social Geography', description: 'Population, migration, settlements, and demographics' },
      { name: 'Economic Geography', description: 'Industries, agriculture, trade, and economic activities' },
      { name: 'Indian Polity', description: 'Constitution, governance, political system, and institutions' },
      { name: 'Scientific Developments', description: 'Space program, nuclear program, and technological advancements' },
      { name: 'UN and World Organizations', description: 'International bodies, treaties, and global organizations' },
      { name: 'Environmental Issues', description: 'Climate change, conservation, ecology, and environmental policies' },
      { name: 'Computer Basics', description: 'Hardware, software, internet, networking, and MS Office' },
      { name: 'Abbreviations', description: 'Common acronyms, short forms, and abbreviations' },
      { name: 'Transport Systems', description: 'Railways, roadways, airways, waterways in India' },
      { name: 'Indian Economy', description: 'Banking, finance, budget, GDP, economic policies' },
      { name: 'Famous Personalities', description: 'Notable figures in various fields - politics, science, sports, arts' },
      { name: 'Government Programs', description: 'Flagship schemes, initiatives, and welfare programs' }
    ]
  }
];

async function checkCurrentData() {
  console.log('\n' + '='.repeat(80));
  console.log('=== STEP 1: CURRENT DATABASE STATE ===');
  console.log('='.repeat(80) + '\n');
  
  try {
    // Get current sections
    const sections = await sql`
      SELECT id, name, description, display_order, exam_type 
      FROM sections 
      WHERE exam_type = 'RRB_NTPC'
      ORDER BY display_order
    `;
    
    console.log(`📊 Current Sections in Database: ${sections.length}\n`);
    if (sections.length > 0) {
      sections.forEach(s => {
        console.log(`  ${s.display_order}. ${s.name}`);
        console.log(`     ID: ${s.id}`);
        console.log(`     Description: ${s.description || '(no description)'}`);
        console.log();
      });
    } else {
      console.log('  (No RRB_NTPC sections found)\n');
    }
    
    // Get current topics
    const topics = await sql`
      SELECT t.id, t.name, t.description, t.section_id, s.name as section_name
      FROM topics t
      JOIN sections s ON t.section_id = s.id
      WHERE s.exam_type = 'RRB_NTPC'
      ORDER BY s.display_order, t.name
    `;
    
    console.log(`📝 Current Topics in Database: ${topics.length}\n`);
    
    // Group topics by section
    const topicsBySection = {};
    topics.forEach(t => {
      if (!topicsBySection[t.section_name]) {
        topicsBySection[t.section_name] = [];
      }
      topicsBySection[t.section_name].push(t);
    });
    
    Object.keys(topicsBySection).forEach(sectionName => {
      console.log(`  [${sectionName}]: ${topicsBySection[sectionName].length} topics`);
      topicsBySection[sectionName].forEach(t => {
        console.log(`    - ${t.name}`);
      });
      console.log();
    });
    
    if (topics.length === 0) {
      console.log('  (No topics found)\n');
    }
    
    return { sections, topics, topicsBySection };
  } catch (error) {
    console.error('❌ Error checking current data:', error);
    throw error;
  }
}

async function analyzeChanges(currentData) {
  console.log('\n' + '='.repeat(80));
  console.log('=== STEP 2: ANALYZING CHANGES ===');
  console.log('='.repeat(80) + '\n');
  
  const { sections: currentSections, topics: currentTopics } = currentData;
  
  const changes = {
    sections: {
      toInsert: [],
      toUpdate: [],
      unchanged: []
    },
    topics: {
      toInsert: [],
      toUpdate: [],
      unchanged: []
    }
  };
  
  // Analyze sections
  console.log('📊 SECTIONS ANALYSIS:\n');
  
  sectionsData.forEach(newSection => {
    const existing = currentSections.find(s => s.name === newSection.name);
    
    if (!existing) {
      changes.sections.toInsert.push(newSection);
      console.log(`  ✨ NEW: "${newSection.name}"`);
      console.log(`     Description: ${newSection.description}`);
      console.log(`     Display Order: ${newSection.displayOrder}`);
      console.log(`     Will create with ${newSection.topics.length} topics\n`);
    } else {
      const needsUpdate = 
        existing.description !== newSection.description ||
        existing.display_order !== newSection.displayOrder;
      
      if (needsUpdate) {
        changes.sections.toUpdate.push({
          existing,
          new: newSection
        });
        console.log(`  🔄 UPDATE: "${newSection.name}"`);
        console.log(`     Current Description: ${existing.description || '(none)'}`);
        console.log(`     New Description: ${newSection.description}`);
        console.log(`     Current Order: ${existing.display_order}, New Order: ${newSection.displayOrder}`);
        console.log(`     Has ${newSection.topics.length} topics to process\n`);
      } else {
        changes.sections.unchanged.push(existing);
        console.log(`  ✓ UNCHANGED: "${newSection.name}"`);
        console.log(`     Has ${newSection.topics.length} topics to process\n`);
      }
    }
  });
  
  console.log(`\n  Summary: ${changes.sections.toInsert.length} new, ${changes.sections.toUpdate.length} to update, ${changes.sections.unchanged.length} unchanged\n`);
  
  // Analyze topics
  console.log('\n📝 TOPICS ANALYSIS:\n');
  
  for (const sectionData of sectionsData) {
    const existingSection = currentSections.find(s => s.name === sectionData.name);
    const sectionId = existingSection?.id || 'NEW';
    
    console.log(`  [Section: ${sectionData.name}]\n`);
    
    for (const newTopic of sectionData.topics) {
      const existing = currentTopics.find(
        t => t.name === newTopic.name && t.section_id === sectionId
      );
      
      if (!existing) {
        changes.topics.toInsert.push({
          sectionName: sectionData.name,
          topic: newTopic
        });
        console.log(`    ✨ NEW: "${newTopic.name}"`);
        console.log(`       Description: ${newTopic.description}`);
      } else {
        const needsUpdate = existing.description !== newTopic.description;
        
        if (needsUpdate) {
          changes.topics.toUpdate.push({
            existing,
            new: newTopic,
            sectionName: sectionData.name
          });
          console.log(`    🔄 UPDATE: "${newTopic.name}"`);
          console.log(`       Current: ${existing.description || '(none)'}`);
          console.log(`       New: ${newTopic.description}`);
        } else {
          changes.topics.unchanged.push(existing);
          console.log(`    ✓ UNCHANGED: "${newTopic.name}"`);
        }
      }
    }
    console.log();
  }
  
  console.log(`  Summary: ${changes.topics.toInsert.length} new, ${changes.topics.toUpdate.length} to update, ${changes.topics.unchanged.length} unchanged\n`);
  
  return changes;
}

async function confirmChanges(changes) {
  console.log('\n' + '='.repeat(80));
  console.log('=== STEP 3: CHANGE SUMMARY ===');
  console.log('='.repeat(80) + '\n');
  
  const totalSectionChanges = changes.sections.toInsert.length + changes.sections.toUpdate.length;
  const totalTopicChanges = changes.topics.toInsert.length + changes.topics.toUpdate.length;
  
  console.log('📋 WHAT WILL BE DONE:\n');
  
  console.log(`  Sections:`);
  console.log(`    ✨ Insert: ${changes.sections.toInsert.length}`);
  console.log(`    🔄 Update: ${changes.sections.toUpdate.length}`);
  console.log(`    ✓ Keep unchanged: ${changes.sections.unchanged.length}`);
  console.log();
  
  console.log(`  Topics:`);
  console.log(`    ✨ Insert: ${changes.topics.toInsert.length}`);
  console.log(`    🔄 Update: ${changes.topics.toUpdate.length}`);
  console.log(`    ✓ Keep unchanged: ${changes.topics.unchanged.length}`);
  console.log();
  
  console.log(`  Total Changes: ${totalSectionChanges + totalTopicChanges}`);
  console.log();
  
  if (totalSectionChanges === 0 && totalTopicChanges === 0) {
    console.log('  ℹ️  No changes needed - database is already up to date!');
    return false;
  }
  
  console.log('  ⚠️  Ready to apply changes to the database.');
  console.log('  ⚠️  Run this script with --execute flag to apply changes.');
  console.log();
  
  return true;
}

async function applyChanges(changes) {
  console.log('\n' + '='.repeat(80));
  console.log('=== STEP 4: APPLYING CHANGES ===');
  console.log('='.repeat(80) + '\n');
  
  let stats = {
    sectionsInserted: 0,
    sectionsUpdated: 0,
    topicsInserted: 0,
    topicsUpdated: 0
  };
  
  try {
    // Insert new sections
    for (const section of changes.sections.toInsert) {
      console.log(`\n📁 Creating section: ${section.name}`);
      const result = await sql`
        INSERT INTO sections (name, description, display_order, exam_type)
        VALUES (${section.name}, ${section.description}, ${section.displayOrder}, ${section.examType})
        RETURNING id
      `;
      console.log(`   ✓ Created with ID: ${result[0].id}`);
      stats.sectionsInserted++;
    }
    
    // Update existing sections
    for (const change of changes.sections.toUpdate) {
      console.log(`\n📁 Updating section: ${change.new.name}`);
      await sql`
        UPDATE sections
        SET 
          description = ${change.new.description},
          display_order = ${change.new.displayOrder}
        WHERE id = ${change.existing.id}
      `;
      console.log(`   ✓ Updated`);
      stats.sectionsUpdated++;
    }
    
    // Get fresh section IDs
    const sections = await sql`
      SELECT id, name FROM sections WHERE exam_type = 'RRB_NTPC'
    `;
    const sectionMap = {};
    sections.forEach(s => {
      sectionMap[s.name] = s.id;
    });
    
    // Insert new topics
    for (const item of changes.topics.toInsert) {
      const sectionId = sectionMap[item.sectionName];
      console.log(`\n  📝 Creating topic: ${item.topic.name} (in ${item.sectionName})`);
      await sql`
        INSERT INTO topics (name, section_id, description)
        VALUES (${item.topic.name}, ${sectionId}, ${item.topic.description})
      `;
      console.log(`     ✓ Created`);
      stats.topicsInserted++;
    }
    
    // Update existing topics
    for (const change of changes.topics.toUpdate) {
      console.log(`\n  📝 Updating topic: ${change.new.name} (in ${change.sectionName})`);
      await sql`
        UPDATE topics
        SET description = ${change.new.description}
        WHERE id = ${change.existing.id}
      `;
      console.log(`     ✓ Updated`);
      stats.topicsUpdated++;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ CHANGES APPLIED SUCCESSFULLY!\n');
    console.log(`  Sections: ${stats.sectionsInserted} inserted, ${stats.sectionsUpdated} updated`);
    console.log(`  Topics: ${stats.topicsInserted} inserted, ${stats.topicsUpdated} updated`);
    console.log();
    
    return stats;
    
  } catch (error) {
    console.error('\n❌ Error applying changes:', error);
    throw error;
  }
}

async function verifyData() {
  console.log('\n' + '='.repeat(80));
  console.log('=== STEP 5: FINAL VERIFICATION ===');
  console.log('='.repeat(80) + '\n');
  
  try {
    const sections = await sql`
      SELECT id, name, display_order 
      FROM sections 
      WHERE exam_type = 'RRB_NTPC'
      ORDER BY display_order
    `;
    
    console.log(`📊 Total Sections: ${sections.length}\n`);
    
    for (const section of sections) {
      const topicCount = await sql`
        SELECT COUNT(*) as count 
        FROM topics 
        WHERE section_id = ${section.id}
      `;
      
      console.log(`  ${section.display_order}. ${section.name}`);
      console.log(`     Topics: ${topicCount[0].count}`);
      console.log(`     ID: ${section.id}`);
      console.log();
    }
    
    const totalTopics = await sql`
      SELECT COUNT(*) as count 
      FROM topics t
      JOIN sections s ON t.section_id = s.id
      WHERE s.exam_type = 'RRB_NTPC'
    `;
    
    console.log(`📝 Total Topics: ${totalTopics[0].count}`);
    console.log();
    
    // Expected values
    const expected = {
      sections: 3,
      topics: 52
    };
    
    const sectionsMatch = sections.length === expected.sections;
    const topicsMatch = parseInt(totalTopics[0].count) === expected.topics;
    
    console.log('🎯 Expected vs Actual:\n');
    console.log(`  Sections: ${expected.sections} expected, ${sections.length} actual ${sectionsMatch ? '✓' : '❌'}`);
    console.log(`  Topics: ${expected.topics} expected, ${totalTopics[0].count} actual ${topicsMatch ? '✓' : '❌'}`);
    console.log();
    
    if (sectionsMatch && topicsMatch) {
      console.log('✅ Database structure matches expected values!\n');
    } else {
      console.log('⚠️  Warning: Database structure does not match expected values!\n');
    }
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
    throw error;
  }
}

async function main() {
  const executeMode = process.argv.includes('--execute');
  
  try {
    console.log('\n');
    console.log('🚀 RRB NTPC Sections & Topics Seeder');
    console.log('='.repeat(80));
    console.log(`Mode: ${executeMode ? 'EXECUTE (will modify database)' : 'DRY RUN (preview only)'}`);
    console.log('='.repeat(80));
    
    // Step 1: Check current state
    const currentData = await checkCurrentData();
    
    // Step 2: Analyze what will change
    const changes = await analyzeChanges(currentData);
    
    // Step 3: Show summary
    const hasChanges = await confirmChanges(changes);
    
    // Step 4: Apply changes if in execute mode
    if (executeMode) {
      if (hasChanges) {
        await applyChanges(changes);
        await verifyData();
      } else {
        console.log('  No changes to apply.\n');
      }
    } else {
      console.log('\n' + '='.repeat(80));
      console.log('\n💡 This was a DRY RUN - no changes were made to the database.');
      console.log('   To apply these changes, run: node seed-rrb-sections-topics.js --execute\n');
    }
    
    console.log('='.repeat(80));
    console.log('✅ Process completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
