import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { SignerRole } from '../enums/signer-role.enum';

export class SignContractDto {
  @IsString()
  @IsNotEmpty()
  contractHash: string;

  @IsEnum(SignerRole)
  @IsNotEmpty()
  role: SignerRole;
}
