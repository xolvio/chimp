export default function (names: string[], exceptionHandler: Function) {
  const nameCounts: Map<string, number> = new Map();
  names.forEach((name) => {
    const val = (nameCounts.get(name) ?? 0) + 1;
    if (val > 1) exceptionHandler(name);
    nameCounts.set(name, val);
  });
}
