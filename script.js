// script.js

// Specify the phone to display (adjust as needed)
const phoneName = "Google Pixel 8 Pro";

Papa.parse("phone_prices.csv", {
  download: true,
  header: true,
  complete: function(results) {
    const dates = [];
    const prices = [];
    results.data.forEach(row => {
      if (row.name === phoneName && row.price) {
        dates.push(row.date);
        prices.push(parseFloat(row.price));
      }
    });
    
    // Create the chart using Chart.js
    const ctx = document.getElementById('priceChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: phoneName + ' Price',
          data: prices,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        scales: {
          x: { title: { display: true, text: 'Date' } },
          y: { title: { display: true, text: 'Price' } }
        }
      }
    });
  }
});
