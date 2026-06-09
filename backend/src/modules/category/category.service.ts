import { CategoryRepository } from './category.repository';
import { AppError } from '../../utils/errors';

export class CategoryService {
  private repository = new CategoryRepository();

  private normalizeName(name: string): string {
    let normalized = name.trim();
    normalized = normalized.replace(/\s+/g, ' ');
    normalized = normalized.split(' ').map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
    return normalized;
  }

  async listCategories(orgId: string) {
    return this.repository.findMany(orgId);
  }

  async createCategory(orgId: string, name: string) {
    const normalizedName = this.normalizeName(name);

    if (!normalizedName) {
      throw new AppError(400, 'Category name is required');
    }

    const existing = await this.repository.findByName(orgId, normalizedName);

    if (existing) {
      if (existing.isActive) {
        throw new AppError(400, 'Category already exists');
      } else {
        // Reactivate soft-deleted category
        return this.repository.updateStatus(existing.id, orgId, true);
      }
    }

    return this.repository.create(orgId, normalizedName);
  }

  async deleteCategory(id: string, orgId: string) {
    try {
      await this.repository.deleteSoft(id, orgId);
    } catch (error) {
      throw new AppError(404, 'Category not found or unauthorized');
    }
  }
}
