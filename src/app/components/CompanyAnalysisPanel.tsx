import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface FinancialBenchmark {
  creditiSoci: { min: number; max: number; optimal: number };
  immobilizzazioni: { min: number; max: number; optimal: number };
  attivoCircolante: { min: number; max: number; optimal: number };
  patrimonioNetto: { min: number; max: number; optimal: number };
  debitiMLT: { min: number; max: number; optimal: number };
  debitiBreve: { min: number; max: number; optimal: number };
}

const industrialBenchmark: FinancialBenchmark = {
  creditiSoci: { min: 0, max: 10, optimal: 5 },
  immobilizzazioni: { min: 40, max: 60, optimal: 50 },
  attivoCircolante: { min: 40, max: 60, optimal: 50 },
  patrimonioNetto: { min: 40, max: 60, optimal: 50 },
  debitiMLT: { min: 20, max: 40, optimal: 30 },
  debitiBreve: { min: 10, max: 30, optimal: 20 },
};

const mercantileBenchmark: FinancialBenchmark = {
  creditiSoci: { min: 0, max: 10, optimal: 5 },
  immobilizzazioni: { min: 10, max: 30, optimal: 20 },
  attivoCircolante: { min: 70, max: 90, optimal: 80 },
  patrimonioNetto: { min: 30, max: 50, optimal: 40 },
  debitiMLT: { min: 15, max: 30, optimal: 20 },
  debitiBreve: { min: 30, max: 50, optimal: 40 },
};

interface CompanyAnalysisPanelProps {
  companyType: "industrial" | "mercantile";
  onCompanyTypeChange: (type: "industrial" | "mercantile") => void;
  onApplyPreset: (type: "industrial" | "mercantile") => void;
}

export function CompanyAnalysisPanel({
  companyType,
  onCompanyTypeChange,
  onApplyPreset,
}: CompanyAnalysisPanelProps) {
  const benchmark =
    companyType === "industrial" ? industrialBenchmark : mercantileBenchmark;

  const [customStructure, setCustomStructure] = useState({
    creditiSoci: benchmark.creditiSoci.optimal,
    immobilizzazioni: benchmark.immobilizzazioni.optimal,
    attivoCircolante: benchmark.attivoCircolante.optimal,
    patrimonioNetto: benchmark.patrimonioNetto.optimal,
    debitiMLT: benchmark.debitiMLT.optimal,
    debitiBreve: benchmark.debitiBreve.optimal,
  });

  const handleValueChange = (key: string, value: number) => {
    setCustomStructure({ ...customStructure, [key]: value });
  };

  const getEquilibriumStatus = (
    value: number,
    benchmark: { min: number; max: number; optimal: number }
  ) => {
    if (Math.abs(value - benchmark.optimal) <= 5) {
      return { status: "Ottimale", color: "text-green-600", bg: "bg-green-50" };
    }
    if (value >= benchmark.min && value <= benchmark.max) {
      return { status: "Adeguato", color: "text-blue-600", bg: "bg-blue-50" };
    }
    return { status: "Debole", color: "text-red-600", bg: "bg-red-50" };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Analisi della Struttura Finanziaria
      </h3>

      {/* Company Type Selector */}
      <div className="mb-6">
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
          Tipologia di Azienda
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onCompanyTypeChange("industrial")}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              companyType === "industrial"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Industriale
          </button>
          <button
            onClick={() => onCompanyTypeChange("mercantile")}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              companyType === "mercantile"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Mercantile
          </button>
        </div>
      </div>

      {/* Apply Preset Button */}
      <button
        onClick={() => onApplyPreset(companyType)}
        className="w-full mb-6 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
      >
        Applica Struttura Tipica {companyType === "industrial" ? "Industriale" : "Mercantile"}
      </button>

      {/* Benchmark Visualization */}
      <div className="space-y-6">
        {/* Assets Structure */}
        <div>
          <h4 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b-2 border-blue-500">
            STRUTTURA DELL'ATTIVO
          </h4>
          <div className="space-y-4">
            <BenchmarkBar
              label="Crediti v/ soci"
              value={customStructure.creditiSoci}
              benchmark={benchmark.creditiSoci}
              color={companyType === "industrial" ? "bg-yellow-500" : "bg-yellow-500"}
              onChange={(v) => handleValueChange("creditiSoci", v)}
              equilibrium={getEquilibriumStatus(
                customStructure.creditiSoci,
                benchmark.creditiSoci
              )}
            />
            <BenchmarkBar
              label="Immobilizzazioni"
              value={customStructure.immobilizzazioni}
              benchmark={benchmark.immobilizzazioni}
              color={companyType === "industrial" ? "bg-blue-500" : "bg-green-500"}
              onChange={(v) => handleValueChange("immobilizzazioni", v)}
              equilibrium={getEquilibriumStatus(
                customStructure.immobilizzazioni,
                benchmark.immobilizzazioni
              )}
            />
            <BenchmarkBar
              label="Attivo Circolante"
              value={customStructure.attivoCircolante}
              benchmark={benchmark.attivoCircolante}
              color={companyType === "industrial" ? "bg-blue-400" : "bg-green-400"}
              onChange={(v) => handleValueChange("attivoCircolante", v)}
              equilibrium={getEquilibriumStatus(
                customStructure.attivoCircolante,
                benchmark.attivoCircolante
              )}
            />
          </div>
        </div>

        {/* Liabilities & Equity Structure */}
        <div>
          <h4 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b-2 border-indigo-500">
            STRUTTURA DEL PASSIVO
          </h4>
          <div className="space-y-4">
            <BenchmarkBar
              label="Patrimonio Netto"
              value={customStructure.patrimonioNetto}
              benchmark={benchmark.patrimonioNetto}
              color={companyType === "industrial" ? "bg-indigo-600" : "bg-emerald-600"}
              onChange={(v) => handleValueChange("patrimonioNetto", v)}
              equilibrium={getEquilibriumStatus(
                customStructure.patrimonioNetto,
                benchmark.patrimonioNetto
              )}
            />
            <BenchmarkBar
              label="Debiti M/L Termine"
              value={customStructure.debitiMLT}
              benchmark={benchmark.debitiMLT}
              color={companyType === "industrial" ? "bg-indigo-400" : "bg-emerald-400"}
              onChange={(v) => handleValueChange("debitiMLT", v)}
              equilibrium={getEquilibriumStatus(
                customStructure.debitiMLT,
                benchmark.debitiMLT
              )}
            />
            <BenchmarkBar
              label="Debiti Breve Termine"
              value={customStructure.debitiBreve}
              benchmark={benchmark.debitiBreve}
              color={companyType === "industrial" ? "bg-indigo-300" : "bg-emerald-300"}
              onChange={(v) => handleValueChange("debitiBreve", v)}
              equilibrium={getEquilibriumStatus(
                customStructure.debitiBreve,
                benchmark.debitiBreve
              )}
            />
          </div>
        </div>
      </div>

      {/* Educational Notes */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h5 className="text-xs font-semibold text-gray-700 mb-2">
          Nota Didattica
        </h5>
        <p className="text-xs text-gray-600 leading-relaxed">
          {companyType === "industrial"
            ? "Le aziende industriali presentano un maggior investimento in immobilizzazioni (impianti, macchinari) e una struttura finanziaria equilibrata tra capitale proprio e debiti a medio-lungo termine per finanziare gli investimenti fissi."
            : "Le aziende mercantili si caratterizzano per un elevato attivo circolante (scorte, crediti commerciali) e maggiori debiti a breve termine per sostenere il ciclo operativo. Il capitale circolante netto è fondamentale."}
        </p>
      </div>
    </div>
  );
}

interface BenchmarkBarProps {
  label: string;
  value: number;
  benchmark: { min: number; max: number; optimal: number };
  color: string;
  onChange: (value: number) => void;
  equilibrium: { status: string; color: string; bg: string };
}

function BenchmarkBar({
  label,
  value,
  benchmark,
  color,
  onChange,
  equilibrium,
}: BenchmarkBarProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-gray-700">{label}</Label>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${equilibrium.bg} ${equilibrium.color}`}
          >
            {equilibrium.status}
          </span>
        </div>
        {isEditing ? (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="h-7 w-16 text-xs"
            min="0"
            max="100"
          />
        ) : (
          <span
            className="text-xs font-bold text-gray-900 cursor-pointer hover:text-blue-600"
            onClick={() => setIsEditing(true)}
          >
            {value.toFixed(0)}%
          </span>
        )}
      </div>

      {/* Benchmark range visualization */}
      <div className="relative h-10 bg-gray-200 rounded-lg overflow-hidden">
        {/* Optimal zone (darker) */}
        <div
          className="absolute h-full bg-gray-300"
          style={{
            left: `${benchmark.optimal - 2.5}%`,
            width: "5%",
          }}
        />
        {/* Adequate zone */}
        <div
          className="absolute h-full bg-gray-250 opacity-30"
          style={{
            left: `${benchmark.min}%`,
            width: `${benchmark.max - benchmark.min}%`,
          }}
        />
        {/* Current value bar */}
        <div
          className={`absolute h-full ${color} transition-all duration-500 flex items-center justify-center`}
          style={{ width: `${value}%` }}
        >
          {value > 15 && (
            <span className="text-xs font-bold text-white">{value.toFixed(0)}%</span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Min: {benchmark.min}%</span>
        <span className="font-semibold text-gray-700">
          Ottimale: {benchmark.optimal}%
        </span>
        <span>Max: {benchmark.max}%</span>
      </div>
    </div>
  );
}