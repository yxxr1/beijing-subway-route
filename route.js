const OneKmInCoords =  0.011000000939146893;
const AverageSubwaySpeedKmh = 80;
const ChangeLineTimeMin = 5;
const StationStopTimeMin = 2;

const calcAverageTime = (distanceKm, changeLineCount, stopCount) => {
  const timeBetweenStationsMin = (distanceKm / AverageSubwaySpeedKmh) * 60;
  const changeLineTime = changeLineCount * ChangeLineTimeMin;
  const stopWaitTime = (stopCount - changeLineCount) * StationStopTimeMin;

  return timeBetweenStationsMin + changeLineTime + stopWaitTime;
}

const getLinesInfo = (route) => {
  if (route.length < 2) {
    return;
  }

  const getIntersection = (set1, set2, allowEmpty = false) => {
    const result = set1.intersection(set2);

    if (!allowEmpty && !result.size) {
      throw new Error('incorrect route');
    }

    return result;
  };
  const routeSections = [getIntersection(route[0].lines, route[1].lines)];

  for (let i = 1; i < route.length - 1; i++) {
    const currentLines = route[i].lines;
    const nextLines = route[i + 1].lines;

    const stationsSharedLines = getIntersection(currentLines, nextLines);
    const lastSection = routeSections[routeSections.length - 1];
    const intersectionWithLast = getIntersection(stationsSharedLines, lastSection, true);

    if (!intersectionWithLast.size) {
      routeSections.push(stationsSharedLines);
    } else {
      routeSections[routeSections.length - 1] = intersectionWithLast;
    }
  }

  return routeSections.map(set => set.values().next().value);
}

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

  const [distance, route] = routes[to];
  const lines = getLinesInfo(route);
  const distanceKm =  distance / OneKmInCoords;
  const timeMin = calcAverageTime(distanceKm, lines.length - 1, route.length - 1);

  return {
    route,
    lines,
    distanceKm: distanceKm.toFixed(1),
    timeMin: Math.ceil(timeMin),
  };
}

module.exports = findRoute;
