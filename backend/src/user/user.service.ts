import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly user: User[] = [
    {
      id: '1',
      name: 'John Doe',
      passwordHash: 'password',
    },
    {
      id: '2',
      name: 'Rolf Assfalg',
      passwordHash: 'password',
    },
  ];

  findAll(): User[] {
    return this.user;
  }

  findOne(id: string): User {
    return this.user.find(user => user.id === id);
  }
}
