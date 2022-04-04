import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { toast } from 'react-toastify';
import NavBar from './components/Navbar';
import Home from './components/Home';
import ShopDetail from './components/ShopDetail';
import MyShops from './components/MyShops';
import ProductDetail from './components/ProductDetail';
import MyFavourites from './components/MyFavourites';
import UserProfile from './components/UserProfile';
import Cart from './components/Cart';
import MyPurchases from './components/MyPurchases';
import Search from './components/Search';
import Footer from './components/Footer';
import NoSuchPage from './components/NoSuchPage';
import CheckAuth from './components/CheckAuth';

export default function App(props) {
  toast.configure();
  return (
    <BrowserRouter>
      <div className="page-container">
        <div className="content-wrap">
          <NavBar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/home' element={<Home />} />
            <Route element={<CheckAuth />}>
              <Route path='/shop' element={<MyShops />} />
              <Route path='/shop/:shopId' element={<ShopDetail />} />
              <Route path='/product/:productId' element={<ProductDetail />} />
              <Route path='/my-favourites' element={<MyFavourites />} />
              <Route path='/user-profile' element={<UserProfile />} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/orders' element={<MyPurchases />} />
              <Route path='/search' element={<Search />} />
            </Route>
            <Route path='*' element={<NoSuchPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}