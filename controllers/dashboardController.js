const Transaction = require("../models/Transaction");

async function index(req, res, next) {
  try {
    const userId = req.session.user.id;
    const summary = await Transaction.getSummaryByUser(userId);
    const chartData = await Transaction.getChartDataByUser(userId);
    const recentTransactions = await Transaction.findAllByUser(userId);

    res.render("dashboard/index", {
      title: "Dashboard",
      summary,
      chartData,
      recentTransactions: recentTransactions.slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index
};
