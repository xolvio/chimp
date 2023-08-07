export default function (names: string[], exceptionHandler: (name: string) => void) {
  const nameCounts: Map<string, number> = new Map();
  for (const name of names) {
    const val = (nameCounts.get(name) ?? 0) + 1;
    if (val > 1) exceptionHandler(name);
    nameCounts.set(name, val);
  }
}
