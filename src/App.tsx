import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ListingsProvider } from './context/ListingsContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CustomerLayout } from './components/customer/CustomerLayout';
import { HomePage } from './components/customer/HomePage';
import { ListPage } from './components/customer/ListPage';
import { DetailPage } from './components/customer/DetailPage';
import { FavoritesPage } from './components/customer/FavoritesPage';
import { AdminRoot } from './components/admin/AdminRoot';

function App() {
  return (
    <ListingsProvider>
      <FavoritesProvider>
        <HashRouter>
          <Routes>
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/list" element={<ListPage />} />
              <Route path="/house/:id" element={<DetailPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
            </Route>
            <Route path="/admin/*" element={<AdminRoot />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </FavoritesProvider>
    </ListingsProvider>
  );
}

export default App;
