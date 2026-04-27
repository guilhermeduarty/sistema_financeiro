document.addEventListener("DOMContentLoaded", () => {
  const chartCanvas = document.getElementById("financialChart");

  if (!chartCanvas) {
    return;
  }

  const rawChartData = chartCanvas.dataset.chart;

  if (!rawChartData) {
    return;
  }

  const chartData = JSON.parse(rawChartData);
  const labels = chartData.map((item) => item.mes);
  const receitas = chartData.map((item) => item.receitas);
  const despesas = chartData.map((item) => item.despesas);

  // O grafico ajuda o usuario a identificar a evolucao das movimentacoes ao longo dos meses.
  new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Receitas",
          data: receitas,
          backgroundColor: "#0f766e"
        },
        {
          label: "Despesas",
          data: despesas,
          backgroundColor: "#ef4444"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
});
