import { Route, Routes, Link } from 'react-router-dom';
import './App.css';

import { Auth } from './components/auth'
import { UserAvatar } from './components/userAvatar';
import { Layout } from './routes/Layout'
import { RequireAuth } from './routes/RequireAuth';

import { ResourceDetailPage } from './pages/resourceDetailPage';
import { CreateResourcePage } from './pages/createResourcePage';
import { UpdateResourcePage } from './pages/updateResourcePage';
import { NotFoundPage } from './pages/notFoundPage';
import { Success } from './pages/submitSucessPage';
import { RegisterSuccess } from './pages/registrationSuccessPage';
import { UserDetail } from './pages/userDetailPage';
import { CategoriesPage } from './pages/categoriesPage';
import { ResourceListByCategory } from './components/resourceListByCategory';
import { AdminPage } from './admin/adminPage';
import { ResourceReviewPageAdmin } from './admin/resourceReviewPageAdmin';
import { ResourceUpdateReviewPageAdmin } from './admin/resourceUpdateReviewPageAdmin';
import { SetAdmin } from './admin/setAdminPage';
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
        <Route path="/" element={<Layout />}>
          {/* public routes */}
          <Route path="/" element={<MainPage />} />
          <Route path="login" element={<Auth />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/:category" element={<ResourceListByCategory />} />
          <Route path="resources/:id" element={<ResourceDetailPage />} />

          {/* admin routes */}
          <Route element={<RequireAuth allowedRoles={['Admin']} />}>
            <Route path="admin" element={<AdminPage />} />
            <Route path="admin-set" element={<SetAdmin />} />
            <Route path="admin/resource-review/:id" element={<ResourceReviewPageAdmin />} />
            <Route path="admin/resource-update-review/:id" element={<ResourceUpdateReviewPageAdmin />} />
          </Route>

          {/* user routes */}
          <Route element={<RequireAuth allowedRoles={['User', 'Admin']}/>}>
            <Route path="user-detail" element={<UserDetail />} />
            <Route path="upload" element={<CreateResourcePage />} />
            <Route path="update/:id" element={<UpdateResourcePage />} />
            <Route path="success" element={<Success />} /> 
            <Route path="success-register" element={<RegisterSuccess />} /> 
          </Route>

          {/* catch all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
