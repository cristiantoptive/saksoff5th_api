import { EntityRepository, Repository } from "typeorm";
import { Service } from "typedi";
import { Product } from "@app/api/entities/Product";

@Service()
@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {
}
