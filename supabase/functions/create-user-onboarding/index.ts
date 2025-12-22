import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const missionarySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional().default('123456'),
  role: z.literal('MISSIONARY'),
  name: z.string().min(3),
  whatsapp: z.string().optional(),
  cpf: z.string().optional().refine((v) => !v || validateCPF(v), 'CPF inválido'),
  birthDate: z.string().optional(),
  region: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional()
  }).optional(),
  church: z.string().optional(),
  pastor: z.string().optional(),
  pastorPhone: z.string().optional(),
  membershipYears: z.number().optional(),
  specialization: z.string().optional(),
  project: z.string().optional()
})

const financierSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional().default('123456'),
  role: z.literal('FINANCIER'),
  name: z.string().min(3),
  phone: z.string().optional()
})

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'
const DEFAULT_CLUSTER_ID = 'a6d47598-4420-44c6-9f52-09cb52ffe669'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('FUNCTIONS_SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('FUNCTIONS_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured')
    }
    const supabase = createClient(supabaseUrl, supabaseKey)

    const body = await req.json()
    const role = body.role
    const schema = role === 'MISSIONARY' ? missionarySchema : financierSchema
    const validation = schema.safeParse(body)
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Dados inválidos', details: validation.error.flatten().fieldErrors }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
    }
    const input = validation.data
    const bodyRaw = await (async () => body)()
    const passwordIsDefault = !bodyRaw.password
    let userId: string | null = null
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: { name: input.name, role: input.role, created_at: new Date().toISOString(), password_requires_change: passwordIsDefault }
      })
      if (authError || !authData.user) throw new Error(authError?.message || 'Failed to create auth user')
      userId = authData.user.id
      const profileData: any = {
        id: userId,
        email: input.email,
        name: input.name,
        role: input.role,
        status: 'PENDING_APPROVAL',
        active: true,
        organization_id: DEFAULT_ORG_ID,
        cluster_id: DEFAULT_CLUSTER_ID,
        preferred_language: 'pt',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      if (role === 'MISSIONARY') {
        if (input.whatsapp) {
          profileData.whatsapp_number = input.whatsapp
          profileData.phone_number = input.whatsapp
        }
        if (input.cpf) {
          const docNum = parseInt(input.cpf.replace(/\D/g, ''))
          if (!Number.isNaN(docNum)) profileData.document = docNum
        }
        if (input.birthDate) profileData.birth_date = input.birthDate
      }
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
      if (profileError) throw profileError
      if (role === 'MISSIONARY') {
        let fullAddress: string | null = null
        if (input.address && (input.address.street || input.address.number || input.address.city || input.address.state)) {
          const street = input.address.street || ''
          const number = input.address.number || 's/n'
          const complement = input.address.complement ? ` - ${input.address.complement}` : ''
          const neighborhood = input.address.neighborhood || ''
          const city = input.address.city || ''
          const state = input.address.state || ''
          const zip = input.address.zipCode || ''
          fullAddress = `${street}, ${number}${complement} - ${neighborhood}, ${city}/${state} - CEP: ${zip}`.replace(/\s+,\s+/g, ', ').replace(/\s+-\s+-\s+/g, ' - ')
        }
        const { error: missionaryError } = await supabase
          .from('missionaries')
          .upsert({
            user_id: userId,
            organization_id: DEFAULT_ORG_ID,
            region: input.region || null,
            location: fullAddress,
            church_name: input.church || null,
            pastor_name: input.pastor || null,
            pastor_phone: input.pastorPhone || null,
            membership_years: input.membershipYears ?? null,
            specialization: input.specialization || null,
            missionary_project_name: input.project || null,
            documents_submitted: { status: 'PENDING_UPLOAD', uploaded_at: null },
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' })
        if (missionaryError) throw missionaryError
      } else {
        const { error: financierError } = await supabase
          .from('financiers')
          .upsert({
            user_id: userId,
            subscription_plan: 0,
            current_balance_cents: 0,
            spt_balance: 0,
            spt_allocated: 0,
            organization_id: DEFAULT_ORG_ID,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' })
        if (financierError) throw financierError
      }
      return new Response(JSON.stringify({ success: true, userId, role, email: input.email, password_is_default: passwordIsDefault, message: 'Usuário criado com sucesso!' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 })
    } catch (dbError) {
      if (userId) {
        try { await supabase.auth.admin.deleteUser(userId) } catch (_) {}
      }
      throw dbError
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor', details: error.details || error.hint || null }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})
function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11) return false
  const invalid = ['00000000000','11111111111','22222222222','33333333333','44444444444','55555555555','66666666666','77777777777','88888888888','99999999999']
  if (invalid.includes(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i)
  let d1 = 11 - (sum % 11); if (d1 > 9) d1 = 0
  if (d1 !== parseInt(cpf.charAt(9))) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i)
  let d2 = 11 - (sum % 11); if (d2 > 9) d2 = 0
  if (d2 !== parseInt(cpf.charAt(10))) return false
  return true
}
