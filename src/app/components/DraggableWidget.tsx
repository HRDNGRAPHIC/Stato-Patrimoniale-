import React, { useState, useCallback, useEffect } from "react";
import { Rnd } from "react-rnd";
import { GripVertical, X, Maximize2, Minimize2 } from "lucide-react";

interface DraggableWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultX?: number;
  defaultY?: number;
  minWidth?: number;
  minHeight?: number;
  darkMode?: boolean;
  onClose?: () => void;
  zIndex?: number;
  onZIndexChange?: (id: string) => void;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  id,
  title,
  children,
  defaultWidth = 500,
  defaultHeight = 400,
  defaultX = 100,
  defaultY = 100,
  minWidth = 300,
  minHeight = 250,
  darkMode = false,
  onClose,
  zIndex = 1,
  onZIndexChange,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [previousState, setPreviousState] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Load position and size from localStorage on mount
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem(`widget-${id}-position`);
    if (saved) {
      const data = JSON.parse(saved);
      return { x: data.x || defaultX, y: data.y || defaultY };
    }
    return { x: defaultX, y: defaultY };
  });

  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem(`widget-${id}-size`);
    if (saved) {
      const data = JSON.parse(saved);
      return { width: data.width || defaultWidth, height: data.height || defaultHeight };
    }
    return { width: defaultWidth, height: defaultHeight };
  });

  // Save position and size to localStorage
  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem(`widget-${id}-position`, JSON.stringify(position));
    localStorage.setItem(`widget-${id}-size`, JSON.stringify(size));
  }, [id, position, size]);

  useEffect(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  const handleDragStop = useCallback(
    (e: any, d: { x: number; y: number }) => {
      setPosition({ x: d.x, y: d.y });
    },
    []
  );

  const handleResizeStop = useCallback(
    (
      e: any,
      direction: any,
      ref: HTMLElement,
      delta: any,
      position: { x: number; y: number }
    ) => {
      setSize({
        width: parseInt(ref.style.width),
        height: parseInt(ref.style.height),
      });
      setPosition(position);
    },
    []
  );

  const handleMaximize = useCallback(() => {
    if (isMaximized) {
      // Restore previous state
      if (previousState) {
        setPosition({ x: previousState.x, y: previousState.y });
        setSize({ width: previousState.width, height: previousState.height });
      }
      setIsMaximized(false);
    } else {
      // Save current state and maximize
      setPreviousState({
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      });
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 100 });
      setIsMaximized(true);
    }
  }, [isMaximized, position, size, previousState]);

  const handleMouseDown = useCallback(() => {
    if (onZIndexChange) {
      onZIndexChange(id);
    }
  }, [id, onZIndexChange]);

  return (
    <Rnd
      position={{ x: position.x, y: position.y }}
      size={{ width: size.width, height: size.height }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      minWidth={minWidth}
      minHeight={minHeight}
      bounds="window"
      enableResizing={!isMaximized}
      dragHandleClassName="widget-drag-handle"
      style={{
        zIndex: zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`h-full flex flex-col rounded-lg shadow-2xl border transition-all ${
          darkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        }`}
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Widget Header */}
        <div
          className={`widget-drag-handle flex items-center justify-between px-4 py-3 border-b cursor-move select-none ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <GripVertical
              className={`w-4 h-4 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <h3
              className={`font-semibold text-sm ${
                darkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleMaximize}
              className={`p-1.5 rounded hover:bg-opacity-10 transition-colors ${
                darkMode
                  ? "hover:bg-white text-gray-400 hover:text-gray-200"
                  : "hover:bg-gray-900 text-gray-500 hover:text-gray-700"
              }`}
              title={isMaximized ? "Ripristina" : "Massimizza"}
            >
              {isMaximized ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className={`p-1.5 rounded hover:bg-opacity-10 transition-colors ${
                  darkMode
                    ? "hover:bg-red-500 text-gray-400 hover:text-red-400"
                    : "hover:bg-red-500 text-gray-500 hover:text-red-600"
                }`}
                title="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Widget Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </Rnd>
  );
};
