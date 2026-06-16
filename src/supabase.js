import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nleeltmyajregojmhazo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZWVsdG15YWpyZWdvam1oYXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzQzNDEsImV4cCI6MjA5NjExMDM0MX0.Gr7TSnwqO56_IqPAQLBMrqe8wxNG4c7jYaG454g4LoU'

export const supabase = createClient(supabaseUrl, supabaseKey)