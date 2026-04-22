import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  userType: string;
  specialistId?: string;
  companyId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) throw new UnauthorizedException();
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      userType: payload.userType,
      companyId: payload.companyId,
      specialistId: payload.specialistId,
    };
  }
}
