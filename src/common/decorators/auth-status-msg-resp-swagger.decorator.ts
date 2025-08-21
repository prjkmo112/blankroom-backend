import { applyDecorators, Type } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiProperty, ApiResponse } from "@nestjs/swagger";
import { IsString } from "class-validator";


class StatusResultDto {
  @ApiProperty()
  @IsString()
  message: string;
}

interface AuthStatusMsgRespSwaggerProps {
  successStatusCode?: number;
  summary?: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  bodyType?: string | Function | [Function] | Type<unknown> | undefined;
}

export function AuthStatusMsgRespSwagger(opts: AuthStatusMsgRespSwaggerProps = {}) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    ApiResponse({ status: opts.successStatusCode || 200, type: StatusResultDto }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 409, description: 'User already exists' }),
  ];

  if (opts.summary)
    decorators.push(ApiOperation({ summary: opts.summary }));
  if (opts.bodyType)
    decorators.push(ApiBody({ type: opts.bodyType }));

  return applyDecorators(...decorators);
}