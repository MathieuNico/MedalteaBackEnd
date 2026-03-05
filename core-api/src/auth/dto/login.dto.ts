import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Email invalide' })
    mail: string;

    @IsString()
    @IsNotEmpty({ message: 'Le mot de passe ne peut pas être vide' })
    password: string;
}
