const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const API_URL = 'https://platform.fatsecret.com/rest/server.api';

let tokenCache = {
  accessToken: '',
  expiresAt: 0
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeToken(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/（.*?）|\(.*?\)/g, '')
    .replace(/[\s,，.。·/_\-+]+/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
}

function cleanLookupText(text = '') {
  return String(text)
    .replace(/\b\d+(?:\.\d+)?\s*(g|gram|grams|kg|ml|oz|lb)\b/gi, ' ')
    .replace(/\d+(?:\.\d+)?\s*(克|千克|毫升|盎司|磅)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseMetricGrams(serving) {
  const metricAmount = parseFloat(serving?.metric_serving_amount);
  const metricUnit = String(serving?.metric_serving_unit || '').toLowerCase();
  if (metricAmount && !Number.isNaN(metricAmount)) {
    if (metricUnit === 'g') return metricAmount;
    if (metricUnit === 'oz') return metricAmount * 28.3495;
    if (metricUnit === 'ml') return metricAmount;
  }

  const description = `${serving?.serving_description || ''} ${serving?.measurement_description || ''}`;
  const gramsMatch = description.match(/(\d+(?:\.\d+)?)\s*g\b/i);
  if (gramsMatch) return parseFloat(gramsMatch[1]);

  const ozMatch = description.match(/(\d+(?:\.\d+)?)\s*oz\b/i);
  if (ozMatch) return parseFloat(ozMatch[1]) * 28.3495;

  return null;
}

function pickServing(servings, requestedServingId = '') {
  const list = toArray(servings).map(item => ({
    ...item,
    __grams: parseMetricGrams(item)
  }));
  if (!list.length) return null;

  if (requestedServingId) {
    const exact = list.find(item => String(item.serving_id || '') === String(requestedServingId));
    if (exact) return exact;
  }

  const by100g = list.find(item => item.__grams && Math.abs(item.__grams - 100) <= 3);
  if (by100g) return by100g;

  const defaultServing = list.find(item => String(item.is_default || '') === '1');
  if (defaultServing && defaultServing.__grams) return defaultServing;

  const firstWithMetric = list.find(item => item.__grams);
  if (firstWithMetric) return firstWithMetric;

  return list[0];
}

function round1(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function normalizePer100(serving, grams) {
  const safeGrams = grams && grams > 0 ? grams : 100;
  const ratio = 100 / safeGrams;
  return {
    kcal: Math.round((parseFloat(serving?.calories) || 0) * ratio),
    protein: round1((parseFloat(serving?.protein) || 0) * ratio),
    carb: round1((parseFloat(serving?.carbohydrate) || 0) * ratio),
    fat: round1((parseFloat(serving?.fat) || 0) * ratio)
  };
}

function inferCategory(name, per100) {
  const lowered = String(name || '').toLowerCase();
  if (/apple|banana|orange|berry|mango|fruit|苹果|香蕉|橙|草莓|蓝莓|芒果|牛油果/.test(lowered)) return '水果';
  if (/lettuce|broccoli|spinach|cucumber|tomato|mushroom|cabbage|zucchini|vegetable|番茄|黄瓜|西兰花|菠菜|白菜|蘑菇|西葫芦|木耳|葱|香菜/.test(lowered)) return '蔬菜';
  if (/rice|bread|oat|oatmeal|noodle|pasta|vermicelli|corn|potato|quinoa|bun|米|饭|面|粉丝|燕麦|玉米|土豆|藜麦|馒头|面包/.test(lowered)) return '主食';
  if (/chicken|beef|pork|egg|tofu|fish|tuna|shrimp|ham|spam|meat|鸡|牛|猪|蛋|豆腐|鱼|虾|午餐肉|肉丸/.test(lowered)) return '蛋白质';
  if (per100.fat >= 60) return '油脂';
  if (per100.protein >= 15 && per100.carb <= 12) return '蛋白质';
  if (per100.carb >= 20 && per100.protein <= 10) return '主食';
  return '其他';
}

function normalizeFoodPayload(food, requestedServingId = '') {
  if (!food) return null;
  const serving = pickServing(food?.servings?.serving, requestedServingId);
  if (!serving) return null;

  const servingGrams = parseMetricGrams(serving) || 100;
  const name = [food.brand_name, food.food_name].filter(Boolean).join(' ');
  const per100 = normalizePer100(serving, servingGrams);

  return {
    source: 'fatsecret',
    sourceType: 'fatsecret_live',
    sourceLabel: 'FatSecret',
    external: true,
    externalPending: true,
    name: name || food.food_name || 'FatSecret 食物',
    cat: inferCategory(name || food.food_name, per100),
    per100,
    fatsecret: {
      foodId: String(food.food_id || ''),
      servingId: String(serving.serving_id || ''),
      foodName: food.food_name || '',
      brandName: food.brand_name || '',
      foodType: food.food_type || '',
      servingDescription: serving.serving_description || '',
      servingGrams: round1(servingGrams),
      region: process.env.FATSECRET_REGION || 'US',
      language: process.env.FATSECRET_LANGUAGE || 'en'
    }
  };
}

function getScore(query, item) {
  const cleanedQuery = normalizeToken(cleanLookupText(query));
  const combinedName = normalizeToken([item.brand_name, item.food_name].filter(Boolean).join(' '));
  const rawName = normalizeToken(item.food_name || '');

  if (!cleanedQuery) return 0;
  if (combinedName === cleanedQuery || rawName === cleanedQuery) return 100;
  if (combinedName.startsWith(cleanedQuery) || rawName.startsWith(cleanedQuery)) return 90;
  if (combinedName.includes(cleanedQuery) || rawName.includes(cleanedQuery)) return 80;
  return 0;
}

async function requestAccessToken() {
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt - 60 * 1000) {
    return tokenCache.accessToken;
  }

  const clientId = process.env.FATSECRET_CLIENT_ID || process.env.FATSECRET_API_KEY;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('FatSecret 环境变量未配置');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const scope = process.env.FATSECRET_SCOPE || 'basic';
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope
    }).toString()
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'FatSecret token 获取失败');
  }

  tokenCache.accessToken = data.access_token;
  tokenCache.expiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;
  return tokenCache.accessToken;
}

async function callFatSecret(token, params) {
  const requestParams = new URLSearchParams({
    ...params,
    format: 'json'
  });
  if (process.env.FATSECRET_REGION) requestParams.set('region', process.env.FATSECRET_REGION);
  if (process.env.FATSECRET_LANGUAGE) requestParams.set('language', process.env.FATSECRET_LANGUAGE);

  const response = await fetch(`${API_URL}?${requestParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error(`FatSecret 返回格式异常：${text.slice(0, 160)}`);
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.error || 'FatSecret 请求失败');
  }
  if (data?.error) {
    throw new Error(data.error.message || data.error.description || 'FatSecret 请求失败');
  }
  return data;
}

async function fetchFoodById(token, foodId, servingId = '') {
  const data = await callFatSecret(token, {
    method: 'food.get',
    food_id: String(foodId)
  });
  return normalizeFoodPayload(data.food || data, servingId);
}

exports.handler = async function handler(event) {
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const params = event.httpMethod === 'POST'
      ? JSON.parse(event.body || '{}')
      : (event.queryStringParameters || {});

    const query = cleanLookupText(params.q || params.query || '');
    const foodId = params.foodId || params.food_id || '';
    const servingId = params.servingId || params.serving_id || '';

    if (!query && !foodId) {
      return json(400, { error: 'Missing q or foodId' });
    }

    const token = await requestAccessToken();

    if (foodId) {
      const food = await fetchFoodById(token, foodId, servingId);
      if (!food) return json(404, { error: 'Food not found' });
      return json(200, { ok: true, food });
    }

    const data = await callFatSecret(token, {
      method: 'foods.search',
      search_expression: query,
      max_results: '6',
      page_number: '0'
    });

    const items = toArray(data?.foods?.food)
      .sort((a, b) => getScore(query, b) - getScore(query, a))
      .slice(0, 4);

    if (!items.length) {
      return json(200, { ok: true, foods: [] });
    }

    const foods = [];
    for (const item of items) {
      try {
        const food = await fetchFoodById(token, item.food_id);
        if (food) foods.push(food);
      } catch (err) {
        console.error('fatsecret detail error:', err.message);
      }
    }

    return json(200, { ok: true, foods });
  } catch (error) {
    console.error('fatsecret-search handler error:', error);
    const statusCode = /未配置/.test(error.message) ? 503 : 500;
    return json(statusCode, { error: error.message || 'FatSecret lookup failed' });
  }
};
