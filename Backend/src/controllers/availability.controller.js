import availabilityService from '../services/availability.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

class AvailabilityController {
  async getMyAvailability(req, res) {
    try {
      const availability = await availabilityService.getAvailability(req.user.userId);
      return successResponse(res, 200, 'Availability retrieved', { availability });
    } catch (error) {
      console.error('Get my availability error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || 'Failed to retrieve availability');
    }
  }

  async updateMyAvailability(req, res) {
    try {
      const availability = await availabilityService.updateAvailability(req.user.userId, req.body);
      return successResponse(res, 200, 'Availability updated', { availability });
    } catch (error) {
      console.error('Update availability error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || 'Failed to update availability');
    }
  }

  async getDoctorAvailability(req, res) {
    try {
      const availability = await availabilityService.getAvailability(req.params.doctorId);
      return successResponse(res, 200, 'Availability retrieved', { availability });
    } catch (error) {
      console.error('Get doctor availability error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || 'Failed to retrieve availability');
    }
  }

  async getDoctorSlots(req, res) {
    try {
      const { date } = req.query;
      if (!date) {
        return errorResponse(res, 400, 'Date is required');
      }

      const result = await availabilityService.getSlotsForDate(req.params.doctorId, date);
      return successResponse(res, 200, 'Slots retrieved', result);
    } catch (error) {
      console.error('Get doctor slots error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || 'Failed to retrieve slots');
    }
  }

  async updateDoctorAvailability(req, res) {
    try {
      const availability = await availabilityService.updateAvailability(req.params.doctorId, req.body);
      return successResponse(res, 200, 'Availability updated', { availability });
    } catch (error) {
      console.error('Update doctor availability error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || 'Failed to update availability');
    }
  }
}

export default new AvailabilityController();
