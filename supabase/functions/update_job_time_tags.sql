CREATE OR REPLACE FUNCTION public.update_job_time_tags()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    tag_id_24h INT := 1;
    tag_id_yesterday INT := 2;
    tag_id_3days INT := 3;
    tag_id_7days INT := 4;
    tag_id_deadline INT := 5;
    tag_id_active INT := 6;  -- 新增的"有效可投递"标签
    current_date_val DATE := CURRENT_DATE;
    last_update_date DATE;
    deadline_date DATE;
    days_diff INT;
    days_to_deadline INT;
    tag_exists BOOLEAN;
BEGIN
    -- 转换日期格式
    last_update_date := DATE(NEW.last_update);
    deadline_date := DATE(NEW.deadline);
    
    -- 计算日期差异
    days_diff := current_date_val - last_update_date;
    days_to_deadline := deadline_date - current_date_val;
    
    -- 检查该招聘信息是否已有标签记录
    SELECT EXISTS(SELECT 1 FROM job_tags WHERE job_id = NEW.id) INTO tag_exists;
    
    -- 确定应该设置的时间标签
    DECLARE
        new_time_tag_id INT;
    BEGIN
        -- 根据更新时间和截止时间确定标签优先级
        IF days_to_deadline BETWEEN 0 AND 3 AND deadline_date >= current_date_val THEN
            -- 即将截止（最高优先级）
            new_time_tag_id := tag_id_deadline;
        ELSIF days_diff = 0 THEN
            -- 24h更新
            new_time_tag_id := tag_id_24h;
        ELSIF days_diff = 1 THEN
            -- 昨天更新
            new_time_tag_id := tag_id_yesterday;
        ELSIF days_diff BETWEEN 2 AND 3 THEN
            -- 3日内更新
            new_time_tag_id := tag_id_3days;
        ELSIF days_diff BETWEEN 4 AND 7 THEN
            -- 7日内更新
            new_time_tag_id := tag_id_7days;
        ELSIF deadline_date >= current_date_val THEN
            -- 有效可投递（超过7天更新且非即将截止）
            new_time_tag_id := tag_id_active;
        END IF;
        
        -- 如果记录已存在，则更新time_tag_id字段
        IF tag_exists THEN
            UPDATE job_tags 
            SET time_tag_id = new_time_tag_id
            WHERE job_id = NEW.id;
        ELSE
            -- 如果记录不存在，则插入新记录
            INSERT INTO job_tags (job_id, time_tag_id) 
            VALUES (NEW.id, new_time_tag_id);
        END IF;
    END;
    
    RETURN NEW;
END;
$function$ 