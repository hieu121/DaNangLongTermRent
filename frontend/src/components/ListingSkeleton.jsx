export default function ListingSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-36 rounded-lg bg-slate-200" />
      <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
      <div className="mt-2 h-5 w-1/3 rounded bg-slate-200" />
    </div>
  );
}
