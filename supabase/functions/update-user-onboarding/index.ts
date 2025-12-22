import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const baseUpdateSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['MISSIONARY', 'FINANCIER']),
  email: z.string().email().optional(),
  name: z.string().min(3).optional(),
  preferred_language: z.string().optional(),
})

const missionaryUpdateSchema = baseUpdateSchema.extend({
  whatsapp: z.string().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  region: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional(),
  church: z.string().optional(),
  pastor: z.string().optional(),
  pastorPhone: z.string().optional(),
  membershipYears: z.number().optional(),
  specialization: z.string().optional(),
  project: z.string().optional(),
  phoneAlternative: z.string().optional(),
  projectLeaderPhone: z.string().optional(),
  languagesSpoken: z.array(z.string()).optional(),
  preferredRegions: z.array(z.string()).optional(),
  ministryExperienceYears: z.number().optional(),
  theologicalFormation: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        year: z.number(),
      })
    )
    .optional(),
  references: z
    .array(
      z.object({
        name: z.string(),
        phone: z.string(),
      })
    )
    .optional(),
})

const financierUpdateSchema = baseUpdateSchema.extend({
  phone: z.string().optional(),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('FUNCTIONS_SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('FUNCTIONS_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) throw new Error('Supabase environment variables not configured')
    const supabase = createClient(supabaseUrl, supabaseKey)

    const body = await req.json()
    const role = body.role
    const schema = role === 'MISSIONARY' ? missionaryUpdateSchema : financierUpdateSchema
    const validation = schema.safeParse(body)
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos', details: validation.error.flatten().fieldErrors }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    const input = validation.data

    const profileUpdates: any = { updated_at: new Date().toISOString() }
    if (input.email) profileUpdates.email = input.email
    if (input.name) profileUpdates.name = input.name
    if (input.preferred_language) profileUpdates.preferred_language = input.preferred_language
    if (role === 'FINANCIER' && (input as any).phone) profileUpdates.phone_number = (input as any).phone
    if (role === 'MISSIONARY') {
      const mi = input as any
      if (mi.whatsapp) {
        profileUpdates.whatsapp_number = mi.whatsapp
        profileUpdates.phone_number = mi.whatsapp
      }
      if (mi.cpf) {
        const docNum = parseInt(String(mi.cpf).replace(/\D/g, ''))
        if (!Number.isNaN(docNum)) profileUpdates.document = docNum
      }
      if (mi.birthDate) profileUpdates.birth_date = mi.birthDate
    }

    if (Object.keys(profileUpdates).length > 1) {
      const { error: profileErr } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', input.userId)
      if (profileErr) throw profileErr
    }

    if (role === 'MISSIONARY') {
      const missionaryUpdates: any = { updated_at: new Date().toISOString() }
      if (input.region) missionaryUpdates.region = input.region
      if (input.church) missionaryUpdates.church_name = input.church
      if (input.pastor) missionaryUpdates.pastor_name = input.pastor
      if (input.pastorPhone) missionaryUpdates.pastor_phone = input.pastorPhone
      if (typeof input.membershipYears !== 'undefined') missionaryUpdates.membership_years = input.membershipYears
      if (input.specialization) missionaryUpdates.specialization = input.specialization
      if (input.project) missionaryUpdates.missionary_project_name = input.project
      if (input.phoneAlternative) missionaryUpdates.phone_alternative = input.phoneAlternative
      if (input.projectLeaderPhone) missionaryUpdates.project_leader_phone = input.projectLeaderPhone
      if (input.languagesSpoken) missionaryUpdates.languages_spoken = input.languagesSpoken
      if (input.preferredRegions) missionaryUpdates.preferred_regions = input.preferredRegions
      if (typeof input.ministryExperienceYears !== 'undefined') missionaryUpdates.ministry_experience_years = input.ministryExperienceYears
      if (input.theologicalFormation) missionaryUpdates.theological_formation = input.theologicalFormation
      if (input.references) missionaryUpdates.references = input.references
      if (input.address) {
        const a = input.address
        const street = a.street || ''
        const number = a.number || 's/n'
        const complement = a.complement ? ` - ${a.complement}` : ''
        const neighborhood = a.neighborhood || ''
        const city = a.city || ''
        const state = a.state || ''
        const zip = a.zipCode || ''
        const fullAddress = `${street}, ${number}${complement} - ${neighborhood}, ${city}/${state} - CEP: ${zip}`.replace(/\s+,\s+/g, ', ').replace(/\s+-\s+-\s+/g, ' - ')
        missionaryUpdates.location = fullAddress
      }
      if (Object.keys(missionaryUpdates).length > 1) {
        const { error: misErr } = await supabase
          .from('missionaries')
          .update(missionaryUpdates)
          .eq('user_id', input.userId)
        if (misErr) throw misErr
      }
    } else {
      // dados específicos do financiador permanecem no update do profile
    }

    return new Response(
      JSON.stringify({ success: true, userId: input.userId, role }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
