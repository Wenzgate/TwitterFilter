export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-800/60" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-xl bg-neutral-800/60" />
        ))}
      </div>
    </div>
  );
}
