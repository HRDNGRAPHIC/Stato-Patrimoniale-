import { useState } from "react";
import { Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { useCurrency } from "../contexts/CurrencyContext";

interface DebtItem {
  id: string;
  name: string;
  totalAmount: number;
}

interface ClassifiedDebt {
  id: string;
  name: string;
  totalAmount: number;
  classification: "short" | "long" | "mixed";
  longTermAmount?: number;
}

interface DebtClassificationProps {
  /** Debiti disponibili dalla card Passivo */
  availableDebts: DebtItem[];
  /** Dark mode */
  darkMode?: boolean;
  /** Callback quando la classificazione cambia */
  onChange?: (debts: ClassifiedDebt[]) => void;
}

export function DebtClassification({ availableDebts, darkMode = false, onChange }: DebtClassificationProps) {
  const [selectedDebtIds, setSelectedDebtIds] = useState<Set<string>>(new Set());
  const [classifiedDebts, setClassifiedDebts] = useState<Map<string, ClassifiedDebt>>(new Map());
  const { formatCurrency } = useCurrency();

  const handleDebtSelection = (debtId: string, checked: boolean) => {
    const newSelected = new Set(selectedDebtIds);
    if (checked) {
      newSelected.add(debtId);
      // Inizializza con classificazione breve di default
      const debt = availableDebts.find(d => d.id === debtId);
      if (debt) {
        const newMap = new Map(classifiedDebts);
        newMap.set(debtId, {
          id: debt.id,
          name: debt.name,
          totalAmount: debt.totalAmount,
          classification: "short",
        });
        setClassifiedDebts(newMap);
        onChange?.(Array.from(newMap.values()));
      }
    } else {
      newSelected.delete(debtId);
      const newMap = new Map(classifiedDebts);
      newMap.delete(debtId);
      setClassifiedDebts(newMap);
      onChange?.(Array.from(newMap.values()));
    }
    setSelectedDebtIds(newSelected);
  };

  const handleTotalAmountChange = (debtId: string, newTotal: number) => {
    const newMap = new Map(classifiedDebts);
    const existing = newMap.get(debtId);
    if (existing) {
      // Se l'importo oltre 12 mesi è maggiore del nuovo totale, aggiustalo
      const longTermAmount = existing.longTermAmount || 0;
      const adjustedLongTerm = existing.classification === "mixed" 
        ? Math.min(longTermAmount, newTotal)
        : longTermAmount;
      
      newMap.set(debtId, {
        ...existing,
        totalAmount: newTotal,
        longTermAmount: adjustedLongTerm,
      });
      setClassifiedDebts(newMap);
      onChange?.(Array.from(newMap.values()));
    }
  };

  const handleClassificationChange = (debtId: string, classification: "short" | "long" | "mixed") => {
    const newMap = new Map(classifiedDebts);
    const existing = newMap.get(debtId);
    if (existing) {
      newMap.set(debtId, {
        ...existing,
        classification,
        longTermAmount: classification === "mixed" ? existing.longTermAmount || 0 : undefined,
      });
      setClassifiedDebts(newMap);
      onChange?.(Array.from(newMap.values()));
    }
  };

  const handleLongTermAmountChange = (debtId: string, amount: number) => {
    const newMap = new Map(classifiedDebts);
    const existing = newMap.get(debtId);
    if (existing) {
      newMap.set(debtId, {
        ...existing,
        longTermAmount: amount,
      });
      setClassifiedDebts(newMap);
      onChange?.(Array.from(newMap.values()));
    }
  };

  const getShortTermAmount = (debt: ClassifiedDebt): number => {
    if (debt.classification === "short") return debt.totalAmount;
    if (debt.classification === "long") return 0;
    return debt.totalAmount - (debt.longTermAmount || 0);
  };

  const getLongTermAmount = (debt: ClassifiedDebt): number => {
    if (debt.classification === "long") return debt.totalAmount;
    if (debt.classification === "short") return 0;
    return debt.longTermAmount || 0;
  };

  // Calculate aggregated totals
  const calculateTotals = () => {
    let totalShortTerm = 0;
    let totalLongTerm = 0;

    Array.from(classifiedDebts.values()).forEach(debt => {
      totalShortTerm += getShortTermAmount(debt);
      totalLongTerm += getLongTermAmount(debt);
    });

    return { totalShortTerm, totalLongTerm, total: totalShortTerm + totalLongTerm };
  };

  const totals = calculateTotals();
  const selectedDebts = availableDebts.filter(d => selectedDebtIds.has(d.id));
  const unselectedDebts = availableDebts.filter(d => !selectedDebtIds.has(d.id));

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Clock className={`w-5 h-5 ${darkMode ? "text-amber-400" : "text-amber-600"}`} />
        <h3 className={`text-base font-bold ${darkMode ? "text-slate-100" : "text-gray-800"}`}>
          Classificazione Debiti per Scadenza
        </h3>
      </div>

      {/* Info Box */}
      <div className={`mb-3 p-2 rounded text-xs ${darkMode ? "bg-blue-900/30 border border-blue-700/50 text-blue-300" : "bg-blue-50 border border-blue-200 text-blue-700"}`}>
        <strong>Logica:</strong> Breve termine &lt;12 mesi | Medio/Lungo termine &gt;12 mesi
      </div>

      {/* Available Debts Selection */}
      {unselectedDebts.length > 0 && (
        <div className="mb-4">
          <Label className={`text-xs font-semibold mb-2 block ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
            Seleziona Debiti da Classificare
          </Label>
          <div className={`space-y-1 max-h-32 overflow-y-auto rounded p-2 ${darkMode ? "bg-slate-700/50" : "bg-gray-50"}`}>
            {unselectedDebts.map(debt => (
              <div key={debt.id} className="flex items-center gap-2">
                <Checkbox
                  id={`debt-${debt.id}`}
                  checked={false}
                  onCheckedChange={(checked) => handleDebtSelection(debt.id, checked as boolean)}
                />
                <label
                  htmlFor={`debt-${debt.id}`}
                  className={`flex-1 text-xs cursor-pointer ${darkMode ? "text-slate-300" : "text-gray-700"}`}
                >
                  {debt.name}
                  <span className={`ml-2 font-semibold ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                    €{formatCurrency(debt.totalAmount)}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classified Debts */}
      {selectedDebts.length > 0 && (
        <div className="space-y-3">
          <Label className={`text-xs font-semibold block ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
            Debiti Selezionati ({selectedDebts.length})
          </Label>

          {selectedDebts.map(debt => {
            const classified = classifiedDebts.get(debt.id);
            if (!classified) return null;

            const shortTerm = getShortTermAmount(classified);
            const longTerm = getLongTermAmount(classified);

            return (
              <div
                key={debt.id}
                className={`rounded-lg p-3 border ${
                  darkMode ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-200"
                }`}
              >
                {/* Debt Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                      {debt.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Label className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                        Importo:
                      </Label>
                      <Input
                        type="number"
                        value={classified.totalAmount}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          handleTotalAmountChange(debt.id, value);
                        }}
                        className={`w-32 h-7 text-xs ${
                          darkMode ? "bg-slate-600 border-slate-500" : "bg-white border-gray-300"
                        }`}
                        step="100"
                        min="0"
                      />
                      <span className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-600"}`}>€</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDebtSelection(debt.id, false)}
                    className={`text-xs px-2 py-1 rounded ${
                      darkMode ? "text-red-400 hover:bg-red-900/30" : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    Rimuovi
                  </button>
                </div>

                {/* Classification Options */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    onClick={() => handleClassificationChange(debt.id, "short")}
                    className={`text-xs py-2 rounded font-medium transition-colors ${
                      classified.classification === "short"
                        ? darkMode
                          ? "bg-green-600 text-white"
                          : "bg-green-500 text-white"
                        : darkMode
                        ? "bg-slate-600 text-slate-300 hover:bg-slate-500"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    &lt;12 mesi
                  </button>
                  <button
                    onClick={() => handleClassificationChange(debt.id, "long")}
                    className={`text-xs py-2 rounded font-medium transition-colors ${
                      classified.classification === "long"
                        ? darkMode
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : darkMode
                        ? "bg-slate-600 text-slate-300 hover:bg-slate-500"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    &gt;12 mesi
                  </button>
                  <button
                    onClick={() => handleClassificationChange(debt.id, "mixed")}
                    className={`text-xs py-2 rounded font-medium transition-colors ${
                      classified.classification === "mixed"
                        ? darkMode
                          ? "bg-amber-600 text-white"
                          : "bg-amber-500 text-white"
                        : darkMode
                        ? "bg-slate-600 text-slate-300 hover:bg-slate-500"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Misto
                  </button>
                </div>

                {/* Mixed Classification Slider */}
                {classified.classification === "mixed" && (
                  <div className="space-y-2">
                    <Label className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                      Di cui oltre 12 mesi: €{formatCurrency(classified.longTermAmount || 0)}
                    </Label>
                    <Slider
                      value={[classified.longTermAmount || 0]}
                      min={0}
                      max={debt.totalAmount}
                      step={100}
                      onValueChange={(values) => handleLongTermAmountChange(debt.id, values[0])}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Summary */}
                <div className={`mt-2 pt-2 border-t text-xs ${darkMode ? "border-slate-600" : "border-gray-300"}`}>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className={darkMode ? "text-slate-400" : "text-gray-600"}>Breve termine:</span>
                      <span className={`ml-1 font-semibold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                        €{formatCurrency(shortTerm)}
                      </span>
                    </div>
                    <div>
                      <span className={darkMode ? "text-slate-400" : "text-gray-600"}>M/L termine:</span>
                      <span className={`ml-1 font-semibold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                        €{formatCurrency(longTerm)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Aggregated Totals */}
          <div className={`mt-4 p-3 rounded-lg border-2 ${
            darkMode ? "bg-slate-700/70 border-slate-500" : "bg-blue-50 border-blue-300"
          }`}>
            <div className={`text-sm font-bold mb-2 ${darkMode ? "text-slate-100" : "text-gray-900"}`}>
              Totali Aggregati
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className={`${darkMode ? "text-slate-400" : "text-gray-600"}`}>Breve termine</div>
                <div className={`text-lg font-bold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                  €{formatCurrency(totals.totalShortTerm)}
                </div>
              </div>
              <div>
                <div className={`${darkMode ? "text-slate-400" : "text-gray-600"}`}>M/L termine</div>
                <div className={`text-lg font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                  €{formatCurrency(totals.totalLongTerm)}
                </div>
              </div>
              <div>
                <div className={`${darkMode ? "text-slate-400" : "text-gray-600"}`}>Totale</div>
                <div className={`text-lg font-bold ${darkMode ? "text-slate-100" : "text-gray-900"}`}>
                  €{formatCurrency(totals.total)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedDebts.length === 0 && (
        <div className={`text-center py-8 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
          <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Seleziona i debiti da classificare</p>
        </div>
      )}
    </div>
  );
}
