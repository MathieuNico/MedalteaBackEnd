import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: any) {

    const hash = await bcrypt.hash(dto.password, 10);

    return this.usersService.create({
      ...dto,
      password: hash,
    });
  }

  async login(dto: any) {

    const user = await this.usersService.findByEmail(dto.mail);

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    const payload = {
      sub: user.id_users,
      email: user.mail,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

}