import { PartialType } from '@nestjs/swagger';
import { CreateCoffeeDto } from './create-coffee.dto';

/* UpdateCoffeeDto */
export class UpdateCoffeeDto extends PartialType(CreateCoffeeDto) {}
