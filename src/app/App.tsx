import { useState, useEffect, useRef } from "react";
import { BalanceSheetSection } from "./components/BalanceSheetSection";
import { CompanyAnalysisPanel, getDefaultStructure, type FinancialStructure } from "./components/CompanyAnalysisPanel";
import ExerciseAnalyzer from "./components/ExerciseAnalyzer";
import FormulaCalculator from "./components/FormulaCalculator";
import { AlertCircle, CheckCircle2, RotateCcw, Sun, Moon } from "lucide-react";
import { Textarea } from "./components/ui/textarea";
import { Label } from "./components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

interface BalanceSheetItemData {
  id: string;
  label: string;
  value: number;
  level: number;
  children?: BalanceSheetItemData[];
}

const createEmptyAttivoData = (): BalanceSheetItemData[] => [
  {
    id: "crediti-soci",
    label: "A. Crediti v/soci",
    value: 0,
    level: 0,
  },
  {
    id: "immobilizzazioni",
    label: "B. Immobilizzazioni",
    value: 0,
    level: 0,
    children: [
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
    label: "C. Attivo circolante",
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
    ],
  },
  {
    id: "ratei-risconti-attivi",
    label: "D. Ratei e risconti attivi",
    value: 0,
    level: 0,
  },
];

const createEmptyPassivoData = (): BalanceSheetItemData[] => [
  {
    id: "patrimonio-netto",
    label: "A. PATRIMONIO NETTO",
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
            id: "riserva-legale",
            label: "Riserva legale",
            value: 0,
            level: 2,
          },
          {
            id: "altre-riserve",
            label: "Altre riserve",
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
      },
    ],
  },
  {
    id: "fondi-debiti-mlt",
    label: "B. FONDI E DEBITI A MEDIO/LUNGO TERMINE",
    value: 0,
    level: 0,
    children: [
      {
        id: "fondi-rischi",
        label: "Fondi per rischi e oneri",
        value: 0,
        level: 1,
      },
      {
        id: "tfr",
        label: "Trattamento di fine rapporto",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-finanziari-mlt",
        label: "Debiti finanziari a medio/lungo termine",
        value: 0,
        level: 1,
        children: [
          {
            id: "mutui",
            label: "Mutui",
            value: 0,
            level: 2,
          },
          {
            id: "obbligazioni",
            label: "Obbligazioni",
            value: 0,
            level: 2,
          },
        ],
      },
    ],
  },
  {
    id: "debiti-breve",
    label: "C. DEBITI A BREVE TERMINE",
    value: 0,
    level: 0,
    children: [
      {
        id: "debiti-fornitori",
        label: "Debiti verso fornitori",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-bancari-breve",
        label: "Debiti verso banche",
        value: 0,
        level: 1,
      },
      {
        id: "debiti-tributari",
        label: "Debiti tributari",
        value: 0,
        level: 1,
      },
      {
        id: "altri-debiti",
        label: "Altri debiti",
        value: 0,
        level: 1,
      },
    ],
  },
  {
    id: "ratei-risconti-passivi",
    label: "D. RATEI E RISCONTI PASSIVI",
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
    label: "Avanzo/disavanzo economico",
    value: 0,
    level: 0,
  },
];

