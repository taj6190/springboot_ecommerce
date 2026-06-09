export default function ProductLoading() {
  return (
    <div className="bg-[#F2F4F8] min-h-screen py-6">
      <div className="container-main">
        <div className="skeleton h-4 w-48 mb-4" />
        <div className="bg-white p-4 md:p-8 rounded-sm border border-[#eee]">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-[40%]">
              <div className="skeleton aspect-square rounded-sm" />
            </div>
            <div className="w-full lg:w-[60%] space-y-4">
              <div className="skeleton h-8 w-3/4" />
              <div className="flex gap-3">
                <div className="skeleton h-7 w-24 rounded-full" />
                <div className="skeleton h-7 w-24 rounded-full" />
                <div className="skeleton h-7 w-24 rounded-full" />
              </div>
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-32 w-full mt-4" />
              <div className="flex gap-3 mt-4">
                <div className="skeleton h-12 flex-1" />
                <div className="skeleton h-12 flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
