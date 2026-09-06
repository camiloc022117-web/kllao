const BaseRepository = require('./BaseRepository');

class ProductRepository extends BaseRepository {
  constructor() {
    super('products');
  }

  async findAll() {
    const { data, error } = await this.client
      .from(this.table)
      .select('id, name, description, base_price, cost_price, current_stock, category_id, product_categories(name)')
      .order('name');

    if (error) throw error;
    return data.map(p => ({
      ...p,
      category_name: p.product_categories?.name
    }));
  }

  async findById(id) {
    const { data, error } = await this.client
      .from(this.table)
      .select('id, name, description, base_price, cost_price, current_stock, category_id, product_categories(name)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return {
      ...data,
      category_name: data.product_categories?.name
    };
  }
}

module.exports = new ProductRepository();
