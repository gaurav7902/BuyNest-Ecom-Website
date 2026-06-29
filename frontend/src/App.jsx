import { BrowserRouter as Router } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Disclaimer from './pages/Disclaimer';
import ReturnPolicy from './pages/ReturnPolicy';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import ProductDetail from './pages/ProductDetails';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Failure from './pages/Failure';
import Profile from './pages/Profile';
import AdminDashboard from './admin/AdminDashboard';
import AddProduct from './admin/AddProduct';
import AdminProducts from './admin/AdminProducts';
import EditProduct from './admin/EditProduct';
import AdminOrders from './admin/AdminOrders';
import AdminUsers from './admin/AdminUsers';
import GuestRoute from './components/GuestRoute';
import styles from './App.module.css';

function App() {
  return (
    <Router>
      <div className={styles.appContainer}>
        <Toaster position='top-center' reverseOrder={false} />
        <Navbar />
        <div className={styles.mainContent}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route
              path='/register'
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />
            <Route
              path='/verify-otp'
              element={
                <GuestRoute>
                  <VerifyOTP />
                </GuestRoute>
              }
            />
            <Route
              path='/login'
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route path='/about' element={<About />} />
            <Route path='/shop' element={<Shop />} />
            <Route path='/return' element={<ReturnPolicy />} />
            <Route path='/disclaimer' element={<Disclaimer />} />
            <Route path='/product/:id' element={<ProductDetail />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/checkout/success' element={<Success />} />
            <Route path='/checkout/failure' element={<Failure />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/admin' element={<AdminDashboard />} />
            <Route path='/admin/add-product' element={<AddProduct />} />
            <Route path='/admin/products' element={<AdminProducts />} />
            <Route path='/admin/edit-product/:id' element={<EditProduct />} />
            <Route path='/admin/orders' element={<AdminOrders />} />
            <Route path='/admin/users' element={<AdminUsers />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
