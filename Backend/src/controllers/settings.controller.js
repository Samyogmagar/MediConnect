import settingsService from '../services/settings.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

class SettingsController {
  async getSettings(req, res) {
    try {
      const settings = await settingsService.getSettings();
      return successResponse(res, 200, 'Settings retrieved successfully', { settings });
    } catch (error) {
      console.error('Get settings error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || 'Failed to load settings');
    }
  }

  async updateSettings(req, res) {
    try {
      const settings = await settingsService.updateSettings(req.body, req.user.userId);
      return successResponse(res, 200, 'Settings updated successfully', { settings });
    } catch (error) {
      console.error('Update settings error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || 'Failed to update settings');
    }
  }
}

export default new SettingsController();
