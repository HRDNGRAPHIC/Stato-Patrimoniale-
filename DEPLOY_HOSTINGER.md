# 🚀 Guida Deploy su Hostinger (Hosting Statico)

Il tuo piano Hostinger non supporta Node.js, ma **non è un problema**! Vite genera un build statico (HTML, CSS, JavaScript) che funziona su qualsiasi hosting tradizionale.

---

## ⚙️ Passo 1: Build del Progetto

Apri PowerShell nella cartella del progetto ed esegui:

```powershell
npm run build
```

Questo comando:
- ✅ Compila tutto il codice TypeScript in JavaScript
- ✅ Ottimizza CSS e JavaScript per la produzione
- ✅ Genera una cartella `dist` con tutti i file pronti per il deploy

---

## 📦 Passo 2: Configurare Variabili d'Ambiente su Hostinger

**IMPORTANTE**: Devi aggiungere le credenziali Supabase anche sul server!

### Opzione A: File `.env` (se il tuo hosting lo supporta)
Carica anche il file `.env.local` (rinominalo in `.env`) nella root del sito.

### Opzione B: Build con Variabili Integrate (Consigliato)
Crea un file `.env.production` nella root del progetto:

```env
VITE_SUPABASE_URL=https://nncpfzbbtpvypfatdmmv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY3BmemJidHB2eXBmYXRkbW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTQwODcsImV4cCI6MjA4NjQ5MDA4N30.ukruR1piV8Aym4CnlWCjOAXu8HTVsxMJUZbkcDZuqdQ
```

Poi riesegui:
```powershell
npm run build
```

Le variabili verranno integrate nel build (sono comunque sicure perché Supabase usa RLS).

---

## 📤 Passo 3: Upload su Hostinger

### Metodo 1: File Manager (Web)
1. Accedi al **pannello di controllo Hostinger**
2. Vai su **File Manager**
3. Naviga nella cartella `public_html` (o la root del tuo dominio)
4. **Elimina** tutti i file esistenti (index.html, ecc.)
5. **Carica** tutto il contenuto della cartella `dist`:
   - `index.html`
   - `assets/` (cartella con JS e CSS)
   - Eventuali altri file

### Metodo 2: FTP (Consigliato per aggiornamenti futuri)
1. Scarica un client FTP come [FileZilla](https://filezilla-project.org/)
2. Ottieni le credenziali FTP da Hostinger:
   - Host: `ftp.tuodominio.com`
   - Username: (trovi nel pannello Hostinger)
   - Password: (trovi nel pannello Hostinger)
3. Connettiti e carica tutto il contenuto di `dist` nella cartella `public_html`

---

## 🔧 Passo 4: Configurazione `.htaccess` (SPA Routing)

Vite genera una Single Page Application. Devi creare un file `.htaccess` nella root del sito (`public_html`) per gestire il routing:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Come creare `.htaccess`:**
1. Crea un file chiamato `.htaccess` (con il punto iniziale!)
2. Incolla il contenuto sopra
3. Carica nella root del sito (`public_html`)

---

## ✅ Passo 5: Test del Sito

1. Apri il tuo dominio in un browser: `https://tuodominio.com`
2. Testa il login utente (deve chiedere nome/cognome ogni volta)
3. Testa il salvataggio su Supabase
4. Testa l'accesso admin (Antonio Guida / Guida)

---

## 🔄 Aggiornamenti Futuri

Ogni volta che modifichi il codice:

```powershell
# 1. Rebuilda il progetto
npm run build

# 2. Carica di nuovo solo il contenuto di `dist` su Hostinger (sovrascrive i file)
```

---

## 🆓 Alternative Hosting (Più Semplici)

Se hai difficoltà con Hostinger, considera questi servizi **gratuiti** con deploy automatico:

### 1. **Vercel** (Consigliato) ⭐
```bash
# Installa Vercel CLI
npm i -g vercel

# Deploy (prima volta)
vercel

# Deploy aggiornamenti
vercel --prod
```
- ✅ Deploy automatico ad ogni push su GitHub
- ✅ HTTPS gratuito
- ✅ CDN globale velocissimo
- ✅ Anteprima automatica per ogni branch

### 2. **Netlify**
```bash
# Installa Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### 3. **Cloudflare Pages**
- Connetti il repository GitHub
- Deploy automatico ad ogni push
- Piano gratuito illimitato

---

## ❓ Troubleshooting

### Problema: "Pagina bianca"
**Soluzione**: Controlla la console del browser (F12) per errori. Probabilmente mancano le variabili d'ambiente Supabase.

### Problema: "404 Not Found" su refresh
**Soluzione**: Aggiungi il file `.htaccess` come spiegato sopra.

### Problema: "Errore nel salvataggio Supabase"
**Soluzione**: 
1. Verifica che `.env.production` contenga le credenziali corrette
2. Rebuilda: `npm run build`
3. Ricarica i file su Hostinger

### Problema: "Images non caricano"
**Soluzione**: Tutte le immagini devono essere nella cartella `public/` prima del build, oppure importate nei componenti React.

---

## 📝 Checklist Finale

- [v] `npm run build` eseguito senza errori
- [v] Credenziali Supabase in `.env.production`
- [v] Contenuto di `dist/` caricato su `public_html/`
- [v] File `.htaccess` presente nella root
- [v] Sito raggiungibile da browser
- [v] Login utente funzionante
- [x] Salvataggio su Supabase funzionante
- [v] Dashboard admin accessibile

---

**Buon deploy! 🎉**
