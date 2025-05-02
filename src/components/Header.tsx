import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, admin, logout } = useAuth();
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleLoginClick = () => {
    setShowLoginOptions(!showLoginOptions);
  };

  const closeLoginOptions = () => {
    setShowLoginOptions(false);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <h1 className="site-title">
          <Link to="/">校园招聘信息平台</Link>
        </h1>
        
        <div className="header-right">
          {!user && !admin ? (
            <div className="login-container">
              <button onClick={handleLoginClick} className="login-button">
                登录
              </button>
              
              {showLoginOptions && (
                <div className="login-options">
                  <Link to="/login/user" onClick={closeLoginOptions} className="login-option">
                    用户登录
                  </Link>
                  <Link to="/login/admin" onClick={closeLoginOptions} className="login-option">
                    管理员登录
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="user-info">
              {user && (
                <>
                  <span className="welcome-text">欢迎，{user.username}</span>
                  <Link to="/user/dashboard" className="dashboard-link">个人中心</Link>
                </>
              )}
              
              {admin && (
                <>
                  <span className="welcome-text">管理员：{admin.admin_username}</span>
                  <Link to="/admin/dashboard" className="dashboard-link">管理控制台</Link>
                </>
              )}
              
              <button onClick={handleLogout} className="logout-button">
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 