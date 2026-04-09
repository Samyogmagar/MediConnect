import HospitalSettings from '../models/HospitalSettings.model.js';

class SettingsService {
  async getSettings() {
    let settings = await HospitalSettings.findOne();
    if (!settings) {
      settings = await HospitalSettings.create({});
    }
    return settings;
  }

  async updateSettings(payload, adminId) {
    const settings = await this.getSettings();

    const fields = [
      'hospitalName',
      'tagline',
      'contactEmail',
      'contactPhone',
      'timezone',
      'address',
      'departments',
      'testCategories',
      'defaultConsultationFee',
      'defaultConsultationDurationMinutes',
    ];

    fields.forEach((field) => {
      if (payload[field] !== undefined) {
        settings[field] = payload[field];
      }
    });

    settings.updatedBy = adminId;
    await settings.save();
    return settings;
  }
}

export default new SettingsService();
