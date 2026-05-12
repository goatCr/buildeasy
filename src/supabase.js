import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rbqeqmnaigmfkaegasjh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJicWVxbW5haWdtZmthZWdhc2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDg3OTYsImV4cCI6MjA5NDE4NDc5Nn0.3XxhmyVfviMbsH2YwuTzUpA74zNIMsQPZ0s-8ukDT5Y'

export const supabase = createClient(supabaseUrl, supabaseKey)