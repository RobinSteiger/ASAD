import { IsString, IsNumber, Min, Length, IsNotEmpty } from 'class-validator';
export class CreatePlayerDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 20) // Name between 2 and 20 characters
  readonly name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(100, { message: 'You need at least 100 credits to play' })
  readonly amount: number;
}
