import crypto from 'crypto';
import fileDB from '../utils/fileDB.js';

export const handleRazorpayWebhook = (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error('Razorpay webhook secret not configured');
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid Razorpay webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      
      // Extract user from metadata or customer_id
      const userId = payment.notes?.userId || payment.customer_id;

      if (userId) {
        const expense = fileDB.createExpense({
          user: userId,
          amount: payment.amount / 100, // Convert paise to rupees
          description: payment.description || `Razorpay Payment - ${payment.id}`,
          category: categorizeByDescription(payment.description || ''),
          date: new Date(payment.created_at * 1000).toISOString(),
          source: 'razorpay',
          autoDetected: true,
          transactionId: payment.id
        });

        console.log(`✅ Auto-added Razorpay transaction: ₹${expense.amount}`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

export const handlePaytmWebhook = (req, res) => {
  try {
    // Paytm webhook verification (implement based on Paytm's documentation)
    const { ORDERID, TXNID, TXNAMOUNT, STATUS, userId } = req.body;

    if (STATUS === 'TXN_SUCCESS' && userId) {
      const amount = parseFloat(TXNAMOUNT);

      const expense = fileDB.createExpense({
        user: userId,
        amount,
        description: `Paytm Payment - ${ORDERID}`,
        category: 'others',
        date: new Date().toISOString(),
        source: 'paytm',
        autoDetected: true,
        transactionId: TXNID
      });

      console.log(`✅ Auto-added Paytm transaction: ₹${expense.amount}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Paytm webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

export const handleGenericWebhook = (req, res) => {
  try {
    const { userId, amount, description, category, date, source } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expense = fileDB.createExpense({
      user: userId,
      amount: parseFloat(amount),
      description: description || 'Webhook Transaction',
      category: category || categorizeByDescription(description || ''),
      date: date || new Date().toISOString(),
      source: source || 'webhook',
      autoDetected: true
    });

    console.log(`✅ Auto-added webhook transaction: ₹${expense.amount}`);
    res.json({ success: true, expense });
  } catch (error) {
    console.error('Generic webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

function categorizeByDescription(description) {
  const desc = (description || '').toLowerCase();
  
  if (desc.includes('movie') || desc.includes('cinema') || desc.includes('bookmyshow')) {
    return 'entertainment';
  }
  if (desc.includes('food') || desc.includes('restaurant') || desc.includes('swiggy') || desc.includes('zomato')) {
    return 'food';
  }
  if (desc.includes('travel') || desc.includes('cab') || desc.includes('uber') || desc.includes('ola') || desc.includes('makemytrip')) {
    return 'travel';
  }
  if (desc.includes('cloth') || desc.includes('fashion') || desc.includes('myntra') || desc.includes('flipkart')) {
    return 'shopping';
  }
  if (desc.includes('grocery') || desc.includes('bigbasket') || desc.includes('bill')) {
    return 'bills';
  }
  
  return 'others';
}

