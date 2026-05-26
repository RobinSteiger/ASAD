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
//import { CreatePlayerDto } from '../dto/create-player.dto';
//import { BetActionDto } from '../dto/bet-action.dto';
//import {LoginPlayerDto} from "../dto/login-player.dto";

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
  handleRegister(@MessageBody() encryptedData: string) {
    return this.gameService.handleRegister(encryptedData);
  }
  @SubscribeMessage(GAME_EVENTS.LOGIN)
  async handleLogin(
      @MessageBody() encryptedData: string) {
    return this.gameService.handleLogin(encryptedData);
  }
  // Handle bet action
  @SubscribeMessage(GAME_EVENTS.BET_ACTION)
  handleBetAction(@MessageBody() encryptedData: string) {
    return this.gameService.handleBetAction(encryptedData);
  }
  // Spin the wheel
  @SubscribeMessage(GAME_EVENTS.SPIN)
  handleSpin(@MessageBody() encryptedData: string) {
    return this.gameService.handleSpinAction(encryptedData);
  }

  
  // Handle board change requests
  @SubscribeMessage(GAME_EVENTS.CHANGE_BOARD)
  handleChangeBoard(@MessageBody() encryptedData: string) {
    return this.gameService.changeBoard(encryptedData);
  }
    
}
