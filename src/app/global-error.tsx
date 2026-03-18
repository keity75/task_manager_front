'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className='min-h-screen flex items-center justify-center p-4'>
        <main className='w-full max-w-md rounded-lg border border-gray-200 p-6 text-center shadow-sm'>
          <h1 className='text-xl font-semibold text-gray-900'>Something went wrong</h1>
          <p className='mt-2 text-sm text-gray-600'>
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            type='button'
            onClick={() => reset()}
            className='mt-4 inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700'
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
