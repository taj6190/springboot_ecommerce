const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'e:/springboot_ecommerce/frontend-client/.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkProducts() {
  const { data, count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  
  console.log('Total products in database:', count);
  if (data.length > 0) {
    console.log('First 5 products:', data.slice(0, 5).map(p => ({ id: p.id, name: p.name_en, status: p.status })));
  }
}

checkProducts();
