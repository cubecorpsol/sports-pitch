const Customer = require('../models/Customer');
const PaymentTransaction = require('../models/PaymentTransaction');

// Helper function to format phone number
const formatPhoneNumber = (phone) => {
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
    formattedPhone = formattedPhone.substring(2);
  }
  return formattedPhone;
};

// Helper function to get month name
const getMonthName = (month, year) => {
  return new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
};

// Send WhatsApp reminder for outstanding balance
exports.sendFeeReminder = async (req, res) => {
  try {
    const { customerId, month, year } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      });
    }

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get customer details
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    const monthlyFee = customer.monthlyFee || 500;

    // Get all transactions for this customer for the month/year
    const transactions = await PaymentTransaction.find({
      customerId,
      month: targetMonth,
      year: targetYear
    });

    // Calculate total amount paid
    const totalAmountPaid = transactions.reduce((sum, t) => sum + t.amount, 0);
    const balance = monthlyFee - totalAmountPaid;

    // Only send reminder if there's a balance
    if (balance <= 0) {
      return res.json({
        success: true,
        message: 'No outstanding balance to remind',
        reminderSent: false
      });
    }

    // Format phone number
    const phone = formatPhoneNumber(customer.phone);
    const monthName = getMonthName(targetMonth, targetYear);

    // Create reminder message
    const message = `Dear ${customer.name}, your pending fee amount is ₹${balance} for the month of ${monthName}. Please pay the remaining amount as soon as possible. Thank you.`;

    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

    res.json({
      success: true,
      whatsappUrl,
      message,
      reminderSent: true,
      customerName: customer.name,
      monthlyFee,
      amountPaid: totalAmountPaid,
      balance
    });
  } catch (error) {
    console.error('Error sending fee reminder:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send WhatsApp notification for successful payment
exports.sendPaymentSuccessNotification = async (req, res) => {
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

    // Get customer details
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Format phone number
    const phone = formatPhoneNumber(customer.phone);
    const monthName = getMonthName(targetMonth, targetYear);

    // Create success message
    const message = `Dear ${customer.name}, your payment of ₹${amount} for the month of ${monthName} has been successfully received. Thank you for your payment.`;

    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

    res.json({
      success: true,
      whatsappUrl,
      message,
      customerName: customer.name,
      amount,
      month: targetMonth,
      year: targetYear
    });
  } catch (error) {
    console.error('Error sending payment success notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send WhatsApp notification for pending payment
exports.sendPendingPaymentNotification = async (req, res) => {
  try {
    const { customerId, month, year } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      });
    }

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get customer details
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    const monthlyFee = customer.monthlyFee || 500;

    // Format phone number
    const phone = formatPhoneNumber(customer.phone);
    const monthName = getMonthName(targetMonth, targetYear);

    // Create pending payment message
    const message = `Dear ${customer.name}, you have not paid the fees amount of ₹${monthlyFee} for the month of ${monthName}. Kindly pay the fees as soon as possible. Thank you.`;

    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

    res.json({
      success: true,
      whatsappUrl,
      message,
      customerName: customer.name,
      monthlyFee,
      month: targetMonth,
      year: targetYear
    });
  } catch (error) {
    console.error('Error sending pending payment notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send WhatsApp notification for partial payment
exports.sendPartialPaymentNotification = async (req, res) => {
  try {
    const { customerId, pendingAmount, month, year } = req.body;

    if (!customerId || !pendingAmount) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and pending amount are required'
      });
    }

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get customer details
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Format phone number
    const phone = formatPhoneNumber(customer.phone);
    const monthName = getMonthName(targetMonth, targetYear);

    // Create partial payment message
    const message = `Dear ${customer.name}, your pending fee amount is ₹${pendingAmount} for the month of ${monthName}. Please pay the remaining amount as soon as possible. Thank you.`;

    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

    res.json({
      success: true,
      whatsappUrl,
      message,
      customerName: customer.name,
      pendingAmount,
      month: targetMonth,
      year: targetYear
    });
  } catch (error) {
    console.error('Error sending partial payment notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send bulk reminders for all customers with outstanding balance
exports.sendBulkReminders = async (req, res) => {
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

    // Find customers with outstanding balance
    const customersWithBalance = customers
      .filter(customer => {
        const paymentData = paymentMap[customer._id.toString()];
        const monthlyFee = customer.monthlyFee || 500;
        const amountPaid = paymentData ? paymentData.totalAmountPaid : 0;
        return (monthlyFee - amountPaid) > 0;
      })
      .map(customer => {
        const paymentData = paymentMap[customer._id.toString()];
        const monthlyFee = customer.monthlyFee || 500;
        const amountPaid = paymentData ? paymentData.totalAmountPaid : 0;
        const balance = monthlyFee - amountPaid;
        
        // Format phone number
        const phone = formatPhoneNumber(customer.phone);
        const monthName = getMonthName(targetMonth, targetYear);

        const message = `Dear ${customer.name}, you have a pending fee balance of ₹${balance} for ${monthName}. Monthly Fee: ₹${monthlyFee}, Amount Paid: ₹${amountPaid}. Kindly complete the payment at the earliest. Thank you.`;

        return {
          customerId: customer._id,
          name: customer.name,
          phone,
          monthlyFee,
          amountPaid,
          balance,
          message,
          whatsappUrl: `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`
        };
      });

    res.json({
      success: true,
      customers: customersWithBalance,
      totalReminders: customersWithBalance.length
    });
  } catch (error) {
    console.error('Error sending bulk reminders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
