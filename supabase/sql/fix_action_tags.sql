-- 手动修复行为标签的SQL脚本

-- 确保job_action_updates表存在一条记录
INSERT INTO job_action_updates (id, last_update, update_needed, last_processed) 
VALUES (1, CURRENT_TIMESTAMP, true, NULL)
ON CONFLICT (id) DO UPDATE 
SET last_update = CURRENT_TIMESTAMP, 
    update_needed = true,
    last_processed = NULL;

-- 手动执行更新函数（注意请在Supabase Studio的SQL编辑器中运行）
DO $$
DECLARE
    tag_id_views INT := 7;   -- 多人浏览
    tag_id_favs INT := 8;    -- 多人收藏
    tag_id_apps INT := 9;    -- 多人投递
    views_threshold INT;
    favs_threshold INT;
    apps_threshold INT;
    total_jobs INT;
    target_count INT;
    apps_count INT := 0;
    favs_count INT := 0;
    views_count INT := 0;
BEGIN
    -- 获取有效招聘信息总数
    SELECT COUNT(*) INTO total_jobs
    FROM job_recruitments
    WHERE is_active = TRUE;
    
    -- 计算每种标签应该分配的数量（20%）
    target_count := GREATEST(FLOOR(total_jobs * 0.2), 1);
    
    -- 计算前20%的阈值
    SELECT percentile_disc(0.8) WITHIN GROUP (ORDER BY jr.views_count)
    INTO views_threshold
    FROM job_recruitments jr
    WHERE jr.is_active = TRUE AND jr.views_count > 0;
    
    SELECT percentile_disc(0.8) WITHIN GROUP (ORDER BY jr.favorites_count)
    INTO favs_threshold
    FROM job_recruitments jr
    WHERE jr.is_active = TRUE AND jr.favorites_count > 0;
    
    SELECT percentile_disc(0.8) WITHIN GROUP (ORDER BY jr.applications_count)
    INTO apps_threshold
    FROM job_recruitments jr
    WHERE jr.is_active = TRUE AND jr.applications_count > 0;
    
    RAISE NOTICE '阈值: 浏览=%，收藏=%，投递=%', views_threshold, favs_threshold, apps_threshold;
    
    -- 清空当前的行为标签
    UPDATE job_tags
    SET action_tag_id = NULL
    WHERE action_tag_id IS NOT NULL;
    
    -- 1. 设置"多人投递"标签
    FOR job IN 
        SELECT jr.id
        FROM job_recruitments jr
        WHERE jr.is_active = TRUE 
          AND jr.applications_count >= apps_threshold 
          AND jr.applications_count > 0
        ORDER BY jr.applications_count DESC
        LIMIT target_count
    LOOP
        -- 检查是否有记录
        PERFORM 1 FROM job_tags WHERE job_id = job.id;
        
        IF FOUND THEN
            -- 更新已有记录
            UPDATE job_tags SET action_tag_id = tag_id_apps WHERE job_id = job.id;
        ELSE
            -- 插入新记录
            INSERT INTO job_tags (job_id, time_tag_id, action_tag_id) 
            VALUES (job.id, 1, tag_id_apps);
        END IF;
        
        apps_count := apps_count + 1;
    END LOOP;
    
    -- 2. 设置"多人收藏"标签（排除已有行为标签的职位）
    FOR job IN 
        SELECT jr.id
        FROM job_recruitments jr
        LEFT JOIN job_tags jt ON jr.id = jt.job_id
        WHERE jr.is_active = TRUE 
          AND jr.favorites_count >= favs_threshold 
          AND jr.favorites_count > 0
          AND (jt.action_tag_id IS NULL OR jt.job_id IS NULL)
        ORDER BY jr.favorites_count DESC
        LIMIT target_count
    LOOP
        -- 检查是否有记录
        PERFORM 1 FROM job_tags WHERE job_id = job.id;
        
        IF FOUND THEN
            -- 更新已有记录
            UPDATE job_tags SET action_tag_id = tag_id_favs WHERE job_id = job.id;
        ELSE
            -- 插入新记录
            INSERT INTO job_tags (job_id, time_tag_id, action_tag_id) 
            VALUES (job.id, 1, tag_id_favs);
        END IF;
        
        favs_count := favs_count + 1;
    END LOOP;
    
    -- 3. 设置"多人浏览"标签（排除已有行为标签的职位）
    FOR job IN 
        SELECT jr.id
        FROM job_recruitments jr
        LEFT JOIN job_tags jt ON jr.id = jt.job_id
        WHERE jr.is_active = TRUE 
          AND jr.views_count >= views_threshold 
          AND jr.views_count > 0
          AND (jt.action_tag_id IS NULL OR jt.job_id IS NULL)
        ORDER BY jr.views_count DESC
        LIMIT target_count
    LOOP
        -- 检查是否有记录
        PERFORM 1 FROM job_tags WHERE job_id = job.id;
        
        IF FOUND THEN
            -- 更新已有记录
            UPDATE job_tags SET action_tag_id = tag_id_views WHERE job_id = job.id;
        ELSE
            -- 插入新记录
            INSERT INTO job_tags (job_id, time_tag_id, action_tag_id) 
            VALUES (job.id, 1, tag_id_views);
        END IF;
        
        views_count := views_count + 1;
    END LOOP;
    
    RAISE NOTICE '行为标签更新完成: 多人投递=%, 多人收藏=%, 多人浏览=%', apps_count, favs_count, views_count;
    
    -- 更新job_action_updates表
    UPDATE job_action_updates
    SET last_processed = CURRENT_TIMESTAMP,
        update_needed = FALSE
    WHERE id = 1;
END $$;

-- 验证更新结果
SELECT '多人浏览' AS 标签类型, COUNT(*) AS 数量 FROM job_tags WHERE action_tag_id = 7
UNION ALL
SELECT '多人收藏' AS 标签类型, COUNT(*) AS 数量 FROM job_tags WHERE action_tag_id = 8
UNION ALL
SELECT '多人投递' AS 标签类型, COUNT(*) AS 数量 FROM job_tags WHERE action_tag_id = 9; 