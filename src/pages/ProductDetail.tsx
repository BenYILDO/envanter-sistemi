import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Package, 
  Edit, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getProductById, 
    deleteProduct, 
    getStockMovementsByProductId,
    products
  } = useAppContext();
  
  const [product, setProduct] = useState<any>(null);
  const [stockMovements, setStockMovements] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      const foundProduct = getProductById(id);
      if (foundProduct) {
        setProduct(foundProduct);
        
        // Stok hareketlerini getir
        const movements = getStockMovementsByProductId(id);
        setStockMovements(movements);
      }
    }
  }, [id, getProductById, getStockMovementsByProductId, products]);

  const handleDelete = () => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      if (id) {
        deleteProduct(id);
        navigate('/products');
      }
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Ürün bulunamadı.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/products" className="mr-4 text-gray-600 hover:text-gray-800">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold">Ürün Detayı</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/products/edit/${id}`}
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
              <Package className="mr-2 text-gray-500" />
              Ürün Bilgileri
            </h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-500 mb-1">Ürün Adı</p>
              <p className="text-xl font-medium">{product.name}</p>
            </div>
            {product.category && (
              <div className="mb-6">
                <p className="text-gray-500 mb-1">Kategori</p>
                <p className="text-lg font-medium">{product.category}</p>
              </div>
            )}
            {product.description && (
              <div className="mb-6">
                <p className="text-gray-500 mb-1">Açıklama</p>
                <p className="text-base">{product.description}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500 mb-1">Mevcut Stok</p>
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${product.currentStock < 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {product.currentStock}
                </span>
                {product.currentStock < 5 && (
                  <AlertTriangle size={20} className="ml-2 text-red-600" />
                )}
              </div>
              {product.currentStock < 5 && (
                <p className="text-red-600 text-sm mt-1">
                  Düşük stok uyarısı! Stok yenileme zamanı.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Stok Hareketleri */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <BarChart3 className="mr-2 text-gray-500" />
                Stok Hareketleri
              </h2>
            </div>
            <div className="p-6">
              {stockMovements.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-3">Tarih</th>
                        <th className="pb-3">İşlem Türü</th>
                        <th className="pb-3 text-center">Miktar</th>
                        <th className="pb-3 text-right">Kalan Stok</th>
                        <th className="pb-3 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockMovements
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(movement => (
                          <tr key={movement.id} className="border-b hover:bg-gray-50">
                            <td className="py-3">
                              {format(new Date(movement.date), 'dd.MM.yyyy')}
                            </td>
                            <td className="py-3">
                              {movement.quantity > 0 ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                  Alım
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                                  Satış
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-center">
                              <div className="flex items-center justify-center">
                                {movement.quantity > 0 ? (
                                  <TrendingUp size={16} className="mr-1 text-purple-600" />
                                ) : (
                                  <TrendingDown size={16} className="mr-1 text-orange-600" />
                                )}
                                <span className={movement.quantity > 0 ? 'text-purple-600' : 'text-orange-600'}>
                                  {Math.abs(movement.quantity)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-right font-medium">
                              {movement.balanceAfter}
                            </td>
                            <td className="py-3 text-right">
                              <Link
                                to={`/transactions/${movement.transactionId}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                İşlem Detayı
                              </Link>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Bu ürüne ait stok hareketi bulunmamaktadır.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;