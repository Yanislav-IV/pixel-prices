// script.js

// Helper: Generate a random bright color
function randomColor() {
  const r = Math.floor(Math.random() * 156) + 100; // 100-255 for brightness
  const g = Math.floor(Math.random() * 156) + 100;
  const b = Math.floor(Math.random() * 156) + 100;
  return `rgb(${r},${g},${b})`;
}

console.log("Starting Papa.parse for CSV...");

function formatPhoneName(fullName) {
  // Remove all occurrences of "5G"
  let name = fullName.replace(/5G/gi, "");
  // Find the start position of "Pixel"
  let start = name.indexOf("Pixel");
  if (start === -1) start = 0; // fallback if not found
  // Find the first occurrence of "GB" after "Pixel"
  let gbIndex = name.indexOf("GB", start);
  if (gbIndex === -1) return name.trim();
  // Return substring from "Pixel" to "GB" (inclusive)
  return name.substring(start, gbIndex + 2).trim();
}

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
	label: formatPhoneName(phone),
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
      li.textContent = formatPhoneName(phone);
      li.style.borderLeft = `5px solid ${phoneColors[phone]}`;
      li.dataset.datasetIndex = i;
      li.style.fontSize = "0.7em";    

      li.addEventListener("mouseover", () => {
        console.log(`Mouseover on: ${phone}`);
        // When hovering, dim all lines to a gray color and set border width to 2
        priceChart.data.datasets.forEach((ds, idx) => {
          ds.borderWidth = 2;
          ds.borderColor = "rgba(200, 200, 200, 0.3)"; // light gray for dimming
        });
        // Highlight the hovered dataset with its original color and thicker border
        priceChart.data.datasets[i].borderWidth = 5;
        priceChart.data.datasets[i].borderColor = phoneColors[phone];
        priceChart.update();
      });
      
      li.addEventListener("mouseout", () => {
        console.log(`Mouseout from: ${phone}`);
        // On mouse out, restore original colors and border widths for all datasets
        priceChart.data.datasets.forEach((ds, idx) => {
          ds.borderWidth = 2;
          ds.borderColor = phoneColors[ds.label];
        });
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
