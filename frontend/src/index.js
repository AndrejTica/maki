import Chart from 'chart.js/auto'
import Plotly from 'plotly.js-dist-min'
import { async } from 'regenerator-runtime';


async function getData() {
  const url = "http://127.0.0.1:8000/data";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const json = await response.json();
    console.log("Fetched Data:", json);
    return json;
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}


//var lineChart = new Chart(
//  document.getElementById('acquisitions'),
//  {
//    type: 'line',
//    data: {
//      datasets: [
//        {
//          label: 'Acquisitions by year',
//        }
//      ]
//    }
//  }
//);
async function updateDiv() {
  const data = await getData();
  lineChart.data.datasets[0].data[2] = data.map(val => val.value);
  lineChart.data.labels = [1, 2, 3, 4, 5, 6];
  lineChart.update();

}

var data = [
  {
    value: 0,
    title: { text: "Speed" },
    type: "indicator",
    mode: "gauge+number"
  }
];

async function create_gauge() {

  var layout = { width: 600, height: 500, margin: { t: 0, b: 0 } };
  Plotly.newPlot('myDiv', data, layout);
}

async function update_gauge() {
  const mydata = await getData();
  console.log(mydata)
  Plotly.restyle('myDiv', { value: [mydata.value] }, 0);
}

create_gauge(data)

setInterval(update_gauge, 2000)

