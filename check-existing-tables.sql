-- ============================================
-- Check Existing Supabase Tables & Policies
-- ============================================
-- Run this in Supabase SQL Editor to see what you have
-- ============================================

-- 1. List all tables in your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check if PM tables exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pm_projects') 
    THEN '✅ pm_projects exists'
    ELSE '❌ pm_projects missing'
  END as pm_projects_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pm_tasks') 
    THEN '✅ pm_tasks exists'
    ELSE '❌ pm_tasks missing'
  END as pm_tasks_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pm_milestones') 
    THEN '✅ pm_milestones exists'
    ELSE '❌ pm_milestones missing'
  END as pm_milestones_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pm_project_members') 
    THEN '✅ pm_project_members exists'
    ELSE '❌ pm_project_members missing'
  END as pm_project_members_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions') 
    THEN '✅ user_subscriptions exists'
    ELSE '❌ user_subscriptions missing'
  END as user_subscriptions_status;

-- 3. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Check table columns for pm_projects
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pm_projects'
ORDER BY ordinal_position;
