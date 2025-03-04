import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Stock from './pages/Stock';
import Contacts from './pages/Contacts';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import TransactionDetail from './pages/TransactionDetail';
import ContactDetail from './pages/ContactDetail';
import ProductDetail from './pages/ProductDetail';
import Capital from './pages/Capital';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="stock" element={<Stock />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="contacts/:id" element={<ContactDetail />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="transactions/:id" element={<TransactionDetail />} />
            <Route path="capital" element={<Capital />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;