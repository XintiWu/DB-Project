import { pool } from './db.js';

const NUM_REQUESTS = 50;

const REQUEST_TYPES = ['Material', 'Tool', 'Humanpower'];
const STATUSES = ['Not Completed', 'Completed'];
const URGENCIES = [1, 2, 3, 4, 5];

const TITLES_MATERIAL = ['急需飲用水', '需要保暖衣物', '缺乏醫療口罩', '需要乾糧', '急需帳篷', '需要睡袋', '急需嬰兒奶粉', '需要衛生紙', '急需消毒水', '需要毛巾'];
const TITLES_TOOL = ['需要發電機', '急需抽水機', '需要鏟子', '需要電鋸', '急需照明設備', '需要無線電', '急需救生艇', '需要繩索', '急需安全帽', '需要手套'];
const TITLES_HUMANPOWER = ['急需醫護人員', '需要搬運志工', '需要交通引導', '急需心理輔導', '需要搜救人員', '需要煮食志工', '急需清潔人員', '需要翻譯人員', '急需社工', '需要司機'];

const ADDRESSES = [
    '台北市信義區市府路1號',
    '台北市大安區新生南路二段1號',
    '台北市中正區中山南路21號',
    '台北市松山區南京東路四段2號',
    '台北市內湖區民權東路六段123號',
    '台北市士林區中正路456號',
    '台北市北投區大業路789號',
    '台北市文山區木柵路一段101號',
    '台北市南港區忠孝東路七段369號',
    '台北市萬華區中華路一段1號',
    '新北市板橋區中山路一段161號',
    '新北市新店區北新路一段88號',
    '新北市中和區景平路666號',
    '新北市永和區中正路100號',
    '新北市三重區重新路三段10號'
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max) => Math.random() * (max - min) + min;

