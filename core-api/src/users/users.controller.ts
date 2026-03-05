import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Request() req: any) {
        // Le User est injecté dans la requête par Passport grâce au payload du JWT
        const user = await this.usersService.findByEmail(req.user.email);

        if (!user) {
            return null;
        }

        // On retire le password de la réponse
        const { password, ...result } = user;
        return result;
    }
}
