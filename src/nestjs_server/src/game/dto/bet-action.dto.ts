import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export type BetActionType = 'place' | 'update' | 'delete';

export class BetActionDto {
  @IsNotEmpty()
  @IsString()
  readonly userId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(36)
  readonly number!: number;

    // Can be empty in a delete
    @IsNumber()
    @Min(1, { message: 'Minimum bet is 1 credit' })
    readonly amount?: number;
    readonly action!: BetActionType;
}