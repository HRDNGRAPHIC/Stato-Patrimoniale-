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
  /** Optional: show N / N-1 year columns with totals for main categories */
  showYearColumns?: boolean;
  valuesN?: Record<string, number>;
  valuesN1?: Record<string, number>;
  onChangeN?: (id: string, value: number) => void;
  onChangeN1?: (id: string, value: number) => void;
  /** Vertical stacked progress bar segments */
  structureBar?: { id: string; percent: number; color: string }[];
  /** Dark mode */
  darkMode?: boolean;
}

export function BalanceSheetSection({
  title,
  items,
  onValueChange,
  themeColor,
  showYearColumns = false,
  valuesN = {},
  valuesN1 = {},
  onChangeN,
  onChangeN1,
  structureBar,
  darkMode = false,
}: BalanceSheetSectionProps) {
  /* Collect level 0 IDs so only main categories start expanded */
  const collectExpandableIds = (list: BalanceSheetItemData[]): string[] => {
    return list.filter(item => item.level === 0 && item.children && item.children.length > 0).map(item => item.id);
  };

  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    () => new Set(collectExpandableIds(items))
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

  /* Flatten the tree into visible rows respecting expand/collapse state */
  const flattenVisible = (
    list: BalanceSheetItemData[],
    depth: number = 0
  ): { item: BalanceSheetItemData; depth: number }[] => {
    const rows: { item: BalanceSheetItemData; depth: number }[] = [];
    for (const item of list) {
      rows.push({ item, depth });
      const hasChildren = item.children && item.children.length > 0;
      if (hasChildren && expandedItems.has(item.id)) {
        rows.push(...flattenVisible(item.children!, depth + 1));
      }
    }
    return rows;
  };

  /* Sum N / N-1 values across direct children (level 1) of a level 0 item */
  const sumChildrenValues = (item: BalanceSheetItemData, values: Record<string, number>): number => {
    if (!item.children) return 0;
    return item.children.reduce((sum, child) => sum + (values[child.id] ?? 0), 0);
  };

  /* Level 0 value: if manually overridden use that, otherwise sum of children */
  const getLevel0Value = (item: BalanceSheetItemData, values: Record<string, number>): number => {
    if (item.id in values) return values[item.id];
    return sumChildrenValues(item, values);
  };

  const visibleRows = flattenVisible(items);
  const total = calculateTotal(items);
  const totalN = items.reduce((s, item) => s + getLevel0Value(item, valuesN), 0);
  const totalN1 = items.reduce((s, item) => s + getLevel0Value(item, valuesN1), 0);

  const hasBar = structureBar && structureBar.length > 0;

  return (
    <div className="flex h-full gap-0">
      {/* ---- Main table card ---- */}
      <div className={`shadow-lg border overflow-hidden flex-1 flex flex-col transition-colors duration-300 ${hasBar ? "rounded-l-xl" : "rounded-xl"} ${
        darkMode
          ? "bg-[#1e293b] border-slate-700"
          : "bg-white border-gray-200"
      }`}>
        {/* ---- Wrapper for scrollable table ---- */}
        <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse table-fixed">
          {/* Column widths */}
          <colgroup>
            <col className="w-auto" />
            {showYearColumns && <col className="w-[130px] min-w-[100px]" />}
            {showYearColumns && <col className="w-[130px] min-w-[100px]" />}
          </colgroup>

          {/* ---- Header ---- */}
          <thead className="sticky top-0 z-10">
            <tr style={{ borderBottom: `4px solid ${themeColor}` }} className={darkMode ? "bg-[#1e293b]" : "bg-white"}>
              <th className={`px-6 py-4 text-left text-2xl font-bold ${darkMode ? "text-slate-100" : "text-gray-900"}`}>
                {title}
              </th>
              {showYearColumns && (
                <th className={`px-3 py-4 text-center text-xs font-semibold border-l ${darkMode ? "text-slate-400 border-slate-600" : "text-gray-500 border-gray-300"}`}>
                  N
                </th>
              )}
              {showYearColumns && (
                <th className={`px-3 py-4 text-center text-xs font-semibold border-l ${darkMode ? "text-slate-400 border-slate-600" : "text-gray-500 border-gray-300"}`}>
                  N-1
                </th>
              )}
            </tr>
          </thead>

          {/* ---- Body rows ---- */}
          <tbody>
            {visibleRows.map(({ item, depth }) => {
              const hasChildren = item.children && item.children.length > 0;
              const itemTotal = hasChildren
                ? calculateTotal(item.children!)
                : item.value;

              const paddingLeft = depth * 24 + 16;

              const fontSize =
                item.level === 0 ? "text-base" : "text-sm";
              const fontWeight =
                item.level === 0
                  ? "font-bold"
                  : item.level === 1
                  ? "font-semibold"
                  : "font-normal";
              const bgColor =
                item.level === 0
                  ? darkMode ? "bg-slate-800/50" : "bg-gray-50"
                  : darkMode ? "bg-[#1e293b]" : "bg-white";
              const borderStyle =
                item.level === 0
                  ? darkMode ? "border-b-2 border-slate-600" : "border-b-2 border-gray-300"
                  : darkMode ? "border-b border-slate-700" : "border-b border-gray-200";

              return (
                <tr
                  key={item.id}
                  className={`${bgColor} ${borderStyle} ${darkMode ? "hover:bg-slate-700/50" : "hover:bg-gray-100"} transition-colors`}
                >
                  {/* Label cell */}
                  <td
                    className="py-3 pr-2"
                    style={{ paddingLeft: `${paddingLeft}px` }}
                  >
                    <div
                      className={`flex items-center gap-2 ${hasChildren ? "cursor-pointer" : ""}`}
                      onClick={() => hasChildren && toggleExpand(item.id)}
                    >
                      {hasChildren ? (
                        <span className="p-1 shrink-0">
                          {expandedItems.has(item.id) ? (
                            <ChevronDown className={`w-4 h-4 ${darkMode ? "text-slate-400" : "text-gray-600"}`} />
                          ) : (
                            <ChevronRight className={`w-4 h-4 ${darkMode ? "text-slate-400" : "text-gray-600"}`} />
                          )}
                        </span>
                      ) : (
                        <span className="w-6 shrink-0" />
                      )}
                      <span className={`${fontSize} ${fontWeight} ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                        {item.label}
                      </span>
                    </div>
                  </td>

                  {/* N cell */}
                  {showYearColumns && (
                    <td className={`py-3 px-3 text-center border-l ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
                      {item.level === 0 && (
                        <EditableValue
                          value={getLevel0Value(item, valuesN)}
                          onChange={(v) => onChangeN?.(item.id, v)}
                          readOnly={false}
                          level={item.level}
                          darkMode={darkMode}
                        />
                      )}
                      {item.level === 1 && (
                        <EditableValue
                          value={valuesN[item.id] ?? 0}
                          onChange={(v) => onChangeN?.(item.id, v)}
                          readOnly={false}
                          level={item.level}
                          darkMode={darkMode}
                        />
                      )}
                    </td>
                  )}

                  {/* N-1 cell */}
                  {showYearColumns && (
                    <td className={`py-3 px-3 text-center border-l ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
                      {item.level === 0 && (
                        <EditableValue
                          value={getLevel0Value(item, valuesN1)}
                          onChange={(v) => onChangeN1?.(item.id, v)}
                          readOnly={false}
                          level={item.level}
                          darkMode={darkMode}
                        />
                      )}
                      {item.level === 1 && (
                        <EditableValue
                          value={valuesN1[item.id] ?? 0}
                          onChange={(v) => onChangeN1?.(item.id, v)}
                          readOnly={false}
                          level={item.level}
                          darkMode={darkMode}
                        />
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---- Footer (anchored to bottom of card) ---- */}
      <div className={`shrink-0 transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-gray-900 text-white"}`}>
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-auto" />
            {showYearColumns && <col className="w-[130px] min-w-[100px]" />}
            {showYearColumns && <col className="w-[130px] min-w-[100px]" />}
          </colgroup>
          <tbody>
            <tr>
              <td className="px-6 py-4 text-lg font-bold">
                TOTALE {title.toUpperCase()}
              </td>
              {showYearColumns && (
                <td className="px-3 py-4 text-center text-lg font-bold border-l border-gray-700">
                  €{totalN.toLocaleString("it-IT")}
                </td>
              )}
              {showYearColumns && (
                <td className="px-3 py-4 text-center text-lg font-bold border-l border-gray-700">
                  €{totalN1.toLocaleString("it-IT")}
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>

      {/* ---- Vertical structure bar (outside the table) ---- */}
      {hasBar && (
        <div className={`w-5 flex flex-col rounded-r-xl overflow-hidden border border-l-0 shadow-lg shrink-0 self-stretch ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
          {structureBar!.map((seg) => (
            <div
              key={seg.id}
              className="transition-all duration-500"
              style={{
                backgroundColor: seg.color,
                flexGrow: seg.percent,
                minHeight: seg.percent > 0 ? "4px" : "0px",
              }}
              title={`${seg.id}: ${seg.percent}%`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface EditableValueProps {
  value: number;
  onChange: (value: number) => void;
  readOnly: boolean;
  level: number;
  darkMode?: boolean;
}

function EditableValue({ value, onChange, readOnly, level, darkMode = false }: EditableValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [rawInput, setRawInput] = useState("");

  const fontSize = level === 0 ? "text-base" : "text-sm";
  const fontWeight =
    level === 0 ? "font-bold" : level === 1 ? "font-semibold" : "font-medium";

  const formatWithDots = (n: number): string => {
    if (n === 0) return "0";
    return n.toLocaleString("it-IT");
  };

  const parseInput = (str: string): number => {
    // Remove dots (thousands separator) and parse
    const cleaned = str.replace(/\./g, "").replace(/[^0-9-]/g, "");
    return Number(cleaned) || 0;
  };

  const handleStartEdit = () => {
    setRawInput(value ? formatWithDots(value) : "");
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Allow only digits, dots, and minus
    const cleaned = input.replace(/[^0-9-]/g, "");
    const numericValue = Number(cleaned) || 0;
    // Format with dots and update
    setRawInput(numericValue ? formatWithDots(numericValue) : cleaned);
    onChange(numericValue);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  if (readOnly) {
    return (
      <span className={`${fontSize} ${fontWeight} ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
        €{value.toLocaleString("it-IT")}
      </span>
    );
  }

  if (isEditing) {
    return (
      <Input
        type="text"
        value={rawInput}
        onChange={handleChange}
        onBlur={handleBlur}
        autoFocus
        className={`h-8 w-full text-sm text-center ${darkMode ? "bg-slate-800 border-slate-600 text-slate-100" : ""}`}
      />
    );
  }

  return (
    <span
      className={`${fontSize} ${fontWeight} cursor-pointer hover:underline ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}
      onClick={handleStartEdit}
    >
      €{value.toLocaleString("it-IT")}
    </span>
  );
}