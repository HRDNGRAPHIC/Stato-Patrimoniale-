import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BalanceSheetSection } from "./components/BalanceSheetSection";
import { CompanyAnalysisPanel, getDefaultStructure, type FinancialStructure } from "./components/CompanyAnalysisPanel";
import ExerciseAnalyzer from "./components/ExerciseAnalyzer";
import FormulaCalculator from "./components/FormulaCalculator";
import AdminDashboard from "./components/AdminDashboard";
import { CICalculator } from "./components/CICalculator";
import { DebtClassification } from "./components/DebtClassification";

import { FormulaViewer } from "./components/FormulaViewer";
import { AlertCircle, CheckCircle2, RotateCcw, Sun, Moon, ArrowLeft } from "lucide-react";
import { saveSession, fetchSessionById } from "../lib/supabaseClient";
import { Textarea } from "./components/ui/textarea";
import { Label } from "./components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { toast, Toaster } from "sonner";
import CurrencyContext from "./contexts/CurrencyContext";

/**
 * =====================================================================
 * DATA MAPPING - CORRELAZIONI PER AUTO-COMPILAZIONE
 * =====================================================================
 * 
 * Queste sono le correlazioni tra i calcoli del "Calcolatore di Formule Finanziarie"
 * e i campi presenti nelle card Attivo/Passivo e nel Conto Economico.
 * Una volta calcolati, i dati vengono automaticamente inseriti al posto giusto.
 * 
 * MAPPATURA CALCOLI → POSIZIONI BILANCIO:
 * 
 * 1. Reddito Netto (Rn) 
 *    = Reddito d'esercizio = Utile
 *    → PASSIVO Card: A. PATRIMONIO NETTO Tot. → III. Utile (perdita) dell'esercizio
 *    ID: "utile-perdita"
 * 
 * 2. Reddito Operativo (Ro)
 *    = "Differenza tra valore e costi della produzione (A-B)"
 *    → CONTO ECONOMICO: Risultato della gestione caratteristica
 * 
 * 3. Ricavi Netti
 *    = Ricavi delle vendite e delle prestazioni (voce A1)
 *    → CONTO ECONOMICO: A. Valore della produzione → 1) Ricavi delle vendite e delle prestazioni
 * 
 * 4. Imposte
 *    = Imposte sul reddito dell'esercizio
 *    → CONTO ECONOMICO: E. Proventi e oneri straordinari → 22) Imposte sul reddito dell'esercizio
 * 
 * 5. Debiti
 *    = D) Debiti (voce D) Debiti ST
 *    → PASSIVO Card: D) Debiti (totale dei debiti a breve termine)
 *    ID: "debiti"
 * 
 * 6. Reddito Ante Imposte (RAI)
 *    = Risultato prima delle imposte (A-B ±C ±D ±E)
 *    → CONTO ECONOMICO: E. → 21) Risultato prima delle imposte
 * 
 * 7. Oneri Finanziari (Of)
 *    = C.17) Interessi e altri oneri finanziari
 *    → CONTO ECONOMICO: C. Proventi e oneri finanziari → 17) Interessi e altri oneri finanziari
 * 
 * 8. Capitale Proprio (CP)
 *    = Patrimonio Netto (PN) tot.
 *    → PASSIVO Card: A. PATRIMONIO NETTO Tot.
 *    ID: "patrimonio-netto"
 * 
 * =====================================================================
 */

interface BalanceSheetItemData {
  id: string;
  label: string;
  value: number;
  level: number;
  children?: BalanceSheetItemData[];
}

const createEmptyAttivoData = (): BalanceSheetItemData[] => [
  {
    id: "immobilizzazioni",
    label: "A. Immobilizzazioni Tot.",
    value: 0,
    level: 0,
    children: [
      {
        id: "crediti-soci",
        label: "B. Crediti v/soci",
        value: 0,
        level: 1,
      },
      {
        id: "immobilizzazioni-immateriali",
        label: "I. Immobilizzazioni immateriali",
        value: 0,
        level: 1,
        children: [
          {
            id: "costi-impianto",
            label: "Costi di impianto e ampliamento",
            value: 0,
            level: 2,
          },
          {
            id: "brevetti",
            label: "Brevetti e proprietà intellettuale",
            value: 0,
            level: 2,
          },
          {
            id: "avviamento",
            label: "Avviamento",
            value: 0,
            level: 2,
          },
        ],
      },
      {
        id: "immobilizzazioni-materiali",
        label: "II. Immobilizzazioni materiali",
        value: 0,
        level: 1,
        children: [
          {
            id: "terreni-fabbricati",
            label: "Terreni e fabbricati",
            value: 0,
            level: 2,
          },
          {
            id: "impianti-macchinari",
            label: "Impianti e macchinari",
            value: 0,
            level: 2,
          },
          {
            id: "attrezzature",
            label: "Attrezzature industriali e commerciali",
            value: 0,
            level: 2,
          },
        ],
      },
      {
        id: "immobilizzazioni-finanziarie",
        label: "III. Immobilizzazioni finanziarie",
        value: 0,
        level: 1,
        children: [
          {
            id: "partecipazioni",
            label: "Partecipazioni",
            value: 0,
            level: 2,
          },
          {
            id: "crediti-immob",
            label: "Crediti",
            value: 0,
            level: 2,
          },
        ],
      },
    ],
  },
  {
    id: "attivo-circolante",
    label: "C. Attivo circolante Tot.",
    value: 0,
    level: 0,
    children: [
      {
        id: "rimanenze",
        label: "I. Rimanenze",
        value: 0,
        level: 1,
        children: [
          {
            id: "materie-prime",
            label: "Materie prime, sussidiarie e di consumo",
            value: 0,
            level: 2,
          },
          {
            id: "prodotti-finiti",
            label: "Prodotti finiti e merci",
            value: 0,
            level: 2,
          },
        ],
      },
      {
        id: "crediti",
        label: "II. Crediti",
        value: 0,
        level: 1,
        children: [
          {
            id: "crediti-clienti",
            label: "Verso clienti",
            value: 0,
            level: 2,
          },
          {
            id: "crediti-altri",
            label: "Altri crediti",
            value: 0,
            level: 2,
          },
        ],
      },
      {
        id: "attivita-finanziarie",
        label: "III. Attività finanziarie che non costituiscono immobilizzazioni",
        value: 0,
        level: 1,
        children: [
          {
            id: "titoli",
            label: "Titoli",
            value: 0,
            level: 2,
          },
        ],
      },
      {
        id: "disponibilita-liquide",
        label: "IV. Disponibilità liquide",
        value: 0,
        level: 1,
        children: [
          {
            id: "banche",
            label: "Depositi bancari e postali",
            value: 0,
            level: 2,
          },
          {
            id: "cassa",
            label: "Denaro e valori in cassa",
            value: 0,
            level: 2,
          },
        ],
      },
      {
        id: "ratei-risconti-attivi",
        label: "D. Ratei e risconti attivi",
        value: 0,
        level: 1,
      },
    ],
  },
];

const createEmptyPassivoData = (): BalanceSheetItemData[] => [
  {
    id: "patrimonio-netto",
    label: "A. PATRIMONIO NETTO Tot.",
    value: 0,
    level: 0,
    children: [
      {
        id: "capitale-sociale",
        label: "I. Capitale sociale",
        value: 0,
        level: 1,
      },
      {
        id: "riserve",
        label: "II. Riserve",
        value: 0,
        level: 1,
        children: [
          {
            id: "riserva-sovrapprezzo",
            label: "Riserva da sovr. azioni",
            value: 0,
            level: 2,
          },
          {
            id: "riserva-rivalutazione",
            label: "Riserva di rivalutazione",
            value: 0,
            level: 2,
          },
          {
            id: "riserva-legale",
            label: "Riserva legale",
            value: 0,
            level: 2,
          },
          {
            id: "riserva-statutaria",
            label: "Riserva statutaria",
            value: 0,
            level: 2,
          },
          {
            id: "riserva-copertura-flussi",
            label: "Riserva per oper. cop. flussi",
            value: 0,
            level: 2,
          },
          {
            id: "riserva-negativa-azioni",
            label: "Riserva neg. per azioni",
            value: 0,
            level: 2,
          },
          {
            id: "altre-riserve",
            label: "Altre Riserve",
            value: 0,
            level: 2,
          },
        ],
      },
      {
        id: "utile-perdita",
        label: "III. Utile (perdita) dell'esercizio",
        value: 0,
        level: 1,
        children: [
          {
            id: "utili-perdita-pn",
            label: "Utili / Perdita PN",
            value: 0,
            level: 2,
          },
          {
            id: "utili-perdite-esercizio",
            label: "Utili / Perdite d'esercizio",
            value: 0,
            level: 2,
          },
        ],
      },
    ],
  },
  {
    id: "fondi-rischi-oneri",
    label: "B) Fondi per rischi e oneri",
    value: 0,
    level: 0,
    children: [
      {
        id: "fondi-quiescenza",
        label: "1) per trattamento di quiescienza e obblighi simili",
        value: 0,
        level: 1,
      },
      {
        id: "fondi-imposte",
        label: "2) per imposte. anche differite",
        value: 0,
        level: 1,
      },
      {
        id: "fondi-derivati",
        label: "3) strumenti finanziari derivati passivi",
        value: 0,
        level: 1,
      },
      {
        id: "fondi-altri",
        label: "4) altri",
        value: 0,
        level: 1,
      },
    ],
  },
  {
    id: "tfr",
    label: "C) TFR",
    value: 0,
    level: 0,
  },
  {
    id: "debiti",
    label: "D) Debiti",
    value: 0,
    level: 0,
    children: [
      {
        id: "debiti-obbligazioni",
        label: "1) obbligazioni",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-obbligazioni-conv",
        label: "2) obbligazioni convertibili",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-soci-finanz",
        label: "3) debiti v/ soci per finanziamenti",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-banche-mutui",
        label: "4) debiti v/ banche (mutui)",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-altri-finanz",
        label: "5) debiti v/ altri finanziatori",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-acconti",
        label: "6) acconti",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-fornitori",
        label: "7) debiti v/ fornitori",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-titoli-credito",
        label: "8) debiti rappr. da titoli di credito",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-controllate",
        label: "9) debiti v/ imprese controllate",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-collegate",
        label: "10) debiti v/ imprese collegate",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-controllanti",
        label: "11) debiti v/ controllanti",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-sottoposto-controllo",
        label: "11 bis) debiti v/ imprese sottoposto al controllo delle controllanti",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-tributari",
        label: "12) debiti tributari",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-istituti-prev",
        label: "13) debiti v/ istituti di prev. e sicurezza sociale",
        value: 0,
        level: 1,
      },
      {
        id: "altri-debiti",
        label: "14) altri debiti",
        value: 0,
        level: 1,
      },
    ],
  },
  {
    id: "ratei-risconti-passivi",
    label: "E) Ratei e risconti",
    value: 0,
    level: 0,
  },
];

const createEmptyContoEconomicoData = (): BalanceSheetItemData[] => [
  {
    id: "ce-valore-produzione",
    label: "A) Valore della produzione",
    value: 0,
    level: 0,
    children: [
      {
        id: "ce-ricavi-vendite",
        label: "1) Ricavi delle vendite e delle prestazioni",
        value: 0,
        level: 1,
      },
      {
        id: "ce-var-rimanenze-prodotti",
        label: "2) Variazioni delle rimanenze di prodotti finiti",
        value: 0,
        level: 1,
      },
      {
        id: "ce-var-lavori-corso",
        label: "3) Variazioni dei lavori in corso su ordinazione",
        value: 0,
        level: 1,
      },
      {
        id: "ce-incrementi-immob",
        label: "4) Incrementi di immobilizzazioni per lavori interni",
        value: 0,
        level: 1,
      },
      {
        id: "ce-altri-ricavi",
        label: "5) Altri ricavi e proventi",
        value: 0,
        level: 1,
      },
    ],
  },
  {
    id: "ce-costi-produzione",
    label: "B) Costi della produzione",
    value: 0,
    level: 0,
    children: [
      {
        id: "ce-materie-prime",
        label: "6) Per materie prime, sussidiarie, di consumo e merci",
        value: 0,
        level: 1,
      },
      {
        id: "ce-servizi",
        label: "7) Per servizi",
        value: 0,
        level: 1,
      },
      {
        id: "ce-godimento-beni",
        label: "8) Per godimento beni di terzi",
        value: 0,
        level: 1,
      },
      {
        id: "ce-personale",
        label: "9) Per il personale",
        value: 0,
        level: 1,
        children: [
          {
            id: "ce-salari-stipendi",
            label: "a) Salari e stipendi",
            value: 0,
            level: 2,
          },
          {
            id: "ce-oneri-sociali",
            label: "b) Oneri sociali",
            value: 0,
            level: 2,
          },
          {
            id: "ce-tfr",
            label: "c) Trattamento di fine rapporto",
            value: 0,
            level: 2,
          },
          {
            id: "ce-quiescenza",
            label: "d) Trattamento di quiescenza",
            value: 0,
            level: 2,
          },
          {
            id: "ce-altri-costi-personale",
            label: "e) Altri costi",
            value: 0,
            level: 2,
          },
        ],
      },
      {
        id: "ce-ammortamenti",
        label: "10) Ammortamenti e svalutazioni",
        value: 0,
        level: 1,
      },
      {
        id: "ce-var-rimanenze-materie",
        label: "11) Variazioni delle rimanenze di materie prime, sussidiarie, di consumo e merci",
        value: 0,
        level: 1,
      },
      {
        id: "ce-accantonamenti-rischi",
        label: "12) Accantonamenti per rischi",
        value: 0,
        level: 1,
      },
      {
        id: "ce-altri-accantonamenti",
        label: "13) Altri accantonamenti",
        value: 0,
        level: 1,
      },
      {
        id: "ce-oneri-diversi",
        label: "14) Oneri diversi di gestione",
        value: 0,
        level: 1,
      },
    ],
  },
  {
    id: "ce-differenza-ab",
    label: "Differenza tra valore e costi della produzione (A-B)",
    value: 0,
    level: 0,
  },
  {
    id: "ce-proventi-oneri-fin",
    label: "C) Proventi e oneri finanziari",
    value: 0,
    level: 0,
    children: [
      {
        id: "ce-proventi-partecipazioni",
        label: "15) Proventi da partecipazioni",
        value: 0,
        level: 1,
      },
      {
        id: "ce-altri-proventi-fin",
        label: "16) Altri proventi finanziari",
        value: 0,
        level: 1,
      },
      {
        id: "ce-interessi-oneri",
        label: "17) Interessi e altri oneri finanziari",
        value: 0,
        level: 1,
      },
    ],
  },
  {
    id: "ce-rettifiche",
    label: "D) Rettifiche di valore di attività finanziarie",
    value: 0,
    level: 0,
    children: [
      {
        id: "ce-rivalutazioni",
        label: "18) Rivalutazioni",
        value: 0,
        level: 1,
      },
      {
        id: "ce-svalutazioni",
        label: "19) Svalutazioni",
        value: 0,
        level: 1,
      },
    ],
  },
  {
    id: "ce-proventi-oneri-straord",
    label: "E) Proventi e oneri straordinari",
    value: 0,
    level: 0,
    children: [
      {
        id: "ce-proventi-straord",
        label: "20) Proventi straordinari",
        value: 0,
        level: 1,
      },
      {
        id: "ce-oneri-straord",
        label: "21) Oneri straordinari",
        value: 0,
        level: 1,
      },
    ],
  },
  {
    id: "ce-risultato-imposte",
    label: "Risultato prima delle imposte (A-B ±C ±D ±E)",
    value: 0,
    level: 0,
  },
  {
    id: "ce-imposte",
    label: "Imposte sul reddito dell'esercizio",
    value: 0,
    level: 0,
  },
  {
    id: "ce-avanzo-disavanzo",
    label: "Utile (perdita) dell'esercizio",
    value: 0,
    level: 0,
  },
];

