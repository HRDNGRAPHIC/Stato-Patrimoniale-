import { useState } from "react";
import { BalanceSheetSection } from "./components/BalanceSheetSection";
import { CompanyAnalysisPanel } from "./components/CompanyAnalysisPanel";
import ExerciseAnalyzer from "./components/ExerciseAnalyzer";
import FormulaCalculator from "./components/FormulaCalculator";
import { AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { Textarea } from "./components/ui/textarea";
import { Label } from "./components/ui/label";

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
    label: "A. CREDITI V/ SOCI",
    value: 0,
    level: 0,
  },
  {
    id: "immobilizzazioni",
    label: "A. IMMOBILIZZAZIONI",
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
    label: "B. ATTIVO CIRCOLANTE",
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
    label: "C. RATEI E RISCONTI ATTIVI",
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
  const [selectedYear, setSelectedYear] = useState<"N" | "N-1">("N");
  const [exerciseText, setExerciseText] = useState("");
  
  const [attivoDataN, setAttivoDataN] = useState<BalanceSheetItemData[]>(createEmptyAttivoData());
  const [passivoDataN, setPassivoDataN] = useState<BalanceSheetItemData[]>(createEmptyPassivoData());
  
  const [attivoDataN1, setAttivoDataN1] = useState<BalanceSheetItemData[]>(createEmptyAttivoData());
  const [passivoDataN1, setPassivoDataN1] = useState<BalanceSheetItemData[]>(createEmptyPassivoData());

  const currentAttivoData = selectedYear === "N" ? attivoDataN : attivoDataN1;
  const currentPassivoData = selectedYear === "N" ? passivoDataN : passivoDataN1;
  const setCurrentAttivoData = selectedYear === "N" ? setAttivoDataN : setAttivoDataN1;
  const setCurrentPassivoData = selectedYear === "N" ? setPassivoDataN : setPassivoDataN1;

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
    setCurrentAttivoData(updateValue(currentAttivoData));
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
    setCurrentPassivoData(updateValue(currentPassivoData));
  };

  const calculateTotal = (items: BalanceSheetItemData[]): number => {
    return items.reduce((sum, item) => {
      if (item.children && item.children.length > 0) {
        return sum + calculateTotal(item.children);
      }
      return sum + item.value;
    }, 0);
  };

  const totalAttivo = calculateTotal(currentAttivoData);
  const totalPassivo = calculateTotal(currentPassivoData);
  const isBalanced = Math.abs(totalAttivo - totalPassivo) < 1;
  const difference = totalAttivo - totalPassivo;

  const resetAllData = () => {
    setAttivoDataN(createEmptyAttivoData());
    setPassivoDataN(createEmptyPassivoData());
    setAttivoDataN1(createEmptyAttivoData());
    setPassivoDataN1(createEmptyPassivoData());
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

      setCurrentAttivoData(attivoWithValues);
      setCurrentPassivoData(passivoWithValues);
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

      setCurrentAttivoData(attivoWithValues);
      setCurrentPassivoData(passivoWithValues);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Exercise Text Area */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <Label htmlFor="exercise-text" className="text-sm font-semibold text-gray-700 mb-2 block">
            Testo dell'Esercizio
          </Label>
          <Textarea
            id="exercise-text"
            placeholder="Inserire qui il testo dell'esercizio, i vincoli, le ipotesi e i dati forniti dal docente..."
            value={exerciseText}
            onChange={(e) => setExerciseText(e.target.value)}
            className="min-h-[100px] text-sm resize-none"
          />
        </div>

        {/* Exercise Analyzer */}
        <ExerciseAnalyzer exerciseText={exerciseText} />

        {/* Formula Calculator */}
        <div className="mt-6">
          <FormulaCalculator />
        </div>

        {/* Year Selector and Reset Button */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Label className="text-sm font-semibold text-gray-700">Anno di riferimento:</Label>
            <div className="inline-flex rounded-lg border-2 border-gray-300 bg-white p-1">
              <button
                onClick={() => setSelectedYear("N")}
                className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${
                  selectedYear === "N"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Anno N
              </button>
              <button
                onClick={() => setSelectedYear("N-1")}
                className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${
                  selectedYear === "N-1"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Anno N-1
              </button>
            </div>
          </div>
          
          <button
            onClick={resetAllData}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Dati
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          {/* Balance Sheet */}
          <div className="grid md:grid-cols-2 gap-6" style={{ height: "calc(100vh - 380px)", minHeight: "700px" }}>
            <BalanceSheetSection
              title="ATTIVO"
              items={currentAttivoData}
              onValueChange={handleAttivoChange}
              themeColor="#2563eb"
            />
            <BalanceSheetSection
              title="PASSIVO E PATRIMONIO NETTO"
              items={currentPassivoData}
              onValueChange={handlePassivoChange}
              themeColor="#7c3aed"
            />
          </div>

          {/* Analysis Panel */}
          <div>
            <CompanyAnalysisPanel
              companyType={companyType}
              onCompanyTypeChange={setCompanyType}
              onApplyPreset={applyPreset}
            />
          </div>
        </div>

        {/* Balance Check */}
        <div className="mt-6">
          <div
            className={`rounded-xl shadow-lg p-6 border-2 transition-all ${
              isBalanced
                ? "bg-green-50 border-green-500"
                : "bg-red-50 border-red-500"
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
                  <h3 className="text-lg font-bold text-gray-900">
                    Verifica di Quadratura - Anno {selectedYear}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isBalanced
                      ? "Il bilancio è correttamente bilanciato"
                      : "Il bilancio presenta uno sbilancio"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Totale Attivo</div>
                  <div className="text-xl font-bold text-blue-600">
                    €{totalAttivo.toLocaleString("it-IT")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Totale Passivo</div>
                  <div className="text-xl font-bold text-purple-600">
                    €{totalPassivo.toLocaleString("it-IT")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Differenza</div>
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
      </div>
    </div>
  );
}
