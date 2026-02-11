import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { RotateCcw, Calculator, Percent, Euro } from "lucide-react";

// Types
interface Formula {
  inputs: string[];
  compact: string;
  extended: string;
  priority: number;
}

interface MetricConfig {
  label: string;
  description: string;
  isPercentage: boolean;
  hasFormulas: boolean;
}

// Configuration
const METRIC_CONFIG: Record<string, MetricConfig> = {
  Roe: {
    label: "ROE",
    description: "Rendimento del capitale proprio",
    isPercentage: true,
    hasFormulas: true,
  },
  Roi: {
    label: "ROI",
    description: "Rendimento del capitale investito",
    isPercentage: true,
    hasFormulas: true,
  },
  Rod: {
    label: "ROD",
    description: "Costo medio del debito",
    isPercentage: true,
    hasFormulas: true,
  },
  Leverage: {
    label: "Leverage",
    description: "Rapporto d'indebitamento",
    isPercentage: false,
    hasFormulas: true,
  },
  Ros: {
    label: "ROS",
    description: "Redditività delle vendite",
    isPercentage: true,
    hasFormulas: true,
  },
  Ro: {
    label: "Reddito Operativo (Ro)",
    description: "Risultato della gestione caratteristica (Reddito operativo)",
    isPercentage: false,
    hasFormulas: true,
  },
  Rn: {
    label: "Reddito Netto (Rn)",
    description: "Utile o perdita d'esercizio (Reddito netto)",
    isPercentage: false,
    hasFormulas: true,
  },
  Cp: {
    label: "Capitale Proprio (Cp)",
    description: "Patrimonio netto (Capitale proprio)",
    isPercentage: false,
    hasFormulas: true,
  },
  Ci: {
    label: "Capitale Investito (Ci)",
    description: "Totale degli impieghi (Capitale investito)",
    isPercentage: false,
    hasFormulas: true,
  },
  V: {
    label: "Vendite (V)",
    description: "Ricavi di vendita (Vendite / Fatturato)",
    isPercentage: false,
    hasFormulas: true,
  },
  Of: {
    label: "Oneri Finanziari (Of)",
    description: "Interessi passivi e altri costi del debito (Oneri finanziari)",
    isPercentage: false,
    hasFormulas: true,
  },
  Imposte: {
    label: "Imposte",
    description: "Carico fiscale dell'esercizio",
    isPercentage: false,
    hasFormulas: true,
  },
  Rai: {
    label: "Reddito Ante Imposte (Rai)",
    description: "Risultato economico prima del calcolo delle tasse (Reddito ante imposte)",
    isPercentage: false,
    hasFormulas: true,
  },
  Debiti: {
    label: "Debiti (Capitale di terzi)",
    description: "Capitale di terzi",
    isPercentage: false,
    hasFormulas: true,
  },
};

