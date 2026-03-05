import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        id_users: number;
        last_name: string;
        first_name: string;
        mail: string;
    } | null>;
}
