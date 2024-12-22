import Chart from 'chart.js/auto'
import Plotly from 'plotly.js-dist-min'
import { async } from 'regenerator-runtime';


async function getData() {
  const url = "http://127.0.0.1:8000/data/all";
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
  lineChart.data.datasets[0].data[2] = data.map(val => val.value); // Would update the first dataset's value of 'March' to be 50
  lineChart.data.labels = [1,2,3,4,5,6]; // Would update the first dataset's value of 'March' to be 50
  lineChart.update(); // Calling update now animates the position of March from 90 to 50.

}

async function gauge(){
  var TESTER = document.getElementById('tester');
  Plotly.newPlot( TESTER, [{
  x: [1, 2, 3, 4, 5],
  y: [1, 2, 4, 8, 16] }], {
  margin: { t: 0 } } );
}

gauge()

//setInterval(updateDiv, 2000)

