export const getInsights = async (req, res) => {
  try {
    res.json({
      insights: [],
      healthScore: 0,
      recommendations: [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


