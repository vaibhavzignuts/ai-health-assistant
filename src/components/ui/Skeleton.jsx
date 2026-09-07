export default function Skeleton({ className = '', ...props }) {
  return (
    <div 
      className={`animate-pulse bg-slate-200 rounded-md ${className}`} 
      {...props} 
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`h-4 bg-slate-200 rounded-md ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`} 
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`p-5 bg-white border border-slate-200 rounded-xl ${className}`}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="mt-4">
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}
