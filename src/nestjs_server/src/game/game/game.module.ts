import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { InMemoryUserRepository } from '../repository/in_memory_user.repository';

@Module({
  providers: [GameService, GameGateway, InMemoryUserRepository],
  exports: [GameService],
})
export class GameModule {}
