// src/game/dto/place-bet.dto.ts
import { IsString, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export class PlaceBetDto {
  @IsNotEmpty()
  @IsString()
  readonly userId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(36) // Only numbers on the roulette wheel
  readonly number: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Minimum bet is 1 credit' })
  readonly amount: number;
}
