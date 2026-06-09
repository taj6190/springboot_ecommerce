const axios = require('e:/springboot_ecommerce/frontend-admin/node_modules/axios');

const API_BASE = 'http://localhost:8080/api';
const ADMIN_EMAIL = 'admin@bdecommerce.com';
const ADMIN_PASSWORD = 'Admin@123';

async function testApi() {
  let token = '';
  let authHeader = {};

  console.log('🚀 Starting FULL Backend API Test Suite');

  // --- 1. AUTH ---
  try {
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    token = loginRes.data.data.accessToken;
    authHeader = { headers: { Authorization: `Bearer ${token}` } };
    console.log('✅ Auth: Login successful');
  } catch (err) {
    console.error('❌ Auth: Login failed', err.response?.data || err.message);
    return;
  }

  // --- 2. CATEGORIES (Full CRUD) ---
  let categoryId = '';
  try {
    // Create
    const createRes = await axios.post(`${API_BASE}/admin/categories`, {
      nameEn: 'Full CRUD Category',
      nameBn: 'পূর্ণ ক্রাড ক্যাটাগরি',
      active: true,
      displayOrder: 10
    }, authHeader);
    categoryId = createRes.data.data.id;
    console.log('✅ Categories: Create successful');

    // Update
    await axios.put(`${API_BASE}/admin/categories/${categoryId}`, {
      nameEn: 'Updated CRUD Category',
      active: true,
      displayOrder: 11
    }, authHeader);
    console.log('✅ Categories: Update successful');

    // GET
    await axios.get(`${API_BASE}/admin/categories/${categoryId}`, authHeader);
    console.log('✅ Categories: GET by ID successful');
  } catch (err) {
    console.error('❌ Categories: CRUD failed', err.response?.data || err.message);
  }

  // --- 3. BRANDS (Full CRUD) ---
  let brandId = '';
  try {
    // Create
    const createRes = await axios.post(`${API_BASE}/admin/brands`, {
      nameEn: 'Full CRUD Brand',
      active: true
    }, authHeader);
    brandId = createRes.data.data.id;
    console.log('✅ Brands: Create successful');

    // Update
    await axios.put(`${API_BASE}/admin/brands/${brandId}`, {
      nameEn: 'Updated CRUD Brand',
      active: true
    }, authHeader);
    console.log('✅ Brands: Update successful');
  } catch (err) {
    console.error('❌ Brands: CRUD failed', err.response?.data || err.message);
  }

  // --- 4. PRODUCTS (Full CRUD) ---
  let productId = '';
  try {
    const randomSuffix = Math.floor(Math.random() * 10000);
    // Create
    const createRes = await axios.post(`${API_BASE}/admin/products`, {
      nameEn: 'CRUD Test Product ' + randomSuffix,
      sku: 'CRUD-TEST-' + randomSuffix,
      mainPrice: 500,
      stockQuantity: 100,
      categoryId: categoryId,
      brandId: brandId,
      status: 'PUBLISHED'
    }, authHeader);
    productId = createRes.data.data.id;
    console.log('✅ Products: Create successful');

    // Update
    await axios.put(`${API_BASE}/admin/products/${productId}`, {
      nameEn: 'Updated CRUD Test Product ' + randomSuffix,
      sku: 'CRUD-TEST-' + randomSuffix,
      mainPrice: 550,
      stockQuantity: 100,
      status: 'PUBLISHED'
    }, authHeader);
    console.log('✅ Products: Update successful');

    // GET
    await axios.get(`${API_BASE}/admin/products/${productId}`, authHeader);
    console.log('✅ Products: GET by ID successful');
  } catch (err) {
    console.error('❌ Products: CRUD failed', err.response?.data || err.message);
  }

  // --- 5. COUPONS (Full CRUD) ---
  let couponId = '';
  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const randomSuffix = Math.floor(Math.random() * 10000);

    // Create
    const createRes = await axios.post(`${API_BASE}/admin/coupons`, {
      code: 'CRUD_TEST_' + randomSuffix,
      type: 'FIXED',
      value: 50,
      minOrderAmount: 100,
      usageLimit: 10,
      active: true,
      startDate: now.toISOString(),
      endDate: nextWeek.toISOString()
    }, authHeader);
    couponId = createRes.data.data.id;
    console.log('✅ Coupons: Create successful');

    // Update
    await axios.put(`${API_BASE}/admin/coupons/${couponId}`, {
      code: 'CRUD_TEST_UPDATED_' + randomSuffix,
      type: 'FIXED',
      value: 60,
      active: true
    }, authHeader);
    console.log('✅ Coupons: Update successful');
  } catch (err) {
    console.error('❌ Coupons: CRUD failed', err.response?.data || err.message);
  }

  // --- 6. SLIDERS (Full CRUD) ---
  let sliderId = '';
  try {
    // Create
    const createRes = await axios.post(`${API_BASE}/admin/sliders`, {
      titleEn: 'CRUD Slider',
      imageUrl: 'http://example.com/image.jpg',
      active: true,
      displayOrder: 1
    }, authHeader);
    sliderId = createRes.data.data.id;
    console.log('✅ Sliders: Create successful');

    // Update
    await axios.put(`${API_BASE}/admin/sliders/${sliderId}`, {
      titleEn: 'Updated CRUD Slider',
      imageUrl: 'http://example.com/image_updated.jpg',
      active: true
    }, authHeader);
    console.log('✅ Sliders: Update successful');
  } catch (err) {
    console.error('❌ Sliders: CRUD failed', err.response?.data || err.message);
  }

  // --- 7. CLEANUP (DELETIONS) ---
  console.log('🧹 Starting Cleanup (Deletions)...');
  try {
    if (sliderId) {
      await axios.delete(`${API_BASE}/admin/sliders/${sliderId}`, authHeader);
      console.log('✅ Sliders: Delete successful');
    }

    if (couponId) {
      await axios.delete(`${API_BASE}/admin/coupons/${couponId}`, authHeader);
      console.log('✅ Coupons: Delete successful');
    }

    if (productId) {
      await axios.delete(`${API_BASE}/admin/products/${productId}`, authHeader);
      console.log('✅ Products: Delete successful');
    }

    if (brandId) {
      await axios.delete(`${API_BASE}/admin/brands/${brandId}`, authHeader);
      console.log('✅ Brands: Delete successful');
    }

    if (categoryId) {
      await axios.delete(`${API_BASE}/admin/categories/${categoryId}`, authHeader);
      console.log('✅ Categories: Delete successful');
    }
  } catch (err) {
    console.error('❌ Cleanup: One or more deletions failed', err.response?.data || err.message);
    if (err.response) console.log('Cleanup error details:', JSON.stringify(err.response.data, null, 2));
  }

  // --- 8. REPORTS & DASHBOARD ---
  try {
    await axios.get(`${API_BASE}/admin/reports/dashboard`, authHeader);
    console.log('✅ Reports: GET dashboard successful');
    
    await axios.get(`${API_BASE}/admin/reports/revenue?period=weekly`, authHeader);
    console.log('✅ Reports: GET revenue successful');

    await axios.get(`${API_BASE}/admin/reports/top-products`, authHeader);
    console.log('✅ Reports: GET top products successful');
  } catch (err) {
    console.error('❌ Reports: Test failed', err.response?.data || err.message);
  }

  console.log('🏁 FULL Backend API Test Suite Completed');
}

testApi();
