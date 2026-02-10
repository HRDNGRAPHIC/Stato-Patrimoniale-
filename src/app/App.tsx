import { useState } from "react";
import { BalanceSheetSection } from "./components/BalanceSheetSection";
import { CompanyAnalysisPanel, getDefaultStructure, type FinancialStructure } from "./components/CompanyAnalysisPanel";
import ExerciseAnalyzer from "./components/ExerciseAnalyzer";
import FormulaCalculator from "./components/FormulaCalculator";
import { AlertCircle, CheckCircle2, RotateCcw, Sun, Moon } from "lucide-react";
import { Textarea } from "./components/ui/textarea";
import { Label } from "./components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Button } from "./components/ui/button";

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

export default function App() {
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

  const totalAttivo = sumSectionN(attivoData, attivoValuesN);
  const totalPassivo = sumSectionN(passivoData, passivoValuesN);
  const isBalanced = Math.abs(totalAttivo - totalPassivo) < 1;
  const difference = totalAttivo - totalPassivo;

  const [showResetDialog, setShowResetDialog] = useState(false);

  const resetAllData = () => {
    setAttivoData(createEmptyAttivoData());
    setPassivoData(createEmptyPassivoData());
    setAttivoValuesN({});
    setAttivoValuesN1({});
    setPassivoValuesN({});
    setPassivoValuesN1({});
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
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-[#0f172a]" : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"}`}>
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 ${
        darkMode
          ? "bg-[#1e293b]/90 border-slate-700"
          : "bg-white/80 border-gray-200"
      }`}>
        <div className="max-w-[1920px] mx-auto px-6 h-14 flex items-center justify-end">
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
      </nav>

      <div className="max-w-[1920px] mx-auto p-6">
        {/* Exercise Text Area */}
        <div className={`mb-6 rounded-xl shadow-lg p-6 border transition-colors duration-300 ${
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
            className={`min-h-[100px] text-sm resize-none ${darkMode ? "bg-[#0f172a] border-slate-600 text-slate-200 placeholder:text-slate-500" : ""}`}
          />
        </div>

        {/* Exercise Analyzer */}
        <ExerciseAnalyzer exerciseText={exerciseText} />

        {/* Formula Calculator */}
        <div className="mt-6">
          <FormulaCalculator />
        </div>

        {/* Reset Button */}
        <div className="my-6 flex items-center justify-end pr-6">
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
        <div className="grid grid-cols-1 gap-6">
          {/* Balance Sheet - full width/height area */}
          <div className="w-full min-h-screen mx-0 px-0 grid md:grid-cols-2 gap-6">
            <BalanceSheetSection
              title="ATTIVO"
              items={attivoData}
              onValueChange={handleAttivoChange}
              themeColor="#2563eb"
              showYearColumns
              darkMode={darkMode}
              valuesN={attivoValuesN}
              valuesN1={attivoValuesN1}
              onChangeN={(id, v) => setAttivoValuesN((prev) => ({ ...prev, [id]: v }))}
              onChangeN1={(id, v) => setAttivoValuesN1((prev) => ({ ...prev, [id]: v }))}
              structureBar={[
                { id: "immobilizzazioni", percent: customStructure.immobilizzazioni, color: "#2B7FFF" },
                { id: "attivo-circolante", percent: customStructure.attivoCircolante, color: "#1A56DB" },
              ]}
            />
            <BalanceSheetSection
              title="PASSIVO E PATRIMONIO NETTO"
              items={passivoData}
              onValueChange={handlePassivoChange}
              themeColor="#7c3aed"
              showYearColumns
              darkMode={darkMode}
              valuesN={passivoValuesN}
              valuesN1={passivoValuesN1}
              onChangeN={(id, v) => setPassivoValuesN((prev) => ({ ...prev, [id]: v }))}
              onChangeN1={(id, v) => setPassivoValuesN1((prev) => ({ ...prev, [id]: v }))}
              structureBar={[
                { id: "patrimonio-netto", percent: customStructure.patrimonioNetto, color: "#6EE7B7" },
                { id: "fondi-debiti-mlt", percent: customStructure.debitiMLT, color: "#34D399" },
                { id: "debiti-breve", percent: customStructure.debitiBreve, color: "#10B981" },
              ]}
            />
          </div>

          {/* Balance Check */}
          <div>
            <div
              className={`rounded-xl shadow-lg p-6 border-2 transition-all ${
                isBalanced
                  ? darkMode ? "bg-green-900/30 border-green-600" : "bg-green-50 border-green-500"
                  : darkMode ? "bg-red-900/30 border-red-600" : "bg-red-50 border-red-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {isBalanced ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  )}
                  <div>
                    <h3 className={`text-lg font-bold ${darkMode ? "text-slate-100" : "text-gray-900"}`}>
                      Verifica di Quadratura
                    </h3>
                    <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                      {isBalanced
                        ? "Il bilancio è correttamente bilanciato"
                        : "Il bilancio presenta uno sbilancio"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-8 text-center">
                  <div>
                    <div className={`text-xs mb-1 ${darkMode ? "text-slate-400" : "text-gray-600"}`}>Totale Attivo</div>
                    <div className="text-xl font-bold text-blue-600">
                      €{totalAttivo.toLocaleString("it-IT")}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs mb-1 ${darkMode ? "text-slate-400" : "text-gray-600"}`}>Totale Passivo</div>
                    <div className="text-xl font-bold text-purple-600">
                      €{totalPassivo.toLocaleString("it-IT")}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs mb-1 ${darkMode ? "text-slate-400" : "text-gray-600"}`}>Differenza</div>
                    <div
                      className={`text-xl font-bold ${
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
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 lg:w-2/5 xl:w-1/3">
              <CompanyAnalysisPanel
                companyType={companyType}
                onCompanyTypeChange={setCompanyType}
                onApplyPreset={applyPreset}
                customStructure={customStructure}
                onStructureChange={handleStructureChange}
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
