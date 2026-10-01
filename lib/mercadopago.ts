import { MercadoPagoConfig, Preference, Payment, PaymentRefund } from 'mercadopago';

// Inicializar cliente Mercado Pago con ACCESS_TOKEN del servidor
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
  options: { timeout: 10000 },
});

export interface CreatePreferenceParams {
  compraId: string;
  premio: string;
  cantidad: number;
  precioUnitario: number;
  nombreCompleto: string;
  telefono: string;
  tokenAcceso: string;
}

export async function createMercadoPagoPreference(params: CreatePreferenceParams) {
  const {
    compraId,
    premio,
    cantidad,
    precioUnitario,
    nombreCompleto,
    telefono,
    tokenAcceso,
  } = params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const returnUrl = `${siteUrl}/dinamica/mis-numeros/${tokenAcceso}`;
  const webhookUrl = `${siteUrl}/api/mp/webhook`;

  // Si no hay token de MP configurado, retornamos URL de fallback para pruebas locales
  if (!process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN.startsWith('TEST-your')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Mercado Pago no está configurado para producción.');
    }
    console.warn('[MercadoPago] MP_ACCESS_TOKEN no configurado o usando valor por defecto. Modo simulado.');
    return {
      id: `pref-mock-${compraId}`,
      init_point: `${returnUrl}?status=approved&collection_id=mock-${Date.now()}&payment_id=mock-pay-${Date.now()}`,
      sandbox_init_point: `${returnUrl}?status=approved&collection_id=mock-${Date.now()}&payment_id=mock-pay-${Date.now()}`,
    };
  }

  const preference = new Preference(client);

  const response = await preference.create({
    body: {
      items: [
        {
          id: compraId,
          title: `Dinámica Adonai: ${premio}`,
          description: `${cantidad} número(s) para la dinámica ${premio}`,
          quantity: cantidad,
          unit_price: Number(precioUnitario),
          currency_id: 'ARS',
        },
      ],
      payer: {
        name: nombreCompleto,
        phone: {
          number: telefono.replace(/\D/g, ''),
        },
      },
      external_reference: compraId,
      back_urls: {
        success: returnUrl,
        pending: returnUrl,
        failure: returnUrl,
      },
      auto_return: 'approved',
      notification_url: webhookUrl,
      // RN-09: Excluir medios de acreditación diferida (efectivo, rapipago, etc.)
      payment_methods: {
        excluded_payment_types: [
          { id: 'ticket' }, // Rapipago, Pago Fácil, etc.
          { id: 'atm' },    // Cajeros automáticos
        ],
        installments: 1, // Pago único (RN de presupuesto)
      },
      metadata: {
        compra_id: compraId,
        token_acceso: tokenAcceso,
      },
    },
  });

  return {
    id: response.id!,
    init_point: response.init_point!,
    sandbox_init_point: response.sandbox_init_point || response.init_point!,
  };
}

export async function getMercadoPagoPayment(paymentId: string | number) {
  if (!process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN.startsWith('TEST-your')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Mercado Pago no está configurado para producción.');
    }
    // Modo simulación local
    return {
      id: paymentId,
      status: 'approved',
      transaction_amount: 0,
      external_reference: '',
      status_detail: 'accredited',
    };
  }

  const payment = new Payment(client);
  return await payment.get({ id: paymentId });
}

export async function refundMercadoPagoPayment(paymentId: string | number) {
  if (!process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN.startsWith('TEST-your')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Mercado Pago no está configurado para producción.');
    }
    console.warn('[MercadoPago] Reembolso simulado para:', paymentId);
    return { status: 'refunded' };
  }

  const refund = new PaymentRefund(client);
  return await refund.create({ payment_id: paymentId });
}
