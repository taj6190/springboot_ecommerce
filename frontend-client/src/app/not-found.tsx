import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-main py-20 text-center">
      <h1 className="text-6xl font-extrabold text-[#081621] mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-8">Page not found</p>
      <Link href="/" className="btn btn-accent">Back to Home</Link>
    </div>
  );
}
