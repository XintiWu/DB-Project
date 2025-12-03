import { Card, CardContent, CardFooter, CardHeader } from './ui/card'

export function SkeletonCard() {
  return (
    <Card className="animate-pulse dark:bg-slate-800 dark:border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
          <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-20 h-5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          <div className="w-20 h-5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>

        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="w-full h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </CardFooter>
    </Card>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

