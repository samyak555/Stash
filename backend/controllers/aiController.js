import { generateInsights } from '../services/aiService.js';

export const getInsights = async (req, res) => {
  try {
    const data = await generateInsights(req.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


