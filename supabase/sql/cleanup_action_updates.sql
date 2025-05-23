-- 可选的清理脚本：删除不再需要的job_action_updates表和定时任务

-- 删除定时任务
SELECT cron.unschedule('hourly-action-tags-update');
SELECT cron.unschedule('process-job-action-updates');

-- 删除不再需要的job_action_updates表
-- 注意：在确认新系统稳定运行后再执行此操作
-- DROP TABLE IF EXISTS job_action_updates;

-- 删除不再需要的process_pending_job_action_updates函数
-- DROP FUNCTION IF EXISTS process_pending_job_action_updates(); 