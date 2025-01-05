// src/components/Layout.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Admin Panel</h3>
        <ul>
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/add-job">Add Job</Link>
          </li>
          <li>
            <Link to="/list-jobs">List Jobs</Link>
          </li>
          <li>
            <Link to="/add-department">Add Department</Link>
          </li>
          <li>
            <Link to="/list-departments">List Departments</Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">{children}</div>
    </div>
  );
};

export default Layout;
