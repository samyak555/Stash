import { useState } from 'react';

const ProgressInput = ({ onAdd, goalId }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      onAdd(goalId, parseFloat(amount));
      setAmount('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="number"
        step="0.01"
        placeholder="Add amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
      <button
        type="submit"
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        Add
      </button>
    </form>
  );
};

export default ProgressInput;

