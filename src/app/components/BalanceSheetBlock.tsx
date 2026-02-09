import { useState } from "react";
import { Input } from "./ui/input";

interface BalanceSheetBlockProps {
  title: string;
  value: number;
  percentage: number;
  color: string;
  onValueChange: (value: number) => void;
  onPercentageChange: (percentage: number) => void;
}

export function BalanceSheetBlock({
  title,
  value,
  percentage,
  color,
  onValueChange,
  onPercentageChange,
}: BalanceSheetBlockProps) {
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [isEditingPercentage, setIsEditingPercentage] = useState(false);

  return (
    <div
      className="rounded-lg p-4 transition-all duration-300 border border-gray-200 shadow-sm hover:shadow-md"
      style={{
        backgroundColor: color,
        minHeight: `${Math.max(percentage * 4, 60)}px`,
        flexGrow: percentage,
      }}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-800">{title}</h4>
          <div className="flex items-center gap-2">
            {isEditingValue ? (
              <Input
                type="number"
                value={value}
                onChange={(e) => onValueChange(Number(e.target.value))}
                onBlur={() => setIsEditingValue(false)}
                autoFocus
                className="h-7 w-28 text-sm bg-white"
              />
            ) : (
              <span
                className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600"
                onClick={() => setIsEditingValue(true)}
              >
                €{value.toLocaleString("it-IT")}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isEditingPercentage ? (
            <Input
              type="number"
              value={percentage}
              onChange={(e) => onPercentageChange(Number(e.target.value))}
              onBlur={() => setIsEditingPercentage(false)}
              autoFocus
              className="h-7 w-16 text-sm bg-white"
              min="0"
              max="100"
              step="0.1"
            />
          ) : (
            <span
              className="text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 bg-white/70 px-2 py-1 rounded"
              onClick={() => setIsEditingPercentage(true)}
            >
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}