import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserDashboard.css';

// 定义用户菜单项
const menuItems = [
  { id: 'my-favorites', title: '我的收藏' },
  { id: 'my-applications', title: '我的投递' },
  { id: 'membership', title: '会员信息' },
  { id: 'settings', title: '账户设置' }
];

const UserDashboard = () => {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('my-favorites');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 检查是否已登录
  useEffect(() => {
    if (!user) {
      navigate('/login/user');
    } else {
      loadUserData();
    }
  }, [user, navigate]);

  // 加载用户数据
  const loadUserData = async () => {
    setLoading(true);
    try {
      // 加载用户详细信息
      const { data: userInfoData, error: userInfoError } = await supabase
        .from('user_info')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (userInfoError) throw userInfoError;
      
      setUserInfo(userInfoData);
      
      // 加载用户收藏的招聘信息
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('user_actions')
        .select(`
          id,
          job_id,
          created_at,
          job_recruitments(id, job_title, company, job_position, deadline)
        `)
        .eq('user_id', user?.id)
        .eq('action_type', '收藏')
        .order('created_at', { ascending: false });

      if (favoritesError) throw favoritesError;
      
      setFavorites(favoritesData || []);
      
      // 加载用户投递的招聘信息
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('user_actions')
        .select(`
          id,
          job_id,
          created_at,
          job_recruitments(id, job_title, company, job_position, deadline)
        `)
        .eq('user_id', user?.id)
        .eq('action_type', '投递')
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;
      
      setApplications(applicationsData || []);
      
    } catch (error) {
      console.error('加载用户数据出错:', error);
    } finally {
      setLoading(false);
    }
  };

  // 根据选中的菜单项渲染不同的内容
  const renderContent = () => {
    switch (activeMenu) {
      case 'my-favorites':
        return (
          <div className="dashboard-content-section">
            <h3>我的收藏</h3>
            {favorites.length === 0 ? (
              <p className="empty-message">暂无收藏的招聘信息</p>
            ) : (
              <div className="job-list">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="job-item">
                    <h4>{favorite.job_recruitments.job_title}</h4>
                    <div className="job-details">
                      <span>{favorite.job_recruitments.company}</span>
                      <span>{favorite.job_recruitments.job_position}</span>
                    </div>
                    <div className="job-actions">
                      <span className="job-date">收藏于: {new Date(favorite.created_at).toLocaleDateString()}</span>
                      <button className="view-detail-btn">查看详情</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'my-applications':
        return (
          <div className="dashboard-content-section">
            <h3>我的投递</h3>
            {applications.length === 0 ? (
              <p className="empty-message">暂无投递的招聘信息</p>
            ) : (
              <div className="job-list">
                {applications.map((application) => (
                  <div key={application.id} className="job-item">
                    <h4>{application.job_recruitments.job_title}</h4>
                    <div className="job-details">
                      <span>{application.job_recruitments.company}</span>
                      <span>{application.job_recruitments.job_position}</span>
                    </div>
                    <div className="job-actions">
                      <span className="job-date">投递于: {new Date(application.created_at).toLocaleDateString()}</span>
                      <button className="view-detail-btn">查看详情</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'membership':
        return (
          <div className="dashboard-content-section">
            <h3>会员信息</h3>
            {userInfo ? (
              <div className="membership-info">
                <div className="info-item">
                  <span className="info-label">会员类型:</span>
                  <span className="info-value">{userInfo.membership_type || '普通用户'}</span>
                </div>
                
                {userInfo.membership_type !== '普通用户' && (
                  <>
                    <div className="info-item">
                      <span className="info-label">会员开始日期:</span>
                      <span className="info-value">
                        {userInfo.membership_start_date ? new Date(userInfo.membership_start_date).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">会员结束日期:</span>
                      <span className="info-value">
                        {userInfo.membership_end_date ? new Date(userInfo.membership_end_date).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">剩余天数:</span>
                      <span className="info-value">{userInfo.membership_remaining_days || 0} 天</span>
                    </div>
                  </>
                )}
                
                <div className="activate-section">
                  <h4>激活会员</h4>
                  <p>输入激活码即可开通或延长会员期限</p>
                  <div className="activation-form">
                    <input type="text" placeholder="请输入激活码" />
                    <button className="activate-btn">激活</button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="empty-message">会员信息加载失败</p>
            )}
          </div>
        );
      
      case 'settings':
        return (
          <div className="dashboard-content-section">
            <h3>账户设置</h3>
            <div className="settings-form">
              <div className="form-group">
                <label htmlFor="username">用户名</label>
                <input type="text" id="username" defaultValue={user?.username} />
              </div>
              
              <div className="form-group">
                <label htmlFor="current-password">当前密码</label>
                <input type="password" id="current-password" />
              </div>
              
              <div className="form-group">
                <label htmlFor="new-password">新密码</label>
                <input type="password" id="new-password" />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm-password">确认新密码</label>
                <input type="password" id="confirm-password" />
              </div>
              
              <button className="save-settings-btn">保存更改</button>
            </div>
          </div>
        );
      
      default:
        return <div>请从左侧选择一个选项</div>;
    }
  };

  if (!user) {
    return <div className="loading-container">正在检查登录状态...</div>;
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-sidebar">
        <div className="user-info">
          <h3>个人中心</h3>
          <p className="user-name">{user.username}</p>
          <p className="user-type">{userInfo?.membership_type || '普通用户'}</p>
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
          <button onClick={loadUserData} className="refresh-button" disabled={loading}>
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

export default UserDashboard; 