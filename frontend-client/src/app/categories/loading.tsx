export default function CategoriesLoading() {
  return (
    <div className="container-main py-8">
      <div className="skeleton h-8 w-48 mb-2" />
      <div className="skeleton h-4 w-64 mb-8" />
      <div className="space-y-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 mb-4">
              <div className="skeleton w-10 h-10 rounded-lg" />
              <div className="skeleton h-5 w-40" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 ml-4 pl-4 border-l-2 border-[#eee]">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="p-3 rounded-xl border border-[#eee]">
                  <div className="skeleton w-8 h-8 mx-auto rounded mb-2" />
                  <div className="skeleton h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
