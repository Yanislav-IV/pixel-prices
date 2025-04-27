<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Pixel Price Chart</title>
  <!-- PapaParse -->
  <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js"></script>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    #priceChart { max-width: 800px; max-height: 400px; }
    #list { list-style: none; padding: 0; margin-top: 20px; }
    #list li { margin: 4px 0; }
  </style>
</head>
<body>
  <canvas id="priceChart"></canvas>
  <ul id="list"></ul>

  <script>
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
      return gbIndex === -1
        ? name.trim()
        : name.substring(start, gbIndex + 2).trim();
    }

    function toSlug(str) {
      return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
    }

    Papa.parse("phone_prices.csv", {
      download: true,
      header: true,
      complete: results => {
        const groups = {};
        results.data.forEach(row => {
          // skip empty rows or missing price
          if (!row.date || !row.name || row.price === "") return;
          const price = parseFloat(row.price);
          groups[row.name] = groups[row.name] || [];
          groups[row.name].push({ date: row.date, price });
        });

        // sort by date
        Object.values(groups).forEach(arr =>
          arr.sort((a,b) => new Date(a.date) - new Date(b.date))
        );

        const phoneNames = Object.keys(groups).sort((a, b) =>
          formatPhoneName(b).localeCompare(formatPhoneName(a))
        );
        const phoneColors = {};
        const datasets = [];

        phoneNames.forEach(phone => {
          const color = randomColor();
          phoneColors[phone] = color;

          datasets.push({
            label: formatPhoneName(phone),
            data: groups[phone].map(pt => ({ x: pt.date, y: pt.price })),
            borderColor: color,
            backgroundColor: color,
            borderWidth: 2,
            stepped: 'post',     // step chart: jump on the day
            spanGaps: false,     // do not connect across missing dates
            // only draw a circle when price changes vs previous
            pointRadius: context => {
              const i = context.dataIndex;
              if (i === 0) return 6;
              const prev = context.dataset.data[i - 1].y;
              const cur  = context.dataset.data[i].y;
              return (cur !== prev) ? 6 : 0;
            },
            pointBorderColor: color,
            pointBackgroundColor: color,
            pointHoverRadius: 8
          });
        });

        const ctx = document.getElementById('priceChart').getContext('2d');
        const priceChart = new Chart(ctx, {
          type: 'line',
          data: { datasets },
          options: {
            parsing: false,
            normalized: true,
            scales: {
              x: {
                type: 'time',
                time: {
                  parser: 'yyyy-MM-dd',
                  unit: 'day',
                  displayFormats: { day: 'MMM dd' }
                },
                ticks: { maxRotation: 90, minRotation: 90 }
              },
              y: {
                beginAtZero: true,
                ticks: { stepSize: 100 }
              }
            },
            plugins: {
              legend: { position: 'top' }
            }
          }
        });

        // Build availability list
        const allDates = results.data.map(r => r.date).sort();
        const lastDate = allDates[allDates.length - 1];
        const listEl = document.getElementById("list");

        phoneNames.forEach(phone => {
          const isAvailable = groups[phone].some(pt => pt.date === lastDate && pt.price > 0);
          const li = document.createElement("li");
          const icon = isAvailable ? "✔️" : "🚫";
          const name = formatPhoneName(phone);
          const url = "https://www.buybest.bg/" + toSlug(phone);
          li.innerHTML = isAvailable
            ? `${icon} <a href="${url}" target="_blank">${name}</a>`
            : `${icon} ${name}`;
          li.style.borderLeft = `4px solid ${phoneColors[phone]}`;
          listEl.appendChild(li);

          // hover highlight
          li.addEventListener("mouseover", () => {
            datasets.forEach(ds => ds.borderColor = "rgba(200,200,200,0.3)");
            const idx = phoneNames.indexOf(phone);
            priceChart.data.datasets[idx].borderColor = phoneColors[phone];
            priceChart.update("none");
          });
          li.addEventListener("mouseout", () => {
            datasets.forEach((ds, i) =>
              ds.borderColor = phoneColors[phoneNames[i]]
            );
            priceChart.update("none");
          });
        });
      }
    });
  </script>
</body>
</html>