export default function App() {
  // ─── Loading screen state ───
  type LoadingPhase = "loading" | "login" | "brand" | "shrink" | "done";
  const [phase, setPhase] = useState<LoadingPhase>(() => {
    // Skip loading if user already logged in this session
    const stored = localStorage.getItem("hrdn_user");
    return stored ? "done" : "loading";
  });
  const [userName, setUserName] = useState(() => {
    const stored = localStorage.getItem("hrdn_user");
    return stored ? JSON.parse(stored) : { nome: "", cognome: "" };
  });
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
    localStorage.setItem("hrdn_user", JSON.stringify(user));
    setUserName(user);
    setPhase("brand");
  };

  const showLoadingScreen = phase !== "done";

  // ─── App state ───
  const [companyType, setCompanyType] = useState<"industrial" | "mercantile">("industrial");
  const [exerciseText, setExerciseText] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  
  const [attivoData, setAttivoData] = useState<BalanceSheetItemData[]>(createEmptyAttivoData());
  const [passivoData, setPassivoData] = useState<BalanceSheetItemData[]>(createEmptyPassivoData());

  // N / N-1 year values for Attivo main categories
  const [attivoValuesN, setAttivoValuesN] = useState<Record<string, number>>({});
  const [attivoValuesN1, setAttivoValuesN1] = useState<Record<string, number>>({});

  // N / N-1 year values for Passivo main categories
  const [passivoValuesN, setPassivoValuesN] = useState<Record<string, number>>({});
  const [passivoValuesN1, setPassivoValuesN1] = useState<Record<string, number>>({});

  // Manual total overrides (used when total is known before categories)
  const [attivoTotalOverrideN, setAttivoTotalOverrideN] = useState(0);
  const [attivoTotalOverrideN1, setAttivoTotalOverrideN1] = useState(0);
  const [passivoTotalOverrideN, setPassivoTotalOverrideN] = useState(0);
  const [passivoTotalOverrideN1, setPassivoTotalOverrideN1] = useState(0);

  // Conto Economico data and year values
  const [contoEconomicoData, setContoEconomicoData] = useState<BalanceSheetItemData[]>(createEmptyContoEconomicoData());
  const [ceValuesN, setCeValuesN] = useState<Record<string, number>>({});
  const [ceValuesN1, setCeValuesN1] = useState<Record<string, number>>({});
  const [ceTotalOverrideN, setCeTotalOverrideN] = useState(0);
  const [ceTotalOverrideN1, setCeTotalOverrideN1] = useState(0);

  // Financial structure analysis (lifted from CompanyAnalysisPanel)
  const [customStructure, setCustomStructure] = useState<FinancialStructure>(
    () => getDefaultStructure(companyType)
  );

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
  const totalAttivo = autoSumAttivoN > 0 ? autoSumAttivoN : attivoTotalOverrideN;
  const totalPassivo = autoSumPassivoN > 0 ? autoSumPassivoN : passivoTotalOverrideN;
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
      <nav className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 ${
        darkMode
          ? "bg-[#1e293b]/90 border-slate-700"
          : "bg-white/80 border-gray-200"
      }`}>
        <div className="max-w-[1920px] mx-auto px-6 max-[617px]:px-3 h-14 max-[617px]:h-12 flex items-center justify-between">
          {/* Shine brand text — UIverse by neerajbaniwal */}
          <span className="btn-shine">hrdn design</span>
          <div className="flex items-center gap-3 max-[617px]:gap-2">
            {/* User Profile Button — UIverse by reglobby */}
            <button className="user-profile">
              <div className="user-profile-inner">
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
          </div>
        </div>
      </nav>

      <div className="max-w-[1920px] mx-auto p-6 max-[617px]:p-3">
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
          <FormulaCalculator immobilizzazioniPercent={customStructure.immobilizzazioni} />
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
            <BalanceSheetSection
              title="ATTIVO"
              items={attivoData}
              onValueChange={handleAttivoChange}
              themeColor="#2563eb"
              themeColorLight="#93c5fd"
              showYearColumns
              darkMode={darkMode}
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
            <BalanceSheetSection
              title="PASSIVO E PN"
              items={passivoData}
              onValueChange={handlePassivoChange}
              themeColor="#7c3aed"
              themeColorLight="#c4b5fd"
              showYearColumns
              darkMode={darkMode}
              valuesN={passivoValuesN}
              valuesN1={passivoValuesN1}
              onChangeN={(id, v) => setPassivoValuesN((prev) => ({ ...prev, [id]: v }))}
              onChangeN1={(id, v) => setPassivoValuesN1((prev) => ({ ...prev, [id]: v }))}
              structureBar={[
                { id: "patrimonio-netto", percent: customStructure.patrimonioNetto, color: companyType === "industrial" ? "#1d4ed8" : "#15803d" },
                { id: "fondi-debiti-mlt", percent: customStructure.debitiMLT, color: companyType === "industrial" ? "#3b82f6" : "#22c55e" },
                { id: "debiti-breve", percent: customStructure.debitiBreve, color: companyType === "industrial" ? "#93c5fd" : "#86efac" },
              ]}
              totalOverrideN={passivoTotalOverrideN}
              totalOverrideN1={passivoTotalOverrideN1}
              onTotalChangeN={setPassivoTotalOverrideN}
              onTotalChangeN1={setPassivoTotalOverrideN1}
            />
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
                      €{totalAttivo.toLocaleString("it-IT")}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs mb-1 ${darkMode ? "text-slate-400" : "text-gray-600"}`}>Totale Passivo</div>
                    <div className="text-xl max-[617px]:text-base font-bold text-purple-600">
                      €{totalPassivo.toLocaleString("it-IT")}
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
                        : `€${Math.abs(difference).toLocaleString("it-IT")}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Panel - right-aligned, compact */}
          <div className="flex flex-col md:flex-row gap-6 max-[617px]:gap-4">
            {/* Conto Economico */}
            <div className="order-2 md:order-1 md:basis-2/3 md:max-w-[66.666%] flex-shrink-0">
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
                valuesN={ceValuesN}
                valuesN1={ceValuesN1}
                onChangeN={(id, v) => setCeValuesN((prev) => ({ ...prev, [id]: v }))}
                onChangeN1={(id, v) => setCeValuesN1((prev) => ({ ...prev, [id]: v }))}
                totalOverrideN={ceTotalOverrideN}
                totalOverrideN1={ceTotalOverrideN1}
                onTotalChangeN={setCeTotalOverrideN}
                onTotalChangeN1={setCeTotalOverrideN1}
                startCollapsed
              />
            </div>
            {/* Analysis Panel */}
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
    </div>
    </>
  );
}
