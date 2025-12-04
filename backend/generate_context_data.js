import { pool } from './db.js';

const getRandomFloat = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to find item ID by partial name
const findItem = (items, name) => items.find(i => i.item_name.includes(name));
// Helper to find skill ID by partial name
const findSkill = (skills, name) => skills.find(s => s.skill_tag_name.includes(name));

const INCIDENT_MAPPINGS = {
  '道路災害': [
    { type: 'Tool', title: '急需挖土機搶通道路', items: ['挖土機'], qty: 1 },
    { type: 'Tool', title: '需要鏟子清理土石', items: ['鏟子'], qty: 10 }, // Assuming '鏟子' might not exist, will check
    { type: 'Humanpower', title: '需要重機具操作員', skills: ['重機械操作'], qty: 2 },
    { type: 'Humanpower', title: '交通管制人力', skills: ['交通'], qty: 4 }
  ],
  '建築災害': [
    { type: 'Humanpower', title: '急需結構技師評估', skills: ['結構技師'], qty: 2 },
    { type: 'Tool', title: '需要安全帽與防護裝備', items: ['安全帽', '手套'], qty: 20 },
    { type: 'Humanpower', title: '搜救犬隊支援', skills: ['搜救犬'], qty: 1 }
  ],
  '農業災害': [
    { type: 'Humanpower', title: '協助農田復原', skills: ['勞動'], qty: 10 },
    { type: 'Material', title: '需要抽水機', items: ['抽水機'], qty: 5 }
  ],
  '交通管制': [
    { type: 'Humanpower', title: '路口交通指揮', skills: ['交通'], qty: 4 },
    { type: 'Tool', title: '反光背心與指揮棒', items: ['反光背心'], qty: 10 }
  ],
  '避難需求': [
    { type: 'Material', title: '急需帳篷安置災民', items: ['帳篷'], qty: 50 },
    { type: 'Material', title: '需要睡袋與毛毯', items: ['睡袋', '毛毯'], qty: 100 },
    { type: 'Material', title: '急需飲用水', items: ['瓶裝水', '桶裝水'], qty: 200 },
    { type: 'Material', title: '需要熱食便當', items: ['便當'], qty: 150 }
  ],
  '人力需求': [
    { type: 'Humanpower', title: '物資搬運志工', skills: ['勞動'], qty: 20 },
    { type: 'Humanpower', title: '現場清潔人員', skills: ['清潔'], qty: 10 }
  ],
  '物資需求': [
    { type: 'Material', title: '急需嬰兒奶粉尿布', items: ['奶粉'], qty: 30 },
    { type: 'Material', title: '需要衛生紙與清潔用品', items: ['衛生紙', '濕紙巾'], qty: 100 },
    { type: 'Material', title: '急需保暖衣物', items: ['保暖外套', '毛毯'], qty: 50 }
  ],
  '通訊災害': [
    { type: 'Tool', title: '急需衛星電話', items: ['衛星電話'], qty: 2 },
    { type: 'Tool', title: '需要無線電對講機', items: ['對講機'], qty: 10 },
    { type: 'Humanpower', title: '通訊設備維修人員', skills: ['通訊'], qty: 2 }
  ],
  '醫療需求': [
    { type: 'Humanpower', title: '急需醫護人員駐點', skills: ['醫師', '護理師'], qty: 5 },
    { type: 'Material', title: '需要急救箱與藥品', items: ['急救箱', '常備藥品'], qty: 20 },
    { type: 'Material', title: '急需口罩與消毒液', items: ['口罩', '消毒液'], qty: 200 }
  ],
  '重建需求': [
    { type: 'Humanpower', title: '協助清理家園', skills: ['勞動'], qty: 30 },
    { type: 'Tool', title: '需要發電機支援', items: ['發電機'], qty: 5 }
  ],
  '環境災害': [
    { type: 'Humanpower', title: '環境消毒人員', skills: ['清潔'], qty: 10 },
    { type: 'Material', title: '需要漂白水與消毒劑', items: ['消毒液', '清潔劑'], qty: 50 }
  ],
  '災損評估': [
    { type: 'Humanpower', title: '需要土木技師', skills: ['大地技師', '水利技師'], qty: 3 },
    { type: 'Humanpower', title: '災損查報人員', skills: ['社工'], qty: 5 }
  ],
  '長期需求': [
    { type: 'Humanpower', title: '心理諮商師', skills: ['心理師'], qty: 5 },
    { type: 'Humanpower', title: '社工人員陪伴', skills: ['社工'], qty: 10 }
  ]
};

