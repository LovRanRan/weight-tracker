// ===== Supabase 初始化 =====
const SUPABASE_URL  = 'https://ujewutykcoxcqprhqaxc.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZXd1dHlrY294Y3FwcmhxYXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjY1ODgsImV4cCI6MjA4OTQ0MjU4OH0.bnmrdsyI_rbPAnxbJ5vhyxSvV9aBl8sh4P_IGHSf0xU';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 当前登录用户（全局可用）
let currentUser = null;

// ===== 鉴权守卫 =====
// 每个功能页面顶部调用此函数
// 未登录 → 跳回 index.html
async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return false;
  }
  currentUser = session.user;

  // 显示用户邮箱（如果页面有 #userEmail 元素）
  const el = document.getElementById('userEmail');
  if (el) el.textContent = currentUser.email;

  return true;
}

// ===== 退出登录 =====
async function logout() {
  await sb.auth.signOut();
  window.location.href = 'index.html';
}

// ===== Toast 提示 =====
function showToast(msg, duration = 2200) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ===== 加载遮罩 =====
function showLoading(show) {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div><span>加载中…</span>';
    document.body.appendChild(overlay);
  }
  overlay.style.display = show ? 'flex' : 'none';
}
