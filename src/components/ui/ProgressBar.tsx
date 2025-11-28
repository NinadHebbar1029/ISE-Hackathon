type Item = {
  label: string;
  value: number;
  colorClass?: string; // tailwind bg-* class
};

export default function ProgressBar({ items, total }: { items: Item[]; total?: number }) {
  const sum = total ?? items.reduce((acc, i) => acc + i.value, 0);
  const safe = sum > 0 ? sum : 1;

  return (
    <div className="space-y-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-200">
        {items.map((i, idx) => {
          const width = `${Math.round((i.value / safe) * 100)}%`;
          const color = i.colorClass ?? ['bg-urgent-500','bg-warning-500','bg-primary-500','bg-green-500','bg-gray-400'][idx % 5];
          return <div key={i.label} className={`${color}`} style={{ width }} />;
        })}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((i, idx) => (
          <div key={i.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded ${i.colorClass ?? ['bg-urgent-500','bg-warning-500','bg-primary-500','bg-green-500','bg-gray-400'][idx % 5]}`} />
              <span className="text-gray-700 capitalize">{i.label.replace('_',' ')}</span>
            </div>
            <span className="font-medium text-gray-900">{i.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
