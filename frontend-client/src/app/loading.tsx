export default function Loading() {
  return (
    <div className="container-main py-8">
      <div className="skeleton h-8 w-48 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#eee] rounded-sm overflow-hidden">
            <div className="skeleton aspect-square" />
            <div className="p-4 space-y-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-5 w-1/3 mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
