import {
  MessageBody,
  SubscribeMessage,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameService } from './game.service';
import { GAME_EVENTS } from './game.events';
import { CreatePlayerDto } from '../dto/create-player.dto';
import { BetActionDto } from '../dto/bet-action.dto';

@WebSocketGateway({
  cors: { origin: '*' }, // Allow Angular to connect
})
export class GameGateway implements OnGatewayInit {
  @WebSocketServer() server!: Server;

  constructor(private readonly gameService: GameService) {}

  //  Give the server to the service when the app starts
  afterInit(server: Server) {
    this.gameService.socketServer = server;
    // Start the timer loop when server starts
    this.gameService.startGameLoop();
  }
  // Register a new player
  @SubscribeMessage(GAME_EVENTS.REGISTER)
  handleRegister(@MessageBody() data: CreatePlayerDto) {
    return this.gameService.handleRegister(data);
  }
  // Handle bet action
  @SubscribeMessage(GAME_EVENTS.BET_ACTION)
  handleBetAction(@MessageBody() data: BetActionDto) {
    return this.gameService.handleBetAction(data);
  }
  // Spin the wheel
  @SubscribeMessage(GAME_EVENTS.SPIN)
  handleSpin() {
    return this.gameService.handleSpinAction();
  }

  // Handle board change requests
  @SubscribeMessage(GAME_EVENTS.CHANGE_BOARD)
  handleChangeBoard(@MessageBody() data: { type: 'european' | 'mini' }) {
    return this.gameService.changeBoard(data.type);
  }
}
