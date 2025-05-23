-- 简化版的行为标签更新脚本 v2

-- 确保job_action_updates表存在一条记录
INSERT INTO job_action_updates (id, last_update, update_needed, last_processed) 
VALUES (1, CURRENT_TIMESTAMP, true, NULL)
ON CONFLICT (id) DO UPDATE 
SET last_update = CURRENT_TIMESTAMP, 
    update_needed = true,
    last_processed = NULL;

-- 手动执行更新函数
DO $$
DECLARE
    tag_id_views INT := 7;   -- 多人浏览
    tag_id_favs INT := 8;    -- 多人收藏
    tag_id_apps INT := 9;    -- 多人投递
    total_jobs INT;
    apps_count INT := 0;
    favs_count INT := 0;
    views_count INT := 0;
BEGIN
    -- 获取有效招聘信息总数
    SELECT COUNT(*) INTO total_jobs 
    FROM job_recruitments
    WHERE is_active = TRUE;
    
    RAISE NOTICE '当前有效招聘信息总数: %', total_jobs;
    
    -- 清空当前的行为标签
    UPDATE job_tags
    SET action_tag_id = NULL
    WHERE action_tag_id IS NOT NULL;
    
    -- 创建临时表存储标签分配结果
    CREATE TEMP TABLE temp_action_tags (
        job_id INT,
        tag_id INT
    ) ON COMMIT DROP;
    
    -- 使用CTE计算百分比排名并分配标签
    WITH ranked_jobs AS (
        SELECT 
            jr.id,
            -- 计算每个指标的百分比排名（0-1之间，值越小表示排名越靠前）
            PERCENT_RANK() OVER (ORDER BY jr.applications_count DESC) AS apps_rank,
            PERCENT_RANK() OVER (ORDER BY jr.favorites_count DESC) AS favs_rank,
            PERCENT_RANK() OVER (ORDER BY jr.views_count DESC) AS views_rank
        FROM job_recruitments jr
        WHERE jr.is_active = TRUE
    ),
    tagged_jobs AS (
        -- 投递量前20%
        SELECT id, tag_id_apps AS tag_id, 1 AS priority
        FROM ranked_jobs
        WHERE apps_rank <= 0.2 AND apps_rank > 0
        UNION ALL
        -- 收藏量前20%（排除已有标签的）
        SELECT rj.id, tag_id_favs AS tag_id, 2 AS priority
        FROM ranked_jobs rj
        WHERE rj.favs_rank <= 0.2 AND rj.favs_rank > 0
          AND NOT EXISTS (
              SELECT 1 FROM ranked_jobs sub
              WHERE sub.id = rj.id AND sub.apps_rank <= 0.2 AND sub.apps_rank > 0
          )
        UNION ALL
        -- 浏览量前20%（排除已有标签的）
        SELECT rj.id, tag_id_views AS tag_id, 3 AS priority
        FROM ranked_jobs rj
        WHERE rj.views_rank <= 0.2 AND rj.views_rank > 0
          AND NOT EXISTS (
              SELECT 1 FROM ranked_jobs sub
              WHERE sub.id = rj.id AND 
              (sub.apps_rank <= 0.2 OR sub.favs_rank <= 0.2) AND 
              (sub.apps_rank > 0 OR sub.favs_rank > 0)
          )
    ),
    final_tags AS (
        -- 只保留每个job_id优先级最高的标签
        SELECT DISTINCT ON (id) id, tag_id
        FROM tagged_jobs
        ORDER BY id, priority
    )
    -- 将结果插入临时表
    INSERT INTO temp_action_tags (job_id, tag_id)
    SELECT id, tag_id FROM final_tags;
    
    -- 更新已存在的标签记录
    UPDATE job_tags jt
    SET action_tag_id = tat.tag_id
    FROM temp_action_tags tat
    WHERE jt.job_id = tat.job_id;
    
    -- 插入不存在的标签记录
    INSERT INTO job_tags (job_id, time_tag_id, action_tag_id)
    SELECT tat.job_id, 1, tat.tag_id
    FROM temp_action_tags tat
    WHERE NOT EXISTS (
        SELECT 1 FROM job_tags jt WHERE jt.job_id = tat.job_id
    );
    
    -- 统计各类型标签数量
    SELECT COUNT(*) INTO apps_count FROM job_tags WHERE action_tag_id = tag_id_apps;
    SELECT COUNT(*) INTO favs_count FROM job_tags WHERE action_tag_id = tag_id_favs;
    SELECT COUNT(*) INTO views_count FROM job_tags WHERE action_tag_id = tag_id_views;
    
    RAISE NOTICE '行为标签更新完成: 多人投递=%, 多人收藏=%, 多人浏览=%', apps_count, favs_count, views_count;
    
    -- 更新job_action_updates表
    UPDATE job_action_updates
    SET last_processed = CURRENT_TIMESTAMP,
        update_needed = FALSE
    WHERE id = 1;
    
    -- 清理临时表（虽然会自动清理，这里显式清理更安全）
    DROP TABLE IF EXISTS temp_action_tags;
END $$;

-- 验证更新结果
SELECT '多人浏览' AS 标签类型, COUNT(*) AS 数量 FROM job_tags WHERE action_tag_id = 7
UNION ALL
SELECT '多人收藏' AS 标签类型, COUNT(*) AS 数量 FROM job_tags WHERE action_tag_id = 8
UNION ALL
SELECT '多人投递' AS 标签类型, COUNT(*) AS 数量 FROM job_tags WHERE action_tag_id = 9; 