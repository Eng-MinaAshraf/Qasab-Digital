import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ietliiksksulejxsjoky.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Py3ffVZPaE32_nctJIqn-w_oYeE_8Ik';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const tables = [
    'products',
    'profiles',
    'users',
    'orders',
    'order_items',
    'reviews',
    'payment_transactions',
    'rate_limits',
    'notifications'
];

async function run() {
    console.log("=== DB Schema Verification ===");
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`❌ Table '${table}' Error:`, error.message);
        } else {
            console.log(`✅ Table '${table}' exists. Count fetched: ${data.length}`);
        }
    }
}
run();
