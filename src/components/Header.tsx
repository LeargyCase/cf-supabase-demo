import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, admin, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  const navigateToLogin = (path: string) => {
    setShowLoginModal(false);
    navigate(path);
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

      {/* 登录模态框 */}
      {showLoginModal && (
        <div className="login-modal-overlay" onClick={closeLoginModal}>
          <div className="login-modal" onClick={e => e.stopPropagation()}>
            <h3>选择登录方式</h3>
            <div className="login-modal-options">
              <button 
                className="login-modal-option user-login" 
                onClick={() => navigateToLogin('/login/user')}
              >
                用户登录
              </button>
              <button 
                className="login-modal-option admin-login" 
                onClick={() => navigateToLogin('/login/admin')}
              >
                管理员登录
              </button>
            </div>
            <button className="login-modal-close" onClick={closeLoginModal}>
              关闭
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 