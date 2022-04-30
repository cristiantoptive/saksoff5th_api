import { Inject, Service } from "typedi";
import { DeleteResult } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Order } from "@app/api/entities/Order";
import { OrderItem } from "@app/api/entities/OrderItem";
import { User } from "@app/api/entities/User";
import { OrderRepository, OrderItemRepository } from "@app/api/repositories";
import { OrderCommand } from "@app/api/commands";
import { AddressTypes, OrderStatuses } from "@app/api/types";
import { AddressService } from "./AddressService";
import { CardsService } from "./CardsService";
import { ProductsService } from "./ProductsService";

@Service()
export class OrderService {
  @InjectRepository() private orderRepository: OrderRepository;
  @InjectRepository() private orderItemRepository: OrderItemRepository;
  @Inject() private addressesService: AddressService;
  @Inject() private cardsService: CardsService;
  @Inject() private productsService: ProductsService;

  public all(user: User): Promise<Order[]> {
    return this.orderRepository.find({
      where: [
        {
          placedBy: user,
        },
      ],
    });
  }

  public find(id: string, user: User): Promise<Order | undefined> {
    return this.orderRepository.findOneOrFail({
      where: [
        {
          id,
          placedBy: user,
        },
      ],
    });
  }

  public async create(command: OrderCommand, user: User): Promise<Order> {
    const order = Order.fromData({
      status: OrderStatuses.Placed,
      placedBy: user,
      shippingAddress: await this.addressesService.find(command.shippingAddress, user, AddressTypes.Shipping),
      billingAddress: await this.addressesService.find(command.billingAddress, user, AddressTypes.Billing),
      paymentCard: await this.cardsService.find(command.card, user),
    });

    await this.orderRepository.save(order);
    await this.createOrderItems(order, command);

    return order;
  }

  public async update(id: string, command: OrderCommand, user: User): Promise<Order> {
    const order = await this.find(id, user);
    if (order.status !== OrderStatuses.Placed) {
      throw new Error("Only placed orders can be updated");
    }

    Order.updateData(order, {
      shippingAddress: await this.addressesService.find(command.shippingAddress, user, AddressTypes.Shipping),
      billingAddress: await this.addressesService.find(command.billingAddress, user, AddressTypes.Billing),
      paymentCard: await this.cardsService.find(command.card, user),
    });

    await this.orderRepository.save(order);

    await this.orderItemRepository.remove(await order.items);
    await this.createOrderItems(order, command);

    return order;
  }

  public async delete(id: string, user: User): Promise<DeleteResult> {
    const order = await this.find(id, user);
    if (order.status !== OrderStatuses.Placed) {
      return null;
    }

    return this.orderRepository.delete({
      id,
      placedBy: user,
    });
  }

  private async createOrderItems(order: Order, command: OrderCommand) {
    for (const item of command.items) {
      const product = await this.productsService.find(item.product);

      if (product.inventory < item.quantity) {
        throw new Error(`There are not enough inventory for product ${product.title}`);
      }

      if (!product.isActive) {
        throw new Error(`Product ${product.title} is not available anymore`);
      }

      await this.orderItemRepository.save(OrderItem.fromData({
        price: product.price,
        quantity: item.quantity,
        product,
        order,
      }));
    }
  }
}
