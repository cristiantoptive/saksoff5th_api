import { Service } from "typedi";
import { DeleteResult } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { ProductCategory } from "@app/api/entities/ProductCategory";
import { ProductCategoryRepository } from "@app/api/repositories";
import { ProductCategoryCommand } from "@app/api/commands";

@Service()
export class ProductCategoryService {
  @InjectRepository() private categoryRepository: ProductCategoryRepository;

  public all(): Promise<ProductCategory[]> {
    return this.categoryRepository.find();
  }

  public find(id: string): Promise<ProductCategory | undefined> {
    return this.categoryRepository.findOneOrFail(id);
  }

  public create(command: ProductCategoryCommand): Promise<ProductCategory> {
    const category = ProductCategory.fromData({
      name: command.name,
    });

    return this.categoryRepository.save(category);
  }

  public async update(id: string, command: ProductCategoryCommand): Promise<ProductCategory> {
    const category = await this.find(id);

    ProductCategory.updateData(category, {
      name: command.name,
    });

    return this.categoryRepository.save(category);
  }

  public delete(id: string): Promise<DeleteResult> {
    return this.categoryRepository.delete(id);
  }
}
