import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ProtocolDecorator = createParamDecorator(
  (defaultValue: string, context: ExecutionContext) => {
    console.log('defaultValue', defaultValue);
    return context.switchToHttp().getRequest().protocol;
  },
);
