import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { ChangeStatusDto } from './dto/change-status.dto';
import { ListQueryDto } from './dto/list-query.dto';
import { UpdateRentalRequestDto } from './dto/update-rental-request.dto';
import { MAX_FILES_PER_REQUEST } from './file-validation';
import { ParseUploadsPipe, ValidatedUpload } from './parse-uploads.pipe';
import { RentalRequestFilesService } from './rental-request-files.service';
import { RentalRequestsService } from './rental-requests.service';
import { ApiFilesUpload, ApiSingleFileUpload } from './upload-docs';

// guard no controller inteiro: nenhuma rota admin fica sem
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/requests')
export class AdminRentalRequestsController {
  constructor(
    private readonly rentalRequests: RentalRequestsService,
    private readonly files: RentalRequestFilesService,
  ) {}

  @Get()
  list(@Query() query: ListQueryDto) {
    return this.rentalRequests.list(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.rentalRequests.findDetail(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateRentalRequestDto,
  ) {
    return this.rentalRequests.update(id, dto);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() { status }: ChangeStatusDto,
  ) {
    return this.rentalRequests.changeStatus(id, status);
  }

  @Post(':id/files')
  @ApiFilesUpload()
  @UseInterceptors(FilesInterceptor('files', MAX_FILES_PER_REQUEST))
  addFiles(
    @Param('id', ParseObjectIdPipe) id: string,
    @UploadedFiles(ParseUploadsPipe) uploads: ValidatedUpload[],
  ) {
    return this.files.add(id, uploads);
  }

  @Put(':id/files/:fileId')
  @ApiSingleFileUpload()
  @UseInterceptors(FileInterceptor('file'))
  replaceFile(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('fileId', ParseObjectIdPipe) fileId: string,
    @UploadedFile(ParseUploadsPipe) [upload]: ValidatedUpload[],
  ) {
    return this.files.replace(id, fileId, upload);
  }

  @Delete(':id/files/:fileId')
  @HttpCode(204)
  removeFile(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('fileId', ParseObjectIdPipe) fileId: string,
  ) {
    return this.files.remove(id, fileId);
  }

  @Get(':id/files/:fileId/url')
  signedUrl(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('fileId', ParseObjectIdPipe) fileId: string,
  ) {
    return this.files.signedUrl(id, fileId);
  }
}
