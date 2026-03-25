// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import AddJob from './pages/AddJob';
import ListJobs from './pages/ListJobs';
import AddDepartment from './pages/AddDepartment';
import ListDepartments from './pages/ListDepartments';
import Layout from './components/Layout';
import UpdateJob from './pages/UpdateJob';
import AddArticle from './pages/AdminArticleForm';
import EditNews from './pages/EditNews';
import AddNews from './pages/AdminArticleForm';
import NewsList from './pages/ListNews';
import AdmissionOpen from './pages/AdmissionOpen';
import EventBanner from './pages/EventBanner';
import StudentsImg from './pages/StudentsImg';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Update authentication state on login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Clear authentication state on logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Redirect to home if authenticated; otherwise, show Login */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />
          }
        />

        {/* Protected Routes with Layout */}
        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Home />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/add-job"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <AddJob />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/list-jobs"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <ListJobs />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/add-department"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <AddDepartment />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/list-departments"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <ListDepartments />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/update-job/:id"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <UpdateJob />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

<Route
          path="/add-artical"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <AddArticle />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

<Route
        path="/news"
        element={
            <Layout>
              <NewsList />
            </Layout>
        }
      />

      {/* Add News Page */}
      <Route
        path="/news/add"
        element={
            <Layout>
              <AddNews />
            </Layout>
        }
      />

      {/* Edit News Page */}
      <Route
        path="/news/edit/:id"
        element={
            <Layout>
              <EditNews />
            </Layout>
        }
      />

      {/* New Pages */}
      <Route
        path="/admission-open"
        element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <AdmissionOpen />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
        }
      />
      <Route
        path="/event-banner"
        element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <EventBanner />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
        }
      />
      <Route
        path="/students-img"
        element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <StudentsImg />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
        }
      />
      </Routes>
    </Router>
  );
}

export default App;




