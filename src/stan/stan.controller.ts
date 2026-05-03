import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { StanService } from './stan.service';
import { UpdateStanDto } from './dto/update-stan.dto';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Stan')
@ApiBearerAuth()
@Controller('stan')
export class StanController {
  constructor(private readonly stanService: StanService) {}

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiOperation({ summary: 'List stan pending (super admin)' })
  findPending() {
    return this.stanService.findPending();
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiOperation({ summary: 'Approve stan' })
  @ApiParam({ name: 'id', example: 1 })
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.stanService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiOperation({ summary: 'Reject stan' })
  @ApiParam({ name: 'id', example: 1 })
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.stanService.reject(id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_stan')
  @ApiOperation({ summary: 'Get profile stan (admin stan)' })
  getProfile(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.stanService.getProfile(req.user.sub);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_stan')
  @ApiOperation({ summary: 'Update profile stan (admin stan)' })
  @ApiBody({ type: UpdateStanDto })
  updateProfile(@Req() req: any, @Body() dto: UpdateStanDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.stanService.updateProfile(req.user.sub, dto);
  }
}
