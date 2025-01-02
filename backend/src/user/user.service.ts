import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';


@Injectable()
export class UserService {
    private readonly users: User[] = [
        {
            id: '1',
            name: 'John',
            password: 'password',
        },
        {
            id: '2',
            name: 'John Doe',
            password: 'password',
        },
    ];

    findAll(): User[] {
        return this.users;
    }

    findOne(id: string): User {
        return this.users.find(user => user.id === id);
    }
}
