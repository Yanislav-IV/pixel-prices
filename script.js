// script.js

// Helper: Generate a random color
function randomColor() {
  const r = Math.floor(Math.random() * 156) + 100; // 100-255 for brighter colors
  const g = Math.floor(Math.random() * 156) + 100;
  const b = Math.floor(Math.random() * 156) + 100;
  return `rgb(${r},${g},${b})`;
}

// Parse CSV data and group by phone name
Papa.parse("phone_prices.csv", {
  download: true,
  header: true,
  complete: function(results) {
    // Group data: key is phone name, value is array of { date, price }
    const groups = {};
    results.data.forEach(row => {
      // Skip rows with missing values
      if (!row.date || !row.name || !row.price) return;
      if (!groups[row.name]) groups[row.name] = [];
      groups[row.name].push({ date: row.date, price: parseFloat(row.price) });
    });

    // Create a sorted list of dates (x-axis) for each phone
    // We'll assume dates are in YYYY-MM-DD format
    // For each phone, sort its data points
    for (let phone in groups) {
      groups[phone].sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Prepare datasets for Chart.js
    const datasets = [];
    const phoneColors = {}; // to store base colors for each phone

    Object.keys(groups).forEach((phone, index) => {
      // Use the dates from the phone's own data as labels later. For the chart we need a common x-axis.
      // Here we'll assume that each phone might have data for different dates,
      // so we'll combine all dates from all phones.
      phoneColors[phone] = randomColor();
      const dataPoints = groups[phone].map(pt => ({ x: pt.date, y: pt.price }));
      datasets.push({
        label: phone,
        data: dataPoints,
        borderColor: phoneColors[phone],
        backgroundColor: phoneColors[phone],
        borderWidth: 2,
        tension: 0.1,
      });
    });

    // Create the Chart.js chart
    const ctx = document.getElementById('priceChart').getContext('2d');
    const priceChart = new Chart(ctx, {
      type: 'line',
      data: {
        // x-values come from each dataset's data objects
        datasets: datasets
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              parser: 'yyyy-MM-dd', // Use Luxon formatting
              unit: 'day',
              displayFormats: { day: 'yyyy-MM-dd' }
            },
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Price'
            }
          }
        },
        plugins: {
          legend: {
            display: false // We are making our own list
          },
          tooltip: {
            mode: 'nearest',
            intersect: false
          }
        }
      }
    });

    // Build the phone list on the right side
    const listEl = document.getElementById("list");
    Object.keys(groups).forEach((phone, i) => {
      const li = document.createElement("li");
      li.textContent = phone;
      li.style.borderLeft = `5px solid ${phoneColors[phone]}`;
      li.dataset.datasetIndex = i; // store index to match with chart dataset

      // Event listeners to highlight the phone line
      li.addEventListener("mouseover", () => {
        // Set all datasets to default
        priceChart.data.datasets.forEach(ds => ds.borderWidth = 2);
        // Highlight the hovered one by increasing border width and brightening color
        priceChart.data.datasets[i].borderWidth = 5;
        priceChart.update();
      });
      li.addEventListener("mouseout", () => {
        priceChart.data.datasets[i].borderWidth = 2;
        priceChart.update();
      });
      listEl.appendChild(li);
    });
  }
});
