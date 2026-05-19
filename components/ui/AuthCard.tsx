export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">🐰</h1>
          <h2 className="text-3xl font-bold dark:text-gray-100">Habit Rabbit</h2>
        </div>
        {children}
      </div>
    </div>
  )
}
