const BaseRepository = require('./BaseRepository');

class VariantRepository extends BaseRepository {
  constructor() {
    super('product_variants');
  }

  async findAll() {
    const { data, error } = await this.client
      .from(this.table)
      .select('id, product_id, size_id, has_liquor, price, products(name), product_sizes(name)')
      .order('id');

    if (error) throw error;
    return data.map(v => ({
      ...v,
      product_name: v.products?.name,
      size_name: v.product_sizes?.name
    }));
  }

  async findById(id) {
    const { data, error } = await this.client
      .from(this.table)
      .select('id, product_id, size_id, has_liquor, price, products(name), product_sizes(name)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return {
      ...data,
      product_name: data.products?.name,
      size_name: data.product_sizes?.name
    };
  }

  async findUnique(productId, sizeId, hasLiquor) {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('product_id', productId)
      .eq('size_id', sizeId)
      .eq('has_liquor', hasLiquor)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
}

module.exports = new VariantRepository();
