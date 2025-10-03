import { APP_NAME } from "@/lib/config";

export default function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full" style={{ backgroundColor: "var(--color-secondary)" }} />
      <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
    </div>
  );
}