export default function App() {
  // ─── URL params for project and session management ───
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get("projectId");
  const sessionId = searchParams.get("sessionId");
  const isNewSession = searchParams.get("new") === "true";
  
  // ─── Loading screen state ───
  type LoadingPhase = "loading" | "login" | "brand" | "shrink" | "done";
  // Ogni utente deve fare login ad ogni reload (non salva in localStorage)
  const [phase, setPhase] = useState<LoadingPhase>("loading");
  const [userName, setUserName] = useState({ nome: "", cognome: "" });
  const [loginNome, setLoginNome] = useState("");
  const [loginCognome, setLoginCognome] = useState("");
  const brandRef = useRef<HTMLSpanElement>(null);
  const navBrandRef = useRef<HTMLSpanElement>(null);

  // Phase transitions
  useEffect(() => {
    if (phase === "loading") {
      const t = setTimeout(() => setPhase("login"), 4000);
      return () => clearTimeout(t);
    }
    if (phase === "brand") {
      const t = setTimeout(() => setPhase("shrink"), 3000);
      return () => clearTimeout(t);
    }
    if (phase === "shrink") {
      const t = setTimeout(() => setPhase("done"), 800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleLogin = () => {
    if (!loginNome.trim() || !loginCognome.trim()) return;
    const user = { nome: loginNome.trim(), cognome: loginCognome.trim() };
    // Non salva in localStorage - il login si perde al reload della pagina
    setUserName(user);
    setPhase("brand");
  };

  const showLoadingScreen = phase !== "done";

  // ─── Admin & Session management ───
  const [currentView, setCurrentView] = useState<"main" | "admin">("main");
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [editingSessionUser, setEditingSessionUser] = useState<{ nome: string; cognome: string } | null>(null);
  const [adminNome, setAdminNome] = useState("");
  const [adminCognome, setAdminCognome] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [saveFlash, setSaveFlash] = useState(false);
  const [formulaCalculatorKey, setFormulaCalculatorKey] = useState(0); // Force remount on session load

  const handleAdminLogin = () => {
    if (adminNome.trim() === "Antonio" && adminCognome.trim() === "Guida" && adminPassword === "Guida") {
      setShowAdminDialog(false);
      setAdminNome("");
      setAdminCognome("");
      setAdminPassword("");
      setAdminError("");
      setIsAdminLoggedIn(true);
      setCurrentView("admin");
    } else {
      setAdminError("Credenziali non valide");
    }
  };

  // ─── Load saved state from localStorage ───
  const loadSavedState = () => {
    try {
      const raw = localStorage.getItem("hrdn_appState");
      if (raw) return JSON.parse(raw);
    } catch { /* ignore corrupt data */ }
    return null;
  };
  const savedState = useMemo(() => loadSavedState(), []);

  // ─── App state ───
  const [companyType, setCompanyType] = useState<"industrial" | "mercantile">(
    () => savedState?.companyType ?? "industrial"
  );
  const [exerciseText, setExerciseText] = useState(() => savedState?.exerciseText ?? "");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("hrdn_darkMode");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("hrdn_darkMode", String(darkMode));
  }, [darkMode]);
  
  // Toggle per visualizzazione cifre in migliaia (€/000)
  const [displayInThousands, setDisplayInThousands] = useState(() => {
    const saved = localStorage.getItem("hrdn_displayInThousands");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("hrdn_displayInThousands", String(displayInThousands));
  }, [displayInThousands]);
  
  // Helper per formattare numeri in base al toggle
  const formatCurrency = useCallback((value: number): string => {
    const displayValue = displayInThousands ? value / 1000 : value;
    return displayValue.toLocaleString("it-IT");
  }, [displayInThousands]);
  
  const [attivoData, setAttivoData] = useState<BalanceSheetItemData[]>(
    () => savedState?.attivoData ?? createEmptyAttivoData()
  );
  const [passivoData, setPassivoData] = useState<BalanceSheetItemData[]>(
    () => savedState?.passivoData ?? createEmptyPassivoData()
  );

  // N / N-1 year values for Attivo main categories
  const [attivoValuesN, setAttivoValuesN] = useState<Record<string, number>>(
    () => savedState?.attivoValuesN ?? {}
  );
  const [attivoValuesN1, setAttivoValuesN1] = useState<Record<string, number>>(
    () => savedState?.attivoValuesN1 ?? {}
  );

  // N / N-1 year values for Passivo main categories
  const [passivoValuesN, setPassivoValuesN] = useState<Record<string, number>>(
    () => savedState?.passivoValuesN ?? {}
  );
  const [passivoValuesN1, setPassivoValuesN1] = useState<Record<string, number>>(
    () => savedState?.passivoValuesN1 ?? {}
  );

  // Manual total overrides (used when total is known before categories)
  const [attivoTotalOverrideN, setAttivoTotalOverrideN] = useState(
    () => savedState?.attivoTotalOverrideN ?? 0
  );
  const [attivoTotalOverrideN1, setAttivoTotalOverrideN1] = useState(
    () => savedState?.attivoTotalOverrideN1 ?? 0
  );
  const [passivoTotalOverrideN, setPassivoTotalOverrideN] = useState(
    () => savedState?.passivoTotalOverrideN ?? 0
  );
  const [passivoTotalOverrideN1, setPassivoTotalOverrideN1] = useState(
    () => savedState?.passivoTotalOverrideN1 ?? 0
  );

  // Conto Economico data and year values
  const [contoEconomicoData, setContoEconomicoData] = useState<BalanceSheetItemData[]>(
    () => savedState?.contoEconomicoData ?? createEmptyContoEconomicoData()
  );
  const [ceValuesN, setCeValuesN] = useState<Record<string, number>>(
    () => savedState?.ceValuesN ?? {}
  );
  const [ceValuesN1, setCeValuesN1] = useState<Record<string, number>>(
    () => savedState?.ceValuesN1 ?? {}
  );
  const [ceTotalOverrideN, setCeTotalOverrideN] = useState(
    () => savedState?.ceTotalOverrideN ?? 0
  );
  const [ceTotalOverrideN1, setCeTotalOverrideN1] = useState(
    () => savedState?.ceTotalOverrideN1 ?? 0
  );

  // Financial structure analysis (lifted from CompanyAnalysisPanel)
  const [customStructure, setCustomStructure] = useState<FinancialStructure>(
    () => savedState?.customStructure ?? getDefaultStructure(companyType)
  );

  // Refs for scrolling to sections
  const attivoRef = useRef<HTMLDivElement>(null);
  const passivoRef = useRef<HTMLDivElement>(null);
  const contoEconomicoRef = useRef<HTMLDivElement>(null);
  
  // State for highlighting updated cells
  const [highlightedCell, setHighlightedCell] = useState<string | null>(null);

  // ─── Auto-login and Session loading ───
  useEffect(() => {
    // Check if user is logged in (coming from dashboard)
    const userDataStr = localStorage.getItem("userData") || sessionStorage.getItem("userData");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setUserName({ nome: userData.nome, cognome: userData.cognome });
        setPhase("done"); // Skip loading screen
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    // Load session if sessionId is provided
    if (sessionId) {
      loadSessionById(parseInt(sessionId));
    }
  }, [sessionId]);

  const loadSessionById = async (id: number) => {
    const result = await fetchSessionById(id);
    if (result.success && result.data) {
      const sessionData = result.data.data;
      
      // Load all state from session
      if (sessionData.companyType) setCompanyType(sessionData.companyType);
      if (sessionData.exerciseText) setExerciseText(sessionData.exerciseText);
      if (sessionData.attivoData) setAttivoData(sessionData.attivoData);
      if (sessionData.passivoData) setPassivoData(sessionData.passivoData);
      if (sessionData.attivoValuesN) setAttivoValuesN(sessionData.attivoValuesN);
      if (sessionData.attivoValuesN1) setAttivoValuesN1(sessionData.attivoValuesN1);
      if (sessionData.passivoValuesN) setPassivoValuesN(sessionData.passivoValuesN);
      if (sessionData.passivoValuesN1) setPassivoValuesN1(sessionData.passivoValuesN1);
      if (sessionData.attivoTotalOverrideN) setAttivoTotalOverrideN(sessionData.attivoTotalOverrideN);
      if (sessionData.attivoTotalOverrideN1) setAttivoTotalOverrideN1(sessionData.attivoTotalOverrideN1);
      if (sessionData.passivoTotalOverrideN) setPassivoTotalOverrideN(sessionData.passivoTotalOverrideN);
      if (sessionData.passivoTotalOverrideN1) setPassivoTotalOverrideN1(sessionData.passivoTotalOverrideN1);
      if (sessionData.contoEconomicoData) setContoEconomicoData(sessionData.contoEconomicoData);
      if (sessionData.ceValuesN) setCeValuesN(sessionData.ceValuesN);
      if (sessionData.ceValuesN1) setCeValuesN1(sessionData.ceValuesN1);
      if (sessionData.ceTotalOverrideN) setCeTotalOverrideN(sessionData.ceTotalOverrideN);
      if (sessionData.ceTotalOverrideN1) setCeTotalOverrideN1(sessionData.ceTotalOverrideN1);
      if (sessionData.customStructure) setCustomStructure(sessionData.customStructure);
      
      // Load FormulaCalculator state if available
      if (sessionData.formulaCalculatorState) {
        localStorage.setItem("formulaCalculatorState", JSON.stringify(sessionData.formulaCalculatorState));
        setFormulaCalculatorKey(prev => prev + 1); // Force remount
      }
      
      toast.success("Sessione caricata con successo");
    } else {
      toast.error("Errore nel caricamento della sessione");
    }
  };

  // ─── Persist all card data to localStorage ───
  useEffect(() => {
    const state = {
      companyType,
      exerciseText,
      attivoData,
      passivoData,
      attivoValuesN,
      attivoValuesN1,
      passivoValuesN,
      passivoValuesN1,
      attivoTotalOverrideN,
      attivoTotalOverrideN1,
      passivoTotalOverrideN,
      passivoTotalOverrideN1,
      contoEconomicoData,
      ceValuesN,
      ceValuesN1,
      ceTotalOverrideN,
      ceTotalOverrideN1,
      customStructure,
    };
    localStorage.setItem("hrdn_appState", JSON.stringify(state));
  }, [
    companyType, exerciseText,
    attivoData, passivoData,
    attivoValuesN, attivoValuesN1,
    passivoValuesN, passivoValuesN1,
    attivoTotalOverrideN, attivoTotalOverrideN1,
    passivoTotalOverrideN, passivoTotalOverrideN1,
    contoEconomicoData,
    ceValuesN, ceValuesN1,
    ceTotalOverrideN, ceTotalOverrideN1,
    customStructure,
  ]);

  // ─── Save session to Supabase ───
  const handleSaveSession = useCallback(async () => {
    // Include FormulaCalculator state from localStorage
    const formulaCalculatorState = localStorage.getItem("formulaCalculatorState");
    const formulaData = formulaCalculatorState ? JSON.parse(formulaCalculatorState) : null;
    
    console.log('📊 FormulaCalculator data from localStorage:', formulaData);

    const sessionData = {
      companyType,
      exerciseText,
      attivoData,
      passivoData,
      attivoValuesN,
      attivoValuesN1,
      passivoValuesN,
      passivoValuesN1,
      attivoTotalOverrideN,
      attivoTotalOverrideN1,
      passivoTotalOverrideN,
      passivoTotalOverrideN1,
      contoEconomicoData,
      ceValuesN,
      ceValuesN1,
      ceTotalOverrideN,
      ceTotalOverrideN1,
      customStructure,
      formulaCalculatorState: formulaData, // Include FormulaCalculator data
    };
    const saveUserName = editingSessionUser ?? userName;
    
    console.log('💾 Saving session data:', sessionData);
    
    // Generate session name
    const sessionName = `Analisi ${companyType === "industrial" ? "Industriale" : "Mercantile"} - ${new Date().toLocaleDateString('it-IT')}`;
    
    // Salva su Supabase
    const currentSessionId = sessionId ? parseInt(sessionId) : undefined;
    const result = await saveSession(
      saveUserName.nome,
      saveUserName.cognome,
      sessionData,
      currentSessionId,
      sessionName
    );
    
    if (result.success) {
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 1500);
      
      // Associate session with project if projectId exists
      if (projectId && result.sessionId) {
        const projectSessionsStr = localStorage.getItem(`project_${projectId}_sessions`);
        const sessionIds: number[] = projectSessionsStr ? JSON.parse(projectSessionsStr) : [];
        
        // Add session ID if not already present
        if (!sessionIds.includes(result.sessionId)) {
          sessionIds.push(result.sessionId);
          localStorage.setItem(`project_${projectId}_sessions`, JSON.stringify(sessionIds));
        }
        
        // Update project with latest session ID and session count
        const projectsStr = localStorage.getItem("projects");
        if (projectsStr) {
          const projects = JSON.parse(projectsStr);
          const updatedProjects = projects.map((p: any) =>
            p.id === projectId 
              ? { ...p, sessionCount: sessionIds.length, sessionId: result.sessionId } 
              : p
          );
          localStorage.setItem("projects", JSON.stringify(updatedProjects));
        }
        
        // Update URL to reflect the saved session ID (for future saves)
        if (!sessionId) {
          const newUrl = `/exercise?projectId=${projectId}&sessionId=${result.sessionId}`;
          window.history.replaceState({}, '', newUrl);
        }
      }
      
      toast.success("Sessione salvata con successo");
    } else {
      alert('Errore nel salvataggio. Controlla la connessione e la configurazione Supabase.');
    }
  }, [
    companyType, exerciseText, attivoData, passivoData,
    attivoValuesN, attivoValuesN1, passivoValuesN, passivoValuesN1,
    attivoTotalOverrideN, attivoTotalOverrideN1, passivoTotalOverrideN, passivoTotalOverrideN1,
    contoEconomicoData, ceValuesN, ceValuesN1, ceTotalOverrideN, ceTotalOverrideN1,
    customStructure, userName, editingSessionUser, projectId, sessionId,
  ]);

  // Auto-balance structure percentages to always sum to 100%
  const handleStructureChange = (newStructure: FinancialStructure) => {
    // Balance Attivo side (immobilizzazioni + attivoCircolante = 100)
    const attivoSum = newStructure.immobilizzazioni + newStructure.attivoCircolante;
    if (attivoSum !== 100) {
      if (newStructure.immobilizzazioni !== customStructure.immobilizzazioni) {
        newStructure.attivoCircolante = Math.max(0, Math.min(100, 100 - newStructure.immobilizzazioni));
      } else {
        newStructure.immobilizzazioni = Math.max(0, Math.min(100, 100 - newStructure.attivoCircolante));
      }
    }

    // Balance Passivo side (patrimonioNetto + debitiMLT + debitiBreve = 100)
    const passivoKeys: (keyof FinancialStructure)[] = ["patrimonioNetto", "debitiMLT", "debitiBreve"];
    const passivoSum = newStructure.patrimonioNetto + newStructure.debitiMLT + newStructure.debitiBreve;
    if (passivoSum !== 100) {
      const changedKey = passivoKeys.find(k => newStructure[k] !== customStructure[k]);
      if (changedKey) {
        const others = passivoKeys.filter(k => k !== changedKey);
        const remaining = Math.max(0, 100 - newStructure[changedKey]);
        const othersSum = others.reduce((s, k) => s + customStructure[k], 0);
        if (othersSum > 0) {
          others.forEach(k => {
            newStructure[k] = Math.max(0, Math.round((customStructure[k] / othersSum) * remaining));
          });
        } else {
          others.forEach((k, i) => {
            newStructure[k] = i === 0 ? remaining : 0;
          });
        }
      }
    }

    setCustomStructure({ ...newStructure });
  };

  const handleAttivoChange = (id: string, value: number) => {
    const updateValue = (items: BalanceSheetItemData[]): BalanceSheetItemData[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, value };
        }
        if (item.children) {
          return { ...item, children: updateValue(item.children) };
        }
        return item;
      });
    };
    setAttivoData(updateValue(attivoData));
  };

  const handlePassivoChange = (id: string, value: number) => {
    const updateValue = (items: BalanceSheetItemData[]): BalanceSheetItemData[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, value };
        }
        if (item.children) {
          return { ...item, children: updateValue(item.children) };
        }
        return item;
      });
    };
    setPassivoData(updateValue(passivoData));
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMULA CALCULATOR SYNC - Sincronizzazione bidirezionale
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Helper: Trova un valore in un albero gerarchico per ID
   */
  const findValueById = (items: BalanceSheetItemData[], id: string): number | undefined => {
    for (const item of items) {
      if (item.id === id) return item.value;
      if (item.children) {
        const found = findValueById(item.children, id);
        if (found !== undefined) return found;
      }
    }
    return undefined;
  };

  /**
   * Handler: Quando FormulaCalculator cambia un valore, aggiorna le card corrispondenti
   */
  const handleFormulaCalcChange = useCallback((metric: string, value: number | null) => {
    const numValue = value ?? 0;
    
    // Mapping metrica -> destinazione per notifiche
    const metricDestinationMap: Record<string, { section: string; label: string; ref: React.RefObject<HTMLDivElement | null>; cellId: string }> = {
      "Rn": { section: "Stato Patrimoniale", label: "A. III. Utile (perdita) dell'esercizio", ref: passivoRef, cellId: "utile-perdita" },
      "Ro": { section: "Conto Economico", label: "Differenza tra valore e costi (A-B)", ref: contoEconomicoRef, cellId: "ce-differenza-ab" },
      "RicaviNetti": { section: "Conto Economico", label: "A.1) Ricavi delle vendite", ref: contoEconomicoRef, cellId: "ce-ricavi-vendite" },
      "Imposte": { section: "Conto Economico", label: "Imposte sul reddito", ref: contoEconomicoRef, cellId: "ce-imposte" },
      "Debiti": { section: "Stato Patrimoniale", label: "D) Debiti", ref: passivoRef, cellId: "debiti" },
      "Rai": { section: "Conto Economico", label: "Risultato prima delle imposte", ref: contoEconomicoRef, cellId: "ce-risultato-imposte" },
      "Of": { section: "Conto Economico", label: "C.17) Interessi e oneri finanziari", ref: contoEconomicoRef, cellId: "ce-interessi-oneri" },
      "Cp": { section: "Stato Patrimoniale", label: "A. Patrimonio Netto", ref: passivoRef, cellId: "patrimonio-netto" },
      "CostiProduzione": { section: "Conto Economico", label: "B) Costi della produzione", ref: contoEconomicoRef, cellId: "ce-costi-produzione" },
      "Pf": { section: "Conto Economico", label: "C.16) Altri proventi finanziari", ref: contoEconomicoRef, cellId: "ce-altri-proventi-fin" },
    };

    const destination = metricDestinationMap[metric];

    switch (metric) {
      case "Rn": // Reddito Netto
        setPassivoValuesN(prev => ({ ...prev, "utile-perdita": numValue }));
        setCeValuesN(prev => ({ ...prev, "ce-avanzo-disavanzo": numValue }));
        break;

      case "Ro": // Reddito Operativo
        setCeValuesN(prev => ({ ...prev, "ce-differenza-ab": numValue }));
        break;

      case "RicaviNetti": // Ricavi Netti
        setCeValuesN(prev => ({ ...prev, "ce-ricavi-vendite": numValue }));
        break;

      case "Imposte": // Imposte
        setCeValuesN(prev => ({ ...prev, "ce-imposte": numValue }));
        break;

      case "Debiti": // Debiti
        setPassivoValuesN(prev => ({ ...prev, "debiti": numValue }));
        break;

      case "Rai": // Reddito Ante Imposte
        setCeValuesN(prev => ({ ...prev, "ce-risultato-imposte": numValue }));
        break;

      case "Of": // Oneri Finanziari
        setCeValuesN(prev => ({ ...prev, "ce-interessi-oneri": numValue }));
        break;

      case "Cp": // Capitale Proprio
        setPassivoValuesN(prev => ({ ...prev, "patrimonio-netto": numValue }));
        break;

      case "CostiProduzione": // Costi della produzione
        setCeValuesN(prev => ({ ...prev, "ce-costi-produzione": numValue }));
        break;

      case "Pf": // Proventi Finanziari
        setCeValuesN(prev => ({ ...prev, "ce-altri-proventi-fin": numValue }));
        break;
    }

    // Mostra notifica e gestisci scroll/highlight
    if (destination && numValue !== 0) {
      const formattedValue = formatCurrency(Math.round(numValue));
      
      toast.success(
        `${metric} aggiornato`,
        {
          description: `Valore ${formattedValue} inserito in "${destination.label}" (${destination.section})`,
          duration: 5000,
          action: {
            label: "Vai alla sezione",
            onClick: () => {
              // Scroll alla sezione
              destination.ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              
              // Highlight temporaneo
              setHighlightedCell(destination.cellId);
              setTimeout(() => setHighlightedCell(null), 2000);
            },
          },
        }
      );
    }
  }, []);

  /**
   * Raccoglie i valori dalle card per passarli a FormulaCalculator
   */
  const formulaCalculatorExternalValues = useMemo(() => {
    return {
      Rn: passivoValuesN["utile-perdita"] || ceValuesN["ce-avanzo-disavanzo"] || undefined,
      Ro: ceValuesN["ce-differenza-ab"] || undefined,
      RicaviNetti: ceValuesN["ce-ricavi-vendite"] || undefined,
      Imposte: ceValuesN["ce-imposte"] || undefined,
      Debiti: passivoValuesN["debiti"] || undefined,
      Rai: ceValuesN["ce-risultato-imposte"] || undefined,
      Of: ceValuesN["ce-interessi-oneri"] || undefined,
      Cp: passivoValuesN["patrimonio-netto"] || undefined,
      CostiProduzione: ceValuesN["ce-costi-produzione"] || undefined,
      Pf: ceValuesN["ce-altri-proventi-fin"] || undefined,
    };
  }, [passivoValuesN, ceValuesN]);

  // Estrai debiti disponibili per classificazione
  const availableDebts = useMemo(() => {
    const debtIds = [
      { id: "tfr", name: "C) TFR" },
      { id: "debiti-obbligazioni", name: "Obbligazioni" },
      { id: "debiti-obbligazioni-conv", name: "Obbligazioni convertibili" },
      { id: "debiti-soci-finanz", name: "Debiti v/ soci per finanziamenti" },
      { id: "debiti-banche-mutui", name: "Debiti v/ banche (mutui)" },
      { id: "debiti-altri-finanz", name: "Debiti v/ altri finanziatori" },
      { id: "debiti-acconti", name: "Acconti" },
      { id: "debiti-fornitori", name: "Debiti v/ fornitori" },
      { id: "debiti-titoli-credito", name: "Debiti rappr. da titoli di credito" },
      { id: "debiti-controllate", name: "Debiti v/ imprese controllate" },
      { id: "debiti-collegate", name: "Debiti v/ imprese collegate" },
      { id: "debiti-controllanti", name: "Debiti v/ controllanti" },
      { id: "debiti-sottoposto-controllo", name: "Debiti v/ imprese sottoposte controllo controllanti" },
      { id: "debiti-tributari", name: "Debiti tributari" },
      { id: "debiti-istituti-prev", name: "Debiti v/ istituti prev. e sicurezza sociale" },
      { id: "altri-debiti", name: "Altri debiti" },
    ];

    return debtIds.map(debt => ({
      id: debt.id,
      name: debt.name,
      totalAmount: passivoValuesN[debt.id] || 0,
    }));
  }, [passivoValuesN]);

  // ═══════════════════════════════════════════════════════════════════════════

  /* Sum N values for a section using the same logic as BalanceSheetSection footer:
     level 0 → use manual override if present, otherwise sum of children */
  const sumSectionN = (
    items: BalanceSheetItemData[],
    values: Record<string, number>
  ): number => {
    return items.reduce((sum, item) => {
      // If manually set at level 0, use it
      if (item.id in values) return sum + values[item.id];
      // Otherwise sum children (level 1)
      if (item.children) {
        return sum + item.children.reduce((s, c) => s + (values[c.id] ?? 0), 0);
      }
      return sum + (values[item.id] ?? 0);
    }, 0);
  };

  const autoSumAttivoN = sumSectionN(attivoData, attivoValuesN);
  const autoSumPassivoN = sumSectionN(passivoData, passivoValuesN);
  // Usa il maggiore tra totale manuale e somma automatica
  const totalAttivo = Math.max(attivoTotalOverrideN, autoSumAttivoN);
  const totalPassivo = Math.max(passivoTotalOverrideN, autoSumPassivoN);
  const isBalanced = Math.abs(totalAttivo - totalPassivo) < 1;
  const difference = totalAttivo - totalPassivo;

  const [showResetDialog, setShowResetDialog] = useState(false);

  const resetAllData = () => {
    setAttivoData(createEmptyAttivoData());
    setPassivoData(createEmptyPassivoData());
    setContoEconomicoData(createEmptyContoEconomicoData());
    setAttivoValuesN({});
    setAttivoValuesN1({});
    setPassivoValuesN({});
    setPassivoValuesN1({});
    setCeValuesN({});
    setCeValuesN1({});
    setAttivoTotalOverrideN(0);
    setAttivoTotalOverrideN1(0);
    setPassivoTotalOverrideN(0);
    setPassivoTotalOverrideN1(0);
    setCeTotalOverrideN(0);
    setCeTotalOverrideN1(0);
    setExerciseText("");
    localStorage.removeItem("hrdn_appState");
    localStorage.removeItem("formulaCalculatorState");
  };

  // Load a saved session's data into all state and switch to main view
  const loadSessionData = (data: any, sessionUser?: { nome: string; cognome: string }) => {
    setCompanyType(data.companyType ?? "industrial");
    setExerciseText(data.exerciseText ?? "");
    setAttivoData(data.attivoData ?? createEmptyAttivoData());
    setPassivoData(data.passivoData ?? createEmptyPassivoData());
    setContoEconomicoData(data.contoEconomicoData ?? createEmptyContoEconomicoData());
    setAttivoValuesN(data.attivoValuesN ?? {});
    setAttivoValuesN1(data.attivoValuesN1 ?? {});
    setPassivoValuesN(data.passivoValuesN ?? {});
    setPassivoValuesN1(data.passivoValuesN1 ?? {});
    setCeValuesN(data.ceValuesN ?? {});
    setCeValuesN1(data.ceValuesN1 ?? {});
    setAttivoTotalOverrideN(data.attivoTotalOverrideN ?? 0);
    setAttivoTotalOverrideN1(data.attivoTotalOverrideN1 ?? 0);
    setPassivoTotalOverrideN(data.passivoTotalOverrideN ?? 0);
    setPassivoTotalOverrideN1(data.passivoTotalOverrideN1 ?? 0);
    setCeTotalOverrideN(data.ceTotalOverrideN ?? 0);
    setCeTotalOverrideN1(data.ceTotalOverrideN1 ?? 0);
    if (data.customStructure) setCustomStructure(data.customStructure);
    
    // Restore FormulaCalculator state
    if (data.formulaCalculatorState) {
      localStorage.setItem("formulaCalculatorState", JSON.stringify(data.formulaCalculatorState));
      // Force remount of FormulaCalculator to reload from localStorage
      setFormulaCalculatorKey(prev => prev + 1);
    }
    
    setEditingSessionUser(sessionUser ?? null);
    setCurrentView("main");
  };

  const applyPreset = (type: "industrial" | "mercantile") => {
    // Reset first to avoid duplication
    const freshAttivoData = createEmptyAttivoData();
    const freshPassivoData = createEmptyPassivoData();

    if (type === "industrial") {
      // Preset industriale: base values for demonstration
      const attivoWithValues = [
        { ...freshAttivoData[0], value: 5000 },
        {
          ...freshAttivoData[1],
          children: freshAttivoData[1].children?.map((cat, catIdx) => ({
            ...cat,
            children: cat.children?.map((item, idx) => ({
              ...item,
              value: [20000, 30000, 50000, 300000, 200000, 80000, 100000, 40000][catIdx * 3 + idx] || 0,
            })),
          })),
        },
        {
          ...freshAttivoData[2],
          children: freshAttivoData[2].children?.map((cat, catIdx) => ({
            ...cat,
            children: cat.children?.map((item, idx) => ({
              ...item,
              value: [150000, 200000, 250000, 50000, 30000, 100000, 10000][catIdx * 2 + idx] || 0,
            })),
          })),
        },
        { ...freshAttivoData[3], value: 20000 },
      ];

      const passivoWithValues = [
        {
          ...freshPassivoData[0],
          children: [
            { ...freshPassivoData[0].children![0], value: 400000 },
            {
              ...freshPassivoData[0].children![1],
              children: [
                { ...freshPassivoData[0].children![1].children![0], value: 80000 },
                { ...freshPassivoData[0].children![1].children![1], value: 120000 },
              ],
            },
            { ...freshPassivoData[0].children![2], value: 130000 },
          ],
        },
        {
          ...freshPassivoData[1],
          children: [
            { ...freshPassivoData[1].children![0], value: 50000 },
            { ...freshPassivoData[1].children![1], value: 100000 },
            {
              ...freshPassivoData[1].children![2],
              children: [
                { ...freshPassivoData[1].children![2].children![0], value: 200000 },
                { ...freshPassivoData[1].children![2].children![1], value: 70000 },
              ],
            },
          ],
        },
        {
          ...freshPassivoData[2],
          children: [
            { ...freshPassivoData[2].children![0], value: 180000 },
            { ...freshPassivoData[2].children![1], value: 140000 },
            { ...freshPassivoData[2].children![2], value: 40000 },
            { ...freshPassivoData[2].children![3], value: 30000 },
          ],
        },
        { ...freshPassivoData[3], value: 20000 },
      ];

      setAttivoData(attivoWithValues);
      setPassivoData(passivoWithValues);
    } else {
      // Preset mercantile: higher current assets, lower fixed assets
      const attivoWithValues = [
        { ...freshAttivoData[0], value: 3000 },
        {
          ...freshAttivoData[1],
          children: freshAttivoData[1].children?.map((cat, catIdx) => ({
            ...cat,
            children: cat.children?.map((item, idx) => ({
              ...item,
              value: [10000, 15000, 25000, 120000, 80000, 30000, 40000, 20000][catIdx * 3 + idx] || 0,
            })),
          })),
        },
        {
          ...freshAttivoData[2],
          children: freshAttivoData[2].children?.map((cat, catIdx) => ({
            ...cat,
            children: cat.children?.map((item, idx) => ({
              ...item,
              value: [250000, 350000, 400000, 80000, 50000, 150000, 20000][catIdx * 2 + idx] || 0,
            })),
          })),
        },
        { ...freshAttivoData[3], value: 15000 },
      ];

      const passivoWithValues = [
        {
          ...freshPassivoData[0],
          children: [
            { ...freshPassivoData[0].children![0], value: 300000 },
            {
              ...freshPassivoData[0].children![1],
              children: [
                { ...freshPassivoData[0].children![1].children![0], value: 60000 },
                { ...freshPassivoData[0].children![1].children![1], value: 90000 },
              ],
            },
            { ...freshPassivoData[0].children![2], value: 100000 },
          ],
        },
        {
          ...freshPassivoData[1],
          children: [
            { ...freshPassivoData[1].children![0], value: 35000 },
            { ...freshPassivoData[1].children![1], value: 70000 },
            {
              ...freshPassivoData[1].children![2],
              children: [
                { ...freshPassivoData[1].children![2].children![0], value: 120000 },
                { ...freshPassivoData[1].children![2].children![1], value: 40000 },
              ],
            },
          ],
        },
        {
          ...freshPassivoData[2],
          children: [
            { ...freshPassivoData[2].children![0], value: 350000 },
            { ...freshPassivoData[2].children![1], value: 250000 },
            { ...freshPassivoData[2].children![2], value: 60000 },
            { ...freshPassivoData[2].children![3], value: 50000 },
          ],
        },
        { ...freshPassivoData[3], value: 15000 },
      ];

      setAttivoData(attivoWithValues);
      setPassivoData(passivoWithValues);
    }
  };

  return (
    <CurrencyContext.Provider value={{ displayInThousands, formatCurrency }}>
    <>
    {/* ─── Loading Screen Overlay ─── */}
    {showLoadingScreen && (
      <div
        className={`fixed inset-0 z-[100] bg-[#0f0f0f] flex items-center justify-center transition-opacity duration-700 ${
          phase === "shrink" ? "animate-fade-out" : ""
        }`}
      >
        {/* Phase 1: Loader */}
        {phase === "loading" && (
          <div className="loader">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        )}

        {/* Phase 2: Login popup */}
        {phase === "login" && (
          <div className="animate-fade-in bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-8 max-[617px]:p-5 shadow-2xl w-[380px] max-[617px]:w-[300px] text-center">
            <h2 className="text-white text-xl max-[617px]:text-lg font-semibold mb-1 font-[Poppins,sans-serif]">Benvenuto</h2>
            <p className="text-gray-400 text-sm mb-6 max-[617px]:mb-4">Inserisci i tuoi dati per accedere</p>
            <div className="space-y-3 mb-6 max-[617px]:mb-4">
              <Input
                type="text"
                placeholder="Nome"
                value={loginNome}
                onChange={(e) => setLoginNome(e.target.value)}
                className="bg-[#252540] border-[#3a3a50] text-white placeholder:text-gray-500 h-11 rounded-lg"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <Input
                type="text"
                placeholder="Cognome"
                value={loginCognome}
                onChange={(e) => setLoginCognome(e.target.value)}
                className="bg-[#252540] border-[#3a3a50] text-white placeholder:text-gray-500 h-11 rounded-lg"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={!loginNome.trim() || !loginCognome.trim()}
              className="w-full py-2.5 bg-white text-[#0f0f0f] rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Accedi
            </button>
          </div>
        )}

        {/* Phase 3: Brand reveal */}
        {phase === "brand" && (
          <div className="animate-fade-in">
            <span ref={brandRef} className="btn-shine-hero">
              hrdn design
            </span>
          </div>
        )}

        {/* Phase 4: Shrink — brand text shrinks toward navbar */}
        {phase === "shrink" && (
          <span
            className="btn-shine-hero"
            style={{
              position: "fixed",
              top: "16px",
              left: "24px",
              fontSize: "19px",
              padding: "12px 48px",
              zIndex: 200,
            }}
          >
            hrdn design
          </span>
        )}
      </div>
    )}

    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-[#0f172a]" : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"}`}>
      {/* Navbar */}
      <nav 
        className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 ${
          darkMode
            ? "bg-[#1e293b]/90 border-slate-700"
            : "bg-white/80 border-gray-200"
        }`}
        style={{ willChange: 'transform' }}
      >
        <div className="max-w-[2560px] mx-auto px-6 max-[617px]:px-3 h-14 max-[617px]:h-12 flex items-center justify-between">
          {/* Shine brand text — UIverse by neerajbaniwal */}
          <div className="flex items-center gap-4">
            <span className="btn-shine">hrdn design</span>
            {projectId && (
              <>
                <div className="h-6 w-px bg-slate-700"></div>
                <button
                  onClick={() => navigate(`/project/${projectId}`)}
                  className={`text-sm transition-colors flex items-center gap-2 ${
                    darkMode 
                      ? "text-slate-400 hover:text-white" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="max-[617px]:hidden">Torna al progetto</span>
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 max-[617px]:gap-2">
            {/* Show user session name when admin is viewing a session */}
            {editingSessionUser && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                darkMode 
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span className="max-[617px]:hidden">{editingSessionUser.nome} {editingSessionUser.cognome}</span>
                <span className="hidden max-[617px]:inline">{editingSessionUser.nome[0]}.{editingSessionUser.cognome[0]}.</span>
              </div>
            )}
            {/* UIverse Bookmark/Save Button by vinodjangid07 — MIT License */}
            {!(isAdminLoggedIn && editingSessionUser) && (
              <button className={`bookmarkBtn ${saveFlash ? "saved" : ""}`} onClick={handleSaveSession}>
                <span className="IconContainer">
                  <svg className="icon" viewBox="0 0 384 512" height="0.9em" xmlns="http://www.w3.org/2000/svg" fill="white">
                    <path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z" />
                  </svg>
                </span>
                <p className="text">Salva</p>
              </button>
            )}
            {/* User Profile Button — UIverse by reglobby */}
            <button
              className="user-profile"
              onClick={() => {
                if (isAdminLoggedIn) {
                  setCurrentView(currentView === "admin" ? "main" : "admin");
                } else {
                  setAdminError("");
                  setShowAdminDialog(true);
                }
              }}
            >
              <div className={`user-profile-inner ${isAdminLoggedIn ? "admin-active" : ""}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-5 h-5 max-[617px]:w-4 max-[617px]:h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
            </button>
            {/* UIverse Switch by Admin12121 */}
            <div className="switch-button">
              <div className="switch-outer">
                <input
                  type="checkbox"
                  id="dark-toggle"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <label htmlFor="dark-toggle">
                  <div className="switch-inner">
                    <Sun className="icon-sun w-3.5 h-3.5 text-amber-600" />
                    <Moon className="icon-moon w-3.5 h-3.5 text-slate-500" />
                  </div>
                </label>
              </div>
            </div>
            {/* Toggle €/000 */}
            <button
              onClick={() => setDisplayInThousands(!displayInThousands)}
              className={`flex items-center gap-1.5 px-3 py-2 h-10 rounded-lg font-semibold text-sm transition-all border ${
                displayInThousands
                  ? darkMode 
                    ? "bg-indigo-600 text-white border-indigo-500" 
                    : "bg-indigo-500 text-white border-indigo-400"
                  : darkMode
                  ? "bg-transparent text-slate-300 border-slate-600 hover:bg-slate-700"
                  : "bg-transparent text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
              title={displayInThousands ? "Mostra valori completi" : "Mostra valori in migliaia"}
            >
              <span className="text-xs">€/000</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Admin Login Dialog */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className={`max-w-sm ${darkMode ? "bg-[#1a1a2e] border-[#2a2a3e] text-white" : ""}`}>
          <DialogHeader>
            <DialogTitle className={darkMode ? "text-white" : ""}>Accesso Amministratore</DialogTitle>
            <DialogDescription className={darkMode ? "text-slate-400" : ""}>
              Inserisci le credenziali per accedere alla dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input
              type="text"
              placeholder="Nome"
              value={adminNome}
              onChange={(e) => { setAdminNome(e.target.value); setAdminError(""); }}
              className={darkMode ? "bg-[#252540] border-[#3a3a50] text-white placeholder:text-gray-500" : ""}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
            />
            <Input
              type="text"
              placeholder="Cognome"
              value={adminCognome}
              onChange={(e) => { setAdminCognome(e.target.value); setAdminError(""); }}
              className={darkMode ? "bg-[#252540] border-[#3a3a50] text-white placeholder:text-gray-500" : ""}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
            />
            <Input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={(e) => { setAdminPassword(e.target.value); setAdminError(""); }}
              className={darkMode ? "bg-[#252540] border-[#3a3a50] text-white placeholder:text-gray-500" : ""}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
            />
            {adminError && (
              <p className="text-sm text-red-500 font-medium">{adminError}</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAdminDialog(false)} className={darkMode ? "border-slate-600 text-slate-300 hover:bg-slate-700" : ""}>
              Annulla
            </Button>
            <Button onClick={handleAdminLogin} className="bg-violet-600 hover:bg-violet-700 text-white">
              Accedi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conditional View: Admin Dashboard vs Main Content */}
      {currentView === "admin" ? (
        <div className="max-w-[2560px] mx-auto p-6 max-[617px]:p-3">
          <button
            onClick={() => setCurrentView("main")}
            className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              darkMode
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla pagina principale
          </button>
          <AdminDashboard darkMode={darkMode} onLoadSession={loadSessionData} />
        </div>
      ) : (
      <div className="max-w-[2560px] mx-auto p-6 max-[617px]:p-3">
        {/* Exercise Text Area */}
        <div className={`mb-6 max-[617px]:mb-4 rounded-xl shadow-lg p-6 max-[617px]:p-3 border transition-colors duration-300 ${
          darkMode
            ? "bg-[#1e293b] border-slate-700"
            : "bg-white border-gray-200"
        }`}>
          <Label htmlFor="exercise-text" className={`text-sm font-semibold mb-2 block ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
            Testo dell'Esercizio
          </Label>
          <Textarea
            id="exercise-text"
            placeholder="Inserire qui il testo dell'esercizio, i vincoli, le ipotesi e i dati forniti dal docente..."
            value={exerciseText}
            onChange={(e) => setExerciseText(e.target.value)}
            className={`min-h-[100px] max-[617px]:min-h-[70px] text-sm max-[617px]:text-xs resize-none ${darkMode ? "bg-[#0f172a] border-slate-600 text-slate-200 placeholder:text-slate-500" : ""}`}
          />
        </div>

        {/* Exercise Analyzer */}
        <ExerciseAnalyzer exerciseText={exerciseText} />

        {/* Formula Calculator */}
        <div className="mt-6 max-[617px]:mt-4">
          <FormulaCalculator 
            key={formulaCalculatorKey} 
            immobilizzazioniPercent={customStructure.immobilizzazioni}
            onMetricChange={handleFormulaCalcChange}
            externalValues={formulaCalculatorExternalValues}
          />
        </div>

        {/* Reset Button */}
        <div className="my-6 max-[617px]:my-3 flex items-center justify-end pr-6 max-[617px]:pr-3">
          <button
            onClick={() => setShowResetDialog(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-white text-sm rounded-md font-medium hover:brightness-90 transition-colors"
            style={{ backgroundColor: "#D4183D" }}
          >
            <RotateCcw className="w-4 h-4" />
            Reset Dati
          </button>
        </div>

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Conferma reset</DialogTitle>
              <DialogDescription>
                Sei sicuro di cancellare tutti i dati inseriti? Questa azione non
                può essere annullata.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                No, annulla
              </Button>
              <Button variant="destructive" onClick={() => { resetAllData(); setShowResetDialog(false); }}>
                Sì, cancella tutto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Main Layout */}
        <div className="grid grid-cols-1 gap-6 max-[617px]:gap-4">
          {/* Balance Sheet - full width/height area */}
          <div className="w-full min-h-screen mx-0 px-0 grid md:grid-cols-2 gap-6 max-[617px]:gap-4">
            <div ref={attivoRef}>
            <BalanceSheetSection
              title="ATTIVO"
              items={attivoData}
              onValueChange={handleAttivoChange}
              themeColor="#2563eb"
              themeColorLight="#93c5fd"
              showYearColumns
              darkMode={darkMode}
              highlightedCell={highlightedCell}
              valuesN={attivoValuesN}
              valuesN1={attivoValuesN1}
              onChangeN={(id, v) => setAttivoValuesN((prev) => ({ ...prev, [id]: v }))}
              onChangeN1={(id, v) => setAttivoValuesN1((prev) => ({ ...prev, [id]: v }))}
              structureBar={[
                { id: "immobilizzazioni", percent: customStructure.immobilizzazioni, color: companyType === "industrial" ? "#2563eb" : "#16a34a" },
                { id: "attivo-circolante", percent: customStructure.attivoCircolante, color: companyType === "industrial" ? "#60a5fa" : "#4ade80" },
              ]}
              totalOverrideN={attivoTotalOverrideN}
              totalOverrideN1={attivoTotalOverrideN1}
              onTotalChangeN={setAttivoTotalOverrideN}
              onTotalChangeN1={setAttivoTotalOverrideN1}
            />
            </div>
            <div ref={passivoRef}>
            <BalanceSheetSection
              title="PASSIVO"
              items={passivoData}
              onValueChange={handlePassivoChange}
              themeColor="#7c3aed"
              themeColorLight="#c4b5fd"
              showYearColumns
              darkMode={darkMode}
              highlightedCell={highlightedCell}
              valuesN={passivoValuesN}
              valuesN1={passivoValuesN1}
              onChangeN={(id, v) => setPassivoValuesN((prev) => ({ ...prev, [id]: v }))}
              onChangeN1={(id, v) => setPassivoValuesN1((prev) => ({ ...prev, [id]: v }))}
              initialCollapsedIds={["debiti"]}
              structureBar={[
                { 
                  id: "patrimonio-netto", 
                  percent: customStructure.patrimonioNetto, 
                  color: companyType === "industrial" ? "#2563eb" : "#16a34a" 
                },
                { 
                  id: "debiti-mlt", 
                  percent: customStructure.debitiMLT, 
                  color: companyType === "industrial" ? "#3b82f6" : "#22c55e"
                },
                { 
                  id: "debiti-breve", 
                  percent: customStructure.debitiBreve, 
                  color: companyType === "industrial" ? "#93c5fd" : "#86efac"
                },
              ]}
              totalOverrideN={passivoTotalOverrideN}
              totalOverrideN1={passivoTotalOverrideN1}
              onTotalChangeN={setPassivoTotalOverrideN}
              onTotalChangeN1={setPassivoTotalOverrideN1}
            />
            </div>
          </div>

          {/* Balance Check */}
          <div>
            <div
              className={`rounded-xl shadow-lg p-6 max-[617px]:p-3 border-2 transition-all ${
                isBalanced
                  ? darkMode ? "bg-green-900/30 border-green-600" : "bg-green-50 border-green-500"
                  : darkMode ? "bg-red-900/30 border-red-600" : "bg-red-50 border-red-500"
              }`}
            >
              <div className="flex items-center justify-between max-[617px]:flex-col max-[617px]:items-start max-[617px]:gap-3">
                <div className="flex items-center gap-4 max-[617px]:gap-2">
                  {isBalanced ? (
                    <CheckCircle2 className="w-8 h-8 max-[617px]:w-6 max-[617px]:h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-8 h-8 max-[617px]:w-6 max-[617px]:h-6 text-red-600" />
                  )}
                  <div>
                    <h3 className={`text-lg max-[617px]:text-sm font-bold ${darkMode ? "text-slate-100" : "text-gray-900"}`}>
                      Verifica di Quadratura
                      <span className={`ml-2 text-sm max-[617px]:text-xs font-normal ${darkMode ? "text-slate-400" : "text-gray-500"}`}>— Anno Corrente</span>
                    </h3>
                    <p className={`text-sm max-[617px]:text-xs ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                      {isBalanced
                        ? "Il bilancio è correttamente bilanciato"
                        : "Il bilancio presenta uno sbilancio"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-8 max-[617px]:gap-3 max-[617px]:w-full text-center">
                  <div>
                    <div className={`text-xs mb-1 ${darkMode ? "text-slate-400" : "text-gray-600"}`}>Totale Attivo</div>
                    <div className="text-xl max-[617px]:text-base font-bold text-blue-600">
                      €{formatCurrency(totalAttivo)}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs mb-1 ${darkMode ? "text-slate-400" : "text-gray-600"}`}>Totale Passivo</div>
                    <div className="text-xl max-[617px]:text-base font-bold text-purple-600">
                      €{formatCurrency(totalPassivo)}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs mb-1 ${darkMode ? "text-slate-400" : "text-gray-600"}`}>Differenza</div>
                    <div
                      className={`text-xl max-[617px]:text-base font-bold ${
                        isBalanced ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isBalanced
                        ? "✓ Bilanciato"
                        : `€${formatCurrency(Math.abs(difference))}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CI Calculator, Debt Classification, Formula Viewer - Three columns grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 max-[617px]:gap-4">
            <div className={`h-[500px] overflow-y-auto rounded-xl shadow-lg border ${
              darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
            }`}>
              <CICalculator
                ciValue={totalAttivo}
                structure={customStructure}
                companyType={companyType}
                onCalculate={(target, value) => {
                  // Attivo targets: immobilizzazioni-nette, attivo-circolante
                  if (target === "immobilizzazioni-nette" || target === "attivo-circolante") {
                    setAttivoValuesN((prev) => ({ ...prev, [target]: value }));
                    toast.success("Valore applicato", {
                      description: `€${formatCurrency(value)} inserito in Attivo`,
                      duration: 3000,
                    });
                  }
                  // Passivo targets: patrimonio-netto, debiti-mlt, debiti-breve
                  else if (target === "patrimonio-netto" || target === "debiti-mlt" || target === "debiti-breve") {
                    setPassivoValuesN((prev) => ({ ...prev, [target]: value }));
                    toast.success("Valore applicato", {
                      description: `€${formatCurrency(value)} inserito in Passivo`,
                      duration: 3000,
                    });
                  }
                }}
                darkMode={darkMode}
              />
            </div>

            <div className={`h-[500px] overflow-y-auto rounded-xl shadow-lg border ${
              darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
            }`}>
              <DebtClassification
                availableDebts={availableDebts}
                darkMode={darkMode}
                onChange={(classifiedDebts) => {
                  console.log("Debiti classificati:", classifiedDebts);
                }}
              />
            </div>

            <div className={`h-[500px] overflow-y-auto rounded-xl shadow-lg border ${
              darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
            }`}>
              <FormulaViewer darkMode={darkMode} />
            </div>
          </div>

          {/* Analysis Panel - Conto Economico & Company Analysis */}
          <div className="flex flex-col md:flex-row gap-6 max-[617px]:gap-4">
            {/* Conto Economico */}
            <div ref={contoEconomicoRef} className="order-2 md:order-1 md:basis-2/3 md:max-w-[66.666%] flex-shrink-0">
              <BalanceSheetSection
                title="CONTO ECONOMICO"
                items={contoEconomicoData}
                onValueChange={(id, v) => {
                  const updateCE = (items: BalanceSheetItemData[]): BalanceSheetItemData[] =>
                    items.map((item) => {
                      if (item.id === id) return { ...item, value: v };
                      if (item.children) return { ...item, children: updateCE(item.children) };
                      return item;
                    });
                  setContoEconomicoData(updateCE(contoEconomicoData));
                }}
                themeColor="#d97706"
                themeColorLight="#fcd34d"
                showYearColumns
                darkMode={darkMode}
                highlightedCell={highlightedCell}
                valuesN={ceValuesN}
                valuesN1={ceValuesN1}
                onChangeN={(id, v) => {
                  setCeValuesN((prev) => {
                    const updated = { ...prev, [id]: v };
                    
                    // Auto-calcola "C. Proventi e oneri finanziari" quando cambiano i figli
                    if (id === "ce-proventi-partecipazioni" || id === "ce-altri-proventi-fin" || id === "ce-interessi-oneri") {
                      const provPart = id === "ce-proventi-partecipazioni" ? v : (prev["ce-proventi-partecipazioni"] || 0);
                      const provFin = id === "ce-altri-proventi-fin" ? v : (prev["ce-altri-proventi-fin"] || 0);
                      const oneri = id === "ce-interessi-oneri" ? v : (prev["ce-interessi-oneri"] || 0);
                      
                      // Calcola: (C.15 + C.16) - C.17
                      updated["ce-proventi-oneri-fin"] = (provPart + provFin) - oneri;
                    }
                    
                    return updated;
                  });
                }}
                onChangeN1={(id, v) => {
                  setCeValuesN1((prev) => {
                    const updated = { ...prev, [id]: v };
                    
                    // Auto-calcola "C. Proventi e oneri finanziari" quando cambiano i figli
                    if (id === "ce-proventi-partecipazioni" || id === "ce-altri-proventi-fin" || id === "ce-interessi-oneri") {
                      const provPart = id === "ce-proventi-partecipazioni" ? v : (prev["ce-proventi-partecipazioni"] || 0);
                      const provFin = id === "ce-altri-proventi-fin" ? v : (prev["ce-altri-proventi-fin"] || 0);
                      const oneri = id === "ce-interessi-oneri" ? v : (prev["ce-interessi-oneri"] || 0);
                      
                      // Calcola: (C.15 + C.16) - C.17
                      updated["ce-proventi-oneri-fin"] = (provPart + provFin) - oneri;
                    }
                    
                    return updated;
                  });
                }}
                totalOverrideN={ceTotalOverrideN}
                totalOverrideN1={ceTotalOverrideN1}
                onTotalChangeN={setCeTotalOverrideN}
                onTotalChangeN1={setCeTotalOverrideN1}
                startCollapsed
              />
            </div>
            {/* Company Analysis Panel */}
            <div className="order-1 md:order-2 md:basis-1/3 md:max-w-[33.333%] flex-1 min-w-0">
              <CompanyAnalysisPanel
                companyType={companyType}
                onCompanyTypeChange={setCompanyType}
                customStructure={customStructure}
                onStructureChange={handleStructureChange}
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
    <Toaster position="top-right" richColors />
    </>
    </CurrencyContext.Provider>
  );
}
