import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Praticien } from './entities/praticien.entity';
import { CreatePraticienDto } from './dto/create-praticien.dto';
import { UpdatePraticienDto } from './dto/update-praticien.dto';

@Injectable()
export class PraticiensService {
    constructor(
        @InjectRepository(Praticien)
        private readonly praticiensRepository: Repository<Praticien>,
    ) { }

    create(createPraticienDto: CreatePraticienDto): Promise<Praticien> {
        const newPraticien = this.praticiensRepository.create(createPraticienDto);
        return this.praticiensRepository.save(newPraticien);
    }

    findAll(): Promise<Praticien[]> {
        return this.praticiensRepository.find();
    }

    async findOne(id: number): Promise<Praticien> {
        const praticien = await this.praticiensRepository.findOne({ where: { id } });
        if (!praticien) {
            throw new NotFoundException(`Praticien with ID ${id} not found`);
        }
        return praticien;
    }

    async update(id: number, updatePraticienDto: UpdatePraticienDto): Promise<Praticien> {
        const praticien = await this.findOne(id);
        const updatedPraticien = this.praticiensRepository.merge(praticien, updatePraticienDto);
        return this.praticiensRepository.save(updatedPraticien);
    }

    async remove(id: number): Promise<void> {
        const praticien = await this.findOne(id);
        await this.praticiensRepository.remove(praticien);
    }
}
