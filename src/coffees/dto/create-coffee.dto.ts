/* CreateCoffeeDto */

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCoffeeDto {
  @ApiProperty({ description: 'The name of a cofee' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'The description of a cofee' })
  @IsString()
  readonly brand: string;

  @ApiProperty({
    description: 'The array of flavors of a cofee',
    example: ['vanila', 'chocolate', 'caramel'],
  })
  @IsString({ each: true })
  readonly flavors: string[];
}
