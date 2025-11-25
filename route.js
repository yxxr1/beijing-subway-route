class Queue {
  constructor() {
    this.array = [];
    this.startIndex = 0;
    this._length = 0;
  }

  add(value) {
    if (!this.array.includes(value)) {
      this.array.push(value);
      this._length++;
    }
  }

  get() {
    const value = this.array[this.startIndex];
    delete this.array[this.startIndex];
    this.startIndex++;
    this._length--;

    return value;
  }

  get length() {
    return this._length;
  }
}

const findRoute = (data, from, to) => {
  const startNode = data[from];
  // { [имя станции]: [расстояние из исходной, маршрут из исходной] }
  const routes = {[startNode.name]: [0, [startNode]]};
  const queue = new Queue();
  queue.add(startNode);

  while (queue.length) {
    const node = queue.get();
    const [distance, route] = routes[node.name];

    node.neighbors.forEach(([distanceToNeighbor, neighbor]) => {
      const neighborDistance = routes[neighbor.name]?.[0] ?? Infinity;
      const newDistance = distance + distanceToNeighbor;

      if (newDistance < neighborDistance) {
        routes[neighbor.name] = [newDistance, [...route, neighbor]];
        queue.add(neighbor);
      }
    });
  }

  return routes[to][1];
}

module.exports = findRoute;
