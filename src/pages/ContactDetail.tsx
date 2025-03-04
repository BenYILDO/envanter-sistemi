import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2, 
  ShoppingCart,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getContactById, 
    deleteContact, 
    transactions,
    contacts
  } = useAppContext();
  
  const [contact, setContact] = useState<any>(null);
  const [contactTransactions, setContactTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSales: 0,
    purchaseAmount: 0,
    saleAmount: 0
  });

  useEffect(() => {
    if (id) {
      const foundContact = getContactById(id);
      if (foundContact) {
        setContact(foundContact);
        
        // İlgili işlemleri bul
        const relatedTransactions = transactions.filter(t => t.contactId === id);
        setContactTransactions(relatedTransactions);
        
        // İstatistikleri hesapla
        const purchases = relatedTransactions.filter(t => t.type === 'purchase');
        const sales = relatedTransactions.filter(t => t.type === 'sale');
        
        setStats({
          totalPurchases: purchases.length,
          totalSales: sales.length,
          purchaseAmount: purchases.reduce((sum, t) => sum + t.totalAmount, 0),
          saleAmount: sales.reduce((sum, t) => sum + t.totalAmount, 0)
        });
      }
    }
  }, [id, getContactById, transactions, contacts]);

  const handleDelete = () => {
    if (window.confirm('Bu kişiyi silmek istediğinizden emin misiniz?')) {
      if (id) {
        deleteContact(id);
        navigate('/contacts');
      }
    }
  };

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Kişi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/contacts" className="mr-4 text-gray-600 hover:text-gray-800">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold">Kişi Detayı</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/contacts/edit/${id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Edit size={18} className="mr-2" />
            Düzenle
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Trash2 size={18} className="mr-2" />
            Sil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow h-fit">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center">
              <User className="mr-2 text-gray-500" />
              Kişi Bilgileri
            </h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-500 mb-1">İsim</p>
              <p className="text-xl font-medium">{contact.name}</p>
            </div>
            <div className="mb-6">
              <p className="text-gray-500 mb-1">Telefon</p>
              <p className="text-lg font-medium flex items-center">
                <Phone size={18} className="mr-2 text-gray-500" />
                {contact.phone}
              </p>
            </div>
            {contact.email && (
              <div className="mb-6">
                <p className="text-gray-500 mb-1">E-posta</p>
                <p className="text-lg font-medium flex items-center">
                  <Mail size={18} className="mr-2 text-gray-500" />
                  {contact.email}
                </p>
              </div>
            )}
            {contact.address && (
              <div>
                <p className="text-gray-500 mb-1">Adres</p>
                <p className="text-base flex items-start">
                  <MapPin size={18} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                  <span>{contact.address}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* İstatistikler */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <ShoppingCart className="mr-2 text-gray-500" />
                İşlem İstatistikleri
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-2">
                      <TrendingUp size={20} />
                    </div>
                    <p className="text-purple-700">Alım Sayısı</p>
                  </div>
                  <p className="text-2xl font-semibold text-purple-800">{stats.totalPurchases}</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-full bg-orange-100 text-orange-600 mr-2">
                      <TrendingDown size={20} />
                    </div>
                    <p className="text-orange-700">Satış Sayısı</p>
                  </div>
                  <p className="text-2xl font-semibold text-orange-800">{stats.totalSales}</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-700 mb-2">Toplam Alım</p>
                  <p className="text-2xl font-semibold text-purple-800">
                    {stats.purchaseAmount.toLocaleString('tr-TR')} ₺
                  </p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-orange-700 mb-2">Toplam Satış</p>
                  <p className="text-2xl font-semibold text-orange-800">
                    {stats.saleAmount.toLocaleString('tr-TR')} ₺
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* İşlem Geçmişi */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">İşlem Geçmişi</h2>
            </div>
            <div className="p-6">
              {contactTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-3">Tarih</th>
                        <th className="pb-3">Tür</th>
                        <th className="pb-3">Ürün Sayısı</th>
                        <th className="pb-3 text-right">Tutar</th>
                        <th className="pb-3 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactTransactions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(transaction => (
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
                            <td className="py-3">
                              {transaction.items.length}
                            </td>
                            <td className="py-3 text-right font-medium">
                              {transaction.totalAmount.toLocaleString('tr-TR')} ₺
                            </td>
                            <td className="py-3 text-right">
                              <Link
                                to={`/transactions/${transaction.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Detay
                              </Link>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Bu kişiye ait işlem bulunmamaktadır.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;