import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Email invalide' })
    mail: string;

    @IsString()
    @IsNotEmpty({ message: 'Le mot de passe ne peut pas être vide' })
    @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Le nom est obligatoire' })
    last_name: string;

    @IsString()
    @IsNotEmpty({ message: 'Le prénom est obligatoire' })
    first_name: string;
}
