import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { resourceLimits } from 'worker_threads';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { Public } from '../common/decorators/public.decorator';
import { ParseIntPipe } from '../common/pipes/parse-int/parse-int.pipe';
import { ProtocolDecorator } from '../common/decorators/protocol.decorator';
import { ApiForbiddenResponse } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger/dist';

@ApiTags('coffees')
@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Public()
  @Get()
  async findAll(
    @ProtocolDecorator('https') protocol,
    @Query() paginationQuery,
  ) {
    /*await new Promise(() =>
      setTimeout(() => this.coffeesService.findAll(paginationQuery), 4000),
    );*/
    console.log('protocol', protocol);
    return this.coffeesService.findAll(paginationQuery);
  }

  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.coffeesService.findOne(id);
  }

  @Post()
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesService.update(id, updateCoffeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeesService.remove(id);
  }

  @Patch('recommend/:id')
  async recommendCoffee(@Param('id') id: string) {
    const coffeeToRecommend = await this.coffeesService.findOne(id);
    return this.coffeesService.recommendCoffee(coffeeToRecommend);
  }
}
