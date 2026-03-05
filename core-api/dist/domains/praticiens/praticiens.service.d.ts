import { Repository } from 'typeorm';
import { Praticien } from './entities/praticien.entity';
import { CreatePraticienDto } from './dto/create-praticien.dto';
import { UpdatePraticienDto } from './dto/update-praticien.dto';
export declare class PraticiensService {
    private readonly praticiensRepository;
    constructor(praticiensRepository: Repository<Praticien>);
    create(createPraticienDto: CreatePraticienDto): Promise<Praticien>;
    findAll(): Promise<Praticien[]>;
    findOne(id: number): Promise<Praticien>;
    update(id: number, updatePraticienDto: UpdatePraticienDto): Promise<Praticien>;
    remove(id: number): Promise<void>;
}
