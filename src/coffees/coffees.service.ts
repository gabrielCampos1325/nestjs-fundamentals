import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from '../events/entities/event.entity';
import { DataSource, Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import coffeesConfig from './coffees.config';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly dataSource: DataSource,
    @Inject(coffeesConfig.KEY)
    private coffeesConfiguration: ConfigType<typeof coffeesConfig>,
  ) {
    const defaultCoffee = coffeesConfiguration.defaultCoffee;
    console.log('defaultCoffee', defaultCoffee);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.coffeeRepository.find({
      relations: { flavors: true },
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne({
      where: { id: +id },
      relations: {
        flavors: true,
      },
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const retrievedFlavors = await Promise.all(
      createCoffeeDto.flavors.map((flavorName) =>
        this.preloadFlavorByName(flavorName),
      ),
    );
    console.log('Flavours: ', retrievedFlavors);
    const newCoffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors: retrievedFlavors,
    });

    await this.coffeeRepository.save(newCoffee);
    return newCoffee;
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    console.log('id', id);

    const retrievedFlavors = await Promise.all(
      updateCoffeeDto.flavors.map((flavorName) =>
        this.preloadFlavorByName(flavorName),
      ),
    );
    const coffeeToUpdate = await this.coffeeRepository.preload({
      id: parseInt(id),
      ...updateCoffeeDto,
      flavors: retrievedFlavors,
    });
    if (!coffeeToUpdate) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return this.coffeeRepository.save(coffeeToUpdate);
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name: name },
    });
    if (existingFlavor) {
      return existingFlavor;
    }
    return this.flavorRepository.create({ name });
  }

  /* CoffeesService - recommendCoffee() addition */
  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      coffee.recommendations++;

      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
      return coffee;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
