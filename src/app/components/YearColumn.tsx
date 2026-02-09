import { useState } from "react";
import { BalanceSheetBlock } from "./BalanceSheetBlock";

interface YearColumnProps {
  year: string;
  items: {
    id: string;
    title: string;
    value: number;
    percentage: number;
    color: string;
  }[];
  onItemChange: (id: string, field: "value" | "percentage", newValue: number) => void;
}

export function YearColumn({ year, items, onItemChange }: YearColumnProps) {
  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className="bg-gray-100 px-4 py-3 rounded-t-lg border-b-2 border-gray-300">
        <h3 className="font-bold text-gray-800 text-center">{year}</h3>
      </div>
      <div className="flex flex-col gap-3 px-2">
        {items.map((item) => (
          <BalanceSheetBlock
            key={item.id}
            title={item.title}
            value={item.value}
            percentage={item.percentage}
            color={item.color}
            onValueChange={(value) => onItemChange(item.id, "value", value)}
            onPercentageChange={(percentage) =>
              onItemChange(item.id, "percentage", percentage)
            }
          />
        ))}
      </div>
      <div className="mt-auto bg-gray-100 px-4 py-3 rounded-b-lg border-t-2 border-gray-300">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">Totale</span>
          <span className="font-bold text-lg text-gray-900">
            €{items.reduce((sum, item) => sum + item.value, 0).toLocaleString('it-IT')}
          </span>
        </div>
      </div>
    </div>
  );
}