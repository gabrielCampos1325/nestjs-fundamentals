import { registerAs } from '@nestjs/config';

export default registerAs('coffees', () => ({
  defaultCoffee: 'Ristretto',
}));
