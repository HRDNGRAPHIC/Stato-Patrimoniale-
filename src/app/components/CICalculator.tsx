import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "./ui/button";
import { useCurrency } from "../contexts/CurrencyContext";

interface CICalculatorProps {
  /** Valore Capitale Investito dal calculator */
  ciValue: number;
  /** Percentuali della struttura */
  structure: {
    immobilizzazioni: number;
    attivoCircolante: number;
    patrimonioNetto: number;
    debitiMLT: number;
    debitiBreve: number;
  };
  /** Tipo di azienda per i colori */
  companyType: "industrial" | "mercantile";
  /** Callback quando l'utente calcola un valore */
  onCalculate: (target: string, value: number) => void;
  /** Dark mode */
  darkMode?: boolean;
}

export function CICalculator({ ciValue, structure, companyType, onCalculate, darkMode = false }: CICalculatorProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const { formatCurrency } = useCurrency();

  const getColors = () => {
    if (companyType === "industrial") {
      return {
        immobilizzazioni: "#2563eb",
        attivoCircolante: "#60a5fa",
        patrimonioNetto: "#2563eb", // Blu per industriale
        debitiMLT: "#3b82f6",
        debitiBreve: "#93c5fd",
      };
    } else {
      return {
        immobilizzazioni: "#16a34a",
        attivoCircolante: "#4ade80",
        patrimonioNetto: "#16a34a", // Verde per mercantile
        debitiMLT: "#22c55e",
        debitiBreve: "#86efac",
      };
    }
  };

  const colors = getColors();

  const segments = [
    { id: "immobilizzazioni", label: "Immobilizzazioni", shortLabel: "Immob.", percent: structure.immobilizzazioni, color: colors.immobilizzazioni, target: "immobilizzazioni-nette", side: "attivo" },
    { id: "attivo-circolante", label: "Attivo Circolante", shortLabel: "Att. Circ.", percent: structure.attivoCircolante, color: colors.attivoCircolante, target: "attivo-circolante", side: "attivo" },
    { id: "patrimonio-netto", label: "Patrimonio Netto", shortLabel: "Patr. Netto", percent: structure.patrimonioNetto, color: colors.patrimonioNetto, target: "patrimonio-netto", side: "passivo" },
    { id: "debiti-mlt", label: "Debiti M/LT", shortLabel: "Deb. MLT", percent: structure.debitiMLT, color: colors.debitiMLT, target: "debiti-mlt", side: "passivo" },
    { id: "debiti-breve", label: "Debiti Breve", shortLabel: "Deb. Breve", percent: structure.debitiBreve, color: colors.debitiBreve, target: "debiti-breve", side: "passivo" },
  ];

  const attivoSegments = segments.filter(s => s.side === "attivo");
  const passivoSegments = segments.filter(s => s.side === "passivo");

  const calculatedValue = selectedSegment
    ? Math.round(ciValue * (segments.find((s) => s.id === selectedSegment)?.percent ?? 0) / 100)
    : 0;

  const handleCalculate = () => {
    if (!selectedSegment) return;
    const segment = segments.find((s) => s.id === selectedSegment);
    if (segment) {
      onCalculate(segment.target, calculatedValue);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Calculator className={`w-5 h-5 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
        <h3 className={`text-base font-bold ${darkMode ? "text-slate-100" : "text-gray-800"}`}>
          Calcolo da Capitale Investito
        </h3>
      </div>

      {/* Bilancio Chart - Two Columns (Flex-1 to expand) */}
      <div className={`flex-1 rounded-lg p-3 mb-3 flex flex-col ${darkMode ? "bg-slate-700/50" : "bg-gray-50"}`}>
        <div className="text-xs font-semibold mb-2 text-center">
          <span className={darkMode ? "text-slate-300" : "text-gray-700"}>Struttura Aziendale</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 flex-1">
          {/* ATTIVO */}
          <div className="flex flex-col h-full">
            <div className={`text-xs font-bold text-center mb-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
              ATTIVO
            </div>
            <div className="flex flex-col gap-1 flex-1">
              {attivoSegments.map((segment) => {
                const isSelected = selectedSegment === segment.id;
                return (
                  <button
                    key={segment.id}
                    onClick={() => setSelectedSegment(segment.id)}
                    className={`relative transition-all rounded ${
                      isSelected ? "ring-2 ring-yellow-400 ring-offset-2" : "hover:brightness-110"
                    }`}
                    style={{
                      backgroundColor: segment.color,
                      minHeight: "60px",
                      flexGrow: segment.percent,
                      flexShrink: 0,
                      flexBasis: 0,
                    }}
                  >
                    <div className="flex flex-col items-center justify-center h-full text-white text-xs font-semibold px-1 py-1">
                      <span className="drop-shadow line-clamp-1">{segment.shortLabel}</span>
                      <span className="text-[10px] drop-shadow">{segment.percent}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASSIVO */}
          <div className="flex flex-col h-full">
            <div className={`text-xs font-bold text-center mb-2 ${darkMode ? "text-purple-400" : "text-purple-600"}`}>
              PASSIVO
            </div>
            <div className="flex flex-col gap-1 flex-1">
              {passivoSegments.map((segment) => {
                const isSelected = selectedSegment === segment.id;
                return (
                  <button
                    key={segment.id}
                    onClick={() => setSelectedSegment(segment.id)}
                    className={`relative transition-all rounded ${
                      isSelected ? "ring-2 ring-yellow-400 ring-offset-2" : "hover:brightness-110"
                    }`}
                    style={{
                      backgroundColor: segment.color,
                      minHeight: "60px",
                      flexGrow: segment.percent,
                      flexShrink: 0,
                      flexBasis: 0,
                    }}
                  >
                    <div className="flex flex-col items-center justify-center h-full text-white text-xs font-semibold px-1 py-1">
                      <span className="drop-shadow line-clamp-1">{segment.shortLabel}</span>
                      <span className="text-[10px] drop-shadow">{segment.percent}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Formula Display */}
      <div className="flex items-center gap-2 flex-wrap text-sm mb-3">
          <div>
            <div className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Ci</div>
            <div className={`text-base font-bold ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
              {ciValue > 0 ? `€${formatCurrency(ciValue)}` : "—"}
            </div>
          </div>

          {selectedSegment && (
            <>
              <div className="text-base font-bold">×</div>
              <div>
                <div className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  {segments.find((s) => s.id === selectedSegment)?.shortLabel}
                </div>
                <div className={`text-base font-bold ${darkMode ? "text-purple-400" : "text-purple-600"}`}>
                  {segments.find((s) => s.id === selectedSegment)?.percent}%
                </div>
              </div>

              <div className="text-base font-bold">=</div>
              <div>
                <div className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Risultato</div>
                <div className={`text-base font-bold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                  €{formatCurrency(calculatedValue)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Calculate Button */}
        <Button
          onClick={handleCalculate}
          disabled={ciValue === 0 || !selectedSegment}
          size="sm"
          className={`w-full ${darkMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-500 hover:bg-indigo-600"} text-white`}
        >
          <Calculator className="w-3 h-3 mr-1" />
          Calcola e Applica
        </Button>
    </div>
  );
}
