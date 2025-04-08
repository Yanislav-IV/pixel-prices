function randomColor() {
  const r = Math.floor(Math.random() * 156) + 100;
  const g = Math.floor(Math.random() * 156) + 100;
  const b = Math.floor(Math.random() * 156) + 100;
  return `rgb(${r},${g},${b})`;
}

function formatPhoneName(fullName) {
  let name = fullName.replace(/5G/gi, "");
  let start = name.indexOf("Pixel");
  if (start === -1) start = 0;
  let gbIndex = name.indexOf("GB", start);
  if (gbIndex === -1) return name.trim();
  return name.substring(start, gbIndex + 2).trim();
}

Papa.parse("phone_prices.csv", {
  download: true,
  header: true,
  complete: function(results) {
    console.log("CSV Parsing complete. Data received:", results.data);
    
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
    
    for (let phone in groups) {
      groups[phone].sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
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
              displayFormats: { day: 'MMM dd' }
            },
	    ticks: {
	      maxRotation: 90,
	      minRotation: 90
	    }
          },
          y: {
	    ticks: {
	      stepSize: 100
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'nearest', intersect: false }
        }
      }
    });
    
    const listEl = document.getElementById("list");
    phoneNames.forEach((phone, i) => {
      const li = document.createElement("li");
      li.textContent = formatPhoneName(phone);
      li.style.borderLeft = `5px solid ${phoneColors[phone]}`;
      li.dataset.datasetIndex = i;
      li.style.fontSize = "0.7em";    

      li.addEventListener("mouseover", () => {
        console.log(`Mouseover on: ${phone}`);
        priceChart.data.datasets.forEach((ds, idx) => {
          ds.borderWidth = 2;
        });
        priceChart.data.datasets[i].borderWidth = 5;
        priceChart.data.datasets[i].borderColor = phoneColors[phone];
        priceChart.update();
      });
      
      li.addEventListener("mouseout", () => {
        console.log(`Mouseout from: ${phone}`);
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
