import Plotly from 'plotly.js-dist-min'

console.log("API URL is:", process.env.URL_BACKEND);
var urlBackend = process.env.URL_BACKEND;

async function getData(type, date, all) {
  try {
    const response = await fetch(all ? `${urlBackend}/data/${type}/${date}/all` : `${urlBackend}/data/${type}/${date}`);
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

async function getDataAverage(type, date) {
  try {
    const response = await fetch(`${urlBackend}/data/${type}/${date}/average`);
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

function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function update_chart(chart_type, sensor_type, date) {
  if (chart_type == "gauge") {
    const chart_data = await getData(sensor_type == "temp" ? "temp" : "co2", date, false);
    try {
      Plotly.restyle(sensor_type == "temp" ? 'gaugeDivTemp' : "gaugeDivCo2", { value: [chart_data.value] }, 0);
    } catch (error) { }
    return;
  } else if (chart_type == "line") {
    const chart_data = await getData(sensor_type == "temp" ? "temp" : "co2", date, true);
    const mydata_map_line_value = chart_data.map((mydata) => mydata.value)
    const mydata_map_line_time = chart_data.map((mydata) => mydata.time)
    try {
      Plotly.restyle(sensor_type == "temp" ? 'lineDivTemp' : "lineDivCo2", { y: [mydata_map_line_value] }, 0);
    } catch (error) { }
    try {
      Plotly.restyle(sensor_type == "temp" ? 'lineDivTemp' : "lineDivCo2", { x: [mydata_map_line_time] }, 0);
    } catch (error) { }
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

async function clear_screen(spare = true) {
  try { clearInterval(intervallId1) } catch (error) { }
  try { clearInterval(intervallId2) } catch (error) { }
  try { clearInterval(intervallId3) } catch (error) { }
  try { Plotly.purge("gaugeDivTemp") } catch (error) { }
  try { Plotly.purge("gaugeDivCo2") } catch (error) { }
  try { Plotly.purge("lineDivTemp") } catch (error) { }
  try { Plotly.purge("lineDivCo2") } catch (error) { }
  try { document.getElementById("alerts").remove() } catch (error) { }
  try { document.getElementById("button_container").remove() } catch (error) { }
  try { document.getElementById("clear_button").remove() } catch (error) { }
  try { document.getElementById("textDiv").remove() } catch (error) { }
  try { document.getElementById("averageDivCo2").remove() } catch (error) { }
  try { document.getElementById("averageDivTemp").remove() } catch (error) { }
  if (spare) {
    try { document.getElementById("dateInput").remove() } catch (error) { }
  }
}

async function create_averages(date) {
  const date_input = document.getElementById("dateInput");
  const average_co2 = await getDataAverage("co2", date);
  const average_div_co2 = document.createElement('div');
  average_div_co2.id = "averageDivCo2";
  average_div_co2.innerText = `Average CO2: ${Math.round(average_co2 * 100) / 100}`;
  average_div_co2.style.display = "inline-block";
  average_div_co2.style.color = "blue";
  average_div_co2.style.marginLeft = "100px";
  date_input.insertAdjacentElement("afterend", average_div_co2);

  const average_temp = await getDataAverage("temp", date);
  const average_div_temp = document.createElement('div');
  average_div_temp.id = "averageDivTemp";
  average_div_temp.innerText = `Average temperature: ${Math.round(average_temp * 100) / 100}`;
  average_div_temp.style.display = "inline-block";
  average_div_temp.style.color = "blue";
  average_div_temp.style.marginLeft = "100px";
  date_input.insertAdjacentElement("afterend", average_div_temp);

}

async function update_averages(date) {
  const average_temp = await getDataAverage("temp", date);
  const average_temp_div = document.getElementById("averageDivTemp");
  average_temp_div.innerText = `Average temperature: ${Math.round(average_temp * 100) / 100}`

  const average_co2 = await getDataAverage("co2", date);
  const average_co2_div = document.getElementById("averageDivCo2");
  average_co2_div.innerText = `Average CO2: ${Math.round(average_co2 * 100) / 100}`
}

async function graph_picker() {
  const text_div = document.createElement('div');
  text_div.id = "textDiv";
  text_div.innerText = "Select the date for the sensor data."
  const date_picker = document.createElement('input');
  date_picker.type = "date";
  date_picker.id = "dateInput";
  const parent_container = document.getElementById("flex-container-line")
  parent_container.prepend(date_picker);
  parent_container.prepend(text_div);
  const date_value = document.getElementById('dateInput');
  date_value.addEventListener('change', function() {
    clear_screen(false);
    var date = date_value.value.split("-");
    var day = date[2];
    var month = date[1];
    var year = date[0];
    var full_date = `${year}-${month}-${day}`;
    create_line("temp", "lineDivTemp");
    create_line("co2", "lineDivCo2");
    create_averages(full_date);
    intervallId1 = setInterval(update_chart.bind(null, "line", "temp", full_date), 1000);
    intervallId2 = setInterval(update_chart.bind(null, "line", "co2", full_date), 1000);
    intervallId3 = setInterval(update_averages.bind(null, full_date), 1000);

  })
}

const clickableLinks = document.querySelectorAll('#sidebar .links a');

let intervallId1;
let intervallId2;
let intervallId3;
clickableLinks.forEach((link) => {
  if (link.textContent == "Dashboard") {
    link.addEventListener("click", (event) => {
      clearInterval(intervallId1);
      clearInterval(intervallId2);
      clear_screen();
      create_gauge("temp", "gaugeDivTemp");
      create_gauge("co2", "gaugeDivCo2");
      intervallId1 = setInterval(update_chart.bind(null, "gauge", "temp", getCurrentDate()), 1000);
      intervallId2 = setInterval(update_chart.bind(null, "gauge", "co2", getCurrentDate()), 1000);
    })
  } else if (link.textContent == "Analytics") {
    link.addEventListener("click", (event) => {
      clearInterval(intervallId1);
      clearInterval(intervallId2);
      clear_screen();
      graph_picker();


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

