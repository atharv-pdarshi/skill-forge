import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/Header';
import React, { useEffect } from 'react';
import '../styles/globals.css'; 
import { Container } from 'react-bootstrap';

import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    }
  }, []);

  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1 py-4">
          <Component {...pageProps} />
        </main>
        <footer className="text-center py-3 mt-auto" style={{ backgroundColor: 'var(--bg-secondary-dark)', borderTop: '1px solid var(--border-color-dark)'}}>
            <Container>
                <p className="mb-0" style={{color: 'var(--text-secondary-dark)'}}>© {new Date().getFullYear()} SkillForge. All rights reserved.</p>
            </Container>
        </footer>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" 
      />
    </AuthProvider>
  );
}

export default MyApp;