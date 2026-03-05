import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(dto: any): Promise<Partial<import("../entities/user.entity").User> & import("../entities/user.entity").User>;
    login(dto: any): Promise<{
        access_token: string;
    }>;
}
