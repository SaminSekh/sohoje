// Supabase Configuration
const SUPABASE_URL = 'https://uzpujtaqzuzjtqecbzto.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-AG7Cn5lImdpWk6yS62tVw_WZax4Yas';

// Create Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabaseClient.from('profiles').select('count', { count: 'exact', head: true });
        if (error) throw error;
        return true;
    } catch (error) {
        showNotification('Failed to connect to database. Please check your connection.', 'error');
        return false;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    testSupabaseConnection();
});

// Export for use in other files
window.supabaseClient = supabaseClient;
