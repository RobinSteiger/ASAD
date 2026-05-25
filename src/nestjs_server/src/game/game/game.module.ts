import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { JsonUserRepository } from '../repository/json_user.repository';

@Module({
  providers: [GameService, GameGateway,  JsonUserRepository],
  exports: [GameService],
})
export class GameModule {}
