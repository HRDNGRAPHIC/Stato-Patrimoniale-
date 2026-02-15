import { createClient } from '@supabase/supabase-js';

// ⚠️ CONFIGURAZIONE SUPABASE - SOSTITUISCI CON I TUOI VALORI
// Prendi questi valori da: https://supabase.com/dashboard/project/_/settings/api
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://IL_TUO_PROGETTO.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'LA_TUA_CHIAVE_ANON';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Funzioni per gestire le sessioni ───

export interface SessionData {
  id?: string;
  user_name: string;
  user_surname: string;
  saved_at?: string;
  data: any;
}

/**
 * Salva o aggiorna una sessione utente
 * Se sessionId è fornito, aggiorna la sessione esistente
 * Altrimenti crea una nuova sessione
 */
export async function saveSession(
  userName: string, 
  userSurname: string, 
  data: any, 
  sessionId?: number,
  sessionName?: string
) {
  try {
    if (sessionId) {
      // Update existing session
      const { error } = await supabase
        .from('sessions')
        .update({
          data,
          session_name: sessionName || `Sessione ${sessionId}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;
      return { success: true, sessionId };
    } else {
      // Create new session
      const { data: newSession, error } = await supabase
        .from('sessions')
        .insert([
          {
            user_name: userName,
            user_surname: userSurname,
            session_name: sessionName || `Sessione ${new Date().toLocaleDateString('it-IT')}`,
            data,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, sessionId: newSession.id };
    }
  } catch (error) {
    console.error('Errore salvataggio sessione:', error);
    return { success: false, error };
  }
}

/**
 * Carica tutte le sessioni (per l'admin)
 */
export async function fetchAllSessions() {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('saved_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Errore caricamento sessioni:', error);
    return { success: false, data: [] };
  }
}

/**
 * Carica la sessione di un utente specifico
 */
export async function fetchUserSession(userName: string, userSurname: string) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_name', userName)
      .eq('user_surname', userSurname)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Errore caricamento sessione utente:', error);
    return { success: false, data: null };
  }
}

/**
 * Elimina una sessione
 */
export async function deleteSession(id: string) {
  try {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Errore eliminazione sessione:', error);
    return { success: false, error };
  }
}

/**
 * Carica una sessione specifica per ID
 */
export async function fetchSessionById(sessionId: number) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Errore caricamento sessione:', error);
    return { success: false, data: null };
  }
}

/**
 * Conta le sessioni esistenti per un utente (per auto-naming)
 */
export async function countUserSessions(userName: string, userSurname: string) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('id', { count: 'exact' })
      .eq('user_name', userName)
      .eq('user_surname', userSurname);

    if (error) throw error;
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Errore conteggio sessioni:', error);
    return { success: false, count: 0 };
  }
}
