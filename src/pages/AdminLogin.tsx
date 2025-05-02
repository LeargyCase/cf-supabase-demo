import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginAdmin, loading, error, clearError, admin } = useAuth();
  const navigate = useNavigate();
  
  // 如果已登录，重定向到管理员面板
  useEffect(() => {
    if (admin) {
      navigate('/admin/dashboard');
    }
  }, [admin, navigate]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // 简单的表单验证
    if (!username.trim() || !password.trim()) {
      return;
    }

    try {
      await loginAdmin(username, password);
      // 登录成功后会通过useEffect自动重定向
    } catch (err) {
      // 错误已在auth context中处理
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h2>管理员登录</h2>
        <p className="login-subtitle">请输入您的管理员账号和密码</p>
        
        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" className="error-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">管理员用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="form-input"
              placeholder="请输入管理员用户名"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="form-input"
                placeholder="请输入密码"
              />
              <button 
                type="button" 
                className="toggle-password-btn"
                onClick={toggleShowPassword}
              >
                {showPassword ? "隐藏" : "显示"}
              </button>
            </div>
          </div>
          
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? '正在登录...' : '登录管理控制台'}
          </button>
        </form>
        
        <div className="login-footer">
          <button 
            onClick={() => navigate('/')} 
            className="back-to-home"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 