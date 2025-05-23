CREATE OR REPLACE FUNCTION public.process_pending_job_action_updates()
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
    needs_update BOOLEAN;
    last_update TIMESTAMP;
    min_interval INTERVAL := '5 minutes'::INTERVAL;
BEGIN
    -- 检查是否有待处理的更新
    SELECT 
        update_needed,
        last_update
    INTO 
        needs_update,
        last_update
    FROM job_action_updates
    WHERE id = 1;
    
    -- 如果需要更新并且距离上次处理间隔超过最小阈值
    IF needs_update = TRUE AND (
        last_processed IS NULL OR 
        CURRENT_TIMESTAMP - last_processed > min_interval
    ) THEN
        -- 调用更新函数
        PERFORM update_job_action_tags();
        
        RAISE NOTICE '检测到待处理的行为标签更新，已执行更新。';
    ELSE
        RAISE NOTICE '没有需要处理的行为标签更新，或者距离上次处理时间过短。';
    END IF;
END;
$function$ 