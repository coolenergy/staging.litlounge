export const chooseBy = <K extends string | number, T>(key: K, records: Record<K, T>) => {
  return records[key];
};
