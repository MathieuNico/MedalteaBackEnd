import { PartialType } from '@nestjs/swagger';
import { CreatePraticienDto } from './create-praticien.dto';

export class UpdatePraticienDto extends PartialType(CreatePraticienDto) { }
