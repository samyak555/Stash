import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Imap = require('node-imap');
import { simpleParser } from 'mailparser';
import Expense from '../models/Expense.js';

class EmailTransactionParser {
  constructor(emailConfig) {
    this.config = emailConfig;
    this.imap = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.imap = new Imap({
          user: this.config.email,
          password: this.config.password,
          host: this.config.host || 'imap.gmail.com',
          port: this.config.port || 993,
          tls: true,
          tlsOptions: { rejectUnauthorized: false }
        });

        this.imap.once('ready', () => {
          console.log('✅ Email connected:', this.config.email);
          resolve();
        });

        this.imap.once('error', (err) => {
          console.error('Email connection error:', err);
          reject(err);
        });

        this.imap.connect();
      } catch (error) {
        reject(error);
      }
    });
  }

  async fetchAndParseTransactions(userId) {
    return new Promise((resolve, reject) => {
      try {
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) return reject(err);

          // Fetch emails from last 7 days
          const sinceDate = new Date();
          sinceDate.setDate(sinceDate.getDate() - 7);
          const searchCriteria = ['UNSEEN', ['SINCE', sinceDate]];

          this.imap.search(searchCriteria, (err, results) => {
            if (err) return reject(err);
            if (!results || results.length === 0) {
              return resolve([]);
            }

            const fetch = this.imap.fetch(results, { bodies: '', struct: true });
            const transactions = [];

            fetch.on('message', (msg, seqno) => {
              let emailBody = '';

              msg.on('body', (stream, info) => {
                let buffer = '';
                stream.on('data', (chunk) => {
                  buffer += chunk.toString('utf8');
                });
                stream.once('end', () => {
                  simpleParser(buffer).then((parsed) => {
                    emailBody = parsed.text || parsed.html || '';
                    const transaction = this.extractTransaction(parsed, userId);
                    if (transaction) {
                      transactions.push(transaction);
                    }
                  }).catch((err) => {
                    console.error('Error parsing email:', err);
                  });
                });
              });
            });

            fetch.once('error', (err) => {
              reject(err);
            });

            fetch.once('end', () => {
              resolve(transactions);
            });
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  extractTransaction(email, userId) {
    const text = email.text || email.html || '';
    const subject = email.subject || '';
    const from = email.from?.text || '';

    // Paytm
    if (from.includes('paytm') || subject.includes('Paytm')) {
      const amountMatch = text.match(/Rs\.?\s*(\d+(?:\.\d{2})?)/i) || text.match(/₹\s*(\d+(?:\.\d{2})?)/);
      const descMatch = text.match(/(?:paid to|sent to|received from)\s*([A-Za-z0-9\s]+)/i);
      if (amountMatch) {
        return {
          user: userId,
          amount: parseFloat(amountMatch[1]),
          category: this.categorizeTransaction(descMatch ? descMatch[1] : 'Paytm Transaction', parseFloat(amountMatch[1])),
          description: descMatch ? descMatch[1] : 'Paytm Transaction',
          date: email.date || new Date(),
        };
      }
    }

    // PhonePe
    if (from.includes('phonepe') || subject.includes('PhonePe')) {
      const amountMatch = text.match(/Rs\.?\s*(\d+(?:\.\d{2})?)/i) || text.match(/₹\s*(\d+(?:\.\d{2})?)/);
      const descMatch = text.match(/(?:paid to|sent to|received from)\s*([A-Za-z0-9\s]+)/i);
      if (amountMatch) {
        return {
          user: userId,
          amount: parseFloat(amountMatch[1]),
          category: this.categorizeTransaction(descMatch ? descMatch[1] : 'PhonePe Transaction', parseFloat(amountMatch[1])),
          description: descMatch ? descMatch[1] : 'PhonePe Transaction',
          date: email.date || new Date(),
        };
      }
    }

    // MakeMyTrip
    if (from.includes('makemytrip') || subject.includes('MakeMyTrip')) {
      const amountMatch = text.match(/Rs\.?\s*(\d+(?:\.\d{2})?)/i) || text.match(/₹\s*(\d+(?:\.\d{2})?)/);
      if (amountMatch) {
        return {
          user: userId,
          amount: parseFloat(amountMatch[1]),
          category: 'Travel',
          description: 'MakeMyTrip Booking',
          date: email.date || new Date(),
        };
      }
    }

    // Generic bank transactions
    const bankKeywords = ['debit', 'credit', 'transaction', 'payment', 'withdrawal'];
    const isBankEmail = bankKeywords.some(keyword => 
      subject.toLowerCase().includes(keyword) || from.toLowerCase().includes('bank')
    );

    if (isBankEmail) {
      const amountMatch = text.match(/Rs\.?\s*(\d+(?:\.\d{2})?)/i) || text.match(/₹\s*(\d+(?:\.\d{2})?)/) || text.match(/INR\s*(\d+(?:\.\d{2})?)/i);
      const descMatch = text.match(/(?:paid to|at|for)\s*([A-Za-z0-9\s]+)/i);
      if (amountMatch) {
        return {
          user: userId,
          amount: parseFloat(amountMatch[1]),
          category: this.categorizeTransaction(descMatch ? descMatch[1] : 'Bank Transaction', parseFloat(amountMatch[1])),
          description: descMatch ? descMatch[1] : 'Bank Transaction',
          date: email.date || new Date(),
        };
      }
    }

    return null;
  }

  categorizeTransaction(description, amount) {
    const desc = description.toLowerCase();
    
    if (desc.includes('food') || desc.includes('restaurant') || desc.includes('zomato') || desc.includes('swiggy')) {
      return 'Food & Dining';
    }
    if (desc.includes('uber') || desc.includes('ola') || desc.includes('taxi') || desc.includes('cab')) {
      return 'Transportation';
    }
    if (desc.includes('hotel') || desc.includes('travel') || desc.includes('flight') || desc.includes('train')) {
      return 'Travel';
    }
    if (desc.includes('shopping') || desc.includes('amazon') || desc.includes('flipkart')) {
      return 'Shopping';
    }
    if (desc.includes('movie') || desc.includes('cinema') || desc.includes('entertainment')) {
      return 'Entertainment';
    }
    if (desc.includes('medical') || desc.includes('hospital') || desc.includes('pharmacy')) {
      return 'Healthcare';
    }
    if (desc.includes('electricity') || desc.includes('water') || desc.includes('gas') || desc.includes('utility')) {
      return 'Utilities';
    }
    
    return 'Other';
  }

  async saveTransactions(transactions) {
    const saved = [];
    for (const transaction of transactions) {
      try {
        // Check if transaction already exists (prevent duplicates)
        const existing = await Expense.findOne({
          user: transaction.user,
          amount: transaction.amount,
          description: transaction.description,
          date: {
            $gte: new Date(new Date(transaction.date).getTime() - 300000), // Within 5 minutes
            $lte: new Date(new Date(transaction.date).getTime() + 300000)
          }
        });

        if (!existing) {
          const expense = await Expense.create(transaction);
          saved.push(expense);
          console.log(`✅ Auto-added: ${transaction.description} - ₹${transaction.amount}`);
        }
      } catch (error) {
        console.error('Error saving transaction:', error);
      }
    }
    return saved;
  }

  disconnect() {
    if (this.imap) {
      this.imap.end();
    }
  }
}

export default EmailTransactionParser;
