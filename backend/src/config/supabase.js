const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseAnonKey } = require('./env');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
