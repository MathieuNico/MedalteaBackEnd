import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

class LoginResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Utilisateur existe déjà' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Connexion d'un utilisateur" })
  @ApiResponse({ status: 200, description: 'Connexion réussie', type: LoginResponse })
  @ApiResponse({ status: 401, description: 'Identifiants incorrects' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

}