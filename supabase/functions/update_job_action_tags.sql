CREATE OR REPLACE FUNCTION public.update_job_action_tags()
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
    tag_id_views INT := 7;   -- 多人浏览
    tag_id_favs INT := 8;    -- 多人收藏
    tag_id_apps INT := 9;    -- 多人投递
    total_jobs INT;
    target_count INT;        -- 每类标签目标数量
    apps_count INT := 0;
    favs_count INT := 0;
    views_count INT := 0;
BEGIN
    -- 获取有效招聘信息总数
    SELECT COUNT(*) INTO total_jobs 
    FROM job_recruitments
    WHERE is_active = TRUE;
    
    -- 计算每种标签数量（20%）
    target_count := GREATEST(FLOOR(total_jobs * 0.2), 1);
    
    RAISE NOTICE '总职位数: %，每类标签目标数: %', total_jobs, target_count;
    
    -- 清空当前的行为标签
    UPDATE job_tags
    SET action_tag_id = NULL
    WHERE action_tag_id IS NOT NULL;
    
    -- 创建临时表存储标签分配结果
    DROP TABLE IF EXISTS temp_action_tags;
    CREATE TEMP TABLE temp_action_tags (
        job_id INT PRIMARY KEY,  -- 确保一个职位只有一个标签
        action_tag_id INT
    );
    
    -- 1. 先分配"多人投递"标签
    INSERT INTO temp_action_tags (job_id, action_tag_id)
    SELECT jr.id, tag_id_apps
    FROM job_recruitments jr
    WHERE jr.is_active = TRUE AND jr.applications_count > 0
    ORDER BY jr.applications_count DESC, jr.id
    LIMIT target_count;
    
    -- 2. 再分配"多人收藏"标签（排除已有标签的）
    INSERT INTO temp_action_tags (job_id, action_tag_id)
    SELECT jr.id, tag_id_favs
    FROM job_recruitments jr
    WHERE jr.is_active = TRUE 
      AND jr.favorites_count > 0
      AND NOT EXISTS (SELECT 1 FROM temp_action_tags t WHERE t.job_id = jr.id)
    ORDER BY jr.favorites_count DESC, jr.id
    LIMIT target_count;
    
    -- 3. 最后分配"多人浏览"标签（排除已有标签的）
    INSERT INTO temp_action_tags (job_id, action_tag_id)
    SELECT jr.id, tag_id_views
    FROM job_recruitments jr
    WHERE jr.is_active = TRUE 
      AND jr.views_count > 0
      AND NOT EXISTS (SELECT 1 FROM temp_action_tags t WHERE t.job_id = jr.id)
    ORDER BY jr.views_count DESC, jr.id
    LIMIT target_count;
    
    -- 统计各类型标签数量
    SELECT COUNT(*) INTO apps_count FROM temp_action_tags WHERE action_tag_id = tag_id_apps;
    SELECT COUNT(*) INTO favs_count FROM temp_action_tags WHERE action_tag_id = tag_id_favs;
    SELECT COUNT(*) INTO views_count FROM temp_action_tags WHERE action_tag_id = tag_id_views;
    
    -- 更新到job_tags表
    UPDATE job_tags jt
    SET action_tag_id = t.action_tag_id
    FROM temp_action_tags t
    WHERE jt.job_id = t.job_id;
    
    -- 插入不存在的记录
    INSERT INTO job_tags (job_id, time_tag_id, action_tag_id)
    SELECT t.job_id, 1, t.action_tag_id
    FROM temp_action_tags t
    WHERE NOT EXISTS (
        SELECT 1 FROM job_tags jt WHERE jt.job_id = t.job_id
    );
    
    RAISE NOTICE '行为标签更新完成: 多人投递=%, 多人收藏=%, 多人浏览=%', 
        apps_count, favs_count, views_count;
    
    -- 清理临时表
    DROP TABLE IF EXISTS temp_action_tags;
END;
$function$ 