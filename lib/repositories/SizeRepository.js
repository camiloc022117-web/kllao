const BaseRepository = require('./BaseRepository');

class SizeRepository extends BaseRepository {
  constructor() {
    super('product_sizes');
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

module.exports = new SizeRepository();
