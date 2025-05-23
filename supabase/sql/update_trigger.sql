-- 更新job_recruitments表的触发器设置

-- 删除旧的触发器（如果存在）
DROP TRIGGER IF EXISTS trigger_job_counts_change ON job_recruitments;

-- 创建新的触发器，监听计数字段的变化
CREATE TRIGGER trigger_job_counts_change
AFTER UPDATE OF views_count, favorites_count, applications_count
ON job_recruitments
FOR EACH ROW
EXECUTE FUNCTION trigger_update_job_action_tags();

-- 显示相关触发器以确认创建成功
SELECT tgname AS trigger_name, 
       relname AS table_name,
       pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE relname = 'job_recruitments' 
  AND tgname = 'trigger_job_counts_change'; 