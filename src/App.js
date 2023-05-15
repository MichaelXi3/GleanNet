import { Route, Routes, Link } from 'react-router-dom';
import './App.css';

import { Auth } from './components/auth'
import { UserAvatar } from './components/userAvatar';

import { ResourceDetailPage } from './pages/resourceDetailPage';
import { CreateResourcePage } from './pages/createResourcePage'
import { NotFoundPage } from './pages/notFoundPage';
import { Success } from './pages/submitSucessPage';
import { RegisterSuccess } from './pages/registrationSuccessPage';
import { UserDetail } from './pages/userDetailPage';
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
            <Link to="/upload"> CreateResource </Link>
          </li>
        </ul>
        <UserAvatar />
      </nav>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/user-detail" element={<UserDetail />} />
        <Route path="/upload" element={<CreateResourcePage />} />
        <Route path="/resources/:id" element={<ResourceDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/success" element={<Success />} /> 
        <Route path="/success-register" element={<RegisterSuccess />} /> 
      </Routes>
    </>
  );
}

export default App;
