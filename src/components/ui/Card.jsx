export default function Card({ children, className = '', noPadding = false, ...props }) {
  return (
    <div 
      className={`bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden ${className}`}
      {...props}
    >
      {!noPadding ? (
        <div className="p-5">
          {children}
        </div>
      ) : children}
    </div>
  );
}
