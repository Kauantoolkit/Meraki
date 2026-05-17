import { UserType } from '../../domain/enums/user-type.enum';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  specialistId?: string;
  companyId?: string;
  createdAt: Date;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}
