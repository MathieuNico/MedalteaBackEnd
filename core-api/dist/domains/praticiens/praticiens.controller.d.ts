import { PraticiensService } from './praticiens.service';
import { CreatePraticienDto } from './dto/create-praticien.dto';
import { UpdatePraticienDto } from './dto/update-praticien.dto';
import { Praticien } from './entities/praticien.entity';
export declare class PraticiensController {
    private readonly praticiensService;
    constructor(praticiensService: PraticiensService);
    create(createPraticienDto: CreatePraticienDto): Promise<Praticien>;
    findAll(): Promise<Praticien[]>;
    findOne(id: number): Promise<Praticien>;
    update(id: number, updatePraticienDto: UpdatePraticienDto): Promise<Praticien>;
    remove(id: number): Promise<void>;
}
