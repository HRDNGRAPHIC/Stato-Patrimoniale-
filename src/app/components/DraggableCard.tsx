import React, { useState, useRef, useCallback, useEffect } from "react";
import { Rnd } from "react-rnd";
import { GripVertical, X, Maximize2, Minimize2 } from "lucide-react";

interface DraggableCardProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  darkMode?: boolean;
  className?: string;
  // Callbacks for state changes
  onFloat?: () => void;
  onDock?: () => void;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  id,
  title,
  children,
  darkMode = false,
  className = "",
  onFloat,
  onDock,
}) => {
  // Detect mobile devices - disable floating on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Mobile/tablet breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [isFloating, setIsFloating] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Floating position and size
  const [floatPosition, setFloatPosition] = useState(() => {
    const saved = localStorage.getItem(`draggable-card-${id}-position`);
    if (saved) {
      const data = JSON.parse(saved);
      return { x: data.x || 100, y: data.y || 100 };
    }
    return { x: 100, y: 100 };
  });

  const [floatSize, setFloatSize] = useState(() => {
    const saved = localStorage.getItem(`draggable-card-${id}-size`);
    if (saved) {
      const data = JSON.parse(saved);
      return { width: data.width || 550, height: data.height || 500 };
    }
    return { width: 550, height: 500 };
  });

  const [previousState, setPreviousState] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Mouse drag detection for docked mode
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  // Save position/size to localStorage
  useEffect(() => {
    if (isFloating) {
      localStorage.setItem(`draggable-card-${id}-position`, JSON.stringify(floatPosition));
      localStorage.setItem(`draggable-card-${id}-size`, JSON.stringify(floatSize));
    }
  }, [id, isFloating, floatPosition, floatSize]);

  const handleMouseDownDocked = useCallback((e: React.MouseEvent) => {
    // Disable floating on mobile
    if (isMobile) return;

    // Only activate on header drag
    const target = e.target as HTMLElement;
    const header = e.currentTarget as HTMLElement;
    if (!header.contains(target)) return;

    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartPos.current) return;

      const deltaX = Math.abs(moveEvent.clientX - dragStartPos.current.x);
      const deltaY = Math.abs(moveEvent.clientY - dragStartPos.current.y);

      // Threshold: 10px movement to activate float
      if ((deltaX > 10 || deltaY > 10) && !isDraggingRef.current) {
        isDraggingRef.current = true;
        setFloatPosition({
          x: moveEvent.clientX - 100,
          y: moveEvent.clientY - 20,
        });
        setIsFloating(true);
        if (onFloat) onFloat();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }
    };

    const handleMouseUp = () => {
      dragStartPos.current = null;
      isDraggingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [onFloat]);

  const handleDragStop = useCallback(
    (e: any, d: { x: number; y: number }) => {
      setFloatPosition({ x: d.x, y: d.y });
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
      setFloatSize({
        width: parseInt(ref.style.width),
        height: parseInt(ref.style.height),
      });
      setFloatPosition(position);
    },
    []
  );

  const handleClose = useCallback(() => {
    setIsFloating(false);
    setIsMaximized(false);
    if (onDock) onDock();
  }, [onDock]);

  const handleMaximize = useCallback(() => {
    if (isMaximized) {
      if (previousState) {
        setFloatPosition({ x: previousState.x, y: previousState.y });
        setFloatSize({ width: previousState.width, height: previousState.height });
      }
      setIsMaximized(false);
    } else {
      setPreviousState({
        x: floatPosition.x,
        y: floatPosition.y,
        width: floatSize.width,
        height: floatSize.height,
      });
      setFloatPosition({ x: 0, y: 0 });
      setFloatSize({ width: window.innerWidth, height: window.innerHeight - 100 });
      setIsMaximized(true);
    }
  }, [isMaximized, floatPosition, floatSize, previousState]);

  // Docked (normal) rendering
  if (!isFloating) {
    return (
      <div className={`${className} transition-all duration-300`}>
        {title && (
          <div
            className={`flex items-center gap-2 px-4 py-3 border-b select-none ${
              isMobile 
                ? "cursor-default" 
                : "cursor-grab active:cursor-grabbing"
            } ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
            onMouseDown={!isMobile ? handleMouseDownDocked : undefined}
          >
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
        )}
        <div>{children}</div>
      </div>
    );
  }

  // Floating rendering (uses Rnd)
  return (
    <Rnd
      position={{ x: floatPosition.x, y: floatPosition.y }}
      size={{ width: floatSize.width, height: floatSize.height }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      minWidth={350}
      minHeight={300}
      bounds="window"
      enableResizing={!isMaximized}
      dragHandleClassName="drag-handle-header"
      disablePointerEvents={false}
      style={{
        position: 'fixed',
        zIndex: 1000,
        willChange: 'transform',
      }}
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
        {/* Floating Header */}
        <div
          className={`drag-handle-header flex items-center justify-between px-4 py-3 border-b cursor-move select-none ${
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
            {title && (
              <h3
                className={`font-semibold text-sm ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {title}
              </h3>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleMaximize}
              className={`p-1.5 rounded hover:bg-opacity-10 transition-colors cursor-pointer ${
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
            <button
              onClick={handleClose}
              className={`p-1.5 rounded hover:bg-opacity-10 transition-colors cursor-pointer ${
                darkMode
                  ? "hover:bg-red-500 text-gray-400 hover:text-red-400"
                  : "hover:bg-red-500 text-gray-500 hover:text-red-600"
              }`}
              title="Chiudi e torna al layout"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </Rnd>
  );
};
