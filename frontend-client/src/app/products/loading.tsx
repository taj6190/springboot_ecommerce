export default function ProductsLoading() {
  return (
    <div className="bg-[#F2F4F8] min-h-screen py-6">
      <div className="container-main">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white border border-[#eee] rounded-sm p-4 space-y-3">
              <div className="skeleton h-5 w-24" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-4 w-full" />
              ))}
            </div>
          </aside>
          <div className="flex-1">
            <div className="skeleton h-12 w-full rounded-sm mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
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
        </div>
      </div>
    </div>
  );
}
