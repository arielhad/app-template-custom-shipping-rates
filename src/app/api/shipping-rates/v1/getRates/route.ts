import { getShippingAppData } from '@/app/actions/app-data';
import { calculatePrice } from '@/app/utils/shipping-calculator';
import { wixAppClient } from '@/app/utils/wix-sdk.app';
import { shippingRates } from '@wix/ecom/service-plugins';

wixAppClient.shippingRates.provideHandlers({
  async getShippingRates(payload: shippingRates.GetShippingRatesEnvelope) {
    // Having the option to throw an error
    if (!payload) {
      throw new shippingRates.InvalidAddressWixError({});
    }

    const { request, metadata } = payload;

    console.log('Shipping rates - called', { request, metadata });

    const appData = await getShippingAppData({ instanceId: metadata.instanceId! });

    const currency = metadata.currency;

    const validShippingRates = appData.shippingMethods.map(({ code, title, logistics, costs, unitOfMeasure }) => ({
      code,
      title,
      logistics,
      cost: {
        price: `${calculatePrice(request, costs, unitOfMeasure)}`,
        currency: currency!,
      },
    }));

    console.log('found shipping rates:', { shippingRates });

    // The SPI implementation: implement your own shipping rates.
    return {
      shippingRates: validShippingRates,
    };
  },
});

export async function POST(request: Request) {
  console.info('Shipping rates::POST - called');
  return wixAppClient.servicePlugins.processRequest(request);
}
