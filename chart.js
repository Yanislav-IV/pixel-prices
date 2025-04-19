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

Papa.parse("phone_prices.csv", {
  download: true,
  header: true,
  complete: results => {
    const groups = {};
    results.data.forEach(row => {
      if (!row.date || !row.name || !row.price) return;
      groups[row.name] = groups[row.name] || [];
      groups[row.name].push({ date: row.date, price: parseFloat(row.price) });
    });
    for (let phone in groups) {
      groups[phone].sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    const datasets = [], phoneColors = {}, phoneNames = Object.keys(groups);
    phoneNames.sort((a, b) =>
      formatPhoneName(b).localeCompare(formatPhoneName(a))
    );
    phoneNames.forEach((phone, i) => {
      phoneColors[phone] = randomColor();
      const dataPoints = groups[phone].map(pt => ({ x: pt.date, y: pt.price }));
      datasets.push({
        label: formatPhoneName(phone),
        data: dataPoints,
        borderColor: phoneColors[phone],
        backgroundColor: phoneColors[phone],
        borderWidth: 2,
        tension: 0.1
      });
    });
    const ctx = document.getElementById('priceChart').getContext('2d');
    const priceChart = new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: { parser: 'yyyy-MM-dd', unit: 'day', displayFormats: { day: 'MMM dd' } },
            ticks: { maxRotation: 90, minRotation: 90 }
          },
          y: { ticks: { stepSize: 100 } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { 
            mode: 'nearest',
            intersect: false,
            callbacks: {
              title(tooltipItems) {
                const d = new Date(tooltipItems[0].parsed.x);
                return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
              }
            }
          }
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
    });
  }
});
