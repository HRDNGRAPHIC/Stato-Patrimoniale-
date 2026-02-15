# 🚀 Setup Supabase per sincronizzare le sessioni

Il sito è pronto per Supabase! Segui questi 3 step:

---

## ✅ STEP 1: Crea progetto Supabase (2 minuti)

1. Vai su https://supabase.com
2. Clicca "Start your project" (o "Sign up" se non hai account)
3. Accedi con GitHub o email
4. Clicca "New project"
5. Compila:
   - **Name**: `hrdn-sessions` (o quello che vuoi)
   - **Database Password**: crea una password sicura e SALVALA
   - **Region**: `Europe (Frankfurt)` o il più vicino
   - **Pricing Plan**: FREE (gratis)
6. Clicca "Create new project" → aspetta 1-2 minuti

---

## ✅ STEP 2: Crea la tabella "sessions" (1 minuto)

1. Nel tuo progetto Supabase, vai su **Table Editor** (icona tabella a sinistra)
2. Clicca **"+ New table"**
3. Nome tabella: `sessions`
4. DISABILITA "Enable Row Level Security (RLS)" per ora (per test)
5. Lascia le colonne di default e clicca **"Save"**
6. Ora clicca sulla tabella `sessions` appena creata
7. Vai su **"Add column"** e aggiungi queste colonne:

   | Nome colonna     | Tipo      | Default value           | Nullable |
   |------------------|-----------|-------------------------|----------|
   | `user_name`      | `text`    | (lascia vuoto)          | NO       |
   | `user_surname`   | `text`    | (lascia vuoto)          | NO       |
   | `saved_at`       | `timestamp` | `now()`               | NO       |
   | `data`           | `jsonb`   | (lascia vuoto)          | NO       |

8. **Importante:** Crea un indice univoco su `user_name` + `user_surname`:
   - Vai su **SQL Editor** (icona </> a sinistra)
   - Incolla e esegui questo comando:
   ```sql
   CREATE UNIQUE INDEX sessions_user_unique ON sessions (user_name, user_surname);
   ```
   - Clicca **"Run"** (o `Ctrl+Enter`)

---

## ✅ STEP 3: Configura le credenziali nel progetto (30 secondi)

1. Nel tuo progetto Supabase, vai su **Project Settings** (icona ingranaggio in basso a sinistra)
2. Clicca su **API** nel menu laterale
3. Copia questi 2 valori:
   - **Project URL** (es: `https://abcdefgh.supabase.co`)
   - **anon public** key (la chiave lunga sotto "Project API keys")

4. Apri il file `.env.local` nella root del progetto React
5. Sostituisci i placeholder con i tuoi valori:

```env
VITE_SUPABASE_URL=https://IL_TUO_PROGETTO_QUI.supabase.co
VITE_SUPABASE_ANON_KEY=LA_TUA_CHIAVE_ANON_QUI
```

6. **SALVA IL FILE**

---

## ✅ STEP 4: Testa in locale

1. Riavvia il server di sviluppo:
   ```bash
   npm run dev
   ```

2. Apri il sito, fai login come utente, compila una sessione e clicca **"Salva"**

3. Vai su Supabase → **Table Editor** → `sessions` → dovresti vedere la tua sessione salvata!

4. Prova ad accedere come admin (Antonio Guida / Guida) e verifica che vedi la sessione nella dashboard

---

## ✅ STEP 5: Deploy su Hostinger

1. Su Hostinger, vai nelle **impostazioni dell'applicazione** e aggiungi le variabili d'ambiente:
   - `VITE_SUPABASE_URL` → il tuo URL Supabase
   - `VITE_SUPABASE_ANON_KEY` → la tua chiave anon

2. Rebuilda e deploya il sito

3. Ora gli utenti possono salvare da telefono e l'admin vedere da PC! 🎉

---

## 🔒 Sicurezza (opzionale ma consigliata)

Per proteggere i dati, abilita Row Level Security (RLS):

1. Vai su **Authentication** → **Policies** (nella tabella `sessions`)
2. Clicca "Enable RLS"
3. Aggiungi queste policy:

**Policy per gli utenti (INSERT/UPDATE):**
```sql
CREATE POLICY "Utenti possono salvare proprie sessioni"
ON sessions FOR ALL
USING (true)
WITH CHECK (true);
```

**Policy per l'admin (SELECT):**
```sql
CREATE POLICY "Admin può leggere tutto"
ON sessions FOR SELECT
USING (true);
```

---

## 🆘 Problemi?

- **Errore "relation does not exist"**: Controlla che la tabella `sessions` sia creata con il nome esatto
- **Errore "invalid API key"**: Verifica di aver copiato la chiave `anon public` (non `service_role`)
- **Nessuna sessione visualizzata**: Controlla la console del browser (F12) per errori
- **401 Unauthorized**: Disabilita temporaneamente RLS per testare

---

Fatto! Ora le sessioni sono sincronizzate tra tutti i dispositivi. 🚀
