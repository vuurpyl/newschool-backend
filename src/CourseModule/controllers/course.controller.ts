import {
  Body,
  Controller,
  Delete,
  Get, Headers,
  HttpCode,
  Param,
  Post,
  Put, Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CourseService } from '../service';
import { Constants, NeedRole, RoleGuard } from '../../CommonsModule';
import { CourseDTO, CourseUpdateDTO, NewCourseDTO } from '../dto';
import { CourseMapper } from '../mapper';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiImplicitBody, ApiImplicitParam,
  ApiImplicitQuery,
  ApiOkResponse,
  ApiOperation,
  ApiUseTags,
} from '@nestjs/swagger';
import { RoleEnum } from '../../SecurityModule/enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '../../UserModule/entity';
import { SecurityService } from '../../SecurityModule/service';

@ApiUseTags('Course')
@ApiBearerAuth()
@Controller(`${Constants.API_PREFIX}/${Constants.API_VERSION_1}/${Constants.COURSE_ENDPOINT}`)
export class CourseController {
  constructor(
    private readonly service: CourseService,
    private readonly mapper: CourseMapper,
    private readonly securityService: SecurityService,
  ) {
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ title: 'Get Courses', description: 'Get all Courses' })
  @ApiImplicitQuery({ name: 'enabled', type: Boolean, required: false, description: 'If not passed, get all courses. If passed, get courses that are enabled or disabled depending on the boolean' })
  @ApiOkResponse({ type: CourseDTO, isArray: true, description: 'All Courses' })
  @NeedRole(RoleEnum.ADMIN, RoleEnum.STUDENT)
  @UseGuards(RoleGuard)
  public async getAll(
    @Query('enabled') enabled: boolean,
    @Headers('authorization') authorization: string,
  ): Promise<CourseDTO[]> {
    const { role }: User = this.securityService.getUserFromToken(authorization.split(' ')[1]);
    if (role.name === RoleEnum.STUDENT) enabled = true;
    return this.mapper.toDtoList(await this.service.getAll(enabled));
  }

  @Get('/:id')
  @HttpCode(200)
  @ApiOkResponse({ type: CourseDTO })
  @ApiImplicitParam({ name: 'id', type: String, required: true, description: 'Course id' })
  @ApiOperation({ title: 'Find Course by id', description: 'Find Course by id' })
  @NeedRole(RoleEnum.ADMIN, RoleEnum.STUDENT)
  @UseGuards(RoleGuard)
  public async findById(@Param('id') id: CourseDTO['id']): Promise<CourseDTO> {
    return this.mapper.toDto(await this.service.findById(id));
  }

  @Get('/slug/:slug')
  @HttpCode(200)
  @ApiOkResponse({ type: CourseDTO })
  @ApiImplicitParam({ name: 'slug', type: String, required: true, description: 'Course slug' })
  @ApiOperation({ title: 'Find Course by slug', description: 'Find Course by slug' })
  @NeedRole(RoleEnum.ADMIN, RoleEnum.STUDENT)
  @UseGuards(RoleGuard)
  public async findBySlug(@Param('slug') slug: CourseDTO['slug']): Promise<CourseDTO> {
    return this.mapper.toDto(await this.service.findBySlug(slug));
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  @HttpCode(201)
  @ApiCreatedResponse({ type: CourseDTO, description: 'Course created' })
  @ApiOperation({ title: 'Add course', description: 'Creates a new course' })
  @ApiImplicitBody({ name: 'Course', type: NewCourseDTO })
  @NeedRole(RoleEnum.ADMIN)
  @UseGuards(RoleGuard)
  public async add(@Body() course: NewCourseDTO, @UploadedFile() file): Promise<CourseDTO> {
    return this.mapper.toDto(
      await this.service.add(course, file),
    );
  }

  @Put('/:id')
  @HttpCode(200)
  @ApiOkResponse({ type: CourseDTO })
  @ApiImplicitParam({ name: 'id', type: String, required: true, description: 'Course id' })
  @ApiOperation({ title: 'Update course', description: 'Update course by id' })
  @NeedRole(RoleEnum.ADMIN)
  @UseGuards(RoleGuard)
  public async update(@Param('id') id: CourseDTO['id'], @Body() courseUpdatedInfo: CourseUpdateDTO) {
    return await this.service.update(id, courseUpdatedInfo);
  }

  @Delete('/:id')
  @HttpCode(200)
  @ApiOkResponse({ type: null })
  @ApiImplicitParam({ name: 'id', type: String, required: true, description: 'Course id' })
  @ApiOperation({ title: 'Delete course', description: 'Delete course by id' })
  @NeedRole(RoleEnum.ADMIN)
  @UseGuards(RoleGuard)
  public async delete(@Param('id') id: CourseDTO['id']): Promise<void> {
    await this.service.delete(id);
  }
}
