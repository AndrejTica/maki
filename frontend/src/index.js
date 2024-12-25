import Plotly from 'plotly.js-dist-min'
import { async } from 'regenerator-runtime';

async function getData(all) {
  let url;
  if(all){
    url = "http://127.0.0.1:8000/data/all";
  } else {
    url = "http://127.0.0.1:8000/data";
  }
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

var data_gauge = [
  {
    value: 0,
    title: { text: "Speed" },
    type: "indicator",
    mode: "gauge+number"
  }
];

async function create_gauge() {
  var layout = { width: 600, height: 500, margin: { t: 0, b: 0 } };
  Plotly.newPlot('gaugeDiv', data_gauge, layout);
}

async function update_gauge() {
  const mydata_gauge = await getData(false);
  console.log(mydata_gauge);
  Plotly.restyle('gaugeDiv', { value: [mydata_gauge.value] }, 0);
}

create_gauge(data_gauge);

setInterval(update_gauge, 2000);

//LINE CHART ------------------

var trace1 = {
  x: [0],
  y: [0],
  type: 'lines'
};

var data_line = [trace1];

async function create_line() {
  Plotly.newPlot('lineDiv', data_line);
}

async function update_line() {
  const mydata_line = await getData(true);
  const mydata_map_line_value = mydata_line.map((mydata) => mydata.value)
  const mydata_map_line_time = mydata_line.map((mydata) => mydata.time)
  console.log(mydata_map_line_value);
  Plotly.restyle('lineDiv', { y: [mydata_map_line_value] }, 0);
  Plotly.restyle('lineDiv', { x: [mydata_map_line_time] }, 0);
}

document.getElementById("line_button").addEventListener("click", function() {
  update_line()
});

create_line()

