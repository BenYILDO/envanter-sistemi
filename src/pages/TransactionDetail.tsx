import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Phone, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Trash2, 
  Edit, 
  Package, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getTransactionById, 
    getContactById, 
    getProductById, 
    deleteTransaction, 
    transactions,
    updateTransaction 
  } = useAppContext();
  
  const [transaction, setTransaction] = useState<any>(null);
  const [contact, setContact] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | undefined>(undefined);
  const [additionalInfo, setAdditionalInfo] = useState<string>('');

  useEffect(() => {
    if (id) {
      const foundTransaction = getTransactionById(id);
      if (foundTransaction) {
        setTransaction(foundTransaction);
        setExchangeRate(foundTransaction.exchangeRate);
        setAdditionalInfo(foundTransaction.additionalInfo || '');
        
        const foundContact = getContactById(foundTransaction.contactId);
        if (foundContact) {
          setContact(foundContact);
        }
        
        const productDetails = foundTransaction.items.map((item: any) => {
          const product = getProductById(item.productId);
          return {
            ...item,
            product
          };
        });
        
        setProducts(productDetails);
      }
    }
  }, [id, getTransactionById, getContactById, getProductById, transactions]);

  const handleDelete = () => {
    if (window.confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
      if (id) {
        deleteTransaction(id);
        navigate('/transactions');
      }
    }
  };

  const handleSaveChanges = () => {
    if (transaction && id) {
      updateTransaction({
        ...transaction,
        exchangeRate,
        additionalInfo
      });
      setIsEditMode(false);
    }
  };

  if (!transaction || !contact) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">İşlem bulunamadı.</p>
        <Link to="/transactions" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-flex items-center">
          <ArrowLeft size={16} className="mr-2" />
          İşlemlere Dön
        </Link>
      </div>
    );
  }

  // Kar/Zarar hesaplama
  let totalCost = 0;
  let profit = 0;
  
  if (transaction.type === 'sale') {
    transaction.items.forEach(item => {
      if (item.purchasePrice) {
        totalCost += item.purchasePrice * item.quantity;
      }
    });
    profit = transaction.totalAmount - totalCost;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link
          to="/transactions"
          className="text-gray-500 hover:text-gray-700 mr-4"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold">İşlem Detayı</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ana Bilgiler */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">İşlem Bilgileri</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Calendar size={20} className="mr-2" />
                  Tarih
                </div>
                <div className="font-medium">
                  {format(new Date(transaction.date), 'dd.MM.yyyy')}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Package size={20} className="mr-2" />
                  İşlem Türü
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    transaction.type === 'purchase' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {transaction.type === 'purchase' ? 'Alım' : 'Satış'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <User size={20} className="mr-2" />
                  Kişi
                </div>
                <div className="font-medium">
                  <Link 
                    to={`/contacts/${contact?.id}`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {contact?.name || 'Bilinmeyen'}
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <CreditCard size={20} className="mr-2" />
                  Ödeme Yöntemi
                </div>
                <div className="font-medium">
                  {transaction.paymentMethod === 'cash' && 'Nakit'}
                  {transaction.paymentMethod === 'credit' && 'Kredi Kartı'}
                  {transaction.paymentMethod === 'bank_transfer' && 'Banka Transferi'}
                  {transaction.paymentMethod === 'other' && 'Diğer'}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <DollarSign size={20} className="mr-2" />
                  Toplam Tutar
                </div>
                <div className="text-xl font-bold text-indigo-600">
                  {transaction.totalAmount.toLocaleString('tr-TR')} ₺
                  {transaction.exchangeRate && transaction.exchangeRate > 0 && (
                    <span className="text-sm text-gray-500 block text-right">
                      ({(transaction.totalAmount / transaction.exchangeRate).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      })})
                    </span>
                  )}
                </div>
              </div>

              {transaction.type === 'sale' && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <Package size={20} className="mr-2" />
                      Toplam Maliyet
                    </div>
                    <div className="font-medium text-gray-800">
                      {totalCost.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      {profit >= 0 ? (
                        <TrendingUp size={20} className="mr-2 text-green-600" />
                      ) : (
                        <TrendingDown size={20} className="mr-2 text-red-600" />
                      )}
                      {profit >= 0 ? 'Kar' : 'Zarar'}
                    </div>
                    <div className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(profit).toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                </>
              )}

              {transaction.notes && (
                <div className="border-t pt-4 mt-4">
                  <div className="text-gray-600 mb-2">Notlar</div>
                  <div className="text-gray-800">{transaction.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ürün Listesi */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Ürün Listesi</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="px-6 py-3">Ürün</th>
                  <th className="px-6 py-3">Miktar</th>
                  <th className="px-6 py-3">Birim Fiyat</th>
                  {transaction.type === 'sale' && (
                    <th className="px-6 py-3">Alış Fiyatı</th>
                  )}
                  <th className="px-6 py-3 text-right">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items.map(item => {
                  const product = getProductById(item.productId);
                  return (
                    <tr key={item.id} className="border-b">
                      <td className="px-6 py-4">
                        <Link
                          to={`/products/${item.productId}`}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          {product?.name || 'Bilinmeyen Ürün'}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4">
                        {item.unitPrice.toLocaleString('tr-TR')} ₺
                      </td>
                      {transaction.type === 'sale' && (
                        <td className="px-6 py-4">
                          {item.purchasePrice?.toLocaleString('tr-TR')} ₺
                        </td>
                      )}
                      <td className="px-6 py-4 text-right font-medium">
                        {item.total.toLocaleString('tr-TR')} ₺
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-bold">
                  <td className="px-6 py-4" colSpan={transaction.type === 'sale' ? 4 : 3}>
                    Genel Toplam
                  </td>
                  <td className="px-6 py-4 text-right text-indigo-600">
                    {transaction.totalAmount.toLocaleString('tr-TR')} ₺
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;