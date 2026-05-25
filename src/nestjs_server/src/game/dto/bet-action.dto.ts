import { IsString, IsNumber, Min, Max, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import type { BoardType } from '../game/game.interface';

export type BetActionType = 'place' | 'update' | 'delete';

export class BetActionDto {
    @IsNotEmpty()
    @IsString()
    readonly userId!: string;

    @IsNotEmpty()
    @IsIn(['european', 'mini'])
    readonly boardType!: BoardType;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(36)
    readonly number!: number;

    // Amount can be empty when the action is delete
    @IsOptional()
    @IsNumber()
    @Min(1, { message: 'Minimum bet is 1 credit' })
    readonly amount?: number;

    // Only these actions are accepted
    @IsNotEmpty()
    @IsIn(['place', 'update', 'delete'])
    readonly action!: BetActionType;
}