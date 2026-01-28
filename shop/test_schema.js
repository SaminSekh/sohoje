const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = 'https://uzpujtaqzuzjtqecbzto.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-AG7Cn5lImdpWk6yS62tVw_WZax4Yas';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
    try {
        const { data, error } = await supabase.from('sale_items').select('*').limit(1);
        if (error) {
            console.error('Error fetching sale_items:', error.message);
            return;
        }
        console.log('Columns in sale_items:', Object.keys(data[0] || {}));
    } catch (err) {
        console.error('Unexpected error:', err.message);
    }
}

test();
