import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UserWithBillParticipationRto } from './rto/user-with-bill-participation.rto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(query?: FindManyOptions<User>): Promise<User[]> {
    return await this.userRepository.find(query);
  }

  async findOne(query: FindOneOptions<User>): Promise<User> {
    const user = await this.userRepository.findOne(query);
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async create(data: Partial<User>): Promise<User> {
    try {
      const user = this.userRepository.create(data);
      return await this.userRepository.save(user);
    } catch (error) {
      if (/already exists/.test(error.detail)) {
        throw new BadRequestException(
          'Account with this username already exists',
        );
      }

      throw new BadRequestException('Malformatted user data');
    }
  }

  calcuteBillParticipation(users: User[]): UserWithBillParticipationRto[] {
    const totalIncome = users.reduce((acc, user) => acc + user.income ?? 0, 0);

    return users.map((user) => ({
      ...user,
      billParticipation: user.income / totalIncome,
    }));
  }
}
