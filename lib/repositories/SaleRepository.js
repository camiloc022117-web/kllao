const supabase = require('../config/supabase');
const BaseRepository = require('./BaseRepository');

class SaleRepository extends BaseRepository {
  constructor() {
    super('sales');
  }

  async findAll() {
    const { data, error } = await supabase
      .from(this.table)
      .select('id, date, time, payment_method, total')
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.table)
      .select('id, date, time, payment_method, total')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    const details = await this.getDetails(id);
    return { ...data, items: details };
  }

  async getDetails(saleId) {
    const { data, error } = await supabase
      .from('sale_details')
      .select('id, product_id, variant_id, quantity, unit_price, subtotal, products(name), product_variants(has_liquor, product_sizes(name))')
      .eq('sale_id', saleId);

    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      product_id: d.product_id,
      variant_id: d.variant_id,
      quantity: d.quantity,
      unit_price: d.unit_price,
      subtotal: d.subtotal,
      product_name: d.products?.name,
      has_liquor: d.product_variants?.has_liquor,
      size_name: d.product_variants?.product_sizes?.name
    }));
  }

  async createWithItems(sale, items) {
    const { data: saleData, error: saleError } = await supabase
      .from(this.table)
      .insert(sale)
      .select()
      .single();

    if (saleError) throw saleError;

    const saleDetails = items.map(item => ({
      sale_id: saleData.id,
      ...item
    }));

    const { error: detailsError } = await supabase
      .from('sale_details')
      .insert(saleDetails);

    if (detailsError) throw detailsError;

    return saleData;
  }

  async findByDateRange(startDate, endDate) {
    const { data: sales, error: salesError } = await supabase
      .from(this.table)
      .select('id, date, time, payment_method, total')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (salesError) throw salesError;

    if (sales.length === 0) return [];

    const saleIds = sales.map(s => s.id);

    const { data: allDetails, error: detailsError } = await supabase
      .from('sale_details')
      .select('id, sale_id, product_id, variant_id, quantity, unit_price, subtotal, products(name), product_variants(has_liquor, product_sizes(name))')
      .in('sale_id', saleIds);

    if (detailsError) throw detailsError;

    const detailsBySale = {};
    for (const d of allDetails) {
      if (!detailsBySale[d.sale_id]) detailsBySale[d.sale_id] = [];
      detailsBySale[d.sale_id].push({
        id: d.id,
        product_id: d.product_id,
        variant_id: d.variant_id,
        quantity: d.quantity,
        unit_price: d.unit_price,
        subtotal: d.subtotal,
        product_name: d.products?.name,
        has_liquor: d.product_variants?.has_liquor,
        size_name: d.product_variants?.product_sizes?.name
      });
    }

    return sales.map(sale => ({
      ...sale,
      items: detailsBySale[sale.id] || []
    }));
  }
}

module.exports = new SaleRepository();
