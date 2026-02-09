import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "./ui/input";

interface BalanceSheetItemData {
  id: string;
  label: string;
  value: number;
  level: number; // 0 = main category, 1 = subcategory, 2 = item
  children?: BalanceSheetItemData[];
  color?: string;
}

interface BalanceSheetSectionProps {
  title: string;
  items: BalanceSheetItemData[];
  onValueChange: (id: string, value: number) => void;
  themeColor: string;
}

export function BalanceSheetSection({
  title,
  items,
  onValueChange,
  themeColor,
}: BalanceSheetSectionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(items.map((item) => item.id))
  );

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const calculateTotal = (items: BalanceSheetItemData[]): number => {
    return items.reduce((sum, item) => {
      if (item.children && item.children.length > 0) {
        return sum + calculateTotal(item.children);
      }
      return sum + item.value;
    }, 0);
  };

  const renderItem = (item: BalanceSheetItemData, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const itemTotal = hasChildren ? calculateTotal(item.children!) : item.value;

    const paddingLeft = depth * 24 + 16;
    const fontSize =
      item.level === 0 ? "text-base" : item.level === 1 ? "text-sm" : "text-sm";
    const fontWeight =
      item.level === 0
        ? "font-bold"
        : item.level === 1
        ? "font-semibold"
        : "font-normal";
    const bgColor =
      item.level === 0
        ? "bg-gray-50"
        : item.level === 1
        ? "bg-white"
        : "bg-white";
    const borderStyle =
      item.level === 0
        ? "border-b-2 border-gray-300"
        : "border-b border-gray-200";

    return (
      <div key={item.id}>
        <div
          className={`${bgColor} ${borderStyle} py-3 px-4 flex items-center justify-between hover:bg-gray-100 transition-colors`}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleExpand(item.id)}
                className="hover:bg-gray-200 rounded p-1"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
            {!hasChildren && <span className="w-6"></span>}
            <span className={`${fontSize} ${fontWeight} text-gray-800`}>
              {item.label}
            </span>
          </div>
          <EditableValue
            value={itemTotal}
            onChange={(newValue) => onValueChange(item.id, newValue)}
            readOnly={hasChildren}
            level={item.level}
          />
        </div>
        {hasChildren && isExpanded && (
          <div>{item.children!.map((child) => renderItem(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const total = calculateTotal(items);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      <div
        className="px-6 py-4 border-b-4"
        style={{ borderColor: themeColor }}
      >
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => renderItem(item))}
      </div>
      <div className="bg-gray-900 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">TOTALE {title.toUpperCase()}</span>
          <span className="text-2xl font-bold">
            €{total.toLocaleString("it-IT")}
          </span>
        </div>
      </div>
    </div>
  );
}

interface EditableValueProps {
  value: number;
  onChange: (value: number) => void;
  readOnly: boolean;
  level: number;
}

function EditableValue({ value, onChange, readOnly, level }: EditableValueProps) {
  const [isEditing, setIsEditing] = useState(false);

  const fontSize = level === 0 ? "text-base" : "text-sm";
  const fontWeight = level === 0 ? "font-bold" : level === 1 ? "font-semibold" : "font-medium";

  if (readOnly) {
    return (
      <span className={`${fontSize} ${fontWeight} text-gray-700`}>
        €{value.toLocaleString("it-IT")}
      </span>
    );
  }

  if (isEditing) {
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={() => setIsEditing(false)}
        autoFocus
        className="h-8 w-32 text-sm text-right"
      />
    );
  }

  return (
    <span
      className={`${fontSize} ${fontWeight} text-blue-600 cursor-pointer hover:text-blue-800 hover:underline`}
      onClick={() => setIsEditing(true)}
    >
      €{value.toLocaleString("it-IT")}
    </span>
  );
}