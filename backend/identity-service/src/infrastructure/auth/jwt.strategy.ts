import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
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
    // O objeto retornado fica disponível como req.user em todos os controllers
    return {
      id: payload.sub,
      email: payload.email,
      userType: payload.userType,
      specialistId: payload.specialistId,
      companyId: payload.companyId,
    };
  }
}
