import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import Home from './pages/Home';
import Post from './pages/Post';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import AllPosts from './pages/admin/AllPosts';
import CommentModeration from './pages/admin/CommentModeration';
import SubscriberManagement from './pages/admin/SubscriberManagement';
import Category from './pages/Category';
import WriteForUs from './pages/WriteForUs';
import PostEditor from './pages/admin/PostEditor';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/global.css';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="App">
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 80px)' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/post/:slug" element={<Post />} />
                <Route path="/category/:category" element={<Category />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/write-for-us" element={<WriteForUs />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/posts" element={
                  <ProtectedRoute>
                    <AllPosts />
                  </ProtectedRoute>
                } />
                <Route path="/admin/posts/new" element={
                  <ProtectedRoute>
                    <PostEditor />
                  </ProtectedRoute>
                } />
                <Route path="/admin/posts/edit/:id" element={
                  <ProtectedRoute>
                    <PostEditor />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/comments" element={
                  <ProtectedRoute>
                    <CommentModeration />
                  </ProtectedRoute>
                } />
                <Route path="/admin/subscribers" element={
                  <ProtectedRoute>
                    <SubscriberManagement />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
            <BackToTop />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
