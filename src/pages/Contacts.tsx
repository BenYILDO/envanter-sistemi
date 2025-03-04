import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Plus, Edit, Trash2, Search, Phone, Mail, MapPin } from 'lucide-react';

const Contacts: React.FC = () => {
  const { contacts, addContact, updateContact, deleteContact } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const initialContactState = {
    id: '',
    name: '',
    phone: '',
    email: '',
    address: ''
  };

  const [formData, setFormData] = useState(initialContactState);

  const handleOpenModal = (contact = null) => {
    if (contact) {
      setFormData(contact);
      setCurrentContact(contact);
    } else {
      setFormData(initialContactState);
      setCurrentContact(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialContactState);
    setCurrentContact(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentContact) {
      updateContact({
        ...formData,
        id: currentContact.id
      });
    } else {
      addContact({
        ...formData,
        id: crypto.randomUUID()
      });
    }
    
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu kişiyi silmek istediğinizden emin misiniz?')) {
      deleteContact(id);
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kişiler</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Yeni Kişi
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Kişi ara..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-6 py-3">İsim</th>
                <th className="px-6 py-3">Telefon</th>
                <th className="px-6 py-3">E-posta</th>
                <th className="px-6 py-3">Adres</th>
                <th className="px-6 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length > 0 ? (
                filteredContacts.map(contact => (
                  <tr key={contact.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{contact.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Phone size={16} className="mr-2 text-gray-500" />
                        {contact.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {contact.email && (
                        <div className="flex items-center">
                          <Mail size={16} className="mr-2 text-gray-500" />
                          {contact.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {contact.address && (
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2 text-gray-500" />
                          {contact.address}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(contact)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'Arama kriterlerine uygun kişi bulunamadı.' : 'Henüz kişi bulunmamaktadır.'}
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
              <h2 className="text-xl font-semibold">
                {currentContact ? 'Kişi Düzenle' : 'Yeni Kişi Ekle'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    İsim
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Adres
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  {currentContact ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;