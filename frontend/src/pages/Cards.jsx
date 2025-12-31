import { useState } from 'react';
import Button from '../components/ui/Button';

const Cards = () => {
  const [cards] = useState([
    {
      id: 1,
      type: 'Credit',
      number: '4532 •••• •••• 1234',
      holder: 'John Doe',
      expiry: '12/25',
      balance: 45000,
      limit: 100000,
      bank: 'HDFC Bank'
    },
    {
      id: 2,
      type: 'Debit',
      number: '5678 •••• •••• 5678',
      holder: 'John Doe',
      expiry: 'N/A',
      balance: 125000,
      bank: 'ICICI Bank'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cards</h1>
          <p className="text-slate-400">Manage your credit and debit cards</p>
        </div>
        <Button variant="primary">Add Card</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${
              card.type === 'Credit' 
                ? 'from-blue-500/20 to-purple-500/20' 
                : 'from-green-500/20 to-cyan-500/20'
            } opacity-50`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  card.type === 'Credit'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-green-500/20 text-green-300 border border-green-500/30'
                }`}>
                  {card.type}
                </span>
                <span className="text-xs text-slate-400">{card.bank}</span>
              </div>
              
              <div className="mb-6">
                <p className="text-xs text-slate-400 mb-2">Card Number</p>
                <p className="text-xl font-mono font-semibold text-white tracking-wider">
                  {card.number}
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Card Holder</p>
                  <p className="text-sm font-medium text-white">{card.holder}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Expires</p>
                  <p className="text-sm font-medium text-white">{card.expiry}</p>
                </div>
              </div>

              {card.type === 'Credit' && (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Available Credit</span>
                    <span className="text-sm font-semibold text-white">
                      ₹{(card.limit - card.balance).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full"
                      style={{ width: `${(card.balance / card.limit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {card.type === 'Debit' && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-slate-400 mb-1">Account Balance</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{card.balance.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cards;

