if (!window.SUPABASE_CONFIG) {
  throw new Error('SUPABASE_CONFIG não encontrado. Carregue config.js primeiro.')
}
if (!window.supabase) {
  throw new Error('Biblioteca Supabase não carregada. Adicione o script CDN no HTML.')
}
const supabaseClient = window.supabase.createClient(
  window.SUPABASE_CONFIG.url,
  window.SUPABASE_CONFIG.anonKey,
  {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
  }
)
window.supabaseClient = supabaseClient
;(function(){
  const cfg = window.SUPABASE_CONFIG
  function redact(s){
    if (!s) return 'undefined'
    return String(s).slice(0, 4) + '…'
  }
  function log(){
    if (!window.__SUPABASE_DEBUG) return
    console.log.apply(console, ['[SupabaseDebug]'].concat(Array.from(arguments)))
  }
  window.__SUPABASE_DEBUG = true
  window.supabaseHealthCheck = async function(){
    try {
      log('Config URL', cfg.url)
      log('AnonKey', redact(cfg.anonKey))
      const funcsUrl = (cfg.url || '').replace(/\/$/, '') + '/functions/v1/'
      const resp = await fetch(funcsUrl, { method: 'GET', mode: 'cors' })
      log('Functions endpoint reachable', resp.ok, resp.status)
    } catch (e) {
      log('Network error to functions endpoint', e && e.message ? e.message : String(e))
    }
    try {
      const { error } = await window.supabaseClient
        .from('missionaries')
        .select('user_id', { head: true, count: 'exact' })
        .limit(1)
      log('Basic select missionaries error', error ? error.message : 'none')
    } catch (e) {
      log('Select threw', e && e.message ? e.message : String(e))
    }
  }
  window.supabaseHealthCheck()
  window.__ONBOARDING_METRICS = window.__ONBOARDING_METRICS || { events: [] }
  function pushMetric(ev){ try { window.__ONBOARDING_METRICS.events.push(ev) } catch (_) {} }
  window.runSupabaseDiagnostics = async function(){
    const start = performance.now()
    let ok = false, status = 0, err = null
    try {
      const funcsUrl = (cfg.url || '').replace(/\/$/, '') + '/functions/v1/'
      const resp = await fetch(funcsUrl, { method: 'GET', mode: 'cors' })
      ok = resp.ok; status = resp.status
      pushMetric({ type: 'functions_endpoint', ok, status, t: performance.now() - start })
      log('Diag functions endpoint', ok, status)
    } catch (e) {
      err = e && e.message ? e.message : String(e)
      pushMetric({ type: 'functions_endpoint', ok: false, error: err, t: performance.now() - start })
      log('Diag functions endpoint error', err)
    }
    const t1 = performance.now()
    try {
      const { data, error } = await window.supabaseClient.functions.invoke(
        cfg.functions && cfg.functions.createUserOnboarding ? cfg.functions.createUserOnboarding : 'create-user-onboarding',
        { body: { role: 'TEST_ONLY', email: '', password: '', name: '' } }
      )
      pushMetric({ type: 'invoke_create', ok: !error && !(data && data.error), error: error ? error.message : (data && data.error) || null, t: performance.now() - t1 })
      log('Diag invoke create', error ? error.message : 'no error')
    } catch (e) {
      pushMetric({ type: 'invoke_create', ok: false, error: e && e.message ? e.message : String(e), t: performance.now() - t1 })
      log('Diag invoke create threw', e && e.message ? e.message : String(e))
    }
    const t2 = performance.now()
    try {
      const { data, error } = await window.supabaseClient.functions.invoke(
        cfg.functions && cfg.functions.updateUserOnboarding ? cfg.functions.updateUserOnboarding : 'update-user-onboarding',
        { body: { userId: '', role: 'TEST_ONLY' } }
      )
      pushMetric({ type: 'invoke_update', ok: !error && !(data && data.error), error: error ? error.message : (data && data.error) || null, t: performance.now() - t2 })
      log('Diag invoke update', error ? error.message : 'no error')
    } catch (e) {
      pushMetric({ type: 'invoke_update', ok: false, error: e && e.message ? e.message : String(e), t: performance.now() - t2 })
      log('Diag invoke update threw', e && e.message ? e.message : String(e))
    }
    const t3 = performance.now()
    try {
      const { error } = await window.supabaseClient
        .from('missionaries')
        .select('user_id', { head: true, count: 'exact' })
        .limit(1)
      pushMetric({ type: 'select_missionaries', ok: !error, error: error ? error.message : null, t: performance.now() - t3 })
      log('Diag select missionaries', error ? error.message : 'no error')
    } catch (e) {
      pushMetric({ type: 'select_missionaries', ok: false, error: e && e.message ? e.message : String(e), t: performance.now() - t3 })
      log('Diag select missionaries threw', e && e.message ? e.message : String(e))
    }
    const t4 = performance.now()
    try {
      const { error } = await window.supabaseClient
        .from('missionaries')
        .update({ documents_submitted: { status: 'TEST' } })
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
      pushMetric({ type: 'update_missionaries', ok: !error, error: error ? error.message : null, t: performance.now() - t4 })
      log('Diag update missionaries', error ? error.message : 'no error')
    } catch (e) {
      pushMetric({ type: 'update_missionaries', ok: false, error: e && e.message ? e.message : String(e), t: performance.now() - t4 })
      log('Diag update missionaries threw', e && e.message ? e.message : String(e))
    }
    const t5 = performance.now()
    try {
      const { data, error } = await window.supabaseClient
        .storage
        .from('profile-attachments')
        .list('', { limit: 1 })
      pushMetric({ type: 'storage_list', ok: !error, error: error ? error.message : null, count: Array.isArray(data) ? data.length : null, t: performance.now() - t5 })
      log('Diag storage list', error ? error.message : 'no error')
    } catch (e) {
      pushMetric({ type: 'storage_list', ok: false, error: e && e.message ? e.message : String(e), t: performance.now() - t5 })
      log('Diag storage list threw', e && e.message ? e.message : String(e))
    }
  }
  window.runSupabaseDiagnostics()
})()
;(function(){
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('test') !== 'e2e') return
    const ts = Date.now()
    const emailFin = `e2e.fin+${ts}@example.com`
    const emailMis = `e2e.mis+${ts}@example.com`
    async function run(){
      const r1 = await window.OnboardingService.createFinancier({ email: emailFin, password: 'senha123', name: 'Teste Fin E2E' })
      const userFin = r1 && r1.data ? r1.data.userId : null
      const profFin = await window.supabaseClient.from('profiles').select('id,email,name,role,status,organization_id,cluster_id').eq('email', emailFin).limit(1)
      const finRow = userFin ? await window.supabaseClient.from('financiers').select('user_id,organization_id,current_balance_cents,spt_balance,created_at').eq('user_id', userFin).limit(1) : { data: null, error: 'missing userId' }
      const r2 = await window.OnboardingService.createMissionary({ email: emailMis, password: 'senha123', name: 'Teste Missionario E2E' })
      const userMis = r2 && r2.data ? r2.data.userId : null
      if (userMis) {
        await window.OnboardingService.updateMissionary(userMis, {
          email: emailMis,
          name: 'Teste Missionario E2E',
          region: 'Sudeste',
          address: { street: 'Rua Teste', number: '123', city: 'São Paulo', state: 'SP', zipCode: '01001000' },
          church: 'Igreja Teste',
          membershipYears: 3
        })
      }
      const profMis = await window.supabaseClient.from('profiles').select('id,email,name,role,status,organization_id,cluster_id').eq('email', emailMis).limit(1)
      const misRow = userMis ? await window.supabaseClient.from('missionaries').select('user_id,region,location,church_name,membership_years,documents_submitted,created_at,updated_at').eq('user_id', userMis).limit(1) : { data: null, error: 'missing userId' }
      console.log('[E2E] Financier create', r1)
      console.log('[E2E] Financier userId', userFin)
      console.log('[E2E] Profiles(fin)', profFin && profFin.data ? profFin.data : profFin)
      console.log('[E2E] Financiers row', finRow && finRow.data ? finRow.data : finRow)
      console.log('[E2E] Missionary create', r2)
      console.log('[E2E] Missionary userId', userMis)
      console.log('[E2E] Profiles(mis)', profMis && profMis.data ? profMis.data : profMis)
      console.log('[E2E] Missionaries row', misRow && misRow.data ? misRow.data : misRow)
    }
    run()
  } catch (_) {}
})()
