import Watchlist from '../models/Watchlist.js';

export const getWatchlist = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const watchlist = await Watchlist.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(watchlist);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ message: 'Failed to fetch watchlist' });
  }
};

export const addToWatchlist = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { symbol, name } = req.body;
    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' });
    }

    const watchlistItem = new Watchlist({
      userId: req.userId,
      symbol: symbol.toUpperCase(),
      name: name || symbol,
    });

    try {
      await watchlistItem.save();
      res.json(watchlistItem);
    } catch (error) {
      if (error.code === 11000) {
        // Already in watchlist
        res.status(400).json({ message: 'Stock already in watchlist' });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ message: 'Failed to add to watchlist' });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const watchlistItem = await Watchlist.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!watchlistItem) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }

    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ message: 'Failed to remove from watchlist' });
  }
};

