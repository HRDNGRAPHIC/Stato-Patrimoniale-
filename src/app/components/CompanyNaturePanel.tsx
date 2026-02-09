import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface CompanyNaturePanelProps {
  type: "industrial" | "trading";
  onTypeChange: (type: "industrial" | "trading") => void;
}

export function CompanyNaturePanel({ type, onTypeChange }: CompanyNaturePanelProps) {
  const industrialProfile = {
    receivables: 5,
    fixedAssets: 45,
    currentAssets: 55,
    equity: 50,
    longTermLiabilities: 30,
    currentLiabilities: 20,
  };

  const tradingProfile = {
    receivables: 5,
    fixedAssets: 20,
    currentAssets: 80,
    equity: 40,
    longTermLiabilities: 20,
    currentLiabilities: 40,
  };

  const profile = type === "industrial" ? industrialProfile : tradingProfile;

  const [customProfile, setCustomProfile] = useState(profile);

  const handleProfileChange = (key: string, value: number) => {
    setCustomProfile({ ...customProfile, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Profilo Natura Aziendale</h3>
      
      {/* Type Selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => onTypeChange("industrial")}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            type === "industrial"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Industriale
        </button>
        <button
          onClick={() => onTypeChange("trading")}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            type === "trading"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Commerciale
        </button>
      </div>

      {/* Assets Composition */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Composizione Attività</h4>
        <div className="space-y-3">
          <ProfileBar
            label="Crediti v/ soci"
            value={customProfile.receivables}
            color={type === "industrial" ? "bg-yellow-500" : "bg-yellow-500"}
            onChange={(value) => handleProfileChange("receivables", value)}
          />
          <ProfileBar
            label="Immobilizzazioni"
            value={customProfile.fixedAssets}
            color={type === "industrial" ? "bg-blue-500" : "bg-green-500"}
            onChange={(value) => handleProfileChange("fixedAssets", value)}
          />
          <ProfileBar
            label="Attività Correnti"
            value={customProfile.currentAssets}
            color={type === "industrial" ? "bg-blue-400" : "bg-green-400"}
            onChange={(value) => handleProfileChange("currentAssets", value)}
          />
        </div>
      </div>

      {/* Liabilities & Equity Composition */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Passività e Patrimonio Netto</h4>
        <div className="space-y-3">
          <ProfileBar
            label="Patrimonio Netto"
            value={customProfile.equity}
            color={type === "industrial" ? "bg-indigo-500" : "bg-emerald-500"}
            onChange={(value) => handleProfileChange("equity", value)}
          />
          <ProfileBar
            label="Passività a Lungo Termine"
            value={customProfile.longTermLiabilities}
            color={type === "industrial" ? "bg-indigo-400" : "bg-emerald-400"}
            onChange={(value) => handleProfileChange("longTermLiabilities", value)}
          />
          <ProfileBar
            label="Passività Correnti"
            value={customProfile.currentLiabilities}
            color={type === "industrial" ? "bg-indigo-300" : "bg-emerald-300"}
            onChange={(value) => handleProfileChange("currentLiabilities", value)}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          {type === "industrial"
            ? "Le aziende industriali hanno tipicamente maggiori immobilizzazioni e passività moderate."
            : "Le aziende commerciali hanno tipicamente maggiori attività correnti e fabbisogno di capitale circolante."}
        </p>
      </div>
    </div>
  );
}

interface ProfileBarProps {
  label: string;
  value: number;
  color: string;
  onChange: (value: number) => void;
}

function ProfileBar({ label, value, color, onChange }: ProfileBarProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-gray-600">{label}</Label>
        {isEditing ? (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="h-6 w-16 text-xs"
            min="0"
            max="100"
          />
        ) : (
          <span
            className="text-xs font-semibold text-gray-700 cursor-pointer hover:text-blue-600"
            onClick={() => setIsEditing(true)}
          >
            {value}%
          </span>
        )}
      </div>
      <div className="h-8 bg-gray-100 rounded-full overflow-hidden relative">
        <div
          className={`h-full ${color} transition-all duration-500 flex items-center justify-center`}
          style={{ width: `${value}%` }}
        >
          {value > 20 && (
            <span className="text-xs font-semibold text-white">{value}%</span>
          )}
        </div>
      </div>
    </div>
  );
}