export const cn = (
  ...classes: (string | boolean | undefined | null)[]
): string => {
  return classes.filter(Boolean).join(' ');
};

export const generateId = (prefix = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const filterBySearchTerm = <T,>(
  items: T[],
  searchTerm: string,
  extractors: ((item: T) => string)[]
): T[] => {
  if (!searchTerm.trim()) return items;
  const term = searchTerm.toLowerCase();
  return items.filter((item) =>
    extractors.some((extractor) => {
      const val = extractor(item);
      return typeof val === 'string' && val.toLowerCase().includes(term);
    })
  );
};
