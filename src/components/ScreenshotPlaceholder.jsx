export default function ScreenshotPlaceholder({ title }) {
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 text-[10px] text-slate-400 truncate">copeland.com/docs/preview</span>
      </div>
      <div className="p-4 space-y-2">
        <div className="h-3 w-2/3 bg-slate-200 rounded" />
        <div className="h-24 w-full bg-slate-100 rounded flex items-center justify-center">
          <span className="text-xs text-slate-400">Diagram / product image</span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded" />
        <div className="h-2 w-5/6 bg-slate-200 rounded" />
        <div className="h-2 w-4/6 bg-slate-200 rounded" />
      </div>
      <p className="text-[11px] text-slate-400 px-4 pb-3">Mock screenshot for "{title}"</p>
    </div>
  );
}
