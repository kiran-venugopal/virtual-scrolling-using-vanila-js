export function db(size = 100, pageSize = 10, getItem) {
  const items = Array(size)
    .fill(null)
    .map((_, index) => getItem(index));

  return {
    load(start, limit = pageSize) {
      const chunk = items.slice(start, start + limit);
      const cursorInfo = {
        chunk,
        nextCursor: start + limit,
        prevCursor: start,
        size: chunk.length
      };
      return new Promise((resolve) => resolve(cursorInfo));
    }
  };
}
