// ===== 所有数据库操作封装 =====
// 依赖 js/supabase.js 中的 sb 和 currentUser
// 适配实际 Supabase 表结构（UUID主键、独立列）

// ========== 工具函数 ==========
const today = () => new Date().toISOString().split('T')[0];

function normalizeFoodLookupName(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/（.*?）|\(.*?\)/g, '')
    .replace(/[\s,，.。·/_\-+]+/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
}

function mapExternalCacheRowToFood(row) {
  const per100 = {
    kcal: row.per100_kcal || 0,
    protein: parseFloat(row.per100_protein) || 0,
    carb: parseFloat(row.per100_carb) || 0,
    fat: parseFloat(row.per100_fat) || 0
  };
  return {
    id: row.id,
    name: row.fatsecret_food_name,
    cat: '外部',
    external: true,
    sourceType: 'usda_cache',
    sourceLabel: 'USDA 缓存',
    per100,
    usda: {
      fdcId: row.fatsecret_food_id,
      dataType: row.serving_description || '',
      cachedAt: row.cached_at,
      expiresAt: row.expires_at
    }
  };
}

// 星期映射：1=周一 ... 7=周日
const DAY_LABELS = ['','周一','周二','周三','周四','周五','周六','周日'];
function dayIntToLabel(n) { return DAY_LABELS[n] || ''; }
function dayLabelToInt(label) { const i = DAY_LABELS.indexOf(label); return i > 0 ? i : 1; }

function getWeekKey() {
  const d = new Date();
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

// ========== 体重 ==========
async function getWeights() {
  const { data, error } = await sb
    .from('weights')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('date');
  if (error) { console.error(error); return []; }
  return data.map(r => ({ id: r.id, date: r.date, value: parseFloat(r.value), note: r.note || '' }));
}

async function addWeight(date, value, note) {
  const { data, error } = await sb
    .from('weights')
    .insert({ user_id: currentUser.id, date, value: parseFloat(value), note: note || '' })
    .select().single();
  if (error) throw error;
  return { id: data.id, date: data.date, value: parseFloat(data.value), note: data.note || '' };
}

async function deleteWeight(id) {
  const { error } = await sb
    .from('weights')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);
  if (error) throw error;
}

// ========== 饮食 ==========
async function getDiets(date) {
  const query = sb.from('diets').select('*').eq('user_id', currentUser.id).order('created_at');
  if (date) query.eq('date', date);
  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return data.map(r => ({ id: r.id, date: r.date, meal: r.meal, food: r.food, kcal: r.kcal || 0 }));
}

async function getAllDiets() {
  const { data, error } = await sb
    .from('diets')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('date');
  if (error) { console.error(error); return []; }
  return data.map(r => ({ id: r.id, date: r.date, meal: r.meal, food: r.food, kcal: r.kcal || 0 }));
}

async function addDiet(date, meal, food, kcal) {
  const { data, error } = await sb
    .from('diets')
    .insert({ user_id: currentUser.id, date, meal, food, kcal: kcal || 0 })
    .select().single();
  if (error) throw error;
  return { id: data.id, date: data.date, meal: data.meal, food: data.food, kcal: data.kcal || 0 };
}

async function addDiets(rows) {
  const inserts = rows.map(r => ({ user_id: currentUser.id, ...r }));
  const { data, error } = await sb.from('diets').insert(inserts).select();
  if (error) throw error;
  return data.map(r => ({ id: r.id, date: r.date, meal: r.meal, food: r.food, kcal: r.kcal || 0 }));
}

async function deleteDiet(id) {
  const { error } = await sb
    .from('diets')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);
  if (error) throw error;
}

// ========== 训练计划 ==========
// workouts.day 是 integer: 1=周一 ... 7=周日
async function getWorkouts() {
  const { data, error } = await sb
    .from('workouts')
    .select('*')
    .eq('user_id', currentUser.id);
  if (error) { console.error(error); return []; }
  return data.map(r => ({
    id: r.id, name: r.name,
    day: r.day,                    // integer 1-7
    dayLabel: dayIntToLabel(r.day), // '周一'-'周日'
    duration: r.duration || '', intensity: r.intensity || '中等',
    detail: r.detail || '', kcal: r.kcal || 0
  }));
}

async function addWorkout(name, dayInt, duration, intensity, detail, kcal) {
  const { data, error } = await sb
    .from('workouts')
    .insert({ user_id: currentUser.id, name, day: dayInt, duration: String(duration || ''), intensity, detail, kcal: kcal || 0 })
    .select().single();
  if (error) throw error;
  return {
    id: data.id, name: data.name, day: data.day,
    dayLabel: dayIntToLabel(data.day),
    duration: data.duration || '', intensity: data.intensity || '中等',
    detail: data.detail || '', kcal: data.kcal || 0
  };
}

async function deleteWorkout(id) {
  const { error } = await sb
    .from('workouts')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);
  if (error) throw error;
}

// ========== 完成训练 ==========
async function getCompleted() {
  const { data, error } = await sb
    .from('completed_workouts')
    .select('*')
    .eq('user_id', currentUser.id);
  if (error) { console.error(error); return {}; }
  const result = {};
  data.forEach(r => {
    if (!result[r.week_key]) result[r.week_key] = {};
    result[r.week_key][r.workout_id] = r.id; // 存 row id 方便删除
  });
  return result;
}

async function toggleDone(workoutId, completed) {
  const weekKey = getWeekKey();
  if (completed) {
    // 取消完成 — 用 user_id + week_key + workout_id 定位
    const { error } = await sb
      .from('completed_workouts')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('week_key', weekKey)
      .eq('workout_id', workoutId);
    if (error) throw error;
    return false;
  } else {
    const { error } = await sb
      .from('completed_workouts')
      .insert({ user_id: currentUser.id, week_key: weekKey, workout_id: workoutId });
    if (error) throw error;
    return true;
  }
}

// ========== 饮食计划 ==========
// meal_plan 是扁平行：每行一个食物 (date, meal_name, food_name, kcal, protein, carb, fat)

async function getMealPlan() {
  const { data, error } = await sb
    .from('meal_plan')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at');
  if (error) { console.error(error); return []; }
  return data.map(r => ({
    id: r.id, date: r.date, meal_name: r.meal_name,
    food_name: r.food_name, kcal: r.kcal || 0,
    protein: parseFloat(r.protein) || 0,
    carb: parseFloat(r.carb) || 0,
    fat: parseFloat(r.fat) || 0
  }));
}

// 按日期分组：返回 { 'YYYY-MM-DD': { '早餐': [...], '午餐': [...], ... } }
function groupMealPlan(rows) {
  const result = {};
  rows.forEach(r => {
    if (!result[r.date]) result[r.date] = {};
    if (!result[r.date][r.meal_name]) result[r.date][r.meal_name] = [];
    result[r.date][r.meal_name].push(r);
  });
  return result;
}

async function addMealPlanItem(date, meal_name, food_name, kcal, protein, carb, fat) {
  const { data, error } = await sb
    .from('meal_plan')
    .insert({
      user_id: currentUser.id, date, meal_name, food_name,
      kcal: kcal || 0, protein: protein || 0, carb: carb || 0, fat: fat || 0
    })
    .select().single();
  if (error) throw error;
  return {
    id: data.id, date: data.date, meal_name: data.meal_name,
    food_name: data.food_name, kcal: data.kcal || 0,
    protein: parseFloat(data.protein) || 0,
    carb: parseFloat(data.carb) || 0,
    fat: parseFloat(data.fat) || 0
  };
}

async function addMealPlanBatch(rows) {
  const inserts = rows.map(r => ({ user_id: currentUser.id, ...r }));
  const { data, error } = await sb.from('meal_plan').insert(inserts).select();
  if (error) throw error;
  return data.map(r => ({
    id: r.id, date: r.date, meal_name: r.meal_name,
    food_name: r.food_name, kcal: r.kcal || 0,
    protein: parseFloat(r.protein) || 0,
    carb: parseFloat(r.carb) || 0,
    fat: parseFloat(r.fat) || 0
  }));
}

async function deleteMealPlanItem(id) {
  const { error } = await sb
    .from('meal_plan')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);
  if (error) throw error;
}

// 删除某天某餐的所有食物（用于模板替换）
async function clearMealPlanDayMeal(date, meal_name) {
  const { error } = await sb
    .from('meal_plan')
    .delete()
    .eq('user_id', currentUser.id)
    .eq('date', date)
    .eq('meal_name', meal_name);
  if (error) throw error;
}

// 删除某天所有食物（用于模板整天替换）
async function clearMealPlanDay(date) {
  const { error } = await sb
    .from('meal_plan')
    .delete()
    .eq('user_id', currentUser.id)
    .eq('date', date);
  if (error) throw error;
}

// ========== 自定义食物 ==========
// custom_foods 独立列：kcal, protein, carb, fat
async function getCustomFoods() {
  const { data, error } = await sb
    .from('custom_foods')
    .select('*')
    .eq('user_id', currentUser.id);
  if (error) { console.error(error); return []; }
  return data.map(r => ({
    id: r.id, name: r.name, cat: r.cat || '自定义', custom: true,
    kcal: r.kcal || 0,
    protein: parseFloat(r.protein) || 0,
    carb: parseFloat(r.carb) || 0,
    fat: parseFloat(r.fat) || 0,
    // 兼容：生成 per100 对象供食物搜索使用
    per100: { kcal: r.kcal || 0, protein: parseFloat(r.protein) || 0, carb: parseFloat(r.carb) || 0, fat: parseFloat(r.fat) || 0 }
  }));
}

