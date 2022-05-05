import { Service } from "typedi";
import { DeleteResult } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Order } from "@app/api/entities/Order";
import { OrderItem } from "@app/api/entities/OrderItem";
import { User } from "@app/api/entities/User";
import { OrderRepository, OrderItemRepository } from "@app/api/repositories";
import { OrderCommand } from "@app/api/commands";
import { OrderStatuses } from "@app/api/types";

@Service()
export class OrderService {
  @InjectRepository() private orderRepository: OrderRepository;
  @InjectRepository() private orderItemRepository: OrderItemRepository;

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
    const order = this.orderRepository.create(
      Order.fromData({
        status: OrderStatuses.Placed,
        placedBy: user,
        shippingAddress: command.shippingAddress,
        billingAddress: command.billingAddress,
        paymentCard: command.card,
      }),
    );

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
      shippingAddress: command.shippingAddress,
      billingAddress: command.billingAddress,
      paymentCard: command.card,
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

    // remove order items manually (no cascade) to propagate remove event
    await this.orderItemRepository.remove(await order.items);

    return this.orderRepository.delete({
      id,
      placedBy: user,
    });
  }

  private async createOrderItems(order: Order, command: OrderCommand) {
    for (const item of command.items) {
      if (item.product.inventory < item.quantity) {
        throw new Error(`There are not enough inventory for product ${item.product.title}`);
      }

      if (!item.product.isActive) {
        throw new Error(`Product ${item.product.title} is not available anymore`);
      }

      const orderItem = this.orderItemRepository.create(
        OrderItem.fromData({
          product: item.product,
          quantity: item.quantity,
          price: item.product.price * item.quantity,
          order,
        }),
      );

      await this.orderItemRepository.save(orderItem);
    }
  }
}
