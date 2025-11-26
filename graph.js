class GraphNode {
  constructor(name, latName, coords) {
    this.name = name;
    this.latName = latName;
    this.lines = new Set();
    this.coords = coords;
    this.neighbors = [];
  }

  addNeighbor(distance, node) {
    this.neighbors.push([distance, node]);
  }

  addLine(line) {
    this.lines.add(line);
  }
}

function buildGraph(data) {
  const nodesMapByName = {};

  const calcDistance = ([x1, y1], [x2, y2]) => {
    const a = Math.abs(x1 - x2);
    const b = Math.abs(y1 - y2);

    return Math.sqrt(a**2 + b**2);
  }

  const handleStation = (lineName, station, index, stations) => {
    const name = station.n;
    const latName = station.sp;
    const coords = station.sl.split(',').map(Number);

    if (!nodesMapByName[name]) {
      nodesMapByName[name] = new GraphNode(name, latName, coords);
    }

    const node = nodesMapByName[name];
    node.addLine(lineName);
    const prevNodeName = index > 0 ? stations[index - 1].n : null;
    const prevNode = prevNodeName ? nodesMapByName[prevNodeName] : null;

    if (prevNode) {
      const distance = calcDistance(node.coords, prevNode.coords);
      node.addNeighbor(distance, prevNode);
      prevNode.addNeighbor(distance, node);
    }
  }

  data.l.forEach((line) => line.st.forEach((...args) => handleStation(line.ln, ...args)));

  return nodesMapByName;
}

module.exports = buildGraph;
