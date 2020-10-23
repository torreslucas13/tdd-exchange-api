import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CurrenciesService } from '../currencies/currencies.service';
import { ExchangeService } from './exchange.service';
import { ExchangeInputType } from './types/exchange-input.type';

describe('ExchangeService', () => {
  let service: ExchangeService;
  let currenciesService: CurrenciesService;
  let mockData;

  beforeEach(async () => {
    const currenciesServiceMock = {
      getCurrency: jest.fn().mockReturnValue({ value: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeService,
        { provide: CurrenciesService, useFactory: () => currenciesServiceMock },
      ],
    }).compile();

    service = module.get<ExchangeService>(ExchangeService);
    currenciesService = module.get<CurrenciesService>(CurrenciesService);
    mockData = { from: 'USD', to: 'BRL', amount: 1 } as ExchangeInputType;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convertAmount()', () => {
    it('should be throw if called with invalid params', async () => {
      mockData.from = '';
      await expect(service.convertAmount(mockData)).rejects.toThrow(new BadRequestException());
    });

    it('should be not throw if called with valid params', async () => {
      await expect(service.convertAmount(mockData)).resolves.not.toThrow();
    });

    it('should be called getCurrency twice', async () => {
      await service.convertAmount(mockData);
      await expect(currenciesService.getCurrency).toBeCalledTimes(2);
    });

    it('should be called getCurrency called with correct params', async () => {
      await service.convertAmount(mockData);
      await expect(currenciesService.getCurrency).toBeCalledWith('BRL');
      await expect(currenciesService.getCurrency).toHaveBeenCalledWith('USD');
    });

    it('should be throw when getCurrency throw', async () => {
      (currenciesService.getCurrency as jest.Mock).mockRejectedValue(new Error());
      mockData.from = 'INVALID';
      await expect(service.convertAmount(mockData)).rejects.toThrow();
    });

    it('should be throw when getCurrency throw', async () => {
      (currenciesService.getCurrency as jest.Mock).mockResolvedValueOnce({ value: 1 });
      (currenciesService.getCurrency as jest.Mock).mockResolvedValueOnce({ value: 1 });
      expect(await service.convertAmount({ from: 'USD', to: 'USD', amount: 1 })).toEqual({
        amount: 1,
      });

      (currenciesService.getCurrency as jest.Mock).mockResolvedValueOnce({ value: 1 });
      (currenciesService.getCurrency as jest.Mock).mockResolvedValueOnce({ value: 0.2 });
      expect(await service.convertAmount(mockData)).toEqual({
        amount: 5,
      });

      (currenciesService.getCurrency as jest.Mock).mockResolvedValueOnce({ value: 0.2 });
      (currenciesService.getCurrency as jest.Mock).mockResolvedValueOnce({ value: 1 });
      expect(await service.convertAmount({ from: 'BRL', to: 'USD', amount: 1 })).toEqual({
        amount: 0.2,
      });
    });
  });
});
