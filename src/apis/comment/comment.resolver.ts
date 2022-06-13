import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { cursorTo } from 'readline';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { CommentService } from './comment.service';
import { CreateCommentInput } from './dto/createComment.input';
import { UpdateCommentInput } from './dto/updateComment.input';
import { Comment } from './entities/comment.entity';
//변경 내용 테스트
@Resolver()
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Query(() => [Comment])
  fetchComments(
    @Args('boardId') boardId: string,
    @Args('pageSize', { nullable: true }) pageSize: number,
    @Args('page', { nullable: true }) page: number,
  ) {
    return this.commentService.findAll({ pageSize, page, boardId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Comment)
  async createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
    @Args('boardId') boardId: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.commentService.create({
      createCommentInput,
      boardId,
      currentUser,
    });
  }

  @Mutation(() => Comment)
  async updateComment(
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
    @Args('commentId') commentId: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.commentService.update({
      updateCommentInput,
      commentId,
      currentUser,
    });
  }

  @Mutation(() => Boolean)
  async deleteComment(
    @Args('commentId') commentId: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return await this.commentService.delete({ currentUser, commentId });
  }
}
