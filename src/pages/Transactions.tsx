import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ShoppingCart, Plus, Edit, Trash2, Search, Calendar, User, CreditCard, UserPlus, Package } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { TransactionType, PaymentMethod } from '../types';

const Transactions: React.FC = () => {
  const { transactions, contacts, products, addTransaction, updateTransaction, deleteTransaction, addContact, addProduct } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Yeni kişi için form state'i
  const [newContactForm, setNewContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Yeni ürün için form state'i
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    description: '',
    category: '',
    currentStock: 0
  });

  const initialItemState = {
    id: '',
    productId: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  };

  const initialTransactionState = {
    id: '',
    type: 'purchase' as TransactionType,
    date: new Date().toISOString().split('T')[0],
    contactId: '',
    items: [{ ...initialItemState, id: crypto.randomUUID() }],
    paymentMethod: 'cash' as PaymentMethod,
    notes: '',
    totalAmount: 0,
    exchangeRate: 0
  };

  const [formData, setFormData] = useState(initialTransactionState);

  const handleOpenModal = (transaction = null) => {
    if (transaction) {
      setFormData({
        ...transaction,
        date: new Date(transaction.date).toISOString().split('T')[0]
      });
      setCurrentTransaction(transaction);
    } else {
      setFormData(initialTransactionState);
      setCurrentTransaction(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialTransactionState);
    setCurrentTransaction(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    
    if (name === 'productId') {
      const product = products.find(p => p.id === value);
      const unitPrice = product ? (newItems[index].unitPrice || 0) : 0;
      const quantity = newItems[index].quantity || 1;
      
      newItems[index] = {
        ...newItems[index],
        [name]: value,
        unitPrice,
        total: unitPrice * quantity
      };
    } else if (name === 'quantity' || name === 'unitPrice') {
      const numValue = parseFloat(value) || 0;
      const quantity = name === 'quantity' ? numValue : (newItems[index].quantity || 1);
      const unitPrice = name === 'unitPrice' ? numValue : (newItems[index].unitPrice || 0);
      
      newItems[index] = {
        ...newItems[index],
        [name]: numValue,
        total: unitPrice * quantity
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [name]: value
      };
    }
    
    const totalAmount = newItems.reduce((sum, item) => sum + item.total, 0);
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      totalAmount
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...initialItemState, id: crypto.randomUUID() }]
    }));
  };

  const removeItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    
    const totalAmount = newItems.reduce((sum, item) => sum + item.total, 0);
    
    setFormData(prev => ({
      ...prev,
      items: newItems.length ? newItems : [{ ...initialItemState, id: crypto.randomUUID() }],
      totalAmount
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentTransaction) {
      updateTransaction({
        ...formData,
        id: currentTransaction.id
      });
    } else {
      addTransaction({
        ...formData,
        id: crypto.randomUUID()
      });
    }
    
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
      deleteTransaction(id);
    }
  };

  const handleNewContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newContact = {
      ...newContactForm,
      id: crypto.randomUUID()
    };
    addContact(newContact);
    setFormData(prev => ({
      ...prev,
      contactId: newContact.id
    }));
    setIsNewContactModalOpen(false);
    setNewContactForm({
      name: '',
      phone: '',
      email: '',
      address: ''
    });
  };

  const handleNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct = {
      ...newProductForm,
      id: crypto.randomUUID()
    };
    addProduct(newProduct);
    setIsNewProductModalOpen(false);
    setNewProductForm({
      name: '',
      description: '',
      category: '',
      currentStock: 0
    });
  };

  const filteredTransactions = transactions
    .filter(transaction => 
      (filterType === 'all' || transaction.type === filterType) &&
      (searchTerm === '' || 
        contacts.find(c => c.id === transaction.contactId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.paymentMethod.includes(searchTerm.toLowerCase()) ||
        transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">İşlemler</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Yeni İşlem
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="İşlem ara..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tüm İşlemler</option>
              <option value="purchase">Sadece Alımlar</option>
              <option value="sale">Sadece Satışlar</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-6 py-3">Tarih</th>
                <th className="px-6 py-3">Tür</th>
                <th className="px-6 py-3">Kişi</th>
                <th className="px-6 py-3">Ödeme Yöntemi</th>
                <th className="px-6 py-3">Ürün Sayısı</th>
                <th className="px-6 py-3 text-right">Tutar</th>
                <th className="px-6 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(transaction => {
                  const contact = contacts.find(c => c.id === transaction.contactId);
                  return (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2 text-gray-500" />
                          {format(new Date(transaction.date), 'dd.MM.yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.type === 'purchase' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {transaction.type === 'purchase' ? 'Alım' : 'Satış'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-gray-500" />
                          {contact?.name || 'Bilinmeyen'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <CreditCard size={16} className="mr-2 text-gray-500" />
                          {transaction.paymentMethod === 'cash' && 'Nakit'}
                          {transaction.paymentMethod === 'credit' && 'Kredi Kartı'}
                          {transaction.paymentMethod === 'bank_transfer' && 'Banka Transferi'}
                          {transaction.paymentMethod === 'other' && 'Diğer'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {transaction.items.length}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {transaction.totalAmount.toLocaleString('tr-TR')} ₺
                        {transaction.exchangeRate && (
                          <span className="text-sm text-gray-500 block">
                            ({(transaction.totalAmount / transaction.exchangeRate).toFixed(2)} $)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/transactions/${transaction.id}`}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Detay
                        </Link>
                        <button
                          onClick={() => handleOpenModal(transaction)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || filterType !== 'all' 
                      ? 'Arama kriterlerine uygun işlem bulunamadı.' 
                      : 'Henüz işlem bulunmamaktadır.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ana İşlem Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {currentTransaction ? 'İşlemi Düzenle' : 'Yeni İşlem'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      İşlem Türü
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="purchase">Alım</option>
                      <option value="sale">Satış</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Tarih
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-700 text-sm font-medium">
                        Kişi
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsNewContactModalOpen(true)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                      >
                        <UserPlus size={16} className="mr-1" />
                        Yeni Kişi Ekle
                      </button>
                    </div>
                    <select
                      name="contactId"
                      value={formData.contactId}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Kişi Seçin</option>
                      {contacts.map(contact => (
                        <option key={contact.id} value={contact.id}>
                          {contact.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Ödeme Yöntemi
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="cash">Nakit</option>
                      <option value="credit">Kredi Kartı</option>
                      <option value="bank_transfer">Banka Transferi</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Dolar Kuru
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="exchangeRate"
                        value={formData.exchangeRate || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Örn: 31.50"
                        step="0.01"
                        min="0"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₺/$</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Ürünler</h3>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsNewProductModalOpen(true)}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        <Package size={16} className="mr-1" />
                        Yeni Ürün Ekle
                      </button>
                      <button
                        type="button"
                        onClick={addItem}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        <Plus size={16} className="mr-1" />
                        Ürün Ekle
                      </button>
                    </div>
                  </div>
                  
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="bg-gray-50 p-4 rounded-lg mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-5">
                          <label className="block text-gray-700 text-xs mb-1">
                            Ürün
                          </label>
                          <select
                            name="productId"
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, e)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          >
                            <option value="">Ürün Seçin</option>
                            {products
                              .filter(product => formData.type === 'purchase' || product.currentStock > 0)
                              .map(product => (
                                <option key={product.id} value={product.id}>
                                  {product.name} (Stok: {product.currentStock})
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-gray-700 text-xs mb-1">
                            Miktar
                          </label>
                          <input
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            min="1"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-gray-700 text-xs mb-1">
                            Birim Fiyat (₺)
                          </label>
                          <input
                            type="number"
                            name="unitPrice"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, e)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-gray-700 text-xs mb-1">
                            Toplam (₺)
                          </label>
                          <input
                            type="number"
                            value={item.total}
                            className="w-full p-2 border rounded-lg bg-gray-100"
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-1 flex items-end">
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="p-2 text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Notlar / Ek Bilgiler
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Fatura bilgileri, garanti durumu, ürün detayları, vb."
                  />
                </div>
                
                <div className="flex justify-end">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-700 mb-1">Toplam Tutar:</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {formData.totalAmount.toLocaleString('tr-TR')} ₺
                    </p>
                    {formData.exchangeRate && formData.exchangeRate > 0 && (
                      <p className="text-lg text-gray-600 mt-1">
                        {(formData.totalAmount / formData.exchangeRate).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50 flex justify-end rounded-b-lg">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  {currentTransaction ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yeni Kişi Modalı */}
      {isNewContactModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {formData.type === 'purchase' ? 'Yeni Tedarikçi Ekle' : 'Yeni Müşteri Ekle'}
              </h2>
            </div>
            <form onSubmit={handleNewContactSubmit}>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={newContactForm.name}
                    onChange={(e) => setNewContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={newContactForm.phone}
                    onChange={(e) => setNewContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={newContactForm.email}
                    onChange={(e) => setNewContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Adres
                  </label>
                  <textarea
                    value={newContactForm.address}
                    onChange={(e) => setNewContactForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50 flex justify-end rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setIsNewContactModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yeni Ürün Modalı */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Yeni Ürün Ekle</h2>
            </div>
            <form onSubmit={handleNewProductSubmit}>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Ürün Adı
                  </label>
                  <input
                    type="text"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Başlangıç Stok Miktarı
                  </label>
                  <input
                    type="number"
                    value={newProductForm.currentStock}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, currentStock: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">Ürün eklendikten sonra stok miktarı alım işlemi ile güncellenecektir.</p>
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50 flex justify-end rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;