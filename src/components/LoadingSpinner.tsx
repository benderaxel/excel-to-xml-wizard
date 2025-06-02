import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ showText = true }: { showText?: boolean }) => {
  return (
    <div className="flex items-center justify-center gap-2 min-w-10">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="sr-only">Loading...</span>
      {showText && <span>Loading...</span>}
    </div>
  );
};
