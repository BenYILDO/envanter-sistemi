import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Wallet, TrendingUp, TrendingDown, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { CapitalMovement } from '../types';

const Capital: React.FC = () => {
  const { capitalMovements = [], addCapitalMovement } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialFormState = {
    type: 'investment' as const,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleOpenModal = () => {
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addCapitalMovement({
      ...formData,
      id: crypto.randomUUID(),
      amount: parseFloat(formData.amount)
    });
    
    handleCloseModal();
  };

  const summary = capitalMovements.reduce((acc, movement) => {
    switch (movement.type) {
      case 'investment':
        acc.totalInvestments += movement.amount;
        break;
      case 'withdrawal':
        acc.totalWithdrawals += movement.amount;
        break;
      case 'profit':
        acc.totalProfit += movement.amount;
        break;
      case 'loss':
        acc.totalLoss += movement.amount;
        break;
    }
    return acc;
  }, {
    totalInvestments: 0,
    totalWithdrawals: 0,
    totalProfit: 0,
    totalLoss: 0
  });

  const currentBalance = summary.totalInvestments - summary.totalWithdrawals + summary.totalProfit - summary.totalLoss;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sermaye Yönetimi</h1>
        <button
          onClick={handleOpenModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Yeni Hareket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Mevcut Bakiye</h3>
            <Wallet className="text-indigo-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {currentBalance.toLocaleString('tr-TR')} ₺
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Toplam Yatırım</h3>
            <DollarSign className="text-green-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {summary.totalInvestments.toLocaleString('tr-TR')} ₺
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Toplam Kar</h3>
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {summary.totalProfit.toLocaleString('tr-TR')} ₺
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Toplam Zarar</h3>
            <TrendingDown className="text-red-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {summary.totalLoss.toLocaleString('tr-TR')} ₺
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Sermaye Hareketleri</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-6 py-3">Tarih</th>
                <th className="px-6 py-3">Tür</th>
                <th className="px-6 py-3">Tutar</th>
                <th className="px-6 py-3">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {capitalMovements.length > 0 ? (
                capitalMovements
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(movement => (
                    <tr key={movement.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2 text-gray-500" />
                          {format(new Date(movement.date), 'dd.MM.yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          movement.type === 'investment' 
                            ? 'bg-green-100 text-green-800'
                            : movement.type === 'withdrawal'
                            ? 'bg-orange-100 text-orange-800'
                            : movement.type === 'profit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {movement.type === 'investment' && 'Yatırım'}
                          {movement.type === 'withdrawal' && 'Çekme'}
                          {movement.type === 'profit' && 'Kar'}
                          {movement.type === 'loss' && 'Zarar'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {movement.amount.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {movement.description?.includes('İşlem No:') ? (
                          <div>
                            {movement.description.split('\n').map((line, index) => {
                              if (line.startsWith('İşlem No:')) {
                                const transactionId = line.split('İşlem No: ')[1];
                                return (
                                  <div key={index} className="flex items-start mb-2">
                                    <Link
                                      to={`/transactions/${transactionId}`}
                                      className="text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                                    >
                                      <ExternalLink size={14} className="mr-1" />
                                      İşlem Detayı
                                    </Link>
                                  </div>
                                );
                              }
                              return <div key={index} className="whitespace-pre-wrap mb-1">{line}</div>;
                            })}
                          </div>
                        ) : (
                          movement.description || '-'
                        )}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Henüz sermaye hareketi bulunmamaktadır.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Yeni Sermaye Hareketi</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Hareket Türü
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="investment">Yatırım</option>
                    <option value="withdrawal">Çekme</option>
                    <option value="profit">Kar</option>
                    <option value="loss">Zarar</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Tutar
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="mb-4">
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
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Açıklama
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
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

export default Capital; 