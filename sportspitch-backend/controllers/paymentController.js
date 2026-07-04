const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const PaymentTransaction = require('../models/PaymentTransaction');

// Get all customers with their current month payment status
exports.getCustomersWithPayments = async (req, res) => {
  try {
    const { filter, month, year } = req.query;
    
    const currentDate = new Date();
    const currentMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const currentYear = year ? parseInt(year) : currentDate.getFullYear();

    let customers = await Customer.find({ isActive: true }).sort({ name: 1 });

    // Get all payment transactions for the specified month/year
    const transactions = await PaymentTransaction.find({
      month: currentMonth,
      year: currentYear
    }).sort({ createdAt: 1 });

    // Calculate total amount paid per customer
    const paymentMap = {};
    transactions.forEach(transaction => {
      const customerId = transaction.customerId.toString();
      if (!paymentMap[customerId]) {
        paymentMap[customerId] = {
          totalAmountPaid: 0,
          monthlyFee: transaction.monthlyFee,
          transactions: []
        };
      }
      paymentMap[customerId].totalAmountPaid += transaction.amount;
      paymentMap[customerId].transactions.push(transaction);
    });

    // Attach payment status to each customer
    const customersWithPayments = customers.map(customer => {
      const paymentData = paymentMap[customer._id.toString()];
      const monthlyFee = customer.monthlyFee || 500;
      const amountPaid = paymentData ? paymentData.totalAmountPaid : 0;
      const balance = monthlyFee - amountPaid;
      
      return {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        sports: customer.sports,
        batch: customer.batch || '',
        monthlyFee: monthlyFee,
        amountPaid: amountPaid,
        balance: balance,
        paymentStatus: balance === 0 ? 'Paid' : amountPaid > 0 ? 'Partially Paid' : 'Unpaid',
        transactions: paymentData ? paymentData.transactions : []
      };
    });

    // Apply filters
    let filteredCustomers = customersWithPayments;
    if (filter === 'Paid') {
      filteredCustomers = customersWithPayments.filter(c => c.paymentStatus === 'Paid');
    } else if (filter === 'Unpaid') {
      filteredCustomers = customersWithPayments.filter(c => c.paymentStatus === 'Unpaid');
    }

    // Calculate stats
    const totalPaid = customersWithPayments.filter(c => c.paymentStatus === 'Paid').length;
    const totalUnpaid = customersWithPayments.filter(c => c.paymentStatus === 'Unpaid').length;

    res.json({
      success: true,
      customers: filteredCustomers,
      stats: {
        totalCustomers: customersWithPayments.length,
        totalPaid,
        totalUnpaid,
        month: currentMonth,
        year: currentYear
      }
    });
  } catch (error) {
    console.error('Error fetching customers with payments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create or update customer
exports.createOrUpdateCustomer = async (req, res) => {
  try {
    const { name, phone, sports, customerId, batch, monthlyFee } = req.body;

    if (!name || !phone || !sports || sports.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, and sports are required'
      });
    }

    let customer;
    const customerData = { name, phone, sports };
    if (batch) customerData.batch = batch;
    if (monthlyFee) customerData.monthlyFee = monthlyFee;

    if (customerId) {
      customer = await Customer.findByIdAndUpdate(
        customerId,
        customerData,
        { new: true }
      );
    } else {
      customer = await Customer.create(customerData);
    }

    res.json({
      success: true,
      customer
    });
  } catch (error) {
    console.error('Error creating/updating customer:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { customerId, status, month, year, editedBy } = req.body;

    if (!customerId || !status) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and status are required'
      });
    }

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Find or create payment record
    let payment = await Payment.findOne({
      customerId,
      month: targetMonth,
      year: targetYear
    });

    if (payment) {
      payment.status = status;
      payment.updatedAt = new Date();
      if (editedBy) {
        payment.editedBy = editedBy;
        payment.editedAt = new Date();
      }
      await payment.save();
    } else {
      payment = await Payment.create({
        customerId,
        month: targetMonth,
        year: targetYear,
        status,
        editedBy: editedBy || null,
        editedAt: editedBy ? new Date() : null
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create monthly payment records for all active customers
exports.createMonthlyRecords = async (req, res) => {
  try {
    const { month, year } = req.body;

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const customers = await Customer.find({ isActive: true });

    let createdCount = 0;
    for (const customer of customers) {
      const existingPayment = await Payment.findOne({
        customerId: customer._id,
        month: targetMonth,
        year: targetYear
      });

      if (!existingPayment) {
        await Payment.create({
          customerId: customer._id,
          month: targetMonth,
          year: targetYear,
          status: 'Unpaid'
        });
        createdCount++;
      }
    }

    res.json({
      success: true,
      message: `Created ${createdCount} payment records for ${targetMonth}/${targetYear}`
    });
  } catch (error) {
    console.error('Error creating monthly records:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send payment reminder SMS
exports.sendReminder = async (req, res) => {
  try {
    console.log('[sendReminder] Request received:', req.body);
    const { customerId, month, year, phone } = req.body;

    if (!customerId) {
      console.log('[sendReminder] Missing customerId');
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      });
    }

    console.log('[sendReminder] Finding customer:', customerId);
    const customer = await Customer.findById(customerId);
    if (!customer) {
      console.log('[sendReminder] Customer not found');
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    console.log('[sendReminder] Customer found:', customer.name, customer.phone);

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    console.log('[sendReminder] Target month/year:', targetMonth, targetYear);

    console.log('[sendReminder] Finding payment record');
    const payment = await Payment.findOne({
      customerId,
      month: targetMonth,
      year: targetYear
    });

    if (!payment) {
      console.log('[sendReminder] Payment record not found');
      return res.status(404).json({
        success: false,
        error: 'Payment record not found'
      });
    }
    console.log('[sendReminder] Payment record found');

    // Use phone from request body if provided, otherwise use customer's phone
    const phoneToUse = phone || customer.phone;
    console.log('[sendReminder] Phone to use:', phoneToUse);

    // Generate WhatsApp message URL
    const message = `Hi ${customer.name}, your sports booking payment for this month is pending. Please complete the payment.`;
    const whatsappUrl = `https://wa.me/91${phoneToUse}?text=${encodeURIComponent(message)}`;
    console.log('[sendReminder] WhatsApp URL generated:', whatsappUrl);

    // Update reminder status
    payment.reminderSent = true;
    payment.reminderSentAt = new Date();
    await payment.save();
    console.log('[sendReminder] Payment record updated');

    res.json({
      success: true,
      whatsappUrl,
      message: 'Reminder sent successfully'
    });
    console.log('[sendReminder] Response sent successfully');
  } catch (error) {
    console.error('[sendReminder] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    await Customer.findByIdAndUpdate(customerId, { isActive: false });

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update payment amount
exports.updatePaymentAmount = async (req, res) => {
  try {
    const { customerId, amount, month, year } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and amount are required'
      });
    }

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Find or create payment record
    let payment = await Payment.findOne({
      customerId,
      month: targetMonth,
      year: targetYear
    });

    if (payment) {
      payment.amount = parseFloat(amount);
      payment.updatedAt = new Date();
      await payment.save();
    } else {
      payment = await Payment.create({
        customerId,
        month: targetMonth,
        year: targetYear,
        status: 'Unpaid',
        amount: parseFloat(amount)
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error updating payment amount:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Get all payments for the specified year
    const payments = await Payment.find({ year: currentYear });

    // Calculate month-wise statistics (only for Paid payments)
    const monthlyStats = {};
    let totalPaid = 0;
    let totalUnpaid = 0;
    let totalAmount = 0;

    for (let month = 1; month <= 12; month++) {
      monthlyStats[month] = {
        month: month,
        monthName: new Date(0, month - 1).toLocaleString('default', { month: 'long' }),
        paid: 0,
        unpaid: 0,
        totalAmount: 0,
        revenue: 0
      };
    }

    payments.forEach(payment => {
      const month = payment.month;
      if (monthlyStats[month]) {
        if (payment.status === 'Paid') {
          monthlyStats[month].paid += 1;
          totalPaid += payment.amount;
          monthlyStats[month].revenue += payment.amount;
        } else {
          monthlyStats[month].unpaid += 1;
          totalUnpaid += payment.amount;
        }
        monthlyStats[month].totalAmount += payment.amount;
        totalAmount += payment.amount;
      }
    });

    res.json({
      success: true,
      stats: {
        year: currentYear,
        totalPaid,
        totalUnpaid,
        totalAmount,
        monthlyStats: Object.values(monthlyStats)
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get revenue statistics
exports.getRevenueStats = async (req, res) => {
  try {
    const { month, year, startDate, endDate } = req.query;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let query = { status: 'Paid' };

    // Apply filters
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (year) {
      query.year = parseInt(year);
    } else {
      query.year = currentYear;
    }

    if (month && !startDate) {
      query.month = parseInt(month);
    }

    // Get filtered payments
    const payments = await Payment.find(query);

    // Calculate revenue
    let totalRevenue = 0;
    const monthlyRevenue = {};
    const yearlyRevenue = {};

    payments.forEach(payment => {
      totalRevenue += payment.amount;

      // Monthly revenue
      const monthKey = `${payment.year}-${payment.month}`;
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = {
          year: payment.year,
          month: payment.month,
          monthName: new Date(0, payment.month - 1).toLocaleString('default', { month: 'long' }),
          revenue: 0
        };
      }
      monthlyRevenue[monthKey].revenue += payment.amount;

      // Yearly revenue
      if (!yearlyRevenue[payment.year]) {
        yearlyRevenue[payment.year] = {
          year: payment.year,
          revenue: 0
        };
      }
      yearlyRevenue[payment.year].revenue += payment.amount;
    });

    // Calculate current month and year revenue
    const currentMonthPayments = await Payment.find({
      status: 'Paid',
      month: currentMonth,
      year: currentYear
    });
    const currentMonthRevenue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    const currentYearPayments = await Payment.find({
      status: 'Paid',
      year: currentYear
    });
    const currentYearRevenue = currentYearPayments.reduce((sum, p) => sum + p.amount, 0);

    // Calculate all-time revenue
    const allTimePayments = await Payment.find({ status: 'Paid' });
    const allTimeRevenue = allTimePayments.reduce((sum, p) => sum + p.amount, 0);

    // Calculate growth statistics
    const monthlyRevenueArray = Object.values(monthlyRevenue).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    let growthRate = 0;
    if (monthlyRevenueArray.length >= 2) {
      const lastMonth = monthlyRevenueArray[monthlyRevenueArray.length - 1];
      const previousMonth = monthlyRevenueArray[monthlyRevenueArray.length - 2];
      if (previousMonth.revenue > 0) {
        growthRate = ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
      }
    }

    res.json({
      success: true,
      stats: {
        totalRevenue: totalRevenue,
        currentMonthRevenue: currentMonthRevenue,
        currentYearRevenue: currentYearRevenue,
        allTimeRevenue: allTimeRevenue,
        monthlyRevenue: Object.values(monthlyRevenue).sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        }),
        yearlyRevenue: Object.values(yearlyRevenue).sort((a, b) => a.year - b.year),
        growthRate: growthRate.toFixed(2),
        currentMonth: currentMonth,
        currentYear: currentYear
      }
    });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Record payment
exports.recordPayment = async (req, res) => {
  try {
    const { customerId, amount, paymentMethod, remarks, month, year } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and amount are required'
      });
    }

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get customer to get monthly fee
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    const monthlyFee = customer.monthlyFee || 500;

    // Get all existing transactions for this customer for this month/year
    const existingTransactions = await PaymentTransaction.find({
      customerId,
      month: targetMonth,
      year: targetYear
    });

    // Calculate total amount paid so far
    const totalAmountPaid = existingTransactions.reduce((sum, t) => sum + t.amount, 0);
    const newTotalAmountPaid = totalAmountPaid + parseFloat(amount);
    const balanceAfterPayment = monthlyFee - newTotalAmountPaid;

    // Create new payment transaction
    const transaction = await PaymentTransaction.create({
      customerId,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'Cash',
      remarks: remarks || '',
      month: targetMonth,
      year: targetYear,
      monthlyFee: monthlyFee,
      balanceAfterPayment: balanceAfterPayment
    });

    res.json({
      success: true,
      transaction,
      totalAmountPaid: newTotalAmountPaid,
      balance: balanceAfterPayment,
      paymentStatus: balanceAfterPayment === 0 ? 'Paid' : newTotalAmountPaid > 0 ? 'Partially Paid' : 'Unpaid'
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get payment history for a customer
exports.getPaymentHistory = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Get customer details
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    const monthlyFee = customer.monthlyFee || 500;
    const joinDate = customer.createdAt;

    // Get all payment transactions for this customer
    const transactions = await PaymentTransaction.find({ customerId })
      .sort({ year: -1, month: -1, createdAt: -1 });

    // Group transactions by month/year
    const monthlyPayments = {};
    transactions.forEach(transaction => {
      const key = `${transaction.year}-${transaction.month}`;
      if (!monthlyPayments[key]) {
        monthlyPayments[key] = {
          year: transaction.year,
          month: transaction.month,
          monthName: new Date(transaction.year, transaction.month - 1).toLocaleString('default', { month: 'long' }),
          totalAmountPaid: 0,
          transactions: []
        };
      }
      monthlyPayments[key].totalAmountPaid += transaction.amount;
      monthlyPayments[key].transactions.push(transaction);
    });

    // Calculate payment status for each month
    const monthlyHistory = Object.values(monthlyPayments).map(monthData => {
      const balance = monthlyFee - monthData.totalAmountPaid;
      return {
        year: monthData.year,
        month: monthData.month,
        monthName: monthData.monthName,
        monthlyFee: monthlyFee,
        amountPaid: monthData.totalAmountPaid,
        balance: balance >= 0 ? balance : 0,
        paymentStatus: balance === 0 ? 'Paid' : monthData.totalAmountPaid > 0 ? 'Partially Paid' : 'Unpaid',
        transactions: monthData.transactions
      };
    });

    // Calculate total months paid and not paid
    const totalMonthsPaid = monthlyHistory.filter(m => m.paymentStatus === 'Paid').length;
    const totalMonthsNotPaid = monthlyHistory.filter(m => m.paymentStatus !== 'Paid').length;

    // Calculate total months since joining
    const now = new Date();
    const joinDateObj = new Date(joinDate);
    const monthsSinceJoin = (now.getFullYear() - joinDateObj.getFullYear()) * 12 + (now.getMonth() - joinDateObj.getMonth()) + 1;

    res.json({
      success: true,
      history: monthlyHistory,
      customerDetails: {
        name: customer.name,
        phone: customer.phone,
        sports: customer.sports,
        joinDate: joinDate,
        monthlyFee: monthlyFee,
        batch: customer.batch || ''
      },
      summary: {
        totalMonthsPaid,
        totalMonthsNotPaid,
        monthsSinceJoin
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Monthly collection report
exports.getMonthlyCollectionReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const customers = await Customer.find({ isActive: true });
    const transactions = await PaymentTransaction.find({
      month: targetMonth,
      year: targetYear
    });

    // Calculate total amount paid per customer
    const paymentMap = {};
    transactions.forEach(transaction => {
      const customerId = transaction.customerId.toString();
      if (!paymentMap[customerId]) {
        paymentMap[customerId] = {
          totalAmountPaid: 0,
          monthlyFee: transaction.monthlyFee
        };
      }
      paymentMap[customerId].totalAmountPaid += transaction.amount;
    });

    const customersWithPayments = customers.map(customer => {
      const paymentData = paymentMap[customer._id.toString()];
      const monthlyFee = customer.monthlyFee || 500;
      const amountPaid = paymentData ? paymentData.totalAmountPaid : 0;
      const balance = monthlyFee - amountPaid;
      const paymentStatus = balance === 0 ? 'Paid' : amountPaid > 0 ? 'Partially Paid' : 'Unpaid';

      return {
        name: customer.name,
        phone: customer.phone,
        sports: customer.sports,
        monthlyFee: monthlyFee,
        amountPaid: amountPaid,
        balance: balance,
        paymentStatus: paymentStatus
      };
    });

    const totalCollection = customersWithPayments
      .reduce((sum, c) => sum + c.amountPaid, 0);
    const paidFees = totalCollection;
    const pendingFees = customersWithPayments
      .reduce((sum, c) => sum + c.balance, 0);

    res.json({
      success: true,
      data: {
        customers: customersWithPayments,
        totalCollection,
        paidFees,
        pendingFees
      }
    });
  } catch (error) {
    console.error('Error fetching monthly collection report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Pending fee report
exports.getPendingFeeReport = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const customers = await Customer.find({ isActive: true });
    const transactions = await PaymentTransaction.find({
      month: currentMonth,
      year: currentYear
    });

    // Calculate total amount paid per customer
    const paymentMap = {};
    transactions.forEach(transaction => {
      const customerId = transaction.customerId.toString();
      if (!paymentMap[customerId]) {
        paymentMap[customerId] = {
          totalAmountPaid: 0,
          monthlyFee: transaction.monthlyFee
        };
      }
      paymentMap[customerId].totalAmountPaid += transaction.amount;
    });

    const pendingCustomers = customers
      .filter(customer => {
        const paymentData = paymentMap[customer._id.toString()];
        const monthlyFee = customer.monthlyFee || 500;
        const amountPaid = paymentData ? paymentData.totalAmountPaid : 0;
        const balance = monthlyFee - amountPaid;
        return balance > 0;
      })
      .map(customer => {
        const paymentData = paymentMap[customer._id.toString()];
        const monthlyFee = customer.monthlyFee || 500;
        const amountPaid = paymentData ? paymentData.totalAmountPaid : 0;
        const balance = monthlyFee - amountPaid;
        
        return {
          name: customer.name,
          phone: customer.phone,
          sports: customer.sports,
          monthlyFee: monthlyFee,
          amountPaid: amountPaid,
          pendingAmount: balance
        };
      });

    const totalPending = pendingCustomers.reduce((sum, c) => sum + c.pendingAmount, 0);

    res.json({
      success: true,
      data: {
        customers: pendingCustomers,
        totalPending
      }
    });
  } catch (error) {
    console.error('Error fetching pending fee report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Edit an existing payment transaction (amount, method, remarks) with an
// audit trail of who changed it and when. Recalculates balanceAfterPayment
// for this transaction and does not touch other transactions in the month.
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, remarks, editedBy } = req.body;

    const transaction = await PaymentTransaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    const previousAmount = transaction.amount;
    const previousPaymentMethod = transaction.paymentMethod;
    const previousRemarks = transaction.remarks;

    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (paymentMethod !== undefined) transaction.paymentMethod = paymentMethod;
    if (remarks !== undefined) transaction.remarks = remarks;

    transaction.editedBy = editedBy || 'Admin';
    transaction.editedAt = new Date();
    transaction.editHistory.push({
      editedBy: editedBy || 'Admin',
      editedAt: new Date(),
      previousAmount,
      previousPaymentMethod,
      previousRemarks
    });

    // Recalculate balance for this customer/month using the updated amount
    const siblingTransactions = await PaymentTransaction.find({
      customerId: transaction.customerId,
      month: transaction.month,
      year: transaction.year,
      _id: { $ne: transaction._id }
    });
    const otherTotal = siblingTransactions.reduce((sum, t) => sum + t.amount, 0);
    const newTotal = otherTotal + transaction.amount;
    transaction.balanceAfterPayment = transaction.monthlyFee - newTotal;

    await transaction.save();

    res.json({
      success: true,
      transaction,
      totalAmountPaid: newTotal,
      balance: transaction.balanceAfterPayment,
      paymentStatus: transaction.balanceAfterPayment === 0 ? 'Paid' : newTotal > 0 ? 'Partially Paid' : 'Unpaid'
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Sport-wise revenue report
exports.getSportWiseRevenueReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const customers = await Customer.find({ isActive: true });
    const transactions = await PaymentTransaction.find({
      month: targetMonth,
      year: targetYear
    });

    // Calculate total amount paid per customer
    const paymentMap = {};
    transactions.forEach(transaction => {
      const customerId = transaction.customerId.toString();
      if (!paymentMap[customerId]) {
        paymentMap[customerId] = {
          totalAmountPaid: 0,
          monthlyFee: transaction.monthlyFee
        };
      }
      paymentMap[customerId].totalAmountPaid += transaction.amount;
    });

    const sportRevenue = {};
    let totalRevenue = 0;

    customers.forEach(customer => {
      const paymentData = paymentMap[customer._id.toString()];
      if (paymentData && paymentData.totalAmountPaid > 0) {
        customer.sports.forEach(sport => {
          if (!sportRevenue[sport]) {
            sportRevenue[sport] = 0;
          }
          const amountPerSport = paymentData.totalAmountPaid / customer.sports.length;
          sportRevenue[sport] += amountPerSport;
          totalRevenue += amountPerSport;
        });
      }
    });

    const sportRevenueArray = Object.keys(sportRevenue).map(sport => ({
      sport,
      revenue: Math.round(sportRevenue[sport]),
      percentage: totalRevenue > 0 ? ((sportRevenue[sport] / totalRevenue) * 100).toFixed(2) : 0
    }));

    res.json({
      success: true,
      data: {
        sportRevenue: sportRevenueArray,
        totalRevenue: Math.round(totalRevenue)
      }
    });
  } catch (error) {
    console.error('Error fetching sport-wise revenue report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
