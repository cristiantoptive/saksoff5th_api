import { Service } from "typedi";
import { DeleteResult } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Vendor } from "@app/api/entities/Vendor";
import { User } from "@app/api/entities/User";
import { VendorRepository } from "@app/api/repositories";
import { VendorCommand } from "@app/api/commands";

@Service()
export class VendorService {
  @InjectRepository() private vendorRepository: VendorRepository;

  public all(user?: User, onlyMine?: boolean): Promise<Vendor[]> {
    if (!onlyMine) {
      return this.vendorRepository.find();
    }

    return this.vendorRepository.find({
      where: {
        createdBy: user,
      },
    });
  }

  public find(id: string, user?: User): Promise<Vendor | undefined> {
    if (!user) {
      return this.vendorRepository.findOneOrFail(id);
    }

    return this.vendorRepository.findOneOrFail({
      where: {
        id,
        createdBy: user,
      },
    });
  }

  public async create(command: VendorCommand, user: User): Promise<Vendor> {
    const vendor = this.vendorRepository.create(
      Vendor.fromData({
        name: command.name,
        createdBy: user,
      }),
    );

    return await this.vendorRepository.save(vendor);
  }

  public async update(id: string, command: VendorCommand, user: User): Promise<Vendor> {
    const vendor = await this.find(id, user);

    Vendor.updateData(vendor, {
      name: command.name,
    });

    return this.vendorRepository.save(vendor);
  }

  public async delete(id: string, user: User): Promise<DeleteResult> {
    return this.vendorRepository.delete({
      id,
      createdBy: user,
    });
  }
}
