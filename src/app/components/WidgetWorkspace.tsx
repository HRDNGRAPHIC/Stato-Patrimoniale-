import React, { useState, useCallback, useMemo } from "react";
import { DraggableWidget } from "./DraggableWidget";

export interface WidgetConfig {
  id: string;
  title: string;
  content: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultX?: number;
  defaultY?: number;
  minWidth?: number;
  minHeight?: number;
  closeable?: boolean;
}

interface WidgetWorkspaceProps {
  widgets: WidgetConfig[];
  darkMode?: boolean;
  initiallyOpen?: string[]; // IDs of widgets to open by default
}

export const WidgetWorkspace: React.FC<WidgetWorkspaceProps> = ({
  widgets,
  darkMode = false,
  initiallyOpen = [],
}) => {
  // Track which widgets are open
  const [openWidgets, setOpenWidgets] = useState<Set<string>>(
    new Set(initiallyOpen.length > 0 ? initiallyOpen : widgets.map(w => w.id))
  );

  // Track z-index ordering (higher index = more on top)
  const [zIndexMap, setZIndexMap] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    widgets.forEach((widget, index) => {
      map.set(widget.id, index + 1);
    });
    return map;
  });

  // Bring widget to front when clicked
  const bringToFront = useCallback((widgetId: string) => {
    setZIndexMap((prevMap) => {
      const newMap = new Map(prevMap);
      const maxZ = Math.max(...Array.from(newMap.values()));
      newMap.set(widgetId, maxZ + 1);
      return newMap;
    });
  }, []);

  // Close widget
  const closeWidget = useCallback((widgetId: string) => {
    setOpenWidgets((prev) => {
      const newSet = new Set(prev);
      newSet.delete(widgetId);
      return newSet;
    });
  }, []);

  // Open widget
  const openWidget = useCallback((widgetId: string) => {
    setOpenWidgets((prev) => {
      const newSet = new Set(prev);
      newSet.add(widgetId);
      return newSet;
    });
    bringToFront(widgetId);
  }, [bringToFront]);

  // Toggle widget open/closed
  const toggleWidget = useCallback(
    (widgetId: string) => {
      if (openWidgets.has(widgetId)) {
        closeWidget(widgetId);
      } else {
        openWidget(widgetId);
      }
    },
    [openWidgets, closeWidget, openWidget]
  );

  const openWidgetsList = useMemo(() => {
    return widgets.filter((widget) => openWidgets.has(widget.id));
  }, [widgets, openWidgets]);

  return (
    <div className="relative w-full h-full">
      {/* Render open widgets */}
      {openWidgetsList.map((widget) => (
        <DraggableWidget
          key={widget.id}
          id={widget.id}
          title={widget.title}
          defaultWidth={widget.defaultWidth}
          defaultHeight={widget.defaultHeight}
          defaultX={widget.defaultX}
          defaultY={widget.defaultY}
          minWidth={widget.minWidth}
          minHeight={widget.minHeight}
          darkMode={darkMode}
          zIndex={zIndexMap.get(widget.id) || 1}
          onZIndexChange={bringToFront}
          onClose={widget.closeable !== false ? () => closeWidget(widget.id) : undefined}
        >
          {widget.content}
        </DraggableWidget>
      ))}

      {/* Widget selector toolbar (if some widgets are closed) */}
      {openWidgets.size < widgets.length && (
        <div
          className={`fixed bottom-4 right-4 flex gap-2 p-3 rounded-lg shadow-xl border ${
            darkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }`}
          style={{ zIndex: 9999 }}
        >
          <span
            className={`text-xs font-medium ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Moduli:
          </span>
          {widgets.map((widget) => (
            <button
              key={widget.id}
              onClick={() => toggleWidget(widget.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                openWidgets.has(widget.id)
                  ? darkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title={
                openWidgets.has(widget.id)
                  ? `Chiudi ${widget.title}`
                  : `Apri ${widget.title}`
              }
            >
              {widget.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
