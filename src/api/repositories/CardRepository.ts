import { EntityRepository, Repository } from "typeorm";
import { Service } from "typedi";
import { Card } from "@app/api/entities/Card";

@Service()
@EntityRepository(Card)
export class CardRepository extends Repository<Card> {
}
