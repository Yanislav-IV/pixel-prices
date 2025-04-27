function randomColor() {
  const r = Math.floor(Math.random() * 156) + 100,
        g = Math.floor(Math.random() * 156) + 100,
        b = Math.floor(Math.random() * 156) + 100;
  return `rgb(${r},${g},${b})`;
}

function formatPhoneName(fullName) {
  let name = fullName.replace(/5G/gi, "");
  let start = name.indexOf("Pixel") === -1 ? 0 : name.indexOf("Pixel");
  let gbIndex = name.indexOf("GB", start);
  return gbIndex === -1 ? name.trim() : name.substring(start, gbIndex + 2).trim();
}

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

Papa.parse("history.csv", {
  download: true,
  header: true,
  dynamicTyping: true,
  complete: results => {
    const groups = {};
    
    results.data.forEach(row => {
      if (!row.date || !row.name) return;
      groups[row.name] = groups[row.name] || [];
      groups[row.name].push({ date: row.date, price: row.price });
    });
    
    for (let phone in groups) {
      groups[phone].sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    const datasets = [], phoneColors = {}, phoneNames = Object.keys(groups);
    
    phoneNames.sort((a, b) =>
      formatPhoneName(b).localeCompare(formatPhoneName(a))
    );

    const allDates = results.data
      .map(r => r.date)
      .filter(Boolean)
      .sort((a,b) => new Date(a) - new Date(b));
    
    const lastDate = allDates[allDates.length - 1];
    const tailDate = new Date(lastDate);
    tailDate.setDate(tailDate.getDate() + 1);
    const tailDateStr = tailDate.toISOString().slice(0,10);
    
    phoneNames.forEach((phone, i) => {
      phoneColors[phone] = randomColor();
      const dataPoints = groups[phone].map(pt => ({ x: pt.date, y: pt.price }));
      
      if (dataPoints.length) {
        const lastY = dataPoints[dataPoints.length - 1].y;
        dataPoints.push({ x: tailDateStr, y: lastY });
      }
      
      datasets.push({
        label: formatPhoneName(phone),
        data: dataPoints,
        borderColor: phoneColors[phone],
        backgroundColor: phoneColors[phone],
        borderWidth: 2,
        tension: 0,
        spanGaps: false,
        stepped: 'after',
        pointRadius: 5,
        pointHoverRadius: 10,
        pointHitRadius: 20
      });
    });
    
    const ctx        = document.getElementById('priceChart').getContext('2d');
    const priceChart = new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onHover(evt, elements) {
          if (elements.length) {
            const idx = elements[0].datasetIndex;
            datasets.forEach((ds, j) => {
              ds.borderWidth = j === idx ? 5 : 2;
              ds.borderColor = j === idx
                ? phoneColors[phoneNames[j]]
                : "rgba(200,200,200,0.3)";
            });
            listItems.forEach((li, j) => {
              li.style.backgroundColor = j === idx ? "#f0f0f0" : "";
            });
          } else {
            datasets.forEach((ds, j) => {
              ds.borderWidth = 2;
              ds.borderColor = phoneColors[phoneNames[j]];
            });
            listItems.forEach(li => (li.style.backgroundColor = ""));
          }
          priceChart.update("none");
        },
        scales: {
          x: {
            type: 'time',
            time: { parser: 'yyyy-MM-dd', unit: 'day', displayFormats: { day: 'MMM dd' } },
            ticks: { maxRotation: 90, minRotation: 90, font: { size: 16 } }
          },
          y: {
            ticks: { 
              stepSize: 100,
              font: { size: 16 }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'nearest',
            intersect: false,
            callbacks: {
              title(tooltipItems) {
                const d = new Date(tooltipItems[0].parsed.x);
                return d.toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });
              }
            }
          }
        }
      }
    });
    
    const allDates = results.data.map(r => r.date);
    const lastDate = allDates.sort()[allDates.length - 1];
    const listEl = document.getElementById("list");
    const listItems = [];
    
    phoneNames.forEach((phone, i) => {
      const li = document.createElement("li");
      const isAvailable = groups[phone].some(pt => pt.date === lastDate);
      const icon  = isAvailable ? "✔️" : "🚫";
      const label = formatPhoneName(phone);
      const url = "https://www.buybest.bg/" + toSlug(phone);
      const linkOrLabel = isAvailable ? `<a href="${url}" target="_blank">${label}</a>` : label;
      
      li.innerHTML = `${icon} ${linkOrLabel}`;
      li.style.cursor = isAvailable ? "pointer" : "default";
      li.style.borderLeft = `5px solid ${phoneColors[phone]}`;
      li.dataset.datasetIndex = i;
      
      li.addEventListener("mouseover", () => {
        priceChart.data.datasets.forEach(ds => { ds.borderWidth = 2; ds.borderColor = "rgba(200, 200, 200, 0.3)"; });
        priceChart.data.datasets[i].borderWidth = 5;
        priceChart.data.datasets[i].borderColor = phoneColors[phone];
        priceChart.update();
      });
      
      li.addEventListener("mouseout", () => {
        priceChart.data.datasets.forEach(ds => {
          ds.borderWidth = 2;
          ds.borderColor = phoneColors[ds.label];
        });
        priceChart.update();
      });
      
      listEl.appendChild(li);
      listItems.push(li);
    });
  }
});
