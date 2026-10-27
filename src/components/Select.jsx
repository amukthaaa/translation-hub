import { ChevronDown } from "lucide-react";

export default function Select({ className = "", wrapperClassName = "", chevronClassName = "right-3", ...props }) {
  return (
    <div className={`relative inline-block ${wrapperClassName}`}>
      <select {...props} className={`appearance-none bg-white ${className}`} />
      <ChevronDown className={`h-4 w-4 text-slate-400 absolute ${chevronClassName} top-1/2 -translate-y-1/2 pointer-events-none`} />
    </div>
  );
}
