import { createApiClient } from '@lib/api'

export interface CheckoutResponse {
  checkoutUrl: string
}

export async function startCheckout(getToken: () => Promise<string | null>): Promise<CheckoutResponse> {
  const api = createApiClient(getToken)
  return api.post<CheckoutResponse>('/stripe/checkout')
}
