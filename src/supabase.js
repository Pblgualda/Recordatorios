import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://sljjlkuqjwxwhoswwdzg.supabase.co"
const supabasePublishableKey = "sb_publishable_Bz0xvfy5DQ5wHMIv8HiIAQ_Lw6nNL7J"

export const supabase = createClient(supabaseUrl, supabasePublishableKey)