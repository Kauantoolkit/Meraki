import { IsString, IsNotEmpty } from 'class-validator';

export class SignContractDto {
  @IsString()
  @IsNotEmpty()
  contractHash: string;
}
