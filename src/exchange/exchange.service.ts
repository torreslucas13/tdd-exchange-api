import { BadRequestException, Injectable } from '@nestjs/common';
import { ExchangeInputType } from './types/exchange-input.type';
import { ExchangeType } from './types/exchange.type';

export class CurrenciesService {
  async getCurrency(currency: string): Promise<any> {
    //
  }
}
@Injectable()
export class ExchangeService {
  constructor(private currenciesService: CurrenciesService) {}

  async convertAmount({ from, to, amount }: ExchangeInputType): Promise<ExchangeType> {
    if (!from || !to || !amount) {
      throw new BadRequestException();
    }
    try {
      const currencyFrom = await this.currenciesService.getCurrency(from);
      const currencyTo = await this.currenciesService.getCurrency(to);

      return { amount: (currencyFrom.value / currencyTo.value) * amount };
    } catch (error) {
      throw new Error(error);
    }
  }
}
