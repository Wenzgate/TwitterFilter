export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-xl bg-neutral-800/60" />
      ))}
    </div>
  );
}
