-- ===== Weight Tracker Supabase 数据库初始化 =====
-- 在 Supabase Dashboard → SQL Editor 中运行此脚本

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. 用户资料
CREATE TABLE IF NOT EXISTS user_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  goals JSONB DEFAULT NULL,
  tdee_profile JSONB DEFAULT NULL,
  meal_goals JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_profile" ON user_profile
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. 体重记录
CREATE TABLE IF NOT EXISTS weights (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value NUMERIC(5,2) NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_weights" ON weights
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. 饮食记录
CREATE TABLE IF NOT EXISTS diets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal TEXT NOT NULL,
  food TEXT NOT NULL,
  kcal INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE diets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_diets" ON diets
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. 训练计划
CREATE TABLE IF NOT EXISTS workouts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  day TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  intensity TEXT DEFAULT '中等',
  detail TEXT DEFAULT '',
  kcal INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_workouts" ON workouts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. 完成训练记录
CREATE TABLE IF NOT EXISTS completed_workouts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,
  workout_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_key, workout_id)
);

ALTER TABLE completed_workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_completed" ON completed_workouts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. 饮食计划
CREATE TABLE IF NOT EXISTS meal_plan (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  meals JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, plan_date)
);

ALTER TABLE meal_plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_meal_plan" ON meal_plan
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. 自定义食物库
CREATE TABLE IF NOT EXISTS custom_foods (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cat TEXT DEFAULT '自定义',
  per100 JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_custom_foods" ON custom_foods
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. 外部食物缓存更新时间触发器
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 外部食物映射
CREATE TABLE IF NOT EXISTS external_food_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  normalized_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'fatsecret',
  fatsecret_food_id TEXT NOT NULL,
  fatsecret_serving_id TEXT NOT NULL DEFAULT '',
  fatsecret_food_name TEXT NOT NULL,
  locale_region TEXT NOT NULL DEFAULT 'US',
  locale_language TEXT NOT NULL DEFAULT 'en',
  match_confidence NUMERIC(4,3) NOT NULL DEFAULT 1.000,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, source, normalized_name, locale_region, locale_language)
);

CREATE INDEX IF NOT EXISTS idx_external_food_matches_user_name
  ON external_food_matches(user_id, normalized_name);
CREATE INDEX IF NOT EXISTS idx_external_food_matches_food_id
  ON external_food_matches(user_id, source, fatsecret_food_id);

ALTER TABLE external_food_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_external_food_matches" ON external_food_matches
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_external_food_matches_updated_at ON external_food_matches;
CREATE TRIGGER trg_external_food_matches_updated_at
  BEFORE UPDATE ON external_food_matches
  FOR EACH ROW
  EXECUTE FUNCTION touch_updated_at();

-- 10. 外部食物短期缓存
CREATE TABLE IF NOT EXISTS external_food_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'fatsecret',
  fatsecret_food_id TEXT NOT NULL,
  fatsecret_serving_id TEXT NOT NULL DEFAULT '',
  fatsecret_food_name TEXT NOT NULL,
  serving_description TEXT NOT NULL DEFAULT '',
  serving_grams NUMERIC(8,2),
  per100_kcal INTEGER NOT NULL DEFAULT 0,
  per100_protein NUMERIC(6,1) NOT NULL DEFAULT 0,
  per100_carb NUMERIC(6,1) NOT NULL DEFAULT 0,
  per100_fat NUMERIC(6,1) NOT NULL DEFAULT 0,
  locale_region TEXT NOT NULL DEFAULT 'US',
  locale_language TEXT NOT NULL DEFAULT 'en',
  cached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, source, fatsecret_food_id, fatsecret_serving_id, locale_region, locale_language)
);

CREATE INDEX IF NOT EXISTS idx_external_food_cache_lookup
  ON external_food_cache(user_id, source, fatsecret_food_id, fatsecret_serving_id);
CREATE INDEX IF NOT EXISTS idx_external_food_cache_expires_at
  ON external_food_cache(user_id, expires_at);

ALTER TABLE external_food_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_external_food_cache" ON external_food_cache
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_external_food_cache_updated_at ON external_food_cache;
CREATE TRIGGER trg_external_food_cache_updated_at
  BEFORE UPDATE ON external_food_cache
  FOR EACH ROW
  EXECUTE FUNCTION touch_updated_at();

-- 11. 给前端登录角色授权
-- 如果只做了建表和 RLS，但没给 authenticated/anon 角色表权限，
-- 前端会直接报 "permission denied for table ..."
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 让后续新建的表/序列也自动继承上述权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
