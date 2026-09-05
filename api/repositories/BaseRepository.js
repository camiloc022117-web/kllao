const supabase = require('../config/supabase');

class BaseRepository {
  constructor(tableName) {
    this.table = tableName;
    this.client = supabase;
  }

  async findAll(orderBy = 'id', ascending = true) {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .order(orderBy, { ascending });

    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async create(record) {
    const { data, error } = await this.client
      .from(this.table)
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await this.client
      .from(this.table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await this.client
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async findBy(filters, orderBy = 'id') {
    let query = this.client.from(this.table).select('*');
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { data, error } = await query.order(orderBy);
    if (error) throw error;
    return data;
  }

  async findWithJoin(joinQuery) {
    const { data, error } = await this.client
      .from(this.table)
      .select(joinQuery)
      .order('id');

    if (error) throw error;
    return data;
  }
}

module.exports = BaseRepository;
