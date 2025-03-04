import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Package, Users, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { products, contacts, transactions } = useAppContext();

  const totalProducts = products.length;
  const totalContacts = contacts.length;
  const lowStockProducts = products.filter(p => p.currentStock < 5).length;
  
  const purchases = transactions.filter(t => t.type === 'purchase');
  const sales = transactions.filter(t => t.type === 'sale');
  
  const totalPurchaseAmount = purchases.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalSaleAmount = sales.reduce((sum, t) => sum + t.totalAmount, 0);
  
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Ana Sayfa</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Package size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Toplam Ürün</p>
              <p className="text-2xl font-semibold">{totalProducts}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/products" className="text-blue-600 text-sm hover:underline">
              Tüm ürünleri görüntüle
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Toplam Kişi</p>
              <p className="text-2xl font-semibold">{totalContacts}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/contacts" className="text-green-600 text-sm hover:underline">
              Tüm kişileri görüntüle
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <TrendingUp size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Toplam Alım</p>
              <p className="text-2xl font-semibold">{purchases.length}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-purple-600 text-sm">
              {totalPurchaseAmount.toLocaleString('tr-TR')} ₺
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <TrendingDown size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Toplam Satış</p>
              <p className="text-2xl font-semibold">{sales.length}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-orange-600 text-sm">
              {totalSaleAmount.toLocaleString('tr-TR')} ₺
            </p>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Son İşlemler</h2>
        </div>
        <div className="p-6">
          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3">Tarih</th>
                    <th className="pb-3">Tür</th>
                    <th className="pb-3">Kişi</th>
                    <th className="pb-3">Ödeme Yöntemi</th>
                    <th className="pb-3 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(transaction => {
                    const contact = contacts.find(c => c.id === transaction.contactId);
                    return (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          {format(new Date(transaction.date), 'dd.MM.yyyy')}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.type === 'purchase' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {transaction.type === 'purchase' ? 'Alım' : 'Satış'}
                          </span>
                        </td>
                        <td className="py-3">{contact?.name || 'Bilinmeyen'}</td>
                        <td className="py-3">
                          {transaction.paymentMethod === 'cash' && 'Nakit'}
                          {transaction.paymentMethod === 'credit' && 'Kredi Kartı'}
                          {transaction.paymentMethod === 'bank_transfer' && 'Banka Transferi'}
                          {transaction.paymentMethod === 'other' && 'Diğer'}
                        </td>
                        <td className="py-3 text-right font-medium">
                          {transaction.totalAmount.toLocaleString('tr-TR')} ₺
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Henüz işlem bulunmamaktadır.</p>
          )}
          
          <div className="mt-4">
            <Link to="/transactions" className="text-blue-600 text-sm hover:underline">
              Tüm işlemleri görüntüle
            </Link>
          </div>
        </div>
      </div>
      
      {/* Low Stock Alert */}
      {lowStockProducts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100 text-red-600">
              <Package size={20} />
            </div>
            <div className="ml-3">
              <p className="text-red-700 font-medium">
                {lowStockProducts} ürün düşük stokta!
              </p>
              <p className="text-red-600 text-sm">
                Stok durumunu kontrol etmek için ürünler sayfasını ziyaret edin.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;