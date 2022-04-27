import { EntityRepository, Repository } from "typeorm";
import { Service } from "typedi";
import { ProductCategory } from "@app/api/entities/ProductCategory";

@Service()
@EntityRepository(ProductCategory)
export class ProductCategoryRepository extends Repository<ProductCategory> {
}
