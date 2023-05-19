import { Route, Routes, Link } from 'react-router-dom';
import './App.css';

import { Auth } from './components/auth'
import { UserAvatar } from './components/userAvatar';

import { ResourceDetailPage } from './pages/resourceDetailPage';
import { CreateResourcePage } from './pages/createResourcePage';
import { UpdateResourcePage } from './pages/updateResourcePage';
import { NotFoundPage } from './pages/notFoundPage';
import { Success } from './pages/submitSucessPage';
import { RegisterSuccess } from './pages/registrationSuccessPage';
import { UserDetail } from './pages/userDetailPage';
import { CategoriesPage } from './pages/categoriesPage';
import { ResourceListByCategory } from './components/resourceListByCategory';
import { MainPage } from './pages/mainPage';

function App() {
  return (
    <>
      <nav className='nav-bar'>
        <ul className='nav-links'>
          <li>
            <Link to="/"> Home </Link>
          </li>
          <li>
            <Link to="/login"> LogIn </Link>
          </li>
          <li>
            <Link to="/categories"> Categories </Link>
          </li>
          <li>
            <Link to="/upload"> CreateResource </Link>
          </li>
        </ul>
        <UserAvatar />
      </nav>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:category" element={<ResourceListByCategory />} />
        <Route path="/user-detail" element={<UserDetail />} />
        <Route path="/upload" element={<CreateResourcePage />} />
        <Route path="/update/:id" element={<UpdateResourcePage />} />
        <Route path="/resources/:id" element={<ResourceDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/success" element={<Success />} /> 
        <Route path="/success-register" element={<RegisterSuccess />} /> 
      </Routes>
    </>
  );
}

export default App;
