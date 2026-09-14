import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ietliiksksulejxsjoky.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Py3ffVZPaE32_nctJIqn-w_oYeE_8Ik';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log("=== Supabase Connection Test ===");
    try {
        // test getting something that might exist
        const { data, error } = await supabase.from('menu_categories').select('*').limit(1);
        if (error) {
            console.log("Supabase error (menu_categories):", error);
        } else {
            console.log("Supabase success (menu_categories):", data);
        }
        
        const { data: d2, error: e2 } = await supabase.from('products').select('*').limit(1);
        if (e2) {
            console.log("Supabase error (products):", e2.message);
        } else {
            console.log("Supabase success (products):", d2);
        }
    } catch(err) {
        console.error("Fatal error:", err);
    }
}
run();
