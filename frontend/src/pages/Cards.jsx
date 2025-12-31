import { useState } from 'react';
import { useCards } from '../contexts/CardsContext';
import Button from '../components/ui/Button';
import AddCardModal from '../components/AddCardModal';
import toast from 'react-hot-toast';

const Cards = () => {
  const { cards, addCard, deleteCard } = useCards();
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddCard = (cardData) => {
    addCard(cardData);
    toast.success('Card added successfully');
  };

  const handleDeleteCard = (cardId) => {
    if (window.confirm('Are you sure you want to remove this card?')) {
      deleteCard(cardId);
      toast.success('Card removed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cards</h1>
          <p className="text-slate-400">Manage your credit and debit cards</p>
        </div>
        <Button 
          variant="primary"
          onClick={() => setShowAddModal(true)}
          leftIcon={<span>➕</span>}
        >
          Add Card
        </Button>
      </div>

      {/* Trust Message */}
      <div className="glass-card rounded-xl p-4 border border-cyan-500/20 bg-cyan-500/5">
        <p className="text-xs text-cyan-300 text-center leading-relaxed">
          🔒 Manual tracking. No forced linking. Your data is never sold.
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 border border-white/10 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No cards added yet</h3>
            <p className="text-slate-400 mb-6">
              Add your debit or credit card to track spending
            </p>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              leftIcon={<span>➕</span>}
            >
              Add Card
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden group"
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
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove card"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-xs text-slate-400 mb-2">Card Number</p>
                  <p className="text-xl font-mono font-semibold text-white tracking-wider">
                    •••• •••• •••• {card.last4Digits}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Bank</p>
                    <p className="text-sm font-medium text-white">{card.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Expires</p>
                    <p className="text-sm font-medium text-white">{card.expiry}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddCardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCard}
      />
    </div>
  );
};

export default Cards;

