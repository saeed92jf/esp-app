// ============================================================
// DiagramLegend - Shows API (green circle) vs non-API
// (gray hexagon) symbol explanation, top-right overlay
// ============================================================

const DiagramLegend = () => (
  <div
    className="
      absolute top-4 right-4 z-10
      bg-white border border-slate-300
      rounded-lg shadow-md px-4 py-3
      flex flex-col gap-2 text-xs text-slate-700
    "
  >
    <p className="font-bold text-slate-800 mb-1">Legend</p>

    {/* API indicator */}
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-green-500 shrink-0" />
      <span>API Standard</span>
    </div>

    {/* Non-API indicator */}
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 bg-gray-500 shrink-0"
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      />
      <span>Non-API Standard</span>
    </div>
  </div>
);

export default DiagramLegend;