async function generateData() {
  const client = await pool.connect();
  try {
    console.log('Starting data generation...');
    await client.query('BEGIN');

    // 0. Ensure title column exists
    console.log('Ensuring title column exists...');
    await client.query('ALTER TABLE "REQUESTS" ADD COLUMN IF NOT EXISTS title VARCHAR(100)');

    // 1. Ensure Users exist
    console.log('Checking Users...');
    let usersRes = await client.query('SELECT user_id FROM "USERS" LIMIT 10');
    if (usersRes.rows.length === 0) {
      console.log('Creating dummy users...');
      for (let i = 0; i < 5; i++) {
        await client.query(`
          INSERT INTO "USERS" (user_id, name, phone, role, status)
          VALUES ($1, $2, $3, 'Member', 'Active')
        `, [1000 + i, `User${i}`, `090000000${i}`]);
      }
      usersRes = await client.query('SELECT user_id FROM "USERS"');
    }
    const userIds = usersRes.rows.map(r => r.user_id);

    // 2. Ensure Areas exist (needed for Incidents)
    console.log('Checking Areas...');
    let areasRes = await client.query('SELECT area_id FROM "AREA" LIMIT 1');
    if (areasRes.rows.length === 0) {
        console.log('Creating dummy area...');
        await client.query(`INSERT INTO "AREA" (area_id, area_name) VALUES ('A01', 'Test Area')`);
        areasRes = await client.query('SELECT area_id FROM "AREA"');
    }
    const areaId = areasRes.rows[0].area_id;

    // 3. Ensure Incidents exist
    console.log('Checking Incidents...');
    let incidentsRes = await client.query('SELECT incident_id FROM "INCIDENTS" LIMIT 10');
    if (incidentsRes.rows.length === 0) {
      console.log('Creating dummy incidents...');
      for (let i = 0; i < 5; i++) {
        await client.query(`
          INSERT INTO "INCIDENTS" (incident_id, title, type, severity, area_id, reporter_id, latitude, longitude, status, address)
          VALUES ($1, $2, 'Fire', 3, $3, $4, 25.0, 121.0, 'Occuring', $5)
        `, [2000 + i, `Incident ${i}`, areaId, userIds[0], getRandomElement(ADDRESSES)]);
      }
      incidentsRes = await client.query('SELECT incident_id FROM "INCIDENTS"');
    }
    const incidentIds = incidentsRes.rows.map(r => r.incident_id);

    // 4. Ensure Item Categories exist
    console.log('Checking Item Categories...');
    let categoriesRes = await client.query('SELECT category_id FROM "ITEM_CATEGORIES" LIMIT 1');
    if (categoriesRes.rows.length === 0) {
        console.log('Creating dummy category...');
        await client.query(`INSERT INTO "ITEM_CATEGORIES" (category_id, category_name, is_tool) VALUES (1, 'General', false)`);
        await client.query(`INSERT INTO "ITEM_CATEGORIES" (category_id, category_name, is_tool) VALUES (2, 'Tools', true)`);
        categoriesRes = await client.query('SELECT category_id FROM "ITEM_CATEGORIES"');
    }
    const categoryIds = categoriesRes.rows.map(r => r.category_id);

    // 5. Ensure Items exist
    console.log('Checking Items...');
    let itemsRes = await client.query('SELECT item_id FROM "ITEMS" LIMIT 10');
    if (itemsRes.rows.length === 0) {
      console.log('Creating dummy items...');
      for (let i = 0; i < 5; i++) {
        await client.query(`
          INSERT INTO "ITEMS" (item_id, item_name, category_id, unit)
          VALUES ($1, $2, $3, 'pcs')
        `, [3000 + i, `Item ${i}`, categoryIds[0]]);
      }
      itemsRes = await client.query('SELECT item_id FROM "ITEMS"');
    }
    const itemIds = itemsRes.rows.map(r => r.item_id);

    // 6. Ensure Skill Tags exist
    console.log('Checking Skill Tags...');
    let skillsRes = await client.query('SELECT skill_tag_id FROM "SKILL_TAGS" LIMIT 10');
    if (skillsRes.rows.length === 0) {
      console.log('Creating dummy skills...');
      const skills = ['Medical', 'Rescue', 'Driving', 'Cooking'];
      let sid = 4000;
      for (const skill of skills) {
        await client.query(`
          INSERT INTO "SKILL_TAGS" (skill_tag_id, skill_tag_name)
          VALUES ($1, $2)
        `, [sid++, skill]);
      }
      skillsRes = await client.query('SELECT skill_tag_id FROM "SKILL_TAGS"');
    }
    const skillIds = skillsRes.rows.map(r => r.skill_tag_id);

    // 7. Generate Requests
    console.log(`Generating ${NUM_REQUESTS} requests...`);
    for (let i = 0; i < NUM_REQUESTS; i++) {
      const type = getRandomElement(REQUEST_TYPES);
      const status = getRandomElement(STATUSES);
      const urgency = getRandomElement(URGENCIES);
      const incidentId = getRandomElement(incidentIds);
      const requesterId = getRandomElement(userIds);
      const requiredQty = getRandomInt(1, 10);
      const address = getRandomElement(ADDRESSES);
      
      let title = '';
      if (type === 'Material') title = getRandomElement(TITLES_MATERIAL);
      else if (type === 'Tool') title = getRandomElement(TITLES_TOOL);
      else title = getRandomElement(TITLES_HUMANPOWER);

      // Insert Request
      const insertRequestRes = await client.query(`
        INSERT INTO "REQUESTS" 
        (requester_id, incident_id, status, urgency, type, address, latitude, longitude, required_qty, current_qty, title)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10)
        RETURNING request_id
      `, [requesterId, incidentId, status, urgency, type, address, getRandomFloat(24, 26), getRandomFloat(120, 122), requiredQty, title]);
      
      const requestId = insertRequestRes.rows[0].request_id;

      // Insert related data based on type
      if (type === 'Material') {
        const itemId = getRandomElement(itemIds);
        await client.query(`
          INSERT INTO "REQUEST_MATERIALS" (request_id, item_id, qty)
          VALUES ($1, $2, $3)
        `, [requestId, itemId, requiredQty]);
      } else if (type === 'Tool') {
        const itemId = getRandomElement(itemIds); // Assuming items can be tools
        await client.query(`
          INSERT INTO "REQUEST_EQUIPMENTS" (request_id, required_equipment, qty)
          VALUES ($1, $2, $3)
        `, [requestId, itemId, requiredQty]);
      } else if (type === 'Humanpower') {
        const skillId = getRandomElement(skillIds);
        await client.query(`
          INSERT INTO "REQUEST_HUMANPOWER" (request_id, skill_tag_id, qty)
          VALUES ($1, $2, $3)
        `, [requestId, skillId, requiredQty]);
      }
    }

    await client.query('COMMIT');
    console.log('Data generation completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error generating data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

generateData();
