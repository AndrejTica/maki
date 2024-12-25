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


async function create_gauge() {
  var data_gauge = [
    {
      value: 0,
      title: { text: "Speed" },
      type: "indicator",
      mode: "gauge+number+delta",
      gauge: {
        axis: { range: [null, 45] },
        bar: { color: "black" },
        steps: [
          { range: [0, 18], color: "lightblue" },
          { range: [18, 24], color: "green" },
          { range: [24, 45], color: "red" }
        ],
      }
    }
  ];
  Plotly.newPlot('gaugeDiv', data_gauge, {
    width: 600, height: 500, margin: { t: 0, b: 0 }
  });
}

async function update_gauge() {
  const mydata_gauge = await getData(false);
  Plotly.restyle('gaugeDiv', { value: [mydata_gauge.value] }, 0);
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

async function update_line() {
  const mydata_line = await getData(true);
  const mydata_map_line_value = mydata_line.map((mydata) => mydata.value)
  const mydata_map_line_time = mydata_line.map((mydata) => mydata.time)
  Plotly.restyle('lineDiv', { y: [mydata_map_line_value] }, 0);
  Plotly.restyle('lineDiv', { x: [mydata_map_line_time] }, 0);
}


//document.getElementById("line_button").addEventListener("click", function() {
//  update_line()
//});


// Select all the clickable spans inside the sidebar
const clickableSpans = document.querySelectorAll('#sidebar .links a');

// Add a click event listener to each span
clickableSpans.forEach(span => {
  span.addEventListener('click', (event) => {

    const gridContainer = document.querySelector('#main-dashboard-content #grid-container');

    // Check if the welcome-title div already exists to avoid duplicates
    if (!document.getElementById('welcome-title')) {
      // Create the welcome-title div dynamically
      const welcomeDiv = document.createElement('div');
      welcomeDiv.id = 'welcome-title'; // Set the ID
      welcomeDiv.textContent = 'Welcome!'; // Set the text content

      // Append the new div to the grid-container
      gridContainer.insertBefore(welcomeDiv, gridContainer.firstChild);
    }

    create_gauge();

    setInterval(update_gauge, 2000);

    create_line()

    setInterval(update_line, 2000)
  });
});


