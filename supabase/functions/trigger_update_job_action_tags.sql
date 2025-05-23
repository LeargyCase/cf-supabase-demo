CREATE OR REPLACE FUNCTION public.trigger_update_job_action_tags()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- 如果views_count、favorites_count或applications_count发生变化，直接调用更新函数
    IF (OLD.views_count <> NEW.views_count) OR 
       (OLD.favorites_count <> NEW.favorites_count) OR 
       (OLD.applications_count <> NEW.applications_count) THEN
        
        RAISE NOTICE '检测到招聘信息计数变更: job_id=%, views=%->%, favorites=%->%, applications=%->%', 
            NEW.id, OLD.views_count, NEW.views_count, 
            OLD.favorites_count, NEW.favorites_count, 
            OLD.applications_count, NEW.applications_count;
        
        -- 直接调用更新函数，不再通过job_action_updates表
        PERFORM update_job_action_tags();
    END IF;
    
    RETURN NEW;
END;
$function$ 