<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Pixel Prices</title>
  <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js"></script>
</head>
<body>
  <canvas id="priceChart" width="800" height="400"></canvas>
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

    // Load and parse your CSV (with 0 for out-of-stock)
    Papa.parse("phone_prices.csv", {
      download: true,
      header: true,
      complete: results => {
        const groups = {};
        results.data.forEach(row => {
          // skip completely empty rows
          if (!row.date || !row.name || row.price === "") return;
          // parse price as number (zero is now valid)
          const price = parseFloat(row.price);
          if (!groups[row.name]) groups[row.name] = [];
          groups[row.name].push({ date: row.date, price });
        });
        // sort each group
        Object.values(groups).forEach(arr =>
          arr.sort((a,b) => new Date(a.date) - new Date(b.date))
        );

        // build Chart.js datasets
        const datasets = [];
        const phoneNames = Object.keys(groups).sort((a,b) =>
          formatPhoneName(b).localeCompare(formatPhoneName(a))
        );
        const phoneColors = {};

        phoneNames.forEach(phone => {
          const color = randomColor();
          phoneColors[phone] = color;

          const data = groups[phone].map(pt => ({
            x: pt.date,
            y: pt.price
          }));

          datasets.push({
            label: formatPhoneName(phone),
            data,
            borderColor: color,
            backgroundColor: color,
            borderWidth: 2,
            stepped: 'post',          // <— do a step plot, jump on the day itself
            spanGaps: false,          // <— don’t join across missing days
            pointRadius: ctx => {
              // only draw a circle if price changed vs previous
              const i = ctx.dataIndex;
              if (i === 0) return 6;
              const prev = ctx.dataset.data[i-1].y;
              const cur  = ctx.dataset.data[i].y;
              return (cur !== prev) ? 6 : 0;
            },
            pointBorderColor: color,
            pointBackgroundColor: color,
            pointHoverRadius: 8
          });
        });

        // instantiate the chart
        new Chart(
          document.getElementById('priceChart').getContext('2d'),
          {
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
                  }
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
          }
        );
      }
    });
  </script>
</body>
</html>
