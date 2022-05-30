import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UsePointResolver } from './usePoint.resolver';
import { UsePointService } from './usePoint.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],

  providers: [UsePointResolver, UsePointService],
})
export class UsePointModule {}
