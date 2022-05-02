import { Service } from "typedi";
import { DeleteResult } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Product } from "@app/api/entities/Product";
import { User } from "@app/api/entities/User";
import { ProductRepository } from "@app/api/repositories";
import { ProductCommand } from "@app/api/commands";

@Service()
export class ProductsService {
  @InjectRepository() private productsRepository: ProductRepository;

  public all(user?: User, onlyMine?: boolean): Promise<Product[]> {
    if (!onlyMine) {
      return this.productsRepository.find({
        isActive: true,
      });
    }

    return this.productsRepository.find({
      where: [
        {
          createdBy: user,
        },
      ],
    });
  }

  public find(id: string, user?: User): Promise<Product | undefined> {
    if (!user) {
      return this.productsRepository.findOneOrFail(id);
    }

    return this.productsRepository.findOneOrFail({
      where: [
        {
          id,
          createdBy: user,
        },
      ],
    });
  }

  public async create(command: ProductCommand, user: User): Promise<Product> {
    const product = Product.fromData({
      SKU: command.SKU,
      title: command.title,
      description: command.description,
      price: command.price,
      inventory: command.inventory,
      deliveryTime: command.deliveryTime,
      isActive: command.isActive,
      vendor: command.vendor,
      category: command.category,
      createdBy: user,
    });

    return this.productsRepository.save(product);
  }

  public async update(id: string, command: ProductCommand, user: User): Promise<Product> {
    const product = await this.find(id, user);

    Product.updateData(product, {
      SKU: command.SKU,
      title: command.title,
      description: command.description,
      price: command.price,
      inventory: command.inventory,
      deliveryTime: command.deliveryTime,
      isActive: command.isActive,
      vendor: command.vendor,
      category: command.category,
    });

    return this.productsRepository.save(product);
  }

  public async delete(id: string, user: User): Promise<DeleteResult> {
    return this.productsRepository.delete({
      id,
      createdBy: user,
    });
  }
}
