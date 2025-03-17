import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interfaces/user.interface';

@Injectable()
export class UserService {
    private users: User[] = [
        {
            id: '1',
            name: 'admin',
            email: 'admin@example.com',
            password: '$2b$10$3aQJRT8sN7S.nCz9wAa4ueTVqQJNp2.iJH76rlClTDoe3uhq99Si2', // "password"
            role: 'Admin',
        },
        {
            id: '2',
            name: 'dozent',
            email: 'dozent@example.com',
            password: '$2b$10$3aQJRT8sN7S.nCz9wAa4ueTVqQJNp2.iJH76rlClTDoe3uhq99Si2',
            role: 'Dozent',
        },
        {
            id: '3',
            name: 'student',
            email: 'student@example.com',
            password: '$2b$10$3aQJRT8sN7S.nCz9wAa4ueTVqQJNp2.iJH76rlClTDoe3uhq99Si2',
            role: 'Student',
        },
    ];

    findAll(): User[] {
        return this.users.map(user => {
            const { password, ...result } = user;
            return result as User;
        });
    }

    findOne(id: string): User {
        const user = this.users.find(user => user.id === id);
        if (!user) return null;
        
        const { password, ...result } = user;
        return result as User;
    }
    
    findByUsername(username: string): User {
        return this.users.find(user => user.name === username);
    }
    
    findByEmail(email: string): User {
        return this.users.find(user => user.email === email);
    }
    
    create(createUserDto: CreateUserDto): User {
        const newUser = {
            id: uuidv4(),
            ...createUserDto,
            role: createUserDto.role || 'Student',
            lastLogin: new Date(),
        };
        
        this.users.push(newUser);
        
        const { password, ...result } = newUser;
        return result as User;
    }
    
    update(id: string, updateUserDto: CreateUserDto): User {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) return null;
        
        const updatedUser = {
            ...this.users[userIndex],
            ...updateUserDto,
        };
        
        this.users[userIndex] = updatedUser;
        
        const { password, ...result } = updatedUser;
        return result as User;
    }
    
    delete(id: string): boolean {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) return false;
        
        this.users.splice(userIndex, 1);
        return true;
    }
}