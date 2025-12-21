import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Imap = require('node-imap');
import { simpleParser } from 'mailparser';
import fileDB from '../utils/fileDB.js';

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
          
          this.imap.search(['UNSEEN', ['SINCE', sinceDate]], (err, results) => {
            if (err) return reject(err);
            
            if (!results || results.length === 0) {
              return resolve([]);
            }

            const fetch = this.imap.fetch(results, { bodies: '' });
            const transactions = [];
            let processed = 0;

            fetch.on('message', (msg, seqno) => {
              msg.on('body', async (stream) => {
                try {
                  const parsed = await simpleParser(stream);
                  const transaction = this.extractTransaction(parsed, userId);
                  if (transaction) {
                    transactions.push(transaction);
                  }
                  processed++;
                  if (processed === results.length) {
                    resolve(transactions);
                  }
                } catch (error) {
                  console.error('Parse error:', error);
                  processed++;
                  if (processed === results.length) {
                    resolve(transactions);
                  }
                }
              });
            });

            fetch.once('error', (err) => {
              console.error('Fetch error:', err);
              resolve(transactions); // Return what we have
            });
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  extractTransaction(email, userId) {
    const subject = (email.subject || '').toLowerCase();
    const text = (email.text || '').toLowerCase();
    const html = (email.html || '').toLowerCase();
    const fullText = subject + ' ' + text;

    // Paytm patterns
    if (fullText.includes('paytm')) {
      return this.parsePaytmTransaction(email, userId);
    }

    // PhonePe patterns
    if (fullText.includes('phonepe') || fullText.includes('phone pe')) {
      return this.parsePhonePeTransaction(email, userId);
    }

    // MakeMyTrip patterns
    if (fullText.includes('makemytrip') || fullText.includes('mmt')) {
      return this.parseMMTTransaction(email, userId);
    }

    // Bank transaction patterns
    if (fullText.includes('debited') || fullText.includes('credited') || 
        fullText.includes('inr') || fullText.includes('rs.') || fullText.includes('₹')) {
      return this.parseBankTransaction(email, userId);
    }

    // Zomato/Swiggy
    if (fullText.includes('zomato') || fullText.includes('swiggy')) {
      return this.parseFoodDeliveryTransaction(email, userId);
    }

    // Uber/Ola
    if (fullText.includes('uber') || fullText.includes('ola')) {
      return this.parseRideTransaction(email, userId);
    }

    // BookMyShow
    if (fullText.includes('bookmyshow') || fullText.includes('bms')) {
      return this.parseEntertainmentTransaction(email, userId);
    }

    return null;
  }

  parsePaytmTransaction(email, userId) {
    const text = email.text || '';
    const subject = email.subject || '';

    // Extract amount
    const amountMatch = text.match(/rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i) || 
                       text.match(/₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i) ||
                       text.match(/inr\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

    // Extract merchant/description
    const merchantMatch = text.match(/paid to\s+([^\n]+)/i) || 
                         text.match(/sent to\s+([^\n]+)/i) ||
                         text.match(/payment to\s+([^\n]+)/i);
    const merchant = merchantMatch ? merchantMatch[1].trim().split('\n')[0] : 'Paytm Payment';

    // Extract date
    const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/) || 
                     subject.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
    const date = dateMatch ? this.parseDate(dateMatch[1]) : new Date();

    return {
      user: userId,
      amount,
      category: this.categorizeTransaction(merchant),
      description: `Paytm - ${merchant}`,
      date: date.toISOString(),
      source: 'paytm',
      autoDetected: true
    };
  }

  parsePhonePeTransaction(email, userId) {
    const text = email.text || '';
    const subject = email.subject || '';

    const amountMatch = text.match(/₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i) ||
                       text.match(/rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    const merchantMatch = text.match(/paid to\s+([^\n]+)/i) ||
                         text.match(/payment to\s+([^\n]+)/i);
    const merchant = merchantMatch ? merchantMatch[1].trim().split('\n')[0] : 'PhonePe Payment';

    const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/) ||
                     subject.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
    const date = dateMatch ? this.parseDate(dateMatch[1]) : new Date();

    return {
      user: userId,
      amount,
      category: this.categorizeTransaction(merchant),
      description: `PhonePe - ${merchant}`,
      date: date.toISOString(),
      source: 'phonepe',
      autoDetected: true
    };
  }

  parseMMTTransaction(email, userId) {
    const text = email.text || '';
    const subject = email.subject || '';

    const amountMatch = text.match(/₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i) || 
                       text.match(/inr\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i) ||
                       text.match(/rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    
    const bookingMatch = text.match(/booking id[:\s]+([a-z0-9]+)/i) ||
                        subject.match(/booking[:\s]+([a-z0-9]+)/i);
    const bookingId = bookingMatch ? bookingMatch[1] : '';

    const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/) ||
                     subject.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
    const date = dateMatch ? this.parseDate(dateMatch[1]) : new Date();

    return {
      user: userId,
      amount,
      category: 'travel',
      description: `MakeMyTrip Booking${bookingId ? ' - ' + bookingId : ''}`,
      date: date.toISOString(),
      source: 'makemytrip',
      autoDetected: true
    };
  }

  parseBankTransaction(email, userId) {
    const text = email.text || '';
    const subject = email.subject || '';

    const amountMatch = text.match(/inr\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i) || 
                       text.match(/rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i) ||
                       text.match(/₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    const isDebit = subject.toLowerCase().includes('debited') || 
                   text.toLowerCase().includes('debited') ||
                   text.toLowerCase().includes('withdrawal');

    if (!isDebit) return null; // Only track expenses (debits)

    const descriptionMatch = text.match(/to\s+([^\n]+?)(?:\s+on|\s+via|\s+at|$)/i) ||
                            text.match(/paid to\s+([^\n]+?)(?:\s+on|\s+via|\s+at|$)/i) ||
                            subject.match(/to\s+([^\n]+)/i);
    const description = descriptionMatch ? descriptionMatch[1].trim().split('\n')[0] : 'Bank Transaction';

    const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/) ||
                     subject.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
    const date = dateMatch ? this.parseDate(dateMatch[1]) : new Date();

    return {
      user: userId,
      amount,
      category: this.categorizeTransaction(description),
      description: description,
      date: date.toISOString(),
      source: 'bank',
      autoDetected: true
    };
  }

  parseFoodDeliveryTransaction(email, userId) {
    const text = email.text || '';
    const amountMatch = text.match(/₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i) ||
                       text.match(/rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    const service = text.includes('zomato') ? 'Zomato' : 'Swiggy';
    
    const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
    const date = dateMatch ? this.parseDate(dateMatch[1]) : new Date();

    return {
      user: userId,
      amount,
      category: 'food',
      description: `${service} Order`,
      date: date.toISOString(),
      source: service.toLowerCase(),
      autoDetected: true
    };
  }

  parseRideTransaction(email, userId) {
    const text = email.text || '';
    const amountMatch = text.match(/₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i) ||
                       text.match(/rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    const service = text.includes('uber') ? 'Uber' : 'Ola';
    
    const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
    const date = dateMatch ? this.parseDate(dateMatch[1]) : new Date();

    return {
      user: userId,
      amount,
      category: 'travel',
      description: `${service} Ride`,
      date: date.toISOString(),
      source: service.toLowerCase(),
      autoDetected: true
    };
  }

  parseEntertainmentTransaction(email, userId) {
    const text = email.text || '';
    const amountMatch = text.match(/₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i) ||
                       text.match(/rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    
    const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
    const date = dateMatch ? this.parseDate(dateMatch[1]) : new Date();

    return {
      user: userId,
      amount,
      category: 'entertainment',
      description: 'BookMyShow - Movie Tickets',
      date: date.toISOString(),
      source: 'bookmyshow',
      autoDetected: true
    };
  }

  parseDate(dateString) {
    try {
      const parts = dateString.split(/[-\/]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2].length === 2 ? '20' + parts[2] : parts[2]);
        return new Date(year, month, day);
      }
    } catch (e) {
      // Fall through to return new Date()
    }
    return new Date();
  }

  categorizeTransaction(description) {
    const desc = description.toLowerCase();
    
    if (desc.includes('movie') || desc.includes('cinema') || desc.includes('bookmyshow') || desc.includes('theater')) {
      return 'entertainment';
    }
    if (desc.includes('food') || desc.includes('restaurant') || desc.includes('swiggy') || desc.includes('zomato') || desc.includes('dining')) {
      return 'food';
    }
    if (desc.includes('travel') || desc.includes('cab') || desc.includes('uber') || desc.includes('ola') || desc.includes('makemytrip') || desc.includes('flight') || desc.includes('train') || desc.includes('hotel')) {
      return 'travel';
    }
    if (desc.includes('cloth') || desc.includes('fashion') || desc.includes('myntra') || desc.includes('flipkart') || desc.includes('amazon') || desc.includes('shopping')) {
      return 'shopping';
    }
    if (desc.includes('grocery') || desc.includes('bigbasket') || desc.includes('bill') || desc.includes('electricity') || desc.includes('water') || desc.includes('gas')) {
      return 'bills';
    }
    if (desc.includes('fuel') || desc.includes('petrol') || desc.includes('diesel')) {
      return 'fuel';
    }
    if (desc.includes('health') || desc.includes('medical') || desc.includes('pharmacy') || desc.includes('hospital')) {
      return 'health';
    }
    
    return 'others';
  }

  async saveTransactions(transactions) {
    const saved = [];
    for (const transaction of transactions) {
      // Check if transaction already exists (prevent duplicates)
      const existing = fileDB.findExpenses({ user: transaction.user })
        .find(e => 
          Math.abs(e.amount - transaction.amount) < 0.01 && 
          e.description === transaction.description &&
          Math.abs(new Date(e.date) - new Date(transaction.date)) < 300000 // Within 5 minutes
        );

      if (!existing) {
        const expense = fileDB.createExpense(transaction);
        saved.push(expense);
        console.log(`✅ Auto-added: ${transaction.description} - ₹${transaction.amount}`);
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

