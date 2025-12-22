const DBG = !!window.__SUPABASE_DEBUG
function debugLog(){ if (DBG) console.log.apply(console, ['[OnboardingService]'].concat(Array.from(arguments))) }
const OnboardingService = {
  async createFinancier(formData) {
    try {
      const payload = {
        role: 'FINANCIER',
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone || null
      }
      const safe = { role: payload.role, email: payload.email, name: payload.name, phone: payload.phone }
      debugLog('invoke', window.SUPABASE_CONFIG.functions.createUserOnboarding, safe)
      const { data, error } = await window.supabaseClient.functions.invoke(
        window.SUPABASE_CONFIG.functions.createUserOnboarding,
        { body: payload }
      )
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      localStorage.setItem('9forlives_financier_user_id', data.userId)
      localStorage.setItem('9forlives_financier_email', payload.email)
      debugLog('result', 'createFinancier', { ok: true, userId: data.userId })
      return { success: true, data }
    } catch (e) {
      debugLog('error', 'createFinancier', e && e.message ? e.message : String(e))
      return { success: false, error: e.message || 'Erro ao criar conta de financiador' }
    }
  }
  ,async updateFinancier(userId, data) {
    try {
      const payload = {
        userId,
        role: 'FINANCIER',
        email: data.email,
        name: data.name,
        phone: data.phone || null,
      }
      debugLog('invoke', 'update-user-onboarding', { userId, role: payload.role, email: payload.email, name: payload.name, phone: payload.phone })
      const { data: resp, error } = await window.supabaseClient.functions.invoke(
        (window.SUPABASE_CONFIG.functions && window.SUPABASE_CONFIG.functions.updateUserOnboarding) ? window.SUPABASE_CONFIG.functions.updateUserOnboarding : 'update-user-onboarding',
        { body: payload }
      )
      if (error) throw error
      if (resp?.error) throw new Error(resp.error)
      debugLog('result', 'updateFinancier', { ok: true })
      return { success: true }
    } catch (e) {
      debugLog('error', 'updateFinancier', e && e.message ? e.message : String(e))
      return { success: false, error: e.message }
    }
  }
  ,async updateMissionary(userId, data) {
    try {
      const payload = {
        userId,
        role: 'MISSIONARY',
        email: data.email,
        name: data.name,
        region: data.region,
        address: data.address,
        church: data.church,
        pastor: data.pastor,
        pastorPhone: data.pastorPhone,
        membershipYears: data.membershipYears,
        specialization: data.specialization,
        project: data.project,
        phoneAlternative: data.phoneAlternative,
        projectLeaderPhone: data.projectLeaderPhone,
        languagesSpoken: data.languagesSpoken,
        preferredRegions: data.preferredRegions,
        ministryExperienceYears: data.ministryExperienceYears,
        theologicalFormation: data.theologicalFormation,
        references: data.references,
      }
      debugLog('invoke', 'update-user-onboarding', { userId, role: payload.role, email: payload.email, name: payload.name })
      const { data: resp, error } = await window.supabaseClient.functions.invoke(
        (window.SUPABASE_CONFIG.functions && window.SUPABASE_CONFIG.functions.updateUserOnboarding) ? window.SUPABASE_CONFIG.functions.updateUserOnboarding : 'update-user-onboarding',
        { body: payload }
      )
      if (error) throw error
      if (resp?.error) throw new Error(resp.error)
      debugLog('result', 'updateMissionary', { ok: true })
      return { success: true }
    } catch (e) {
      debugLog('error', 'updateMissionary', e && e.message ? e.message : String(e))
      return { success: false, error: e.message }
    }
  }
  ,async createMissionary(formData) {
    try {
      const payload = {
        role: 'MISSIONARY',
        email: formData.email,
        password: formData.password,
        name: formData.name,
      }
      const safe = { role: payload.role, email: payload.email, name: payload.name }
      debugLog('invoke', window.SUPABASE_CONFIG.functions.createUserOnboarding, safe)
      const { data, error } = await window.supabaseClient.functions.invoke(
        window.SUPABASE_CONFIG.functions.createUserOnboarding,
        { body: payload }
      )
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      localStorage.setItem('9forlives_missionary_user_id', data.userId)
      localStorage.setItem('9forlives_missionary_email', payload.email)
      debugLog('result', 'createMissionary', { ok: true, userId: data.userId })
      return { success: true, data }
    } catch (e) {
      debugLog('error', 'createMissionary', e && e.message ? e.message : String(e))
      return { success: false, error: e.message || 'Erro ao criar conta de missionário' }
    }
  }
  ,async uploadDocuments(userId, files) {
    try {
      const uploads = []
      const bucket = 'profile-attachments'
      const typeMap = {
        proof_of_address: 'PROOF_OF_ADDRESS',
        id_document: 'ID_DOCUMENT',
        profile_photo: 'PROFILE_PHOTO',
      }
      for (const [fieldName, file] of Object.entries(files)) {
        if (!file) continue
        const attachmentType = typeMap[fieldName]
        if (!attachmentType) continue
        const ext = (file.name.split('.').pop() || 'bin')
        const storagePath = `${userId}/${attachmentType.toLowerCase()}-${Date.now()}.${ext}`
        const { data: up, error: upErr } = await window.supabaseClient.storage
          .from(bucket)
          .upload(storagePath, file, { cacheControl: '3600', upsert: false })
        if (upErr) throw upErr
        const { error: dbErr } = await window.supabaseClient
          .from('profile_attachments')
          .insert({
            profile_id: userId,
            attachment_type: attachmentType,
            storage_bucket: bucket,
            storage_path: storagePath,
            file_name: file.name,
            file_size_bytes: file.size,
            mime_type: file.type,
            status: 'UPLOADED',
          })
        if (dbErr) throw dbErr
        uploads.push({ fieldName, attachmentType, storagePath })
      }
      const { error: docUpdateErr } = await window.supabaseClient
        .from('missionaries')
        .update({
          documents_submitted: {
            status: 'UPLOADED',
            uploaded_at: new Date().toISOString(),
            files: uploads,
          },
        })
        .eq('user_id', userId)
      if (docUpdateErr) throw docUpdateErr
      debugLog('result', 'uploadDocuments', { ok: true, count: uploads.length })
      return { success: true, uploads }
    } catch (e) {
      debugLog('error', 'uploadDocuments', e && e.message ? e.message : String(e))
      return { success: false, error: e.message }
    }
  }
}
window.OnboardingService = OnboardingService