// Formula database
const FORMULAS: Record<string, Formula[]> = {
  Ro: [
    {
      inputs: ["Roi", "Ci"],
      compact: "Ro = Roi × Ci / 100",
      extended: "Reddito operativo (Ro) = Roi × Ci / 100",
      priority: 1,
    },
    {
      inputs: ["V", "Ros"],
      compact: "Ro = V × ROS / 100",
      extended: "Reddito operativo (Ro) = V × ROS / 100",
      priority: 3,
    },
  ],
  Rn: [
    {
      inputs: ["Rai", "Imposte"],
      compact: "Rn = Rai - imposte",
      extended: "Reddito netto (Rn) = Rai - imposte",
      priority: 1,
    },
    {
      inputs: ["Roe", "Cp"],
      compact: "Rn = Roe × Cp / 100",
      extended: "Reddito netto (Rn) = Roe × Cp / 100",
      priority: 2,
    },
  ],
  Roe: [
    {
      inputs: ["Rn", "Cp"],
      compact: "Roe = Rn / Cp × 100",
      extended: "Roe = Rn / Cp × 100 (reddito netto / capitale proprio)",
      priority: 1,
    },
  ],
  Roi: [
    {
      inputs: ["Ro", "Ci"],
      compact: "Roi = Ro / Ci × 100",
      extended: "Roi = Ro / Ci × 100 (reddito operativo / capitale investito)",
      priority: 1,
    },
  ],
  Ros: [
    {
      inputs: ["Ro", "V"],
      compact: "ROS = Ro / V × 100",
      extended: "ROS = Ro / V × 100",
      priority: 1,
    },
  ],
  Rod: [
    {
      inputs: ["Of", "Debiti"],
      compact: "Rod = Of / Debiti × 100",
      extended: "Rod = Of / Debiti × 100 (costo medio del debito)",
      priority: 1,
    },
  ],
  Ci: [
    {
      inputs: ["Ro", "Roi"],
      compact: "Ci = Ro × 100 / Roi",
      extended: "Capitale investito (Ci) = Ro × 100 / Roi",
      priority: 1,
    },
    {
      inputs: ["Cp", "Debiti"],
      compact: "Ci = Cp + Debiti",
      extended: "Capitale investito (Ci) = Cp + Debiti (mezzi propri + capitale di terzi)",
      priority: 3,
    },
    {
      inputs: ["Cp", "Leverage"],
      compact: "Ci = Cp × Leverage",
      extended: "Capitale investito (Ci) = Cp × Leverage",
      priority: 4,
    },
  ],
  Cp: [
    {
      inputs: ["Ci", "Debiti"],
      compact: "Cp = Ci - Debiti",
      extended: "Capitale proprio (Cp) = Ci - Debiti",
      priority: 2,
    },
    {
      inputs: ["Rn", "Roe"],
      compact: "Cp = Rn × 100 / Roe",
      extended: "Capitale proprio (Cp) = Rn × 100 / Roe",
      priority: 3,
    },
  ],
  Leverage: [
    {
      inputs: ["Ci", "Cp"],
      compact: "Leverage = Ci / Cp",
      extended:
        "Leverage (rapporto d'indebitamento) = Ci / Cp // Nota: se =1 l'azienda non ha debiti; se >2 è molto indebitata",
      priority: 1,
    },
  ],
  Debiti: [
    {
      inputs: ["Ci", "Cp"],
      compact: "Debiti = Ci - Cp",
      extended: "Debiti = Ci - Cp",
      priority: 1,
    },
  ],
  Of: [
    {
      inputs: ["Debiti", "Rod"],
      compact: "Of = Debiti × ROD / 100",
      extended: "Of = Debiti × ROD / 100",
      priority: 1,
    },
  ],
  Rai: [
    {
      inputs: ["Ro", "Of"],
      compact: "Rai = Ro - Of",
      extended: "Rai = Ro - Of + proventi finanziari",
      priority: 1,
    },
  ],
};

// Blacklisted formulas that should never be suggested
const BLACKLIST = [
  "Cp = Ro / Roi × 100",
  "Ci = Ro / (Roi / 100)",
  "Ro = Ri / Ci × 100",
  "Ci = Ro / Roi × 100",
];

type MetricState = Record<string, number | null>;

export default function FormulaCalculator() {
  const METRICS_ORDER = [
    "Roe",
    "Roi",
    "Rod",
    "Leverage",
    "Ros",
    "Ro",
    "Rn",
    "Cp",
    "Ci",
    "V",
    "Of",
    "Imposte",
    "Rai",
    "Debiti",
  ];

  const [metrics, setMetrics] = useState<MetricState>({});
  const [manuallySet, setManuallySet] = useState<Set<string>>(new Set());
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});
  const [suggestedFormulas, setSuggestedFormulas] = useState<
    Record<string, Formula[]>
  >({});
  const [selectedFormulaMetric, setSelectedFormulaMetric] = useState<
    string | null
  >(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showAllFormulasDialog, setShowAllFormulasDialog] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("formulaCalculatorState");
    if (saved) {
      try {
        const { metrics: savedMetrics, manuallySet: savedManuallySet } =
          JSON.parse(saved);
        setMetrics(savedMetrics);
        setManuallySet(new Set(savedManuallySet));
      } catch (e) {
        console.error("Failed to load saved state:", e);
      }
    }
  }, []);

  // Save to localStorage whenever metrics change
  useEffect(() => {
    localStorage.setItem(
      "formulaCalculatorState",
      JSON.stringify({
        metrics,
        manuallySet: Array.from(manuallySet),
      })
    );
  }, [metrics, manuallySet]);

  // Calculate suggested formulas
  useEffect(() => {
    const newSuggestions: Record<string, Formula[]> = {};

    METRICS_ORDER.forEach((metric) => {
      // Skip if already manually set
      if (manuallySet.has(metric)) return;

      const applicableFormulas = (FORMULAS[metric] || []).filter((formula) => {
        // Check if all inputs are available
        const hasAllInputs = formula.inputs.every((input) => metrics[input] != null);
        return hasAllInputs;
      });

      if (applicableFormulas.length > 0) {
        // Sort by priority
        applicableFormulas.sort((a, b) => a.priority - b.priority);
        newSuggestions[metric] = applicableFormulas;
      }
    });

    setSuggestedFormulas(newSuggestions);
  }, [metrics, manuallySet]);

  // Format input helper
  const formatValue = (value: string, isPercentage: boolean): string => {
    if (!value) return "";

    // Remove all spaces and commas
    let clean = value.replace(/\s/g, "").replace(/,/g, ".");

    if (isPercentage) {
      // Percentage: just return as-is (with dot for decimal)
      return clean;
    } else {
      // Monetary: convert dot to thousands separator
      // First replace dots with empty to normalize
      const parts = clean.split(".");
      if (parts.length === 1) {
        return parts[0];
      }

      // Reconstruct with proper formatting
      const integerPart = parts[0];
      const decimalPart = parts[parts.length - 1];

      // Assume last part after last dot is decimals if it has 1-2 digits
      if (decimalPart && decimalPart.length <= 2) {
        const thousands = parts.slice(0, -1).join("");
        return thousands + decimalPart;
      }

      return clean;
    }
  };

  // Validation helper
  const isValidInput = (
    value: string,
    isPercentage: boolean,
    metric: string
  ): boolean => {
    if (!value) return true; // Empty is valid

    const clean = value.replace(/\s/g, "").replace(/,/g, ".");

    if (isPercentage) {
      // Check if it's a valid number
      const num = parseFloat(clean);
      if (isNaN(num)) return false;
      // No trailing zeros (12.0 is invalid, 12 is valid, 12.5 is valid)
      if (clean.includes(".") && clean.endsWith("0")) return false;
      return true;
    } else {
      // Monetary: should be integer
      const num = parseFloat(clean);
      if (isNaN(num)) return false;
      // Only allow Leverage to be negative
      if (num < 0 && metric !== "Leverage") return false;
      return true;
    }
  };

  // Handle input change (typing) - accept any input, validate on blur
  const handleInputChange = (metric: string, value: string) => {
    // Store temporary input value during typing
    setInputValues((prev) => ({
      ...prev,
      [metric]: value,
    }));

    // Clear error during typing to allow user to complete input
    setInputErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[metric];
      return newErrors;
    });
  };

  // Handle input blur - validate and save on blur
  const handleInputBlur = (metric: string, value: string) => {
    const config = METRIC_CONFIG[metric];

    // Clear temporary input value
    setInputValues((prev) => {
      const newValues = { ...prev };
      delete newValues[metric];
      return newValues;
    });

    // Empty value = clear metric
    if (!value || value.trim() === "") {
      setMetrics((prev) => ({
        ...prev,
        [metric]: null,
      }));
      setManuallySet((prev) => {
        const newSet = new Set(prev);
        newSet.delete(metric);
        return newSet;
      });
      setInputErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[metric];
        return newErrors;
      });
      return;
    }

    let numericValue: number | null = null;
    let errorMsg = "";

    if (config.isPercentage) {
      // Percentage: convert comma to dot and parse
      const normalized = value.replace(",", ".");

      // Check for valid number format: digits with optional single decimal separator
      const percentRegex = /^-?\d+([.,]\d+)?$/;
      if (!percentRegex.test(value.trim())) {
        errorMsg = "Solo numeri e una virgola/punto";
      } else {
        const parsed = parseFloat(normalized);
        if (isNaN(parsed)) {
          errorMsg = "Numero non valido";
        } else {
          // Check for trailing zero (e.g., "12,0" or "12.0")
          if (
            normalized.includes(".") &&
            normalized.endsWith("0") &&
            normalized.split(".")[1].length === 1
          ) {
            errorMsg = "Trailing zero non consentito (12,0 no)";
          } else {
            numericValue = parsed;
          }
        }
      }
    } else {
      // Monetary: allow point as thousands separator
      const cleanValue = value.replace(/\./g, "");
      const monetaryRegex = /^-?\d+$/;

      if (!monetaryRegex.test(cleanValue.trim())) {
        errorMsg = "Solo numeri e punti migliaia";
      } else {
        const parsed = parseFloat(cleanValue);
        if (isNaN(parsed)) {
          errorMsg = "Numero non valido";
        } else {
          numericValue = parsed;
        }
      }
    }

    // Show error if validation failed
    if (errorMsg) {
      setInputErrors((prev) => ({
        ...prev,
        [metric]: errorMsg,
      }));
      return;
    }

    // Update state if valid
    if (numericValue !== null) {
      setMetrics((prev) => ({
        ...prev,
        [metric]: numericValue,
      }));
      setManuallySet((prev) => new Set(prev).add(metric));
      setInputErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[metric];
        return newErrors;
      });
    }
  };

  /**
   * Validates percentage input:
   * - Accepts comma as decimal separator (converts to dot internally)
   * - Rejects trailing zeros (12.0 invalid, 12 valid, 12.5 valid)
   */
  const isValidPercentage = (value: string): boolean => {
    if (!value) return true;
    const normalized = value.replace(",", ".");
    const num = parseFloat(normalized);
    if (isNaN(num)) return false;
    // Reject trailing zero (e.g., "12.0" or "12,0")
    if (normalized.includes(".") && normalized.endsWith("0")) return false;
    return true;
  };

  /**
   * Validates monetary input:
   * - Accepts format: 4445000 or 4.445.000 (point as thousands separator)
   * - Rejects comma
   */
  const isValidMonetary = (value: string, metric: string): boolean => {
    if (!value) return true;
    // Remove thousands separators and convert to number
    const clean = value.replace(/\./g, "");
    const num = parseFloat(clean);
    if (isNaN(num)) return false;
    // Only allow negative for Leverage
    if (num < 0 && metric !== "Leverage") return false;
    return true;
  };

  // Apply formula
  const applyFormula = (metric: string, formula: Formula) => {
    let result: number | null = null;

    const m = metrics;

    // Calculation logic for each metric
    switch (metric) {
      case "Ro":
        if (formula.inputs.includes("Roi") && m.Roi != null && m.Ci != null) {
          result = (m.Roi * m.Ci) / 100;
        } else if (
          formula.inputs.includes("V") &&
          m.V != null &&
          m.Ros != null
        ) {
          result = (m.V * m.Ros) / 100;
        }
        break;
      case "Rn":
        if (
          formula.inputs.includes("Rai") &&
          m.Rai != null &&
          m.Imposte != null
        ) {
          result = m.Rai - m.Imposte;
        } else if (
          formula.inputs.includes("Roe") &&
          m.Roe != null &&
          m.Cp != null
        ) {
          result = (m.Roe * m.Cp) / 100;
        }
        break;
      case "Roe":
        if (m.Rn != null && m.Cp != null) {
          result = (m.Rn / m.Cp) * 100;
        }
        break;
      case "Roi":
        if (m.Ro != null && m.Ci != null) {
          result = (m.Ro / m.Ci) * 100;
        }
        break;
      case "Ros":
        if (m.Ro != null && m.V != null) {
          result = (m.Ro / m.V) * 100;
        }
        break;
      case "Rod":
        if (m.Of != null && m.Debiti != null) {
          result = (m.Of / m.Debiti) * 100;
        }
        break;
      case "Ci":
        if (
          formula.inputs.includes("Ro") &&
          m.Ro != null &&
          m.Roi != null
        ) {
          result = (m.Ro * 100) / m.Roi;
        } else if (
          formula.inputs.includes("Cp") &&
          m.Cp != null &&
          m.Debiti != null
        ) {
          result = m.Cp + m.Debiti;
        } else if (
          formula.inputs.includes("Leverage") &&
          m.Cp != null &&
          m.Leverage != null
        ) {
          result = m.Cp * m.Leverage;
        }
        break;
      case "Cp":
        if (
          formula.inputs.includes("Ci") &&
          m.Ci != null &&
          m.Debiti != null
        ) {
          result = m.Ci - m.Debiti;
        } else if (
          formula.inputs.includes("Roe") &&
          m.Rn != null &&
          m.Roe != null
        ) {
          result = (m.Rn * 100) / m.Roe;
        }
        break;
      case "Leverage":
        if (m.Ci != null && m.Cp != null) {
          result = m.Ci / m.Cp;
        }
        break;
      case "Debiti":
        if (m.Ci != null && m.Cp != null) {
          result = m.Ci - m.Cp;
        }
        break;
      case "Of":
        if (m.Debiti != null && m.Rod != null) {
          result = (m.Debiti * m.Rod) / 100;
        }
        break;
      case "Rai":
        if (m.Ro != null && m.Of != null) {
          result = m.Ro - m.Of;
        }
        break;
      default:
        break;
    }

    if (result !== null) {
      setMetrics((prev) => ({
        ...prev,
        [metric]: result,
      }));
      setManuallySet((prev) => new Set(prev).add(metric));
      setSelectedFormulaMetric(null);
    }
  };

  // Reset all data
  const handleReset = () => {
    setMetrics({});
    setManuallySet(new Set());
    localStorage.removeItem("formulaCalculatorState");
    setShowResetDialog(false);
  };

  // Get input value with formatting
  const getInputValue = (metric: string, metric_config: MetricConfig): string => {
    const value = metrics[metric];
    if (value === null || value === undefined) return "";

    if (metric_config.isPercentage) {
      return value.toString();
    } else {
      // Format with thousands separator
      return Math.round(value).toLocaleString("it-IT");
    }
  };

  // Determine cell styling
  const getCellStyles = (metric: string) => {
    const numSuggestions = suggestedFormulas[metric]?.length || 0;

    if (numSuggestions === 0) {
      return "bg-white border border-gray-200";
    } else if (numSuggestions === 1) {
      return "bg-gray-100 border border-gray-300";
    } else {
      return "bg-blue-50 border-2 border-blue-400";
    }
  };

  /**
   * Get the most common formula for a metric (first in list, highest priority)
   */
  const getMostCommonFormula = (metric: string): Formula | null => {
    const formulas = FORMULAS[metric];
    if (!formulas || formulas.length === 0) return null;
    // Return formula with lowest priority number (most common)
    return formulas.sort((a, b) => a.priority - b.priority)[0] || null;
  };

  /**
   * Convert input string to internal numeric value
   * Handles both comma and thousands separator formats
   */
  const parseInputValue = (
    value: string,
    isPercentage: boolean
  ): number | null => {
    if (!value) return null;

    if (isPercentage) {
      // Replace comma with dot for percentages
      const normalized = value.replace(",", ".");
      const num = parseFloat(normalized);
      return isNaN(num) ? null : num;
    } else {
      // Remove thousands separators for monetary values
      const clean = value.replace(/\./g, "");
      const num = parseFloat(clean);
      return isNaN(num) ? null : num;
    }
  };

  /**
   * Format numeric value for display
   */
  const formatDisplayValue = (
    value: number | null,
    isPercentage: boolean
  ): string => {
    if (value === null || value === undefined) return "";

    if (isPercentage) {
      // Show percentage as-is
      return value.toString();
    } else {
      // Format with Italian thousands separator (.)
      return Math.round(value).toLocaleString("it-IT");
    }
  };

  return (
    <TooltipProvider>
      <Card className="bg-white rounded-xl shadow-lg p-6 max-[617px]:p-3 border border-gray-200">
        <div className="mb-6 max-[617px]:mb-3 flex items-center justify-between max-[617px]:flex-col max-[617px]:items-start max-[617px]:gap-2">
          <div className="flex items-center gap-3 max-[617px]:gap-2">
            <Calculator className="w-6 h-6 max-[617px]:w-5 max-[617px]:h-5 text-blue-600" />
            <div>
              <h2 className="text-2xl max-[617px]:text-lg font-bold text-gray-900">
                Calcolatore di Formule Finanziarie
              </h2>
              <p className="text-sm max-[617px]:text-xs text-gray-600">
                Inserisci i valori e il sistema suggerirà automaticamente le formule
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 min-[566px]:flex-row min-[566px]:items-center max-[617px]:self-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllFormulasDialog(true)}
              className="whitespace-nowrap max-[490px]:text-xs max-[490px]:px-2 max-[490px]:py-1 max-[490px]:h-7"
            >
              Mostra tutte le formule
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              className="flex items-center gap-2 max-[490px]:text-xs max-[490px]:px-2 max-[490px]:py-1 max-[490px]:h-7 max-[490px]:gap-1"
            >
              <RotateCcw className="w-4 h-4 max-[490px]:w-3 max-[490px]:h-3" />
              Reset tutto
            </Button>
          </div>
        </div>

        {/* Metrics Grid - Responsive: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 max-[617px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 max-[617px]:gap-2">
          {METRICS_ORDER.map((metric) => {
            const config = METRIC_CONFIG[metric];
            const numSuggestions = suggestedFormulas[metric]?.length || 0;
            const isManuallySet = manuallySet.has(metric);
            const cellClasses = getCellStyles(metric);
            const value = metrics[metric];
            const mostCommonFormula = getMostCommonFormula(metric);

            // Determine cell border classes based on state
            // NOTE: Green borders now only on the inner input div, not on outer cell
            let cellBorderClasses = "border border-gray-200 bg-white";
            if (numSuggestions === 1) {
              // Blue border for single suggestion
              cellBorderClasses =
                "border-4 border-blue-500 bg-white cursor-pointer hover:shadow-md transition-shadow";
            } else if (numSuggestions > 1) {
              // Blue background for multiple suggestions
              cellBorderClasses =
                "border-2 border-blue-400 bg-blue-50 cursor-pointer hover:shadow-md transition-shadow";
            }

            return (
              <div
                key={metric}
                className={`rounded-lg p-3 max-[617px]:p-2 transition-all h-full min-h-[80px] max-[617px]:min-h-[60px] flex flex-col ${cellBorderClasses}`}
                onClick={() => {
                  if (numSuggestions > 0) {
                    setSelectedFormulaMetric(metric);
                  }
                }}
              >
                {/* Title with icon and tooltip */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="flex items-start justify-between mb-2 cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (numSuggestions > 0) {
                          setSelectedFormulaMetric(metric);
                        }
                      }}
                    >
                      <div className="flex items-center gap-1 flex-1">
                        <Label className="text-sm max-[617px]:text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {config.label}
                        </Label>
                        {config.isPercentage ? (
                          <Percent className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Euro className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="text-sm">
                      <p className="font-semibold">{config.description}</p>
                      {numSuggestions > 0 && (
                        <p className="text-xs mt-1 text-blue-100">
                          Clicca per vedere le formule disponibili
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Input Field with Green Border when manually set */}
                <div className="flex-1 flex flex-col">
                  <div
                    className={`w-full transition-all ${
                      isManuallySet
                        ? "border-2 border-green-500 rounded-lg p-2"
                        : ""
                    } ${
                      inputErrors[metric] ? "border-2 border-red-500 rounded-lg p-2" : ""
                    }`}
                  >
                    <Input
                      type="text"
                      placeholder={
                        !isManuallySet && mostCommonFormula
                          ? mostCommonFormula.compact
                          : ""
                      }
                      value={
                        inputValues[metric] !== undefined
                          ? inputValues[metric]
                          : formatDisplayValue(value, config.isPercentage)
                      }
                      onChange={(e) => handleInputChange(metric, e.target.value)}
                      onBlur={(e) => handleInputBlur(metric, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-sm w-full placeholder:italic placeholder:opacity-50 ${
                        isManuallySet && !inputErrors[metric]
                          ? "text-green-700 font-bold border-0"
                          : inputErrors[metric]
                          ? "text-red-600 border-0"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {/* Error message */}
                  {inputErrors[metric] && (
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      {inputErrors[metric]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Formulas Dialog */}
      <Dialog
        open={selectedFormulaMetric !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedFormulaMetric(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Formule per {METRIC_CONFIG[selectedFormulaMetric!]?.label}
            </DialogTitle>
            <DialogDescription>
              Seleziona la formula che desideri applicare
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestedFormulas[selectedFormulaMetric!]?.map(
              (formula, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => applyFormula(selectedFormulaMetric!, formula)}
                >
                  <p className="font-bold text-sm text-blue-700">
                    {formula.compact}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    {formula.extended}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Priorità: {formula.priority}
                  </p>
                </div>
              )
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedFormulaMetric(null)}
            >
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
            >
              No, annulla
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Sì, cancella tutto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* All Formulas Dialog */}
      <Dialog open={showAllFormulasDialog} onOpenChange={setShowAllFormulasDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tutte le formule disponibili</DialogTitle>
            <DialogDescription>
              Elenco completo delle formule finanziarie disponibili nel sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {METRICS_ORDER.map((metric) => (
              (FORMULAS[metric] || []).length > 0 && (
                <div key={metric} className="border-b pb-3">
                  <h3 className="font-bold text-blue-700 mb-2">
                    {METRIC_CONFIG[metric]?.label || metric}
                  </h3>
                  <div className="space-y-2 ml-3">
                    {FORMULAS[metric].map((formula, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-semibold text-gray-800">
                          {formula.compact}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {formula.extended}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAllFormulasDialog(false)}
            >
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
