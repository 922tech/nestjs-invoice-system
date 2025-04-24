
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    users: any
    constructor() {
        this.users = [
        {
            userId: 1,
            username: 'root',
            password: '1234',
        },
        {
            userId: 2,
            username: 'maria',
            password: 'guess',
        },
        ];
    }

  async findOne(username) {
    return this.users.find(user => user.username === username);
  }
}
