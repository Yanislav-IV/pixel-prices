// script.js

// Helper: Generate a random bright color
function randomColor() {
  const r = Math.floor(Math.random() * 156) + 100; // 100-255 for brightness
  const g = Math.floor(Math.random() * 156) + 100;
  const b = Math.floor(Math.random() * 156) + 100;
  return `rgb(${r},${g},${b})`;
}

console.log("Starting Papa.parse for CSV...");

Papa.parse("phone_prices.csv", {
  download: true,
  header: true,
  complete: function(results) {
    console.log("CSV Parsing complete. Data received:", results.data);
    
    // Group data by phone name
    const groups = {};
    results.data.forEach(row => {
      if (!row.date || !row.name || !row.price) {
        console.log("Skipping row due to missing data:", row);
        return;
      }
      if (!groups[row.name]) groups[row.name] = [];
      groups[row.name].push({ date: row.date, price: parseFloat(row.price) });
    });
    console.log("Grouped data by phone:", groups);
    
    // Sort each phone's data points by date
    for (let phone in groups) {
      groups[phone].sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    // Prepare Chart.js datasets
    const datasets = [];
    const phoneColors = {};
    const phoneNames = Object.keys(groups);
    console.log("Phone names to be plotted:", phoneNames);
    
    phoneNames.forEach((phone, index) => {
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
    
    console.log("Prepared datasets for Chart.js:", datasets);
    
    // Create the Chart.js chart
    const ctx = document.getElementById('priceChart').getContext('2d');
    const priceChart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: datasets
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              parser: 'yyyy-MM-dd',
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
          legend: { display: false },
          tooltip: { mode: 'nearest', intersect: false }
        }
      }
    });
    
    console.log("Chart created successfully.");
    
    // Build the phone list on the right side for interactivity
    const listEl = document.getElementById("list");
    phoneNames.forEach((phone, i) => {
      const li = document.createElement("li");
      li.textContent = phone;
      li.style.borderLeft = `5px solid ${phoneColors[phone]}`;
      li.dataset.datasetIndex = i;
      
      li.addEventListener("mouseover", () => {
        console.log(`Mouseover on: ${phone}`);
        // Reset all lines to default
        priceChart.data.datasets.forEach(ds => ds.borderWidth = 2);
        // Highlight this phone's line
        priceChart.data.datasets[i].borderWidth = 5;
        priceChart.update();
      });
      
      li.addEventListener("mouseout", () => {
        console.log(`Mouseout from: ${phone}`);
        priceChart.data.datasets[i].borderWidth = 2;
        priceChart.update();
      });
      
      listEl.appendChild(li);
    });
    
    console.log("Phone list created for interactivity.");
  },
  error: function(err) {
    console.error("Error during CSV parsing:", err);
  }
});
