import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { User } from '../user/entities/user.entity';
import { UsePointService } from './usePoint.service';

@Resolver()
export class UsePointResolver {
  constructor(private readonly usePointService: UsePointService) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
  usePoint(@CurrentUser() currentUser: ICurrentUser) {
    return this.usePointService.use({ currentUser });
  }
}
