const readline = require('node:readline');
const buildGraph = require('./graph');
const findRoute = require('./route');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const showRoute = (routesData, index) => {
  const { route, lines, timeMin, distanceKm } = routesData[index];
  const routeText = route.map((node) => `${node.name}(${node.latName})`).join('\n -> ');
  const infoText = `Количество пересадок: ${lines.length - 1}\n Линии: ${lines.join(' -> ')}\n Примерное время в пути: ${timeMin}m\n Примерное расстояние: ${distanceKm}km`;

  console.log(`Показан ${index + 1} маршрут из ${routesData.length}`);
  console.log('Маршрут:\n ->', routeText);
  console.log('Информация о маршруте:\n', infoText);
}

const inputRouteNumber = (routesData) => {
  console.log(`\nНайдено маршрутов: ${routesData.length}`);

  rl.question(`<route number> or 'exit' -> `, (input) => {
    if (input === 'exit') {
      return process.exit();
    }

    const number = parseInt(input);

    if (isNaN(number) || number < 1 || number > routesData.length) {
      console.log('Incorrect route number');
      return inputRouteNumber(routesData);
    }

    showRoute(routesData, number - 1);
    inputRouteNumber(routesData);
  });
}

const inputTo = (graphData, from) => (
  rl.question('To station -> ', (to) => {
    if (!graphData[to] || from === to) {
      console.log('Incorrect station');
      return inputTo(from);
    }

    const routesData = findRoute(graphData, from, to);

    showRoute(routesData, 0);
    inputRouteNumber(routesData);
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
