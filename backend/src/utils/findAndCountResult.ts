export type ListQuery = {
  _limit?: string | number;
  _page?: string | number;
  _sort?: string;
  _order?: string;
  q?: string;
  [key: string]: unknown;
};

export const findAndCountResult = <T extends Record<string, any>>(
  rows: T[],
  query: ListQuery = {},
): { rows: T[]; count: number; limit: number; page: number } => {
  const limit = Number(query._limit || 10);
  const page = Number(query._page || 1);
  const sort = query._sort;
  const order = String(query._order || "desc").toLowerCase();

  let filtered = [...rows];

  if (sort) {
    filtered = filtered.sort((a, b) => {
      const aValue = a[sort];
      const bValue = b[sort];
      if (aValue === bValue) return 0;
      if (aValue === undefined || bValue === undefined) return 0;
      return aValue > bValue
        ? order === "asc"
          ? 1
          : -1
        : order === "asc"
          ? -1
          : 1;
    });
  }

  if (query.q) {
    const q = String(query.q).toLowerCase();
    filtered = filtered.filter((row) =>
      Object.values(row).some(
        (value) => typeof value === "string" && value.toLowerCase().includes(q),
      ),
    );
  }

  const reserved = new Set(["_limit", "_page", "_sort", "_order", "q"]);
  Object.keys(query).forEach((key) => {
    if (reserved.has(key)) return;
    const queryValue = query[key];
    if (queryValue === undefined || queryValue === null || queryValue === "")
      return;
    filtered = filtered.filter((row) =>
      String(row[key] ?? "")
        .toLowerCase()
        .includes(String(queryValue).toLowerCase()),
    );
  });

  const count = filtered.length;
  const start = (page - 1) * limit;

  return {
    rows: filtered.slice(start, start + limit),
    count,
    limit,
    page,
  };
};
