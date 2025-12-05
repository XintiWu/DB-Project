
import { pool } from '../db.js';

async function fixSequence() {
  try {
    console.log('Fixing INVENTORIES sequence...');
    
    // Reset sequence to MAX(inventory_id) + 1
    const sql = `
      SELECT setval(
        pg_get_serial_sequence('"INVENTORIES"', 'inventory_id'),
        COALESCE((SELECT MAX(inventory_id) + 1 FROM "INVENTORIES"), 1),
        false
      );
    `;
    
    const res = await pool.query(sql);
    console.log('Sequence fixed:', res.rows[0]);
    
    console.log('Fixing INVENTORY_OWNERS sequences (just in case)...');
    // Also fix INVENTORY_OWNERS if they have sequences (user_id might not be serial there directly if FK, but inventory_id might be mistakenly shared or separate?) 
    // Schema says: inventory_id bigint NOT NULL DEFAULT nextval('"INVENTORY_OWNERS_inventory_id_seq"'::regclass)
    // AND: user_id bigint NOT NULL DEFAULT nextval('"INVENTORY_OWNERS_user_id_seq"'::regclass)
    // This is weird for a link table (usually it just holds values), but let's fix them too if they exist.
    
    // Actually, looking at the user's provided schema:
    // CREATE TABLE ... INVENTORY_OWNERS ... inventory_id ... DEFAULT nextval(...)
    // This implies creating a new owner record generates a new inventory_id? That seems wrong for a link table.
    // Usually link table inserts just use existing IDs.
    // BUT my code does: INSERT INTO "INVENTORY_OWNERS" (inventory_id, user_id) VALUES ($1, $2)
    // So distinct sequences for the link table shouldn't matter as long as I insert explicit values.
    
    // The error was specifically "INVENTORIES_pkey". So I only *need* to fix INVENTORIES.
    
  } catch (err) {
    console.error('Error fixing sequence:', err);
  } finally {
    await pool.end();
  }
}

fixSequence();
