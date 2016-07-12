
const cache = new Map();

export function store(id, view) {
  cache.set(id, view);
}

export function retrieve(id) {
  return cache.get(id);
}

export function drop(id) {
  cache.delete(id);
}
