const supabase = require('../config/supabase');
const BaseRepository = require('./BaseRepository');

class StockEntryRepository extends BaseRepository {
  constructor() {
    super('stock_entries');
  }

  async findAll() {
    const { data, error } = await supabase
      .from(this.table)
      .select('id, date, payment_method, total')
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.table)
      .select('id, date, payment_method, total')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    const details = await this.getDetails(id);
    return { ...data, items: details };
  }

  async getDetails(entryId) {
    const { data, error } = await supabase
      .from('stock_entry_details')
      .select('id, product_id, quantity, cost_price, subtotal, products(name)')
      .eq('stock_entry_id', entryId);

    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      product_id: d.product_id,
      quantity: d.quantity,
      cost_price: d.cost_price,
      subtotal: d.subtotal,
      product_name: d.products?.name
    }));
  }

  async createWithItems(entry, items) {
    const { data: entryData, error: entryError } = await supabase
      .from(this.table)
      .insert(entry)
      .select()
      .single();

    if (entryError) throw entryError;

    const entryDetails = items.map(item => ({
      stock_entry_id: entryData.id,
      ...item
    }));

    const { error: detailsError } = await supabase
      .from('stock_entry_details')
      .insert(entryDetails);

    if (detailsError) throw detailsError;

    return entryData;
  }
}

module.exports = new StockEntryRepository();
