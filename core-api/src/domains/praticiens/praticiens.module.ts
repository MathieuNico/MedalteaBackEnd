import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PraticiensController } from './praticiens.controller';
import { PraticiensService } from './praticiens.service';
import { Praticien } from './entities/praticien.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Praticien])],
  controllers: [PraticiensController],
  providers: [PraticiensService],
  exports: [PraticiensService],
})
export class PraticiensModule { }
