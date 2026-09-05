const sizeRepo = require('../repositories/SizeRepository');

class SizeService {
  async getAll() {
    return sizeRepo.findAll();
  }

  async getById(id) {
    const size = await sizeRepo.findById(id);
    if (!size) {
      const err = new Error('Tamaño no encontrado');
      err.status = 404;
      throw err;
    }
    return size;
  }

  async create({ name }) {
    if (!name || name.trim() === '') {
      const err = new Error('El nombre es requerido');
      err.status = 400;
      throw err;
    }
    return sizeRepo.create({ name: name.trim() });
  }

  async update(id, { name }) {
    if (!name || name.trim() === '') {
      const err = new Error('El nombre es requerido');
      err.status = 400;
      throw err;
    }
    await this.getById(id);
    return sizeRepo.update(id, { name: name.trim() });
  }

  async delete(id) {
    await this.getById(id);
    return sizeRepo.delete(id);
  }
}

module.exports = new SizeService();
