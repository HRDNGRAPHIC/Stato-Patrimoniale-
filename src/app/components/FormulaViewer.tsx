import React, { useState } from "react";
import { Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

interface FormulaViewerProps {
  darkMode?: boolean;
}

// METRICS ORDER from FormulaCalculator
const INDICI_METRICS = ["Roe", "Roi", "Rod", "Ros", "Rai"];
const CE_METRICS = ["Ro", "Rn", "RicaviNetti", "CostiProduzione", "Imposte", "Of", "Pf"];
const ST_METRICS = ["Cp", "Ci", "Debiti", "Leverage", "IndiceRotazione", "TassoInteresse"];

const METRICS_ORDER = [...INDICI_METRICS, ...CE_METRICS, ...ST_METRICS];

// Labels from FormulaCalculator METRIC_CONFIG
const METRIC_LABELS: Record<string, string> = {
  Roe: "ROE",
  Roi: "ROI",
  Rod: "ROD",
  Ros: "ROS",
  Rai: "Reddito Ante Imposte (Rai)",
  Ro: "Reddito Operativo (Ro)",
  Rn: "Reddito Netto (Rn)",
  RicaviNetti: "Ricavi Netti",
  CostiProduzione: "Costi della produzione",
  Imposte: "Imposte",
  Of: "Oneri Finanziari (Of)",
  Pf: "Proventi Finanziari (Pf)",
  Cp: "Capitale Proprio (Cp)",
  Ci: "Capitale Investito (Ci)",
  Debiti: "Debiti (Capitale di terzi)",
  Leverage: "Leverage",
  IndiceRotazione: "Indice di Rotazione",
  TassoInteresse: "Tasso di Interesse",
};

// Formulas from FormulaCalculator
const FORMULAS: Record<string, Array<{ compact: string; extended: string }>> = {
  Ro: [
    { compact: "Ro = Roi × Ci / 100", extended: "Reddito operativo (Ro) = Roi × Ci / 100" },
    { compact: "Ro = Ricavi netti × ROS / 100", extended: "Reddito operativo (Ro) = Ricavi netti × ROS / 100" },
  ],
  Rn: [
    { compact: "Rn = Rai - imposte", extended: "Reddito netto (Rn) = Rai - imposte" },
    { compact: "Rn = Roe × Cp / 100", extended: "Reddito netto (Rn) = Roe × Cp / 100" },
  ],
  Roe: [
    { compact: "Roe = Rn / Cp × 100", extended: "Roe = Rn / Cp × 100 (reddito netto / capitale proprio)" },
  ],
  Roi: [
    { compact: "Roi = Ro / Ci × 100", extended: "Roi = Ro / Ci × 100 (reddito operativo / capitale investito)" },
  ],
  Ros: [
    { compact: "Ros = Ro / Ricavi netti × 100", extended: "Ros = Reddito operativo / Ricavi netti × 100" },
    { compact: "Ros = Roi / Indice di rotazione", extended: "ROS = ROI / Indice di rotazione" },
  ],
  Rod: [
    { compact: "Rod = Of / Debiti × 100", extended: "Rod = Oneri finanziari / Debiti × 100" },
  ],
  Ci: [
    { compact: "Ci = Ro × 100 / Roi", extended: "Capitale investito (Ci) = Ro × 100 / Roi" },
    { compact: "Ci = Cp + Debiti", extended: "Capitale investito (Ci) = Cp + Debiti (mezzi propri + capitale di terzi)" },
    { compact: "Ci = Cp × Leverage", extended: "Capitale investito (Ci) = Cp × Leverage" },
  ],
  Cp: [
    { compact: "Cp = Ci - Debiti", extended: "Capitale proprio (Cp) = Ci - Debiti (dove Ci è il totale delle attività)" },
    { compact: "Cp = Rn × 100 / Roe", extended: "Capitale proprio (Cp) = Rn × 100 / Roe" },
  ],
  Leverage: [
    { compact: "Leverage = Ci / Cp", extended: "Leverage = Ci / Cp — Nota: se = 1, l'azienda non ha debiti; se > 2, è molto indebitata." },
  ],
  Debiti: [
    { compact: "Debiti = Ci - Cp", extended: "Debiti = Ci - Cp" },
  ],
  Of: [
    { compact: "Of = Debiti × ROD / 100", extended: "Of = Debiti × ROD / 100" },
    { compact: "Of = Ro - Rai", extended: "Oneri finanziari (Of) = Ro - Rai" },
  ],
  Rai: [
    { compact: "Rai = Ro - Of", extended: "Reddito ante imposte (Rai) = Reddito operativo - Oneri finanziari (considerando eventuali proventi finanziari e rettifiche)" },
    { compact: "Rai = Rn + Imposte", extended: "Reddito ante imposte = Reddito netto + Imposte" },
  ],
  RicaviNetti: [
    { compact: "Ricavi netti = Indice di Rotazione × Ci", extended: "Ricavi netti = Indice di Rotazione × Capitale investito" },
    { compact: "Ricavi netti = Ro / Ros × 100", extended: "Ricavi netti = Reddito operativo / ROS × 100" },
  ],
  CostiProduzione: [
    { compact: "Costi Produzione = Ricavi Netti - Ro", extended: "Costi della produzione = Ricavi Netti - Reddito Operativo (Ro)" },
  ],
  Pf: [
    { compact: "Pf = Ci × Tasso di interesse / 100", extended: "Proventi Finanziari = Capitale investito × Tasso di interesse / 100" },
    { compact: "Pf = Rai - Ro + Of", extended: "Proventi Finanziari = Rai - Ro + Of" },
  ],
  TassoInteresse: [
    { compact: "Tasso interesse = Of / Debiti × 100", extended: "Tasso di Interesse = Oneri finanziari / Debiti × 100" },
  ],
  IndiceRotazione: [
    { compact: "IR = Ricavi Netti / Ci", extended: "Indice di Rotazione = Ricavi Netti / Capitale investito" },
  ],
  Imposte: [
    { compact: "Imposte = Rai - Rn", extended: "Imposte = Reddito ante imposte - Reddito netto" },
  ],
};

export const FormulaViewer: React.FC<FormulaViewerProps> = ({ darkMode = false }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Show first 4 metrics initially (Roe, Roi, Rod, Ros)
  const baseMetrics = METRICS_ORDER.slice(0, 4);
  const additionalMetrics = METRICS_ORDER.slice(4);
  const hasMore = additionalMetrics.length > 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Calculator className={`w-5 h-5 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
        <h2 className={`text-base font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          Formule Finanziarie
        </h2>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Base metrics (always visible) */}
        {baseMetrics.map((metric) => {
          const formulas = FORMULAS[metric] || [];
          if (formulas.length === 0) return null;

          return (
            <div key={metric}>
              <h3 className={`text-sm font-bold mb-2 ${
                darkMode ? "text-blue-400" : "text-blue-700"
              }`}>
                {METRIC_LABELS[metric] || metric}
              </h3>
              <div className="space-y-1.5">
                {formulas.map((formula, index) => (
                  <div
                    key={index}
                    className={`p-2.5 rounded-lg border ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${
                      darkMode ? "text-gray-100" : "text-gray-900"
                    }`}>
                      {formula.compact}
                    </div>
                    <div className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {formula.extended}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Toggle Button */}
        {hasMore && (
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="outline"
            className={`w-full mt-2 transition-all ${
              darkMode
                ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                : "border-gray-300 hover:bg-gray-50 text-gray-700"
            }`}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Mostra meno
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Mostra altro ({additionalMetrics.length} formule)
              </>
            )}
          </Button>
        )}

        {/* Additional metrics (expandable) */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-3 pt-3">
            {additionalMetrics.map((metric) => {
              const formulas = FORMULAS[metric] || [];
              if (formulas.length === 0) return null;

              return (
                <div key={metric}>
                  <h3 className={`text-sm font-bold mb-2 ${
                    darkMode ? "text-blue-400" : "text-blue-700"
                  }`}>
                    {METRIC_LABELS[metric] || metric}
                  </h3>
                  <div className="space-y-1.5">
                    {formulas.map((formula, index) => (
                      <div
                        key={index}
                        className={`p-2.5 rounded-lg border ${
                          darkMode
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className={`text-sm font-semibold mb-1 ${
                          darkMode ? "text-gray-100" : "text-gray-900"
                        }`}>
                          {formula.compact}
                        </div>
                        <div className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {formula.extended}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
