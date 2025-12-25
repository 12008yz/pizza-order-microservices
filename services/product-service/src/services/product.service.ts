import { Product } from '../models/Product';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

export class ProductService {
  async getAllProducts(category?: string, availableOnly: boolean = true, ids?: number[]) {
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (availableOnly) {
      where.isAvailable = true;
    }

    if (ids && ids.length > 0) {
      where.id = {
        [Op.in]: ids,
      };
    }

    return await Product.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async getProductById(id: number) {
    const product = await Product.findByPk(id);
    if (!product) {
      const error = new Error('Product not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async getProductsByIds(ids: number[]) {
    return await Product.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
        isAvailable: true,
      },
    });
  }

  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    category: 'pizza' | 'drink' | 'side';
    imageUrl?: string;
  }) {
    return await Product.create(data);
  }

  async updateProduct(id: number, data: Partial<Product>) {
    const product = await this.getProductById(id);
    await product.update(data);
    return product;
  }

  async deleteProduct(id: number) {
    const product = await this.getProductById(id);
    await product.destroy();
    return { message: 'Product deleted successfully' };
  }
}

