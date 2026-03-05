import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PraticiensService } from './praticiens.service';
import { CreatePraticienDto } from './dto/create-praticien.dto';
import { UpdatePraticienDto } from './dto/update-praticien.dto';
import { Praticien } from './entities/praticien.entity';

@ApiTags('Praticiens')
@Controller('praticiens')
export class PraticiensController {
    constructor(private readonly praticiensService: PraticiensService) { }

    @Post()
    create(@Body() createPraticienDto: CreatePraticienDto): Promise<Praticien> {
        return this.praticiensService.create(createPraticienDto);
    }

    @Get()
    findAll(): Promise<Praticien[]> {
        return this.praticiensService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Praticien> {
        return this.praticiensService.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePraticienDto: UpdatePraticienDto,
    ): Promise<Praticien> {
        return this.praticiensService.update(id, updatePraticienDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.praticiensService.remove(id);
    }
}
