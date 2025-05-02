import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const UserLogin = () => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, loading, error, clearError, user } = useAuth();
  const navigate = useNavigate();
  
  // 如果已登录，重定向到用户中心
  useEffect(() => {
    if (user) {
      navigate('/user/dashboard');
    }
  }, [user, navigate]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // 简单的表单验证
    if (!account.trim() || !password.trim()) {
      return;
    }

    try {
      await loginUser(account, password);
      // 登录成功后会通过useEffect自动重定向
    } catch (err) {
      // 错误已在auth context中处理
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h2>用户登录</h2>
        <p className="login-subtitle">请输入您的账号和密码</p>
        
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
            <label htmlFor="account">账号</label>
            <input
              type="text"
              id="account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              required
              disabled={loading}
              className="form-input"
              placeholder="请输入您的账号"
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
            {loading ? '正在登录...' : '登录个人中心'}
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

export default UserLogin; 