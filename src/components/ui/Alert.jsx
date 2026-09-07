import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

export default function Alert({ title, children, variant = 'info', className = '', ...props }) {
  const variants = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-500" />
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <XCircle className="h-5 w-5 text-red-500" />
    }
  };

  const style = variants[variant] || variants.info;

  return (
    <div className={`rounded-lg border p-4 ${style.bg} ${style.border} ${className}`} {...props}>
      <div className="flex">
        <div className="flex-shrink-0">
          {style.icon}
        </div>
        <div className="ml-3">
          {title && <h3 className={`text-sm font-medium ${style.text}`}>{title}</h3>}
          <div className={`text-sm ${title ? 'mt-2' : ''} ${style.text} opacity-90`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
