import { FolderOpen } from 'lucide-react';

export default function EmptyState({ 
  icon = <FolderOpen className="mx-auto h-12 w-12 text-slate-300" />, 
  title = "No data found", 
  description = "Get started by creating a new entry.", 
  action 
}) {
  return (
    <div className="text-center p-8 bg-white border border-dashed border-slate-300 rounded-xl">
      {icon}
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
