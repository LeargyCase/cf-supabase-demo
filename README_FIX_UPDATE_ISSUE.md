# 修复用户更新问题

## 问题描述

在更新账户内容时出现两个错误：
1. `UPDATE requires a WHERE clause` - 表示在执行UPDATE语句时缺少WHERE子句
2. `stack depth limit exceeded` - 表示触发器递归调用导致堆栈溢出

## 原因分析

1. 数据库中存在一个名为`update_updated_at_column`的触发器函数，它会自动更新表的`updated_at`字段。
2. 前端代码在更新用户信息时，同时手动设置了`updated_at`字段。
3. 这导致了触发器和手动更新之间的冲突，可能引发递归调用。

## 解决方案

### 1. 修改触发器函数

创建了一个SQL脚本`fix_user_update_triggers.sql`，修改触发器函数，避免递归调用：

```sql
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
```

### 2. 创建直接更新用户信息的函数

创建了两个存储过程，用于安全地更新用户信息，避免触发器问题：

```sql
-- 创建一个直接更新用户信息的函数
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
```

### 3. 修改前端代码

修改了`UserDashboard.tsx`中的用户更新代码，使用新的存储过程：

```javascript
// 使用存储过程更新用户名和头像，避免触发器问题
const { data, error } = await supabase.rpc(
  'direct_update_user',
  {
    p_user_id: user.id,
    p_username: usernameInput,
    p_icon: selectedIcon
  }
);

// 使用存储过程更新密码，避免触发器问题
const { data: updateData, error: updateError } = await supabase.rpc(
  'direct_update_user_password',
  {
    p_user_id: user.id,
    p_password: newPassword
  }
);
```

## 应用修复

1. 执行SQL脚本`fix_user_update_triggers.sql`
2. 重新部署前端代码

## 注意事项

- 这些修改不会影响现有数据
- 修复后，用户更新操作应该不再出现错误
- 如果仍然出现问题，可能需要检查其他触发器或约束
