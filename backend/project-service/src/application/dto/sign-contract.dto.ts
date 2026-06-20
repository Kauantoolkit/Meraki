import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { SignerRole } from '../../domain/enums/signer-role.enum';

export class SignContractDto {
  @IsString()
  @IsNotEmpty()
  contractHash: string;

  @IsEnum(SignerRole)
  @IsNotEmpty()
  role: SignerRole;

  // Preenchidos pelo controller a partir do request — não vêm do body
  ipAddress?: string;
  userAgent?: string;
}
