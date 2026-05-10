// SIDEBAR TOGGLE

function openSidebar() {
  var side = document.getElementById("sidebar");
  side.style.display = side.style.display === "block" ? "none" : "block";
}

function closeSidebar() {
  document.getElementById("sidebar").style.display = "none";
}

window.onload = function () {
  let expenses = [];
  const storedExpenses = localStorage.getItem("bizTrackTransactions");
  if (storedExpenses) {
    try {
      expenses = JSON.parse(storedExpenses);
    } catch (e) {
      console.error("Failed to parse expenses in dashboard", e);
      expenses = [];
    }
  }
  if (!expenses || expenses.length === 0) {
    expenses = [
      {
        trID: 1,
        trDate: "2024-01-05",
        trCategory: "Rent",
        trAmount: 100.0,
        trNotes: "January Rent",
      },
      {
        trID: 2,
        trDate: "2024-01-15",
        trCategory: "Order Fulfillment",
        trAmount: 35.0,
        trNotes: "Order #1005",
      },
      {
        trID: 3,
        trDate: "2024-01-08",
        trCategory: "Utilities",
        trAmount: 120.0,
        trNotes: "Internet",
      },
      {
        trID: 4,
        trDate: "2024-02-05",
        trCategory: "Supplies",
        trAmount: 180.0,
        trNotes: "Embroidery Machine",
      },
      {
        trID: 5,
        trDate: "2024-01-25",
        trCategory: "Miscellaneous",
        trAmount: 20.0,
        trNotes: "Pizza",
      },
    ];
  }

  let revenues = [];
  const storedRevenues = localStorage.getItem("bizTrackOrders");
  if (storedRevenues) {
    try {
      revenues = JSON.parse(storedRevenues);
    } catch (e) {
      console.error("Failed to parse revenues in dashboard", e);
      revenues = [];
    }
  }
  if (!revenues || revenues.length === 0) {
    revenues = [
      {
        orderID: "1001",
        orderDate: "2024-01-05",
        itemName: "Baseball caps",
        itemPrice: 25.0,
        qtyBought: 2,
        shipping: 2.5,
        taxes: 9.0,
        orderTotal: 61.5,
        orderStatus: "Pending",
      },
      {
        orderID: "1002",
        orderDate: "2024-03-05",
        itemName: "Water bottles",
        itemPrice: 17.0,
        qtyBought: 3,
        shipping: 3.5,
        taxes: 6.0,
        orderTotal: 60.5,
        orderStatus: "Processing",
      },
      {
        orderID: "1003",
        orderDate: "2024-02-05",
        itemName: "Tote bags",
        itemPrice: 20.0,
        qtyBought: 4,
        shipping: 2.5,
        taxes: 2.0,
        orderTotal: 84.5,
        orderStatus: "Shipped",
      },
      {
        orderID: "1004",
        orderDate: "2023-01-05",
        itemName: "Canvas prints",
        itemPrice: 55.0,
        qtyBought: 1,
        shipping: 2.5,
        taxes: 19.0,
        orderTotal: 76.5,
        orderStatus: "Delivered",
      },
      {
        orderID: "1005",
        orderDate: "2024-01-15",
        itemName: "Beanies",
        itemPrice: 15.0,
        qtyBought: 2,
        shipping: 3.9,
        taxes: 4.0,
        orderTotal: 37.9,
        orderStatus: "Pending",
      },
    ];
  }

  const totalExpenses = calculateExpTotal(expenses);
  const totalRevenues = calculateRevTotal(revenues);
  const totalBalance = totalRevenues - totalExpenses;
  const numOrders = revenues.length;

  const revDiv = document.getElementById("rev-amount");
  const expDiv = document.getElementById("exp-amount");
  const balDiv = document.getElementById("balance");
  const ordDiv = document.getElementById("num-orders");

  revDiv.innerHTML = `
      <span class="title">Revenue</span>
      <span class="amount-value">$${totalRevenues.toFixed(2)}</span> 
  `;

  expDiv.innerHTML = `
    <span class="title">Expenses</span>
    <span class="amount-value">$${totalExpenses.toFixed(2)}</span>
  `;

  balDiv.innerHTML = `
    <span class="title">Balance</span>
    <span class="amount-value">$${totalBalance.toFixed(2)}</span>
  `;

  ordDiv.innerHTML = `
    <span class="title">Orders</span>
    <span class="amount-value">${numOrders}</span>
  `;
};

function calculateExpTotal(transactions) {
  return transactions.reduce(
    (total, transaction) => total + transaction.trAmount,
    0,
  );
}
function calculateRevTotal(orders) {
  return orders.reduce((total, order) => total + order.orderTotal, 0);
}

// ---------- CHARTS ----------

// BAR CHART

function calculateCategorySales(products) {
  const categorySales = {};

  products.forEach((product) => {
    const category = product.prodCat;

    if (!categorySales[category]) {
      categorySales[category] = 0;
    }

    categorySales[category] += product.prodPrice * product.prodSold;
  });

  return categorySales;
}

