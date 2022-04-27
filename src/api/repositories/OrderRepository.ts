import { EntityRepository, Repository } from "typeorm";
import { Service } from "typedi";
import { Order } from "@app/api/entities/Order";

@Service()
@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {
}
