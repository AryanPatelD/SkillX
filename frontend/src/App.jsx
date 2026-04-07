import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SkillsHub from './pages/SkillsHub';
import OfferSkill from './pages/OfferSkill';
import RequestHelp from './pages/RequestHelp';
import MySessions from './pages/MySessions';
import MeetingRoom from './pages/MeetingRoom';
import UserFeedbackPage from './pages/UserFeedbackPage';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const RootRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Navbar />
      {/* spacer so content doesn't go under the fixed sidebar */}
      <style>{`
        .main-content-area {
          margin-left: 240px;
          flex: 1;
          min-width: 0;
          transition: margin-left 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        [data-sidebar="collapsed"] .main-content-area {
          margin-left: 72px;
        }
        @media (max-width: 768px) {
          .main-content-area {
            margin-left: 0 !important;
            padding-top: 64px;
          }
        }
      `}</style>
      <main className="main-content-area">
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
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
            path="/my-sessions"
            element={
              <PrivateRoute>
                <Layout>
                  <MySessions />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/meeting/:meetingId"
            element={
              <PrivateRoute>
                <MeetingRoom />
              </PrivateRoute>
            }
          />
          <Route
            path="/feedback/:userId"
            element={
              <Layout>
                <UserFeedbackPage />
              </Layout>
            }
          />
          <Route path="/" element={<RootRoute />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