async function generateContextData() {
  const client = await pool.connect();
  try {
    console.log('Starting context-aware data generation...');
    await client.query('BEGIN');

    // 1. Fetch Reference Data
    const incidentsRes = await client.query('SELECT * FROM "INCIDENTS"');
    const itemsRes = await client.query('SELECT * FROM "ITEMS"');
    const skillsRes = await client.query('SELECT * FROM "SKILL_TAGS"');
    const usersRes = await client.query('SELECT user_id FROM "USERS"'); // Get some users for requesters

    const incidents = incidentsRes.rows;
    const items = itemsRes.rows;
    const skills = skillsRes.rows;
    const userIds = usersRes.rows.map(u => u.user_id);

    if (incidents.length === 0) {
      console.log('No incidents found. Please run generate_test_data.js first or ensure incidents exist.');
      return;
    }

    console.log(`Found ${incidents.length} incidents. Generating requests...`);

    for (const incident of incidents) {
      const templates = INCIDENT_MAPPINGS[incident.type] || INCIDENT_MAPPINGS['避難需求']; // Fallback
      
      // Pick 1-2 random templates for this incident
      const numRequests = getRandomInt(1, 3);
      for (let i = 0; i < numRequests; i++) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const requesterId = userIds[Math.floor(Math.random() * userIds.length)];
        
        // Create Request
        const lat = incident.latitude + getRandomFloat(-0.005, 0.005);
        const lng = incident.longitude + getRandomFloat(-0.005, 0.005);
        
        const insertRequestRes = await client.query(`
          INSERT INTO "REQUESTS" 
          (requester_id, incident_id, status, urgency, type, address, latitude, longitude, required_qty, current_qty, title)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10)
          RETURNING request_id
        `, [
          requesterId, 
          incident.incident_id, 
          'Not Completed', 
          getRandomInt(3, 5), // Higher urgency for these
          template.type, 
          incident.address, // Use incident address roughly
          lat, 
          lng, 
          template.qty, 
          template.title
        ]);
        
        const requestId = insertRequestRes.rows[0].request_id;

        // Insert Details
        if (template.type === 'Material') {
          const itemName = template.items[Math.floor(Math.random() * template.items.length)];
          const item = findItem(items, itemName);
          if (item) {
            await client.query(`
              INSERT INTO "REQUEST_MATERIALS" (request_id, item_id, qty)
              VALUES ($1, $2, $3)
            `, [requestId, item.item_id, template.qty]);
          }
        } else if (template.type === 'Tool') {
           const itemName = template.items[Math.floor(Math.random() * template.items.length)];
           const item = findItem(items, itemName);
           if (item) {
             await client.query(`
               INSERT INTO "REQUEST_EQUIPMENTS" (request_id, required_equipment, qty)
               VALUES ($1, $2, $3)
             `, [requestId, item.item_id, template.qty]);
           }
        } else if (template.type === 'Humanpower') {
          const skillName = template.skills[Math.floor(Math.random() * template.skills.length)];
          const skill = findSkill(skills, skillName);
          if (skill) {
            await client.query(`
              INSERT INTO "REQUEST_HUMANPOWER" (request_id, skill_tag_id, qty)
              VALUES ($1, $2, $3)
            `, [requestId, skill.skill_tag_id, template.qty]);
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log('Context-aware data generation completed.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error generating context data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

generateContextData();
