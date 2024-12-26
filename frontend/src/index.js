import Plotly from 'plotly.js-dist-min'
import { async } from 'regenerator-runtime';

async function getData(all) {
  let url;
  if (all) {
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

async function create_gauge(sensor_type, gauge_div) {
  const gaugeConfig = {
    temp: {
      text: "Temperature",
      range: [null, 45],
      colors: [
        { range: [0, 18], color: "lightblue" },
        { range: [18, 24], color: "green" },
        { range: [24, 45], color: "red" }
      ]
    },
    co2: {
      text: "CO2",
      range: [50, 200],
      colors: [{ range: [24, 45], color: "red" }]
    }
  };

  const config = gaugeConfig[sensor_type];
  if (!config) {
    console.error(`Unknown sensor type: ${sensor_type}`);
    return;
  }

  const data_gauge = [
    {
      value: 0,
      title: { text: config.text },
      type: "indicator",
      mode: "gauge+number+delta",
      gauge: {
        axis: { range: config.range },
        bar: { color: "black" },
        steps: config.colors
      }
    }
  ];

  Plotly.newPlot(gauge_div, data_gauge, {
    width: 600,
    height: 500,
    margin: { t: 0, b: 0 }
  });
}

//async function update_chart(chart_div) {
async function update_chart(chart_type) {
  if (chart_type == "gauge") {
    const chart_data = await getData(false);
    Plotly.restyle('gaugeDivTemp', { value: [chart_data.value] }, 0);
    return;
  } else if (chart_type == "line") {
    const chart_data = await getData(true);
    const mydata_map_line_value = chart_data.map((mydata) => mydata.value)
    const mydata_map_line_time = chart_data.map((mydata) => mydata.time)
    Plotly.restyle('lineDiv', { y: [mydata_map_line_value] }, 0);
    Plotly.restyle('lineDiv', { x: [mydata_map_line_time] }, 0);
    return;
  } else {
    console.error(`Unknown chart type: ${chart_type}`);
  }
}


//LINE CHART ------------------

async function create_line() {
  Plotly.newPlot('lineDiv', [{
    x: [0],
    y: [0],
    type: 'lines'
  }]
  );
}

const clickableLinks = document.querySelectorAll('#sidebar .links a');

clickableLinks.forEach((link) => {
  if (link.textContent == "Dashboard") {
    link.addEventListener("click", (event) => {
      const gridContainer = document.querySelector('#main-dashboard-content #grid-container');
      if (!document.getElementById('welcome-title')) {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.id = 'welcome-title';
        welcomeDiv.textContent = 'Welcome to the dashboard';
        gridContainer.insertBefore(welcomeDiv, gridContainer.firstChild);

        create_gauge("temp", "gaugeDivTemp");
        //create_gauge("co2", "gaugeDivCo2");
        setInterval(update_chart.bind(null, "gauge"), 2000);
        create_line()
        setInterval(update_chart.bind(null, "line"), 2000)
      }
    })
  }
});


