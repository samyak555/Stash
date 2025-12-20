import fileDB from '../utils/fileDB.js';

export const getAll = async (req, res) => {
  try {
    const incomes = fileDB.findIncomes({ user: req.user._id });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const income = fileDB.createIncome({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const income = fileDB.updateIncome(req.params.id, req.body);
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    fileDB.deleteIncome(req.params.id);
    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

