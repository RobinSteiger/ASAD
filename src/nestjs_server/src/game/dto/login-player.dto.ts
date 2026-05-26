import { IsString, Length, IsNotEmpty } from 'class-validator';
export class LoginPlayerDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 20) // Name between 2 and 20 characters
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 50)
  readonly password: string;
}
