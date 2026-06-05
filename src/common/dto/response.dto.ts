import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponse<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;

  constructor(message: string, data: T) {
    this.success = true;
    this.message = message.endsWith('successful') ? message : `${message} successful`;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

export class ErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'BAD_REQUEST' })
  code: string;

  @ApiProperty({ example: 'An error occurred' })
  message: string;

  @ApiProperty({ required: false, example: null })
  details?: Record<string, any> | any[];

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;

  constructor(code: string, message: string, details?: Record<string, any> | any[]) {
    this.success = false;
    this.code = code;
    this.message = message;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError {
  field: string;
  rule: string;
  message: string;

  constructor(field: string, rule: string, message: string) {
    this.field = field;
    this.rule = rule;
    this.message = message;
  }
}
