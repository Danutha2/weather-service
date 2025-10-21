import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { WeatherInfoService } from './weather-info.service';
import { WeatherDTO } from '../DTO/weather.dto';

@Controller('weather-info')
export class WeatherInfoController {
  private readonly logger = new Logger(WeatherInfoController.name);

  constructor(private readonly weatherInfoService: WeatherInfoService) {}

  /**
   * GET /weather-info/getInfo?location=CMB&date=2025-10-12
   * Returns weather info for a given location and date
   */
  @Get('getInfo')
  async getWeatherInfo(@Query('location') location: string) {
    try {
      if (!location) {
        throw new BadRequestException('Location is required');
      }

      const result = await this.weatherInfoService.getWeather(location);

      if (!result || (Array.isArray(result) && result.length === 0)) {
        throw new NotFoundException(
          `No weather data found for location: ${location}`,
        );
      }

      this.logger.log(`Successfully fetched weather info for ${location}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get weather info | location=${location}, error=${error.message}`,
        error.stack,
      );

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to fetch weather information. Please try again later.',
      );
    }
  }

  @Post('create')
  async createWeatherInfo(@Body() weatherDTO: WeatherDTO[]) {
    try {
      if (!weatherDTO || weatherDTO.length === 0) {
        throw new BadRequestException('Weather data is required');
      }

      const result = await this.weatherInfoService.createWeatherInfor(
        weatherDTO,
      );

      this.logger.log(`Weather info created successfully`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create weather info | error=${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to create weather information. Please try again later.',
      );
    }
  }

  @Put('change')
  async changeDelayTime(@Query('delayms') delayMs: number) {
    try {
      if (!delayMs || isNaN(delayMs)) {
        throw new BadRequestException('Valid delay (ms) is required');
      }

      const result = await this.weatherInfoService.setDelay(delayMs);

      this.logger.log(`Delay time updated to ${delayMs}ms`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to change delay | delayMs=${delayMs}, error=${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to update delay. Please try again later.',
      );
    }
  }
}