function initializeChart() {
  let items = [];
  const storedProducts = localStorage.getItem("bizTrackProducts");
  if (storedProducts) {
    try {
      items = JSON.parse(storedProducts);
    } catch (e) {
      console.error("Failed to parse products for chart", e);
      items = [];
    }
  }
  if (!items || items.length === 0) {
    items = [
      {
        prodID: "PD001",
        prodName: "Baseball caps",
        prodDesc: "Peace embroidered cap",
        prodCat: "Hats",
        prodPrice: 25.0,
        prodSold: 20,
      },
      {
        prodID: "PD002",
        prodName: "Water bottles",
        prodDesc: "Floral lotus printed bottle",
        prodCat: "Drinkware",
        prodPrice: 48.5,
        prodSold: 10,
      },
      {
        prodID: "PD003",
        prodName: "Sweatshirt",
        prodDesc: "Palestine sweater",
        prodCat: "Clothing",
        prodPrice: 17.5,
        prodSold: 70,
      },
      {
        prodID: "PD004",
        prodName: "Posters",
        prodDesc: "Vibes printed poster",
        prodCat: "Home decor",
        prodPrice: 12.0,
        prodSold: 60,
      },
      {
        prodID: "PD005",
        prodName: "Pillow cases",
        prodDesc: "Morrocan print pillow case",
        prodCat: "Accessories",
        prodPrice: 17.0,
        prodSold: 40,
      },
    ];
  }

  const categorySalesData = calculateCategorySales(items);

  const sortedCategorySales = Object.entries(categorySalesData)
    .sort(([, a], [, b]) => b - a)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  const barChartOptions = {
    series: [
      {
        name: "Total Sales",
        data: Object.values(sortedCategorySales),
      },
    ],
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    theme: {
      palette: "palette9",
    },
    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 3,
        horizontal: false,
        columnWidth: "50%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    fill: {
      opacity: 0.7,
    },
    xaxis: {
      categories: Object.keys(sortedCategorySales),
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Total Sales ($)",
      },
      axisTicks: {
        show: false,
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$" + val.toFixed(2);
        },
      },
    },
  };

  const barChart = new ApexCharts(
    document.querySelector("#bar-chart"),
    barChartOptions,
  );
  barChart.render();

  // DONUT CHART

  function calculateCategoryExp(transactions) {
    const categoryExpenses = {};

    transactions.forEach((transaction) => {
      const category = transaction.trCategory;

      if (!categoryExpenses[category]) {
        categoryExpenses[category] = 0;
      }

      categoryExpenses[category] += transaction.trAmount;
    });

    return categoryExpenses;
  }

  let expItems = [];
  const storedExpenses = localStorage.getItem("bizTrackTransactions");
  if (storedExpenses) {
    try {
      expItems = JSON.parse(storedExpenses);
    } catch (e) {
      console.error("Failed to parse expenses for donut chart", e);
      expItems = [];
    }
  }
  if (!expItems || expItems.length === 0) {
    expItems = [
      {
        trID: 1,
        trDate: "2024-01-05",
        trCategory: "Rent",
        trAmount: 100.0,
        trNotes: "January Rent",
      },
      {
        trID: 2,
        trDate: "2024-01-15",
        trCategory: "Order Fulfillment",
        trAmount: 35.0,
        trNotes: "Order #1005",
      },
      {
        trID: 3,
        trDate: "2024-01-08",
        trCategory: "Utilities",
        trAmount: 120.0,
        trNotes: "Internet",
      },
      {
        trID: 4,
        trDate: "2024-02-05",
        trCategory: "Supplies",
        trAmount: 180.0,
        trNotes: "Embroidery Machine",
      },
      {
        trID: 5,
        trDate: "2024-01-25",
        trCategory: "Miscellaneous",
        trAmount: 20.0,
        trNotes: "Pizza",
      },
    ];
  }

  const categoryExpData = calculateCategoryExp(expItems);

  const donutChartOptions = {
    series: Object.values(categoryExpData),
    labels: Object.keys(categoryExpData),
    chart: {
      type: "donut",
      width: "100%",
      toolbar: {
        show: false,
      },
    },
    theme: {
      palette: "palette1",
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "14px",
        fontFamily: "Loto, sans-serif",
        fontWeight: "regular",
      },
    },
    plotOptions: {
      pie: {
        customScale: 0.8,
        donut: {
          size: "60%",
        },
        offsetY: 20,
      },
      stroke: {
        colors: undefined,
      },
    },
    legend: {
      position: "left",
      offsetY: 55,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$" + val.toFixed(2);
        },
      },
    },
  };

  const donutChart = new ApexCharts(
    document.querySelector("#donut-chart"),
    donutChartOptions,
  );
  donutChart.render();
}
