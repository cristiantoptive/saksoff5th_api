import { Service } from "typedi";
import { DeleteResult } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Card } from "@app/api/entities/Card";
import { User } from "@app/api/entities/User";
import { CardRepository } from "@app/api/repositories";
import { CreateCardCommand, UpdateCardCommand } from "@app/api/commands/cards";

@Service()
export class CardsService {
  @InjectRepository() private cardsRepository: CardRepository;

  public all(user: User): Promise<Card[]> {
    return this.cardsRepository.find({
      where: [
        {
          user,
        },
      ],
    });
  }

  public find(id: string, user: User): Promise<Card | undefined> {
    return this.cardsRepository.findOneOrFail({
      where: [
        {
          id,
          user,
        },
      ],
    });
  }

  public create(command: CreateCardCommand, user: User): Promise<Card> {
    const card = Card.fromData({
      user: user,
      name: command.name,
      number: command.number,
      expiresOn: command.expiresOn,
    });

    return this.cardsRepository.save(card);
  }

  public async update(id: string, command: UpdateCardCommand, user: User): Promise<Card> {
    const card = await this.find(id, user);

    Card.updateData(card, {
      name: command.name,
      number: command.number,
      expiresOn: command.expiresOn,
    });

    return this.cardsRepository.save(card);
  }

  public async delete(id: string, user: User): Promise<DeleteResult> {
    return this.cardsRepository.delete({
      id,
      user,
    });
  }
}