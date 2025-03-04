import React, { createContext, useContext, useState, useEffect } from 'react';
import { Contact, Product, Transaction, StockMovement, CapitalMovement } from '../types';

interface AppContextType {
  contacts: Contact[];
  products: Product[];
  transactions: Transaction[];
  stockMovements: StockMovement[];
  capitalMovements: CapitalMovement[];
  addContact: (contact: Contact) => void;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  getContactById: (id: string) => Contact | undefined;
  getProductById: (id: string) => Product | undefined;
  getTransactionById: (id: string) => Transaction | undefined;
  getStockMovementsByProductId: (productId: string) => StockMovement[];
  addCapitalMovement: (movement: CapitalMovement) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('contacts');
    return saved ? JSON.parse(saved) : [];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('stockMovements');
    return saved ? JSON.parse(saved) : [];
  });

  const [capitalMovements, setCapitalMovements] = useState<CapitalMovement[]>(() => {
    const saved = localStorage.getItem('capitalMovements');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('stockMovements', JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem('capitalMovements', JSON.stringify(capitalMovements));
  }, [capitalMovements]);

  const addContact = (contact: Contact) => {
    setContacts([...contacts, contact]);
  };

  const updateContact = (contact: Contact) => {
    setContacts(contacts.map(c => c.id === contact.id ? contact : c));
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addTransaction = (transaction: Transaction) => {
    // Stok kontrolü ve güncelleme
    const newStockMovements: StockMovement[] = [];
    
    transaction.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      // Satış işleminde stok kontrolü
      if (transaction.type === 'sale' && product.currentStock < item.quantity) {
        throw new Error(`${product.name} için yeterli stok yok. Mevcut stok: ${product.currentStock}`);
      }

      // Ürün stoğunu güncelle
      const quantityChange = transaction.type === 'purchase' ? item.quantity : -item.quantity;
      const newStock = product.currentStock + quantityChange;

      // Satış işleminde alış fiyatını kaydet
      if (transaction.type === 'sale') {
        // Son alış fiyatını bul
        const lastPurchase = transactions
          .filter(t => t.type === 'purchase')
          .flatMap(t => t.items)
          .filter(i => i.productId === item.productId)
          .sort((a, b) => b.unitPrice - a.unitPrice)[0];

        if (lastPurchase) {
          item.purchasePrice = lastPurchase.unitPrice;
        }
      }

      // Ürünü güncelle
      updateProduct({
        ...product,
        currentStock: newStock
      });

      // Stok hareketi ekle
      newStockMovements.push({
        id: crypto.randomUUID(),
        productId: product.id,
        transactionId: transaction.id,
        date: transaction.date,
        quantity: quantityChange,
        balanceAfter: newStock
      });
    });

    // Stok hareketlerini kaydet
    setStockMovements([...stockMovements, ...newStockMovements]);

    // İşlemi kaydet
    setTransactions([...transactions, transaction]);

    // Kar/Zarar hesaplama ve sermaye hareketi ekleme
    if (transaction.type === 'sale') {
      let totalCost = 0;
      transaction.items.forEach(item => {
        if (item.purchasePrice) {
          totalCost += item.purchasePrice * item.quantity;
        }
      });

      const profit = transaction.totalAmount - totalCost;

      if (profit !== 0) {
        const itemDetails = transaction.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return `${product?.name}: ${item.quantity} adet, Alış: ${item.purchasePrice}₺, Satış: ${item.unitPrice}₺`;
        }).join('\n');

        addCapitalMovement({
          id: crypto.randomUUID(),
          date: transaction.date,
          type: profit > 0 ? 'profit' : 'loss',
          amount: Math.abs(profit),
          description: `İşlem No: ${transaction.id}\n` +
                      `${transaction.items.length} ürün satışından ${profit > 0 ? 'kar' : 'zarar'}\n` +
                      `Toplam Satış: ${transaction.totalAmount}₺\n` +
                      `Toplam Maliyet: ${totalCost}₺\n` +
                      `${profit > 0 ? 'Kar' : 'Zarar'}: ${Math.abs(profit)}₺\n\n` +
                      `Ürün Detayları:\n${itemDetails}`
        });
      }
    }
  };

  const updateTransaction = (transaction: Transaction) => {
    const oldTransaction = transactions.find(t => t.id === transaction.id);
    if (!oldTransaction) return;
    
    // Revert old stock movements
    oldTransaction.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;
      
      const oldQuantityChange = oldTransaction.type === 'purchase' ? item.quantity : -item.quantity;
      const revertedStock = product.currentStock - oldQuantityChange;
      
      // Update product with reverted stock
      updateProduct({
        ...product,
        currentStock: revertedStock
      });
    });
    
    // Remove old stock movements for this transaction
    setStockMovements(stockMovements.filter(sm => sm.transactionId !== transaction.id));
    
    // Remove old capital movement for this transaction if it exists
    if (oldTransaction.type === 'sale') {
      setCapitalMovements(prev => prev.filter(cm => !cm.description?.includes(`İşlem No: ${transaction.id}`)));
    }
    
    // Add new transaction and create new stock movements
    setTransactions(transactions.map(t => t.id === transaction.id ? transaction : t));
    
    // Kar/Zarar hesaplama
    if (transaction.type === 'sale') {
      let totalCost = 0;
      transaction.items.forEach(item => {
        if (item.purchasePrice) {
          totalCost += item.purchasePrice * item.quantity;
        }
      });
      
      const profit = transaction.totalAmount - totalCost;
      
      // Kar/Zarar hareketini ekle
      if (profit !== 0) {
        const itemDetails = transaction.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return `${product?.name}: ${item.quantity} adet, Alış: ${item.purchasePrice}₺, Satış: ${item.unitPrice}₺`;
        }).join('\n');

        addCapitalMovement({
          id: crypto.randomUUID(),
          date: transaction.date,
          type: profit > 0 ? 'profit' : 'loss',
          amount: Math.abs(profit),
          description: `İşlem No: ${transaction.id}\n` +
                      `${transaction.items.length} ürün satışından ${profit > 0 ? 'kar' : 'zarar'}\n` +
                      `Toplam Satış: ${transaction.totalAmount}₺\n` +
                      `Toplam Maliyet: ${totalCost}₺\n` +
                      `${profit > 0 ? 'Kar' : 'Zarar'}: ${Math.abs(profit)}₺\n\n` +
                      `Ürün Detayları:\n${itemDetails}`
        });
      }
    }
    
    const newStockMovements: StockMovement[] = [];
    
    transaction.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;
      
      const quantityChange = transaction.type === 'purchase' ? item.quantity : -item.quantity;
      const newBalance = product.currentStock + quantityChange;
      
      // Update product stock
      updateProduct({
        ...product,
        currentStock: newBalance
      });
      
      // Create stock movement record
      newStockMovements.push({
        id: crypto.randomUUID(),
        productId: item.productId,
        transactionId: transaction.id,
        date: transaction.date,
        quantity: quantityChange,
        balanceAfter: newBalance
      });
    });
    
    setStockMovements([...stockMovements, ...newStockMovements]);
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    // Revert stock movements
    transaction.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;
      
      const quantityChange = transaction.type === 'purchase' ? item.quantity : -item.quantity;
      const revertedStock = product.currentStock - quantityChange;
      
      // Update product with reverted stock
      updateProduct({
        ...product,
        currentStock: revertedStock
      });
    });
    
    // Remove stock movements for this transaction
    setStockMovements(stockMovements.filter(sm => sm.transactionId !== id));
    
    // Remove transaction
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const getContactById = (id: string) => {
    return contacts.find(c => c.id === id);
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  const getTransactionById = (id: string) => {
    return transactions.find(t => t.id === id);
  };

  const getStockMovementsByProductId = (productId: string) => {
    return stockMovements.filter(sm => sm.productId === productId);
  };

  const addCapitalMovement = (movement: CapitalMovement) => {
    setCapitalMovements(prev => [...prev, movement]);
  };

  return (
    <AppContext.Provider
      value={{
        contacts,
        products,
        transactions,
        stockMovements,
        capitalMovements,
        addContact,
        updateContact,
        deleteContact,
        addProduct,
        updateProduct,
        deleteProduct,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getContactById,
        getProductById,
        getTransactionById,
        getStockMovementsByProductId,
        addCapitalMovement
      }}
    >
      {children}
    </AppContext.Provider>
  );
};