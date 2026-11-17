import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { PermissionsGuard, RequirePermission } from '../auth/guard/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  directPermissions?: string[];
}

class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  roleId?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  directPermissions?: string[];

  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string;
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('users:manage')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('permissions')
  getPermissionsCatalog() {
    return this.usersService.getPermissionsCatalog();
  }

  @Get('roles')
  listRoles() {
    return this.usersService.listRoles();
  }

  @Get()
  listUsers() {
    return this.usersService.listUsers();
  }

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }
}
