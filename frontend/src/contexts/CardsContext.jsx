import { createContext, useContext, useState, useEffect } from 'react';

const CardsContext = createContext(null);

export const CardsProvider = ({ children }) => {
  const [cards, setCards] = useState([]);

  // Load cards from localStorage on mount
  useEffect(() => {
    try {
      const savedCards = localStorage.getItem('userCards');
      if (savedCards) {
        setCards(JSON.parse(savedCards));
      }
    } catch (error) {
      console.error('Failed to load cards from localStorage:', error);
    }
  }, []);

  // Save cards to localStorage whenever cards change
  const saveCards = (newCards) => {
    try {
      setCards(newCards);
      localStorage.setItem('userCards', JSON.stringify(newCards));
    } catch (error) {
      console.error('Failed to save cards to localStorage:', error);
    }
  };

  const addCard = (cardData) => {
    const newCard = {
      id: Date.now().toString(),
      type: cardData.type,
      bankName: cardData.bankName,
      last4Digits: cardData.last4Digits,
      expiry: cardData.expiry,
      createdAt: new Date().toISOString(),
    };
    const updatedCards = [...cards, newCard];
    saveCards(updatedCards);
    return newCard;
  };

  const deleteCard = (cardId) => {
    const updatedCards = cards.filter(card => card.id !== cardId);
    saveCards(updatedCards);
  };

  const value = {
    cards,
    addCard,
    deleteCard,
  };

  return (
    <CardsContext.Provider value={value}>
      {children}
    </CardsContext.Provider>
  );
};

export const useCards = () => {
  const context = useContext(CardsContext);
  if (!context) {
    throw new Error('useCards must be used within CardsProvider');
  }
  return context;
};












