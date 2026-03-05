import { IsString, IsInt, IsOptional, MaxLength, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePraticienDto {
    @ApiPropertyOptional({ example: 'Dupont', description: 'Nom de famille du praticien' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    lastName?: string;

    @ApiPropertyOptional({ example: 'Jean', description: 'Prénom du praticien' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    firstName?: string;

    @ApiPropertyOptional({ example: '10 rue de la Paix', description: 'Adresse postale du cabinet' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    address?: string;

    @ApiPropertyOptional({ example: 'France', description: 'Pays d\'exercice' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    country?: string;

    @ApiPropertyOptional({ example: 'jean.dupont@email.com', description: 'Adresse email de contact' })
    @IsEmail()
    @IsOptional()
    @MaxLength(50)
    mail?: string;

    @ApiPropertyOptional({ example: 'Paris', description: 'Ville d\'exercice' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    city?: string;

    @ApiPropertyOptional({ example: 75000, description: 'Code postal' })
    @IsInt()
    @IsOptional()
    postalCode?: number;

    @ApiPropertyOptional({ example: '0612345678', description: 'Numéro de téléphone' })
    @IsString()
    @IsOptional()
    @MaxLength(15)
    phoneNumber?: string;

    @ApiPropertyOptional({ example: 'Lundi-Vendredi 9h-18h', description: 'Horaires généraux' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    schedules?: string;

    @ApiPropertyOptional({ example: 60, description: 'Prix moyen d\'une consultation en euros' })
    @IsInt()
    @IsOptional()
    price?: number;
}
