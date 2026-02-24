import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SkillsHub from './pages/SkillsHub';
import OfferSkill from './pages/OfferSkill';
import RequestHelp from './pages/RequestHelp';
import BookSession from './pages/BookSession';
import MySessions from './pages/MySessions';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

import Navbar from './components/Navbar';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="page-container">
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/skills-hub"
            element={
              <PrivateRoute>
                <Layout>
                  <SkillsHub />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/offer-skill"
            element={
              <PrivateRoute>
                <Layout>
                  <OfferSkill />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/request-help"
            element={
              <PrivateRoute>
                <Layout>
                  <RequestHelp />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/book-session"
            element={
              <PrivateRoute>
                <Layout>
                  <BookSession />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/my-sessions"
            element={
              <PrivateRoute>
                <Layout>
                  <MySessions />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
