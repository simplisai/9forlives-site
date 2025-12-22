const SUPABASE_CONFIG = {
  url: 'https://cnhwgplsmstnjqsltekh.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaHdncGxzbXN0bmpxc2x0ZWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTczODgsImV4cCI6MjA3NDk5MzM4OH0.nvSFZGoBQOajNC0HdcWj7pABan0eG9wtnEPtMU2jIJU',
  defaultOrgId: '00000000-0000-0000-0000-000000000001',
  defaultClusterId: 'a6d47598-4420-44c6-9f52-09cb52ffe669',
  functions: {
    createUserOnboarding: 'create-user-onboarding',
    updateUserOnboarding: 'update-user-onboarding'
  }
}
window.SUPABASE_CONFIG = SUPABASE_CONFIG
