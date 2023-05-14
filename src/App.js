import { Route, Routes, Link } from 'react-router-dom';
import './App.css';

import { Auth } from './components/auth'
import { CreateResource } from './components/createResource';

import { ResourceDetailPage } from './pages/resourceDetailPage';
import { CreateResourcePage } from './pages/createResourcePage'
import { NotFoundPage } from './pages/notFoundPage';
import { Success } from './pages/submitSucessPage';
import { MainPage } from './pages/mainPage';

function App() {
  return (
    <>
      <nav>
        <ul>
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
      </nav>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/upload" element={<CreateResourcePage />} />
        <Route path="/resources/:id" element={<ResourceDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/success" element={<Success />} /> 
      </Routes>
    </>
  );
}

export default App;
