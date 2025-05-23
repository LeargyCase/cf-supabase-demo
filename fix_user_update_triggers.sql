-- 检查是否存在自动更新updated_at的触发器
SELECT tgname AS trigger_name,
       relname AS table_name,
       pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE relname = 'users';

-- 修改触发器函数，避免递归
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 只有当updated_at没有被手动设置时才自动更新它
  IF NEW.updated_at IS NULL OR NEW.updated_at = OLD.updated_at THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- 创建一个直接更新用户信息的函数，避免触发器问题
CREATE OR REPLACE FUNCTION direct_update_user(
  p_user_id INT,
  p_username VARCHAR,
  p_icon INT
)
RETURNS VOID AS $$
BEGIN
  -- 直接执行SQL更新，避免触发器问题
  UPDATE users
  SET
    username = p_username,
    icon = p_icon,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 创建一个直接更新用户密码的函数
CREATE OR REPLACE FUNCTION direct_update_user_password(
  p_user_id INT,
  p_password VARCHAR
)
RETURNS VOID AS $$
BEGIN
  -- 直接执行SQL更新，避免触发器问题
  UPDATE users
  SET
    password = p_password,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
