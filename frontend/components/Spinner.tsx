interface Props {
  label: string;
}

export function Spinner({ label }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      <span className="text-gray-500">{label}</span>
    </div>
  );
}
