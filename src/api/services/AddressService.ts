import { Service } from "typedi";
import { DeleteResult } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Address } from "@app/api/entities/Address";
import { User } from "@app/api/entities/User";
import { AddressRepository } from "@app/api/repositories";
import { AddressCommand } from "@app/api/commands";
import { AddressTypes } from "@app/api/types";

@Service()
export class AddressService {
  @InjectRepository() private addressRepository: AddressRepository;

  public all(user: User): Promise<Address[]> {
    return this.addressRepository.find({
      where: {
        user,
      },
    });
  }

  public find(id: string, user: User, type?: AddressTypes): Promise<Address | undefined> {
    return this.addressRepository.findOneOrFail({
      where: {
        id,
        user,
        ...(type ? { type } : { }),
      },
    });
  }

  public create(command: AddressCommand, user: User): Promise<Address> {
    const address = this.addressRepository.create(
      Address.fromData({
        user: user,
        type: command.type,
        firstName: command.firstName,
        lastName: command.lastName,
        line1: command.line1,
        line2: command.line2,
        city: command.city,
        state: command.state,
        zipcode: command.zipcode,
        country: command.country,
      }),
    );

    return this.addressRepository.save(address);
  }

  public async update(id: string, command: AddressCommand, user: User): Promise<Address> {
    const address = await this.find(id, user);

    Address.updateData(address, {
      type: command.type,
      firstName: command.firstName,
      lastName: command.lastName,
      line1: command.line1,
      line2: command.line2,
      city: command.city,
      state: command.state,
      zipcode: command.zipcode,
      country: command.country,
    });

    return this.addressRepository.save(address);
  }

  public async delete(id: string, user: User): Promise<DeleteResult> {
    return this.addressRepository.delete({
      id,
      user,
    });
  }
}
