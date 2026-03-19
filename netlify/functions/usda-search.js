const API_BASE = 'https://api.nal.usda.gov/fdc/v1';

// 关键营养素 nutrientId
const NUTRIENT_ENERGY = 1008;   // Energy (kcal)
const NUTRIENT_PROTEIN = 1003;  // Protein (g)
const NUTRIENT_CARB = 1005;     // Carbohydrate, by difference (g)
const NUTRIENT_FAT = 1004;      // Total lipid (fat) (g)

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify(body)
  };
}

function round1(v) {
  return Math.round((Number(v) || 0) * 10) / 10;
}

function extractNutrient(nutrients, nutrientId) {
  if (!Array.isArray(nutrients)) return 0;
  const n = nutrients.find(item =>
    (item.nutrientId || item.nutrientNumber && false) === nutrientId
    || item.nutrientId === nutrientId
  );
  return n ? Number(n.value || n.amount || 0) : 0;
}

function inferCategory(name, per100) {
  const lowered = String(name || '').toLowerCase();
  if (/apple|banana|orange|berry|mango|fruit|grape|melon|pear|peach|plum|cherry|kiwi|苹果|香蕉|橙|草莓|蓝莓|芒果|牛油果|葡萄|西瓜|桃/.test(lowered)) return '水果';
  if (/lettuce|broccoli|spinach|cucumber|tomato|mushroom|cabbage|zucchini|vegetable|carrot|onion|pepper|celery|番茄|黄瓜|西兰花|菠菜|白菜|蘑菇|西葫芦|木耳|葱|香菜|胡萝卜/.test(lowered)) return '蔬菜';
  if (/rice|bread|oat|oatmeal|noodle|pasta|vermicelli|corn|potato|quinoa|bun|wheat|flour|cereal|米|饭|面|粉丝|燕麦|玉米|土豆|藜麦|馒头|面包/.test(lowered)) return '主食';
  if (/chicken|beef|pork|egg|tofu|fish|tuna|shrimp|ham|spam|meat|salmon|turkey|lamb|duck|鸡|牛|猪|蛋|豆腐|鱼|虾|午餐肉|肉丸|三文鱼/.test(lowered)) return '蛋白质';
  if (/milk|cheese|yogurt|butter|cream|牛奶|奶酪|酸奶|黄油|奶油/.test(lowered)) return '乳制品';
  if (per100.fat >= 60) return '油脂';
  if (per100.protein >= 15 && per100.carb <= 12) return '蛋白质';
  if (per100.carb >= 20 && per100.protein <= 10) return '主食';
  return '其他';
}

function normalizeFoodPayload(food) {
  if (!food) return null;

  const nutrients = food.foodNutrients || [];
  const per100 = {
    kcal: Math.round(extractNutrient(nutrients, NUTRIENT_ENERGY)),
    protein: round1(extractNutrient(nutrients, NUTRIENT_PROTEIN)),
    carb: round1(extractNutrient(nutrients, NUTRIENT_CARB)),
    fat: round1(extractNutrient(nutrients, NUTRIENT_FAT))
  };

  // 跳过明显无营养数据的项
  if (per100.kcal === 0 && per100.protein === 0 && per100.carb === 0 && per100.fat === 0) {
    return null;
  }

  const name = [food.brandName, food.description].filter(Boolean).join(' ').trim();
  const fdcId = String(food.fdcId || '');

  return {
    source: 'usda',
    sourceType: 'usda_live',
    sourceLabel: 'USDA',
    external: true,
    externalPending: true,
    name: name || food.description || 'USDA Food',
    cat: inferCategory(name || food.description, per100),
    per100,
    usda: {
      fdcId,
      dataType: food.dataType || '',
      brandName: food.brandName || '',
      foodCategory: food.foodCategory || '',
      description: food.description || ''
    }
  };
}

function getScore(query, item) {
  const q = query.toLowerCase().trim();
  const desc = (item.description || '').toLowerCase();
  const brand = (item.brandName || '').toLowerCase();
  const combined = `${brand} ${desc}`.trim();

  if (desc === q || combined === q) return 100;
  if (desc.startsWith(q) || combined.startsWith(q)) return 90;
  if (desc.includes(q) || combined.includes(q)) return 80;

  // 优先 SR Legacy / Foundation 数据（质量更高）
  const dataType = (item.dataType || '').toLowerCase();
  if (dataType.includes('foundation') || dataType.includes('sr legacy')) return 60;

  return 50;
}

exports.handler = async function handler(event) {
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.USDA_API_KEY;
    if (!apiKey) {
      return json(503, { error: 'USDA_API_KEY 环境变量未配置' });
    }

    const params = event.httpMethod === 'POST'
      ? JSON.parse(event.body || '{}')
      : (event.queryStringParameters || {});

    const query = (params.q || params.query || '').trim();
    const fdcId = params.fdcId || params.fdc_id || '';

    if (!query && !fdcId) {
      return json(400, { error: 'Missing q or fdcId' });
    }

    // ===== 按 fdcId 查询单个食物 =====
    if (fdcId) {
      const url = `${API_BASE}/food/${fdcId}?api_key=${apiKey}`;
      const resp = await fetch(url);
      if (!resp.ok) {
        const text = await resp.text();
        return json(resp.status, { error: `USDA API error: ${text.slice(0, 200)}` });
      }
      const data = await resp.json();
      const food = normalizeFoodPayload(data);
      if (!food) return json(404, { error: 'Food not found or no nutrient data' });
      return json(200, { ok: true, food });
    }

    // ===== 搜索食物 =====
    const searchUrl = `${API_BASE}/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=8&dataType=Foundation,SR%20Legacy,Branded`;
    const resp = await fetch(searchUrl);
    if (!resp.ok) {
      const text = await resp.text();
      return json(resp.status, { error: `USDA API error: ${text.slice(0, 200)}` });
    }
    const data = await resp.json();

    const items = (data.foods || [])
      .sort((a, b) => getScore(query, b) - getScore(query, a))
      .slice(0, 6);

    const foods = items
      .map(item => normalizeFoodPayload(item))
      .filter(Boolean)
      .slice(0, 4);

    return json(200, { ok: true, foods });
  } catch (error) {
    console.error('usda-search handler error:', error);
    return json(500, { error: error.message || 'USDA lookup failed' });
  }
};