async function saveCustomFood(name, cat, kcal, protein, carb, fat) {
  const { data, error } = await sb
    .from('custom_foods')
    .insert({
      user_id: currentUser.id, name, cat: cat || '自定义',
      kcal: kcal || 0, protein: protein || 0, carb: carb || 0, fat: fat || 0
    })
    .select().single();
  if (error) throw error;
  return {
    id: data.id, name: data.name, cat: data.cat || '自定义', custom: true,
    kcal: data.kcal || 0,
    protein: parseFloat(data.protein) || 0,
    carb: parseFloat(data.carb) || 0,
    fat: parseFloat(data.fat) || 0,
    per100: { kcal: data.kcal || 0, protein: parseFloat(data.protein) || 0, carb: parseFloat(data.carb) || 0, fat: parseFloat(data.fat) || 0 }
  };
}

async function deleteCustomFood(id) {
  const { error } = await sb
    .from('custom_foods')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);
  if (error) throw error;
}

// ========== 外部食物映射 / 缓存 ==========
async function getExternalFoodCacheFoods() {
  const nowIso = new Date().toISOString();
  const { data, error } = await sb
    .from('external_food_cache')
    .select('*')
    .eq('user_id', currentUser.id)
    .gt('expires_at', nowIso)
    .order('updated_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data || []).map(mapExternalCacheRowToFood);
}

async function getExternalFoodMatchByName(normalizedName, localeRegion = 'US', localeLanguage = 'en') {
  const { data, error } = await sb
    .from('external_food_matches')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('source', 'usda')
    .eq('normalized_name', normalizedName)
    .eq('locale_region', localeRegion)
    .eq('locale_language', localeLanguage)
    .maybeSingle();
  if (error) { console.error(error); return null; }
  return data || null;
}

async function getExternalFoodCacheByIds(foodId, servingId = '', localeRegion = 'US', localeLanguage = 'en') {
  const nowIso = new Date().toISOString();
  const { data, error } = await sb
    .from('external_food_cache')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('source', 'usda')
    .eq('fatsecret_food_id', String(foodId))
    .eq('fatsecret_serving_id', String(servingId || ''))
    .eq('locale_region', localeRegion)
    .eq('locale_language', localeLanguage)
    .gt('expires_at', nowIso)
    .maybeSingle();
  if (error) { console.error(error); return null; }
  return data ? mapExternalCacheRowToFood(data) : null;
}

async function saveExternalFoodMatch(payload) {
  const row = {
    user_id: currentUser.id,
    normalized_name: normalizeFoodLookupName(payload.normalized_name),
    original_name: payload.original_name || payload.normalized_name,
    source: payload.source || 'usda',
    fatsecret_food_id: String(payload.fatsecret_food_id),
    fatsecret_serving_id: String(payload.fatsecret_serving_id || ''),
    fatsecret_food_name: payload.fatsecret_food_name,
    locale_region: payload.locale_region || 'US',
    locale_language: payload.locale_language || 'en',
    match_confidence: payload.match_confidence == null ? 1 : payload.match_confidence,
    last_synced_at: payload.last_synced_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { error } = await sb
    .from('external_food_matches')
    .upsert(row, { onConflict: 'user_id,source,normalized_name,locale_region,locale_language' });
  if (error) throw error;
}

async function saveExternalFoodCache(payload) {
  const row = {
    user_id: currentUser.id,
    source: payload.source || 'usda',
    fatsecret_food_id: String(payload.fatsecret_food_id),
    fatsecret_serving_id: String(payload.fatsecret_serving_id || ''),
    fatsecret_food_name: payload.fatsecret_food_name,
    serving_description: payload.serving_description || '',
    serving_grams: payload.serving_grams == null ? null : payload.serving_grams,
    per100_kcal: payload.per100_kcal || 0,
    per100_protein: payload.per100_protein || 0,
    per100_carb: payload.per100_carb || 0,
    per100_fat: payload.per100_fat || 0,
    locale_region: payload.locale_region || 'US',
    locale_language: payload.locale_language || 'en',
    cached_at: payload.cached_at || new Date().toISOString(),
    expires_at: payload.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await sb
    .from('external_food_cache')
    .upsert(row, { onConflict: 'user_id,source,fatsecret_food_id,fatsecret_serving_id,locale_region,locale_language' })
    .select()
    .single();
  if (error) throw error;
  return mapExternalCacheRowToFood(data);
}

// ========== 用户资料 ==========
// user_profile 独立列：height, age, gender, activity, goal, start_weight, target_weight,
//   target_date, kcal_target, protein_target, carb_target, fat_target
async function getProfile() {
  const { data, error } = await sb
    .from('user_profile')
    .select('*')
    .eq('user_id', currentUser.id)
    .maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}

async function saveProfile(fields) {
  // fields 是一个对象，只包含要更新的列
  // 例如 { height: 175, age: 25, kcal_target: 1800 }
  const payload = { user_id: currentUser.id, updated_at: new Date().toISOString(), ...fields };
  const { error } = await sb
    .from('user_profile')
    .upsert(payload, { onConflict: 'user_id' });
  if (error) { console.error('saveProfile error:', error); throw error; }
}
