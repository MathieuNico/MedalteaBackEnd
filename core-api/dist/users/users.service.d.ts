import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class UsersService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    findByEmail(mail: string): Promise<User | null>;
    create(userData: Partial<User>): Promise<Partial<User> & User>;
}
