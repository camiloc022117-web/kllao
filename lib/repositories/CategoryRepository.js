const supabase = require('../config/supabase');
const BaseRepository = require('./BaseRepository');

class CategoryRepository extends BaseRepository {
  constructor() {
    super('product_categories');
  }

  async findAll() {
    const { data, error } = await supabase
      .from(this.table)
      .select('id, name, description')
      .order('name');

    if (error) throw error;
    return data;
  }
}

module.exports = new CategoryRepository();
