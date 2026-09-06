const BaseRepository = require('./BaseRepository');

class CategoryRepository extends BaseRepository {
  constructor() {
    super('product_categories');
  }

  async findAll() {
    const { data, error } = await this.client
      .from(this.table)
      .select('id, name')
      .order('name');

    if (error) throw error;
    return data;
  }
}

module.exports = new CategoryRepository();
