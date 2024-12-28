import Plotly from 'plotly.js-dist-min'
import { async } from 'regenerator-runtime';

async function getData(type, all) {
  let url;
  if (all) {
    url = `http://127.0.0.1:8000/data/${type}/all`;
  } else {
    url = `http://127.0.0.1:8000/data/${type}`;
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
      range: [250, 1500],
      colors: [
        { range: [250, 500], color: "green" },
        { range: [500, 1000], color: "yellow" },
        { range: [1000, 1500], color: "red" }
      ]
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

async function update_chart(chart_type, sensor_type) {
  if (chart_type == "gauge") {
    const chart_data = await getData(sensor_type == "temp" ? "temp" : "co2", false);
    Plotly.restyle(sensor_type == "temp" ? 'gaugeDivTemp' : "gaugeDivCo2", { value: [chart_data.value] }, 0);
    return;
  } else if (chart_type == "line") {
    const chart_data = await getData(sensor_type == "temp" ? "temp" : "co2", true);
    const mydata_map_line_value = chart_data.map((mydata) => mydata.value)
    const mydata_map_line_time = chart_data.map((mydata) => mydata.time)
    Plotly.restyle(sensor_type == "temp" ? 'lineDivTemp' : "lineDivCo2", { y: [mydata_map_line_value] }, 0);
    Plotly.restyle(sensor_type == "temp" ? 'lineDivTemp' : "lineDivCo2", { x: [mydata_map_line_time] }, 0);
    return;
  } else {
    console.error(`Unknown chart type: ${chart_type}`);
  }
}


//LINE CHART ------------------

async function create_line(sensor_type, line_div) {
  var layout = {
    title: { text: sensor_type == "temp" ? "Temperature" : "Co2" }
  };
  Plotly.newPlot(line_div, [{ x: [0], y: [0], type: 'lines' }], layout);
}

async function clear_screen() {
  try { clearInterval(intervallId1) } catch (error) { }
  try { clearInterval(intervallId2) } catch (error) { }
  try { Plotly.purge("gaugeDivTemp") } catch (error) { }
  try { Plotly.purge("gaugeDivCo2") } catch (error) { }
  try { Plotly.purge("lineDivTemp") } catch (error) { }
  try { Plotly.purge("lineDivCo2") } catch (error) { }
  try { document.getElementById("alerts").remove() } catch (error) { }
  try { document.getElementById("button_container").remove() } catch (error) { }
  try { document.getElementById("clear_button").remove() } catch (error) { }
}

const clickableLinks = document.querySelectorAll('#sidebar .links a');

let intervallId1;
let intervallId2;
clickableLinks.forEach((link) => {
  if (link.textContent == "Dashboard") {
    link.addEventListener("click", (event) => {
      clearInterval(intervallId1);
      clearInterval(intervallId2);
      clear_screen();
      create_gauge("temp", "gaugeDivTemp");
      create_gauge("co2", "gaugeDivCo2");
      intervallId1 = setInterval(update_chart.bind(null, "gauge", "temp"), 1000);
      intervallId2 = setInterval(update_chart.bind(null, "gauge", "co2"), 1000);
    })
  } else if (link.textContent == "Analytics") {
    link.addEventListener("click", (event) => {
      clearInterval(intervallId1);
      clearInterval(intervallId2);
      clear_screen();
      create_line("temp", "lineDivTemp");
      create_line("co2", "lineDivCo2");
      intervallId1 = setInterval(update_chart.bind(null, "line", "temp"), 1000);
      intervallId2 = setInterval(update_chart.bind(null, "line", "co2"), 1000);
    })
  } else if (link.textContent == "Alerts") {
    link.addEventListener("click", (event) => {
      clear_screen();
      const alertsDiv = document.createElement('div');
      alertsDiv.id = 'alerts';
      document.body.appendChild(alertsDiv);
      const alertDiv = document.createElement('div');
      alertDiv.textContent = "No alerts yet!";
      alertDiv.classList.add('alert-message');
      alertsDiv.appendChild(alertDiv);
    });
  } else if (link.textContent == "Settings") {
    link.addEventListener("click", (event) => {
      clear_screen();
      const parentElement = document.createElement("div");
      parentElement.id = 'button_container';
      document.body.appendChild(parentElement)
      const clear_data_button = document.createElement('button');
      clear_data_button.id = 'clear_button';
      clear_data_button.type = "button";
      clear_data_button.textContent = "Click Me!";
      parentElement.append(clear_data_button);
      clear_data_button.addEventListener("click", () => {
        alert("Button clicked!");
      });
    });
  }
});


