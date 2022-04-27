import { EntityRepository, Repository } from "typeorm";
import { Service } from "typedi";
import { OrderItem } from "@app/api/entities/OrderItem";

@Service()
@EntityRepository(OrderItem)
export class OrderItemRepository extends Repository<OrderItem> {
}
