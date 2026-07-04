import { cn } from "@/lib/utils";

export function Avatar({
  name,
  photoUrl,
  size = 44,
}: {
  name: string;
  photoUrl?: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size / 2.6 }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700"
      )}
    >
      {initials}
    </div>
  );
}
