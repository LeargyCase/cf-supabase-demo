-- 检查管理员表是否存在，如果不存在则创建
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  admin_username VARCHAR(100) NOT NULL UNIQUE,
  admin_password VARCHAR(255) NOT NULL,
  admin_permissions VARCHAR(100) NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 检查是否已存在默认管理员，如果不存在则创建
INSERT INTO admins (admin_username, admin_password, admin_permissions)
SELECT 'admin', 'admin123', 'super_admin'
WHERE NOT EXISTS (
  SELECT 1 FROM admins WHERE admin_username = 'admin'
);

-- 输出成功信息
DO $$
BEGIN
  RAISE NOTICE '管理员表初始化完成，默认管理员账号: admin, 密码: admin123';
END $$; 