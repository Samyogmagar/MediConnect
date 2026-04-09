import axios from 'axios';
import env from '../config/env.js';

/**
 * Payment Service
 * Handles third-party payment verification and payment normalization.
 */
class PaymentService {
  _khaltiHeaders() {
    return {
      Authorization: `Key ${env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Initiate Khalti ePayment and return payment URL + pidx.
   */
  async initiateKhaltiPayment({ amount, purchaseOrderId, purchaseOrderName, customerInfo, returnUrl, websiteUrl }) {
    if (!env.KHALTI_SECRET_KEY) {
      throw {
        statusCode: 500,
        message: 'Khalti secret key is not configured on server',
      };
    }

    const amountPaisa = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountPaisa) || amountPaisa <= 0) {
      throw { statusCode: 400, message: 'Invalid payment amount for Khalti' };
    }

    const initiateUrl = `${env.KHALTI_API_BASE_URL}/epayment/initiate/`;

    try {
      const response = await axios.post(
        initiateUrl,
        {
          return_url: returnUrl,
          website_url: websiteUrl,
          amount: amountPaisa,
          purchase_order_id: purchaseOrderId,
          purchase_order_name: purchaseOrderName,
          customer_info: customerInfo,
        },
        {
          headers: this._khaltiHeaders(),
          timeout: 10000,
        }
      );

      const data = response.data || {};
      return {
        pidx: data.pidx,
        paymentUrl: data.payment_url,
        expiresAt: data.expires_at,
        expiresIn: data.expires_in,
        raw: data,
      };
    } catch (error) {
      const status = error.response?.status;
      const rawData = error.response?.data;

      console.error('[Khalti Initiate] Error status:', status);
      console.error('[Khalti Initiate] Error data:', JSON.stringify(rawData));
      console.error('[Khalti Initiate] Error message:', error.message);
      console.error('[Khalti Initiate] Request details:', {
        amount: amountPaisa,
        purchaseOrderId,
        returnUrl,
        websiteUrl,
      });

      // If Khalti returned a non-JSON response (e.g. 503 HTML page)
      if (status === 503 || status === 502 || status === 504) {
        throw {
          statusCode: 503,
          message: 'Khalti payment service is temporarily unavailable. Please try again shortly or use Cash on Delivery.',
        };
      }

      const data = typeof rawData === 'object' && rawData !== null ? rawData : {};
      // Khalti may return errors as: detail, message, errors (object), non_field_errors (array)
      const providerMessage =
        data.detail ||
        data.message ||
        (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) ||
        (data.errors && typeof data.errors === 'object'
          ? Object.values(data.errors).flat()[0]
          : null) ||
        null;

      if (status === 401 || status === 403) {
        throw {
          statusCode: 502,
          message: 'Khalti authentication failed. Please check your Khalti secret key configuration.',
        };
      }

      if (status === 400) {
        throw {
          statusCode: 400,
          message: providerMessage || 'Invalid payment request. Please check the appointment details.',
        };
      }

      throw {
        statusCode: status || 400,
        message: providerMessage || error.message || 'Failed to initiate Khalti payment. Please try again.',
      };
    }
  }

  /**
   * Verify Khalti payment using pidx lookup API.
   * @param {Object} input
   * @param {string} input.pidx - Khalti payment index
   * @param {number} input.amount - Expected amount in NPR
   */
  async verifyKhaltiPayment({ pidx, amount }) {
    if (!pidx) {
      throw { statusCode: 400, message: 'Khalti pidx is required for verification' };
    }

    if (!env.KHALTI_SECRET_KEY) {
      throw {
        statusCode: 500,
        message: 'Khalti secret key is not configured on server',
      };
    }

    const lookupUrl = `${env.KHALTI_API_BASE_URL}/epayment/lookup/`;

    try {
      const response = await axios.post(
        lookupUrl,
        { pidx },
        {
          headers: this._khaltiHeaders(),
          timeout: 10000,
        }
      );

      const data = response.data || {};
      const paymentStatus = String(data.status || '').toLowerCase();
      const isCompleted = paymentStatus === 'completed';

      if (!isCompleted) {
        throw {
          statusCode: 400,
          message: 'Khalti payment is not completed',
        };
      }

      const expectedAmountPaisa = Math.round(Number(amount) * 100);
      const paidAmountPaisa = Number(data.total_amount || 0);

      if (expectedAmountPaisa > 0 && paidAmountPaisa > 0 && expectedAmountPaisa !== paidAmountPaisa) {
        throw {
          statusCode: 400,
          message: 'Khalti paid amount does not match appointment amount',
        };
      }

      return {
        verified: true,
        provider: 'khalti',
        transactionId: data.transaction_id || pidx,
        pidx,
        paidAmountPaisa,
        raw: data,
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }

      const providerMessage = error.response?.data?.detail || error.response?.data?.message;
      throw {
        statusCode: 400,
        message: providerMessage || 'Failed to verify Khalti payment',
      };
    }
  }

  /**
   * Build COD payment object. COD is treated as booking-confirmed payment mode.
   */
  buildCodPayment(amount) {
    return {
      method: 'cod',
      provider: 'cod',
      status: 'completed',
      amount,
      currency: 'NPR',
      transactionId: `COD-${Date.now()}`,
      paidAt: new Date(),
    };
  }
}

export default new PaymentService();
