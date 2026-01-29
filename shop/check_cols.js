const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = 'https://uzpujtaqzuzjtqecbzto.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-AG7Cn5lImdpWk6yS62tVw_WZax4Yas';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
    try {
        // Checking if specific columns exist in sale_items
        const { error } = await supabase
            .from('sale_items')
            .select('product_name, product_image, sku')
            .limit(1);

        if (error) {
            console.log('Error or Columns missing:', error.message);
        } else {
            console.log('Columns (product_name, product_image, sku) exist in sale_items table.');
        }
    } catch (err) {
        console.error('Unexpected error:', err.message);
    }
}

check();
