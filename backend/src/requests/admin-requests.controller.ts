import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { ChangeStatusDto } from './dto/change-status.dto';
import { ListQueryDto } from './dto/list-query.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestsService } from './requests.service';

// guard no controller inteiro: nenhuma rota admin fica sem
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/requests')
export class AdminRequestsController {
  constructor(private readonly requests: RequestsService) {}

  @Get()
  list(@Query() query: ListQueryDto) {
    return this.requests.list(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.requests.findDetail(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateRequestDto,
  ) {
    return this.requests.update(id, dto);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() { status }: ChangeStatusDto,
  ) {
    return this.requests.changeStatus(id, status);
  }
}
