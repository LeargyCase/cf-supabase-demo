数据库设计说明

---

# 校园信息招聘网站数据库设计与说明文档

## 1. 系统概述

本系统旨在提供校园信息招聘服务，支持用户注册、职位浏览、职位申请和收藏等功能，管理员可以管理职位信息、用户信息、激活码等数据。数据存储使用 Supabase 作为数据库，前端托管在 Cloudflare Pages。

## 2. 数据库表设计

### 2.1 系统数据表 (system\_data)

**描述：** 该表记录系统的版本和最后更新的时间，便于后期系统维护和版本控制。

| 字段名              | 类型          | 描述       |
| ---------------- | ----------- | -------- |
| id               | SERIAL      | 唯一标识     |
| current\_version | VARCHAR(50) | 系统当前版本   |
| last\_update     | TIMESTAMP   | 系统最后更新时间 |

### 2.2 管理员表 (admins)

**描述：** 该表记录管理员账号信息，用于后台管理系统的用户认证和权限管理。

| 字段名                | 类型           | 描述                  |
| ------------------ | ------------ | ------------------- |
| id                 | SERIAL       | 唯一标识                |
| admin\_username    | VARCHAR(100) | 管理员用户名              |
| admin\_password    | VARCHAR(255) | 管理员密码               |
| admin\_permissions | VARCHAR(100) | 管理员权限（例如：管理员、超级管理员） |
| is\_active         | BOOLEAN      | 是否有效（用于逻辑删除，默认为有效）  |
| created\_at        | TIMESTAMP    | 创建时间                |
| updated\_at        | TIMESTAMP    | 更新时间                |

### 2.3 用户表 (users)

**描述：** 该表记录注册用户的信息，包括用户名、账号、密码等基本信息。

| 字段名         | 类型           | 描述                 |
| ----------- | ------------ | ------------------ |
| id          | SERIAL       | 唯一标识               |
| username    | VARCHAR(100) | 用户名                |
| account     | VARCHAR(100) | 用户账号               |
| password    | VARCHAR(255) | 用户密码               |
| is\_active  | BOOLEAN      | 是否有效（用于逻辑删除，默认为有效） |
| created\_at | TIMESTAMP    | 创建时间               |
| updated\_at | TIMESTAMP    | 更新时间               |

### 2.4 用户信息表 (user\_info)

**描述：** 该表记录用户的详细信息，包括会员类型、激活码等信息。

| 字段名                         | 类型           | 描述                     |
| --------------------------- | ------------ | ---------------------- |
| id                          | SERIAL       | 唯一标识                   |
| user\_id                    | INT          | 用户ID，关联 `users` 表的 id  |
| membership\_type            | VARCHAR(50)  | 会员类型（如：普通用户、试用会员、正式会员） |
| membership\_code            | VARCHAR(100) | 绑定的会员激活码               |
| membership\_start\_date     | TIMESTAMP    | 会员开始日期                 |
| membership\_end\_date       | TIMESTAMP    | 会员结束日期                 |
| membership\_remaining\_days | INT          | 会员剩余天数                 |
| is\_active                  | BOOLEAN      | 是否有效（用于逻辑删除，默认为有效）     |
| created\_at                 | TIMESTAMP    | 创建时间                   |
| updated\_at                 | TIMESTAMP    | 更新时间                   |

### 2.5 用户行为表 (user\_actions)

**描述：** 该表记录用户的行为，如收藏的招聘信息和投递的招聘信息。

| 字段名          | 类型          | 描述                                 |
| ------------ | ----------- | ---------------------------------- |
| id           | SERIAL      | 唯一标识                               |
| user\_id     | INT         | 用户ID，关联 `users` 表的 id              |
| job\_id      | INT         | 招聘信息ID，关联 `job_recruitments` 表的 id |
| action\_type | VARCHAR(50) | 用户行为类型（如：投递、收藏）                    |
| created\_at  | TIMESTAMP   | 行为发生时间                             |

### 2.6 激活码表 (activation\_codes)

**描述：** 该表用于存储系统生成的激活码，验证用户的激活状态。

| 字段名            | 类型           | 描述                       |
| -------------- | ------------ | ------------------------ |
| id             | SERIAL       | 唯一标识                     |
| code           | VARCHAR(100) | 激活码                      |
| is\_active     | BOOLEAN      | 是否有效（用于控制激活码是否有效）        |
| is\_used       | BOOLEAN      | 是否被启用（用于控制当前激活码是否已经被用户占用）        |
| validity\_days | INT          | 激活码有效期（单位：天）             |
| user\_id       | INT          | 绑定的用户ID，关联 `users` 表的 id |
| created\_at    | TIMESTAMP    | 激活码创建时间                  |

### 2.7 招聘信息表 (job\_recruitments)

**描述：** 该表记录招聘信息的详细内容，包括职位名称、公司、发布时间等。

| 字段名                         | 类型           | 描述                |
| --------------------------- | ------------ | ----------------- |
| id                          | SERIAL       | 唯一标识              |
| job\_title                  | text         | 招聘信息标题            |
| company                     | text         | 招聘公司              |
| description                 | text         | 对招聘公司的描述       |
| category_id                 | CATCHAR(50)    | 对应18个分类id中的一个或者多个，用空格隔开  |
| post\_time                  | TIMESTAMP    | 发布时间              |
| last\_update                | TIMESTAMP    | 最后更新时间           |
| deadline                    | TIMESTAMP    | 截止投递时间           |
| job\_location               | text         | 工作地点              |
| job\_position               | text         | 招聘岗位              |
| job\_major                  | text         | 招聘专业              |
| job\_graduation\_year       | text         | 招聘对象（如：24届、25届）   |
| job\_education\_requirement | text         | 招聘学历要求（如：本科、研究生）  |
| application\_link           | VARCHAR(255) | 投递链接              |
| views\_count                | INT          | 浏览人数              |
| favorites\_count            | INT          | 收藏人数              |
| applications\_count         | INT          | 投递人数              |
| is\_active                  | BOOLEAN      | 是否有效（用于记录该条目是否过期） |
| created\_at                 | TIMESTAMP    | 创建时间              |
| updated\_at                 | TIMESTAMP    | 更新时间              |

### 2.8 分类表 (job\_categories)

**描述：** 该表用于存储招聘信息的分类，并记录每个分类下的有效招聘信息数量。

| 字段名                | 类型          | 描述                 |
| ------------------ | ----------- | ------------------ |
| id                 | SERIAL      | 唯一标识               |
| category           | text        | 分类名称（如：国企、外企等）     |
| category_number    | int         | 用于对外标识索引该分类（该值与id字段的值相同，也可以用id索引|
| active\_job\_count | INT         | 当前分类下的有效招聘信息数量     |
| is\_active         | BOOLEAN     | 是否有效（用于逻辑删除，默认为有效） |
其中，该表为固定表，具体信息如下，分类为枚举字段
id	category	category_number	active_job_count	is_active
1	国企	1	0	TRUE
2	外企	2	0	TRUE
3	事业单位	3	0	TRUE
4	银行/金融	4	0	TRUE
5	互联网	5	0	TRUE
6	制造业	6	0	TRUE
7	游戏	7	0	TRUE
8	快消/品牌	8	0	TRUE
9	生物医药	9	0	TRUE
10	汽车/新能源	10	0	TRUE
11	科技	11	0	TRUE
12	美妆	12	0	TRUE
13	传媒	13	0	TRUE
14	一线大厂	14	0	TRUE
15	小而美	15	0	TRUE
16	教育	16	0	TRUE
17	地产/建筑	17	0	TRUE
18	其他	18	0	TRUE


### 2.9 招聘信息与分类的多对多关系表 (job\_recruitment\_categories)

**描述：** 该表用于建立招聘信息和分类之间的多对多关系。

| 字段名          | 类型  | 描述                                 |
| ------------ | --- | ---------------------------------- |
| job\_id      | INT | 招聘信息ID，关联 `job_recruitments` 表的 id |
| category\_id | INT | 分类ID，关联 `job_categories` 表的 id     |

### 2.10 标签表 (tags)

**描述：** 该表用于存储各种标签，包括时间相关标签如"24h更新"、"即将截止"等。

| 字段名       | 类型           | 描述                      |
| --------- | ------------ | ----------------------- |
| id        | SERIAL       | 唯一标识                    |
| tag_name  | VARCHAR(100) | 标签名称                    |
| tag_type  | VARCHAR(50)  | 标签类型（如：time_sensitive） |
| is_active | BOOLEAN      | 是否有效                    |
| created_at | TIMESTAMP   | 创建时间                    |

### 2.11 招聘信息标签关联表 (job\_tags)

**描述：** 该表用于建立招聘信息和标签之间的多对多关系。

| 字段名    | 类型  | 描述                             |
| ------ | --- | ------------------------------ |
| job_id | INT | 招聘信息ID，关联 `job_recruitments` 表 |
| tag_id | INT | 标签ID，关联 `tags` 表              |

### 2.12 统计报表表 (statistics)

**描述：** 该表用于存储系统的统计数据，便于生成报表和分析系统使用情况。

| 字段名                | 类型        | 描述        |
| ------------------ | --------- | --------- |
| id                 | SERIAL    | 唯一标识      |
| stat_date          | DATE      | 统计日期      |
| total_users        | INT       | 总用户数      |
| active_users       | INT       | 活跃用户数     |
| total_jobs         | INT       | 总招聘信息数    |
| active_jobs        | INT       | 有效招聘信息数   |
| total_applications | INT       | 总申请数      |
| total_favorites    | INT       | 总收藏数      |
| created_at         | TIMESTAMP | 创建时间      |

## 3. 数据库函数与触发器

### 3.1 更新招聘信息时自动更新分类表的有效条目数量

在每次新增或更新招聘信息时，系统会自动更新对应分类的有效招聘信息数量。

```sql
CREATE OR REPLACE FUNCTION update_job_category_count() 
RETURNS TRIGGER AS $$
BEGIN
    -- 更新对应分类的有效招聘信息条目数量
    UPDATE job_categories 
    SET active_job_count = (
        SELECT COUNT(*)
        FROM job_recruitment_categories jrc
        WHERE jrc.category_id = NEW.category_id AND jrc.job_id IN (SELECT id FROM job_recruitments WHERE is_active = TRUE AND deadline >= CURRENT_DATE)
    )
    WHERE id = NEW.category_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_category_count
AFTER INSERT OR UPDATE ON job_recruitments
FOR EACH ROW EXECUTE FUNCTION update_job_category_count();
```

### 3.2 创建激活码的函数

该函数用于生成一个新的激活码。

```sql
DO $$ 
DECLARE
    i INT;
    num_codes INT := 30;  -- 生成 30 个激活码
    validity_days INT := 30;  -- 每个激活码的有效期为 30 天
BEGIN
    FOR i IN 1..num_codes LOOP
        -- 调用 create_activation_code 函数批量生成激活码
        PERFORM create_activation_code(validity_days);
    END LOOP;
END $$;

SELECT * FROM activation_codes;
```

### 3.3 会员过期检查函数

该函数用于自动检查会员的过期状态，并更新会员的剩余天数和激活状态。

```sql
CREATE OR REPLACE FUNCTION check_membership_expiration()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_info
    SET membership_remaining_days = 
        CASE 
            WHEN membership_end_date IS NOT NULL THEN 
                GREATEST(0, EXTRACT(DAY FROM (membership_end_date - CURRENT_DATE)))
            ELSE 0
        END,
        is_active = CASE WHEN membership_end_date >= CURRENT_DATE THEN TRUE ELSE FALSE END
    WHERE membership_end_date IS NOT NULL;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER daily_membership_check
AFTER INSERT OR UPDATE ON user_info
FOR EACH ROW
EXECUTE FUNCTION check_membership_expiration();
```

### 3.4 招聘信息过期检查函数

该函数用于自动检查招聘信息的过期状态，并更新其激活状态。

```sql
CREATE OR REPLACE FUNCTION check_job_expiration()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE job_recruitments
    SET is_active = FALSE
    WHERE deadline < CURRENT_DATE AND is_active = TRUE;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER daily_job_check
AFTER INSERT OR UPDATE ON job_recruitments
FOR EACH ROW
EXECUTE FUNCTION check_job_expiration();
```

### 3.5 自动更新招聘信息时间标签的函数

该函数用于根据招聘信息的更新时间和截止时间自动生成时间相关的标签，如"24h更新"、"即将截止"等。

```sql
CREATE OR REPLACE FUNCTION update_job_time_tags()
RETURNS TRIGGER AS $$
DECLARE
    tag_id_24h INT;
    tag_id_yesterday INT;
    tag_id_3days INT;
    tag_id_7days INT;
    tag_id_deadline INT;
    current_date_val DATE := CURRENT_DATE;
    last_update_date DATE;
    deadline_date DATE;
    days_diff INT;
    days_to_deadline INT;
BEGIN
    -- 获取标签ID
    SELECT id INTO tag_id_24h FROM tags WHERE tag_name = '24h更新' AND tag_type = 'time_sensitive';
    SELECT id INTO tag_id_yesterday FROM tags WHERE tag_name = '昨天更新' AND tag_type = 'time_sensitive';
    SELECT id INTO tag_id_3days FROM tags WHERE tag_name = '3日内更新' AND tag_type = 'time_sensitive';
    SELECT id INTO tag_id_7days FROM tags WHERE tag_name = '7日内更新' AND tag_type = 'time_sensitive';
    SELECT id INTO tag_id_deadline FROM tags WHERE tag_name = '即将截止' AND tag_type = 'time_sensitive';
    
    -- 转换日期格式
    last_update_date := DATE(NEW.last_update);
    deadline_date := DATE(NEW.deadline);
    
    -- 计算日期差异
    days_diff := current_date_val - last_update_date;
    days_to_deadline := deadline_date - current_date_val;
    
    -- 先删除该招聘信息的所有时间相关标签
    DELETE FROM job_tags 
    WHERE job_id = NEW.id 
    AND tag_id IN (tag_id_24h, tag_id_yesterday, tag_id_3days, tag_id_7days, tag_id_deadline);
    
    -- 根据更新时间添加相应标签
    IF days_diff = 0 THEN
        -- 24h更新：当天更新
        INSERT INTO job_tags (job_id, tag_id) VALUES (NEW.id, tag_id_24h);
    ELSIF days_diff = 1 THEN
        -- 昨天更新
        INSERT INTO job_tags (job_id, tag_id) VALUES (NEW.id, tag_id_yesterday);
    ELSIF days_diff BETWEEN 2 AND 3 THEN
        -- 3日内更新
        INSERT INTO job_tags (job_id, tag_id) VALUES (NEW.id, tag_id_3days);
    ELSIF days_diff BETWEEN 4 AND 7 THEN
        -- 7日内更新
        INSERT INTO job_tags (job_id, tag_id) VALUES (NEW.id, tag_id_7days);
    END IF;
    
    -- 检查是否即将截止（3天内含3天）
    IF days_to_deadline BETWEEN 0 AND 3 AND deadline_date >= current_date_val THEN
        -- 即将截止
        INSERT INTO job_tags (job_id, tag_id) VALUES (NEW.id, tag_id_deadline);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_update_job_time_tags
AFTER INSERT OR UPDATE ON job_recruitments
FOR EACH ROW
EXECUTE FUNCTION update_job_time_tags();

-- 创建每日自动更新所有招聘信息标签的函数
CREATE OR REPLACE FUNCTION daily_update_all_job_tags()
RETURNS VOID AS $$
BEGIN
    -- 通过更新last_update字段为其当前值来触发每个记录的tag更新触发器
    UPDATE job_recruitments
    SET last_update = last_update
    WHERE is_active = TRUE;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;
```

## 4. 结语

此文档概述了数据库设计的核心部分，包括表结构、字段含义和相关逻辑。为确保系统的高可维护性和扩展性，建议根据实际需求逐步完善系统功能，及时更新数据库结构。
