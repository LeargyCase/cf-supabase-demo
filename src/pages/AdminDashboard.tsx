import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

// 定义管理菜单项
const menuItems = [
  { id: 'job-management', title: '招聘信息管理' },
  { id: 'user-management', title: '用户管理' },
  { id: 'activation-code', title: '激活码管理' },
  { id: 'category-management', title: '分类管理' },
  { id: 'tag-management', title: '标签管理' },
  { id: 'statistics', title: '统计报表' },
];

const AdminDashboard = () => {
  const { admin, supabase } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('job-management');
  const [statistics, setStatistics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalActivationCodes: 0,
    usedActivationCodes: 0,
  });
  const [loading, setLoading] = useState(true);

  // 检查是否已登录为管理员
  useEffect(() => {
    if (!admin) {
      navigate('/login/admin');
    } else {
      loadStatistics();
    }
  }, [admin, navigate]);

  // 加载统计数据
  const loadStatistics = async () => {
    setLoading(true);
    try {
      // 获取招聘信息统计
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_recruitments')
        .select('id, is_active', { count: 'exact' });

      if (jobsError) throw jobsError;

      const activeJobs = jobsData?.filter(job => job.is_active).length || 0;
      
      // 获取用户统计
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, is_active', { count: 'exact' });

      if (usersError) throw usersError;

      const activeUsers = usersData?.filter(user => user.is_active).length || 0;
      
      // 获取激活码统计
      const { data: codesData, error: codesError } = await supabase
        .from('activation_codes')
        .select('id, is_used', { count: 'exact' });

      if (codesError) throw codesError;

      const usedCodes = codesData?.filter(code => code.is_used).length || 0;
      
      setStatistics({
        totalJobs: jobsData?.length || 0,
        activeJobs,
        totalUsers: usersData?.length || 0,
        activeUsers,
        totalActivationCodes: codesData?.length || 0,
        usedActivationCodes: usedCodes,
      });
    } catch (error) {
      console.error('加载统计数据出错:', error);
    } finally {
      setLoading(false);
    }
  };

  // 根据选中的菜单项渲染不同的内容
  const renderContent = () => {
    // 这里根据activeMenu渲染不同的管理内容
    // 实际项目中可能需要拆分为多个组件来处理不同的管理功能
    switch (activeMenu) {
      case 'job-management':
        return (
          <div className="dashboard-content-section">
            <h3>招聘信息管理</h3>
            <p>这里可以管理所有的招聘信息。可以添加、编辑、删除招聘信息。</p>
            <div className="action-buttons">
              <button className="action-button add-button">添加新招聘信息</button>
              <button className="action-button view-button">查看所有招聘信息</button>
            </div>
          </div>
        );
      
      case 'user-management':
        return (
          <div className="dashboard-content-section">
            <h3>用户管理</h3>
            <p>这里可以管理所有的注册用户。可以添加、编辑、删除用户信息。</p>
            <div className="action-buttons">
              <button className="action-button view-button">查看所有用户</button>
            </div>
          </div>
        );
      
      case 'activation-code':
        return (
          <div className="dashboard-content-section">
            <h3>激活码管理</h3>
            <p>这里可以生成和管理激活码。</p>
            <div className="action-buttons">
              <button className="action-button add-button">生成新激活码</button>
              <button className="action-button view-button">查看所有激活码</button>
            </div>
          </div>
        );
      
      case 'category-management':
        return (
          <div className="dashboard-content-section">
            <h3>分类管理</h3>
            <p>这里可以管理职位分类。</p>
            <div className="action-buttons">
              <button className="action-button view-button">查看所有分类</button>
            </div>
          </div>
        );
      
      case 'tag-management':
        return (
          <div className="dashboard-content-section">
            <h3>标签管理</h3>
            <p>这里可以管理职位标签。</p>
            <div className="action-buttons">
              <button className="action-button add-button">添加新标签</button>
              <button className="action-button view-button">查看所有标签</button>
            </div>
          </div>
        );
      
      case 'statistics':
        return (
          <div className="dashboard-content-section">
            <h3>统计报表</h3>
            <p>这里展示系统的各种统计数据。</p>
            <div className="statistics-grid">
              <div className="stat-card">
                <h4>招聘信息</h4>
                <div className="stat-numbers">
                  <div className="stat-item">
                    <span className="stat-label">总数:</span>
                    <span className="stat-value">{statistics.totalJobs}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">有效:</span>
                    <span className="stat-value">{statistics.activeJobs}</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <h4>用户</h4>
                <div className="stat-numbers">
                  <div className="stat-item">
                    <span className="stat-label">总数:</span>
                    <span className="stat-value">{statistics.totalUsers}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">活跃:</span>
                    <span className="stat-value">{statistics.activeUsers}</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <h4>激活码</h4>
                <div className="stat-numbers">
                  <div className="stat-item">
                    <span className="stat-label">总数:</span>
                    <span className="stat-value">{statistics.totalActivationCodes}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">已使用:</span>
                    <span className="stat-value">{statistics.usedActivationCodes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>请从左侧选择一个管理选项</div>;
    }
  };

  if (!admin) {
    return <div className="loading-container">正在检查登录状态...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-sidebar">
        <div className="admin-info">
          <h3>管理控制台</h3>
          <p className="admin-name">{admin.admin_username}</p>
          <p className="admin-role">{admin.admin_permissions}</p>
        </div>
        
        <nav className="dashboard-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id} className={activeMenu === item.id ? 'active' : ''}>
                <button onClick={() => setActiveMenu(item.id)}>
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>{menuItems.find(item => item.id === activeMenu)?.title}</h2>
          <button onClick={loadStatistics} className="refresh-button" disabled={loading}>
            {loading ? '加载中...' : '刷新数据'}
          </button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <p>加载数据中...</p>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 