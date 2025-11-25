const readline = require('node:readline');
const buildGraph = require('./graph');
const findRoute = require('./route');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const inputTo = (graphData, from) => (
  rl.question('To station -> ', (to) => {
    if (!graphData[to] || from === to) {
      console.log('Incorrect station');
      return inputTo(from);
    }

    const route = findRoute(graphData, from, to);

    const result = route.map((node) => `${node.name}(${node.latName})`).join('\n-> ');

    console.log('Оптимальный маршрут:\n->', result);
    process.exit();
  })
);
const inputFrom = (graphData) => (
  rl.question(`From station -> `, (from) => {
    if (!graphData[from]) {
      console.log('Incorrect station');
      return inputFrom(graphData);
    }

    inputTo(graphData, from);
  })
);

const start = async () => {
  let subwayData;

  if (process.env.DATA_PATH) {
    subwayData = require(process.env.DATA_PATH);
  } else {
    console.log('Loading data...')
    subwayData = await fetch('https://map.amap.com/service/subway?srhdata=1100_drw_beijing.json').then((res) => res.json());
    console.log('Loading completed')
  }
  const graphData = buildGraph(subwayData);

  inputFrom(graphData);
}

start();
