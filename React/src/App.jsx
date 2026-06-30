import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import HomePage    from './pages/homepage.jsx'
import AngolaPage  from './pages/AngolaPage.jsx'
import UKPage      from './pages/UKPage.jsx'
import LoginPage   from './pages/auth/LoginPage.jsx'
import JoinPage    from './pages/auth/JoinPage.jsx'
import AdminPage   from './pages/auth/AdminDashboard.jsx'
import AccountPage from './pages/AccountPage.jsx'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx'
import ResetPasswordPage  from './pages/auth/ResetPasswordPage.jsx'
import UnsubscribePage    from './pages/UnsubscribePage.jsx'
import ArtistsPage  from './pages/country/ArtistsPage.jsx'
import EventsPage   from './pages/country/EventsPage.jsx'
import ShopPage     from './pages/country/ShopPage.jsx'
import ServicesPage from './pages/country/ServicesPage.jsx'
import CountryGate  from './pages/CountryGate.jsx'
import ArtistDetailPage  from './pages/detail/ArtistDetailPage.jsx'
import EventDetailPage   from './pages/detail/EventDetailPage.jsx'
import ProductDetailPage from './pages/detail/ProductDetailPage.jsx'
import ServiceDetailPage from './pages/detail/ServiceDetailPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"      element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/join"  element={<JoinPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/unsubscribe/:token" element={<UnsubscribePage />} />

            <Route path="/angola" element={<AngolaPage />} />
            <Route path="/uk"     element={<UKPage />} />

            <Route path="/artists"  element={<CountryGate />} />
            <Route path="/events"   element={<CountryGate />} />
            <Route path="/shop"     element={<CountryGate />} />
            <Route path="/services" element={<CountryGate />} />

            <Route path="/:country/artists"  element={<ArtistsPage />} />
            <Route path="/:country/events"   element={<EventsPage />} />
            <Route path="/:country/shop"     element={<ShopPage />} />
            <Route path="/:country/services" element={<ServicesPage />} />

            <Route path="/:country/artists/:id"  element={<ArtistDetailPage />} />
            <Route path="/:country/events/:id"   element={<EventDetailPage />} />
            <Route path="/:country/shop/:id"     element={<ProductDetailPage />} />
            <Route path="/:country/services/:id" element={<ServiceDetailPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}