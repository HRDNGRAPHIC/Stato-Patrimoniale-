import { useState, useRef, useCallback, useEffect } from "react";
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

export interface FinancialStructure {
  creditiSoci: number;
  immobilizzazioni: number;
  attivoCircolante: number;
  patrimonioNetto: number;
  debitiMLT: number;
  debitiBreve: number;
}

export function getDefaultStructure(companyType: "industrial" | "mercantile"): FinancialStructure {
  const b = companyType === "industrial" ? industrialBenchmark : mercantileBenchmark;
  return {
    creditiSoci: b.creditiSoci.optimal,
    immobilizzazioni: b.immobilizzazioni.optimal,
    attivoCircolante: b.attivoCircolante.optimal,
    patrimonioNetto: b.patrimonioNetto.optimal,
    debitiMLT: b.debitiMLT.optimal,
    debitiBreve: b.debitiBreve.optimal,
  };
}

interface CompanyAnalysisPanelProps {
  companyType: "industrial" | "mercantile";
  onCompanyTypeChange: (type: "industrial" | "mercantile") => void;
  onApplyPreset: (type: "industrial" | "mercantile") => void;
  customStructure: FinancialStructure;
  onStructureChange: (structure: FinancialStructure) => void;
  darkMode?: boolean;
}

export function CompanyAnalysisPanel({
  companyType,
  onCompanyTypeChange,
  onApplyPreset,
  customStructure,
  onStructureChange,
  darkMode = false,
}: CompanyAnalysisPanelProps) {
  const benchmark =
    companyType === "industrial" ? industrialBenchmark : mercantileBenchmark;

  const handleValueChange = (key: string, value: number) => {
    onStructureChange({ ...customStructure, [key]: value });
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
    <div className={`rounded-xl shadow-lg p-6 max-[617px]:p-3 border transition-colors duration-300 ${darkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-gray-200"}`}>
      <h3 className={`text-xl max-[617px]:text-base font-bold mb-6 max-[617px]:mb-3 ${darkMode ? "text-slate-100" : "text-gray-900"}`}>
        Analisi della Struttura Finanziaria
      </h3>

      {/* Company Type Selector */}
      <div className="mb-6 max-[617px]:mb-3">
        <Label className={`text-sm max-[617px]:text-xs font-semibold mb-3 max-[617px]:mb-2 block ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
          Tipologia di Azienda
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onCompanyTypeChange("industrial")}
            className={`px-4 max-[617px]:px-2 py-3 max-[617px]:py-2 rounded-lg font-semibold max-[617px]:text-sm transition-all ${
              companyType === "industrial"
                ? "bg-blue-600 text-white shadow-md"
                : darkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Industriale
          </button>
          <button
            onClick={() => onCompanyTypeChange("mercantile")}
            className={`px-4 max-[617px]:px-2 py-3 max-[617px]:py-2 rounded-lg font-semibold max-[617px]:text-sm transition-all ${
              companyType === "mercantile"
                ? "bg-green-600 text-white shadow-md"
                : darkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Mercantile
          </button>
        </div>
      </div>

      {/* Apply Preset Button */}
      <button
        onClick={() => onApplyPreset(companyType)}
        className="w-full mb-6 max-[617px]:mb-3 px-4 max-[617px]:px-2 py-3 max-[617px]:py-2 bg-indigo-600 text-white rounded-lg font-semibold max-[617px]:text-sm hover:bg-indigo-700 transition-colors shadow-md"
      >
        Applica Struttura Tipica {companyType === "industrial" ? "Industriale" : "Mercantile"}
      </button>

      {/* Benchmark Visualization */}
      <div className="space-y-6 max-[617px]:space-y-3">
        {/* Assets Structure */}
        <div>
          <h4 className={`text-sm font-bold mb-3 pb-2 border-b-2 border-blue-500 ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
            STRUTTURA DELL'ATTIVO
          </h4>
          <div className="space-y-4">
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
          <h4 className={`text-sm font-bold mb-3 pb-2 border-b-2 border-indigo-500 ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
            STRUTTURA DEL PASSIVO
          </h4>
          <div className="space-y-4">
            <BenchmarkBar
              label="Patrimonio Netto"
              value={customStructure.patrimonioNetto}
              benchmark={benchmark.patrimonioNetto}
              color="bg-[#059669]"
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
              color="bg-[#34D399]"
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
              color="bg-[#6EE7B7]"
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
      <div className={`mt-6 max-[617px]:mt-3 pt-4 max-[617px]:pt-2 border-t ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
        <h5 className={`text-xs font-semibold mb-2 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
          Nota Didattica
        </h5>
        <p className={`text-xs leading-relaxed ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
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
  const barRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const calcPercent = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (!bar) return value;
      const rect = bar.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      return Math.round(Math.min(100, Math.max(0, pct)));
    },
    [value]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onChange(calcPercent(e.clientX));
    },
    [calcPercent, onChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      onChange(calcPercent(e.clientX));
    },
    [calcPercent, onChange]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div className="space-y-2 max-[617px]:space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 max-[617px]:gap-1">
          <Label className="text-xs max-[617px]:text-[10px] font-medium text-gray-700">{label}</Label>
          <span
            className={`text-xs max-[617px]:text-[10px] font-semibold px-2 max-[617px]:px-1 py-0.5 rounded ${equilibrium.bg} ${equilibrium.color}`}
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

      {/* Benchmark range visualization — draggable */}
      <div
        ref={barRef}
        className="relative h-10 max-[617px]:h-7 bg-gray-200 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Optimal zone (darker) */}
        <div
          className="absolute h-full bg-gray-300 pointer-events-none"
          style={{
            left: `${benchmark.optimal - 2.5}%`,
            width: "5%",
          }}
        />
        {/* Adequate zone */}
        <div
          className="absolute h-full bg-gray-250 opacity-30 pointer-events-none"
          style={{
            left: `${benchmark.min}%`,
            width: `${benchmark.max - benchmark.min}%`,
          }}
        />
        {/* Current value bar */}
        <div
          className={`absolute h-full ${color} transition-[width] duration-75 flex items-center justify-center pointer-events-none`}
          style={{ width: `${value}%` }}
        >
          {value > 15 && (
            <span className="text-xs font-bold text-white">{value.toFixed(0)}%</span>
          )}
        </div>
        {/* Drag handle at edge of bar */}
        <div
          className="absolute top-0 h-full w-1 bg-white/70 pointer-events-none"
          style={{ left: `${value}%`, transform: "translateX(-2px)" }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs max-[617px]:text-[10px] text-gray-500">
        <span>Min: {benchmark.min}%</span>
        <span className="font-semibold text-gray-700">
          Ottimale: {benchmark.optimal}%
        </span>
        <span>Max: {benchmark.max}%</span>
      </div>
    </div>
  );
}