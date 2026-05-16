import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://kekyjdiocwzyvuxlhoas.supabase.co"
const supabasePublishableKey = "sb_publishable_CDaXjvItGql1rsVhW5rrgw_AR9zJyT7"

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
