import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<Partial<import("../entities/user.entity").User> & import("../entities/user.entity").User>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
}
