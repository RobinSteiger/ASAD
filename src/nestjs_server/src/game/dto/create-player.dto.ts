import { IsString, IsNumber, Min, Length, IsNotEmpty } from 'class-validator';
export class CreatePlayerDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 20) // Name between 2 and 20 characters
  readonly name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1000, { message: 'You need at least 1000 credits to play' })
  readonly amount: number;
}
