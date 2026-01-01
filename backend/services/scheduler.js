import schedule from 'node-schedule';
import EmailTransactionParser from './emailParser.js';
import User from '../models/User.js';
import CryptoJS from 'crypto-js';

class TransactionScheduler {
  constructor() {
    this.parsers = new Map();
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'your-secret-key-change-in-production';
  }

  encryptPassword(password) {
    return CryptoJS.AES.encrypt(password, this.encryptionKey).toString();
  }

  decryptPassword(encryptedPassword) {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async setupUserEmail(userId, emailConfig) {
    try {
      // Encrypt password before storing
      const encryptedPassword = this.encryptPassword(emailConfig.password);
      
      // Save encrypted config
      const user = await User.findById(userId);
      if (user) {
        user.emailConfig = {
          email: emailConfig.email,
          password: encryptedPassword,
          host: emailConfig.host || 'imap.gmail.com',
          port: emailConfig.port || 993,
          enabled: true,
          lastSync: null
        };
        await user.save();
      }

      // Decrypt for connection
      const decryptedConfig = {
        ...emailConfig,
        password: emailConfig.password // Already decrypted from request
      };

      const parser = new EmailTransactionParser(decryptedConfig);
      await parser.connect();
      this.parsers.set(userId.toString(), parser);
      
      console.log(`✅ Email configured for user: ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error setting up email for user ${userId}:`, error);
      throw error;
    }
  }

  async setupUserEmailOAuth(userId, emailConfig) {
    try {
      // For OAuth, we store the access token instead of password
      const user = await User.findById(userId);
      if (user) {
        user.emailConfig = {
          email: emailConfig.email,
          accessToken: emailConfig.accessToken, // OAuth token
          host: emailConfig.host || 'imap.gmail.com',
          port: emailConfig.port || 993,
          enabled: true,
          lastSync: null,
          authType: 'oauth'
        };
        await user.save();
      }

      // For OAuth, we'll use the access token for Gmail API
      // For now, mark as configured (full OAuth implementation would use Gmail API)
      console.log(`✅ OAuth email configured for user: ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error setting up OAuth email for user ${userId}:`, error);
      throw error;
    }
  }

  async removeUserEmail(userId) {
    const parser = this.parsers.get(userId.toString());
    if (parser) {
      parser.disconnect();
      this.parsers.delete(userId.toString());
    }

    const user = await User.findById(userId);
    if (user && user.emailConfig) {
      user.emailConfig.enabled = false;
      await user.save();
    }
  }

  async syncUserTransactions(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.emailConfig || !user.emailConfig.enabled) {
        return { count: 0, error: 'Email not configured' };
      }

      // Skip OAuth users for now (would need Gmail API implementation)
      if (user.emailConfig.authType === 'oauth') {
        console.log(`⏭️ Skipping OAuth user ${userId} (Gmail API not implemented yet)`);
        return { count: 0, error: 'OAuth not fully implemented' };
      }

      let parser = this.parsers.get(userId.toString());
      
      // Reconnect if not connected
      if (!parser) {
        const decryptedConfig = {
          email: user.emailConfig.email,
          password: this.decryptPassword(user.emailConfig.password),
          host: user.emailConfig.host,
          port: user.emailConfig.port
        };
        parser = new EmailTransactionParser(decryptedConfig);
        await parser.connect();
        this.parsers.set(userId.toString(), parser);
      }

      const transactions = await parser.fetchAndParseTransactions(userId.toString());
      const saved = await parser.saveTransactions(transactions);

      // Update last sync time
      if (user.emailConfig) {
        user.emailConfig.lastSync = new Date();
        await user.save();
      }

      return { count: saved.length, transactions: saved };
    } catch (error) {
      console.error(`Error syncing transactions for user ${userId}:`, error);
      // Remove parser on error to force reconnect next time
      this.parsers.delete(userId.toString());
      throw error;
    }
  }

  startScheduler() {
    // Check emails every 5 minutes
    schedule.scheduleJob('*/5 * * * *', async () => {
      console.log('🔍 Auto-syncing transactions...');
      
      const users = await User.find({ 'emailConfig.enabled': true });
      
      for (const user of users) {
        try {
          const result = await this.syncUserTransactions(user._id.toString());
          if (result.count > 0) {
            console.log(`✅ User ${user._id}: Found ${result.count} new transactions`);
          }
        } catch (error) {
          console.error(`❌ Error syncing user ${user._id}:`, error.message);
        }
      }
    });

    console.log('✅ Transaction scheduler started (checking every 5 minutes)');
  }

  stopScheduler() {
    schedule.gracefulShutdown();
    for (const parser of this.parsers.values()) {
      parser.disconnect();
    }
    console.log('🛑 Transaction scheduler stopped');
  }

  getSyncStatus(userId) {
    return User.findById(userId).then(user => {
      if (!user || !user.emailConfig) {
        return { connected: false, lastSync: null };
      }

      return {
        connected: user.emailConfig.enabled || false,
        email: user.emailConfig.email,
        lastSync: user.emailConfig.lastSync || null,
        isConnected: this.parsers.has(userId.toString())
      };
    });
  }
}

export default new TransactionScheduler();
