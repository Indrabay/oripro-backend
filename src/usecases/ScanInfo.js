class ScanInfoUsecase {
  constructor(scanInfoRepository) {
    this.scanInfoRepository = scanInfoRepository;
  }

  async createScanInfo(data, ctx) {
    try {
      ctx.log?.info(data, "ScanInfoUsecase.createScanInfo");
      const scanInfo = await this.scanInfoRepository.create(data, ctx);
      return scanInfo;
    } catch (error) {
      ctx.log?.error(
        { data, error: error.message },
        "ScanInfoUsecase.createScanInfo_error"
      );
      throw error;
    }
  }

  async getScanInfo(id, ctx) {
    try {
      ctx.log?.info({ id }, "ScanInfoUsecase.getScanInfo");
      const scanInfo = await this.scanInfoRepository.findById(id, ctx);
      return scanInfo;
    } catch (error) {
      ctx.log?.error(
        { id, error: error.message },
        "ScanInfoUsecase.getScanInfo_error"
      );
      throw error;
    }
  }

  async getScanInfosByScanCode(scanCode, ctx) {
    try {
      ctx.log?.info({ scanCode }, "ScanInfoUsecase.getScanInfosByScanCode");
      const scanInfos = await this.scanInfoRepository.findByScanCode(scanCode, ctx);
      return scanInfos;
    } catch (error) {
      ctx.log?.error(
        { scanCode, error: error.message },
        "ScanInfoUsecase.getScanInfosByScanCode_error"
      );
      throw error;
    }
  }

  async listScanInfos(queryParams, ctx) {
    try {
      ctx.log?.info(queryParams, "ScanInfoUsecase.listScanInfos");
      const result = await this.scanInfoRepository.listAll(queryParams, ctx);
      return result;
    } catch (error) {
      ctx.log?.error(
        { queryParams, error: error.message },
        "ScanInfoUsecase.listScanInfos_error"
      );
      throw error;
    }
  }

  async updateScanInfo(id, data, ctx) {
    try {
      ctx.log?.info({ id, data }, "ScanInfoUsecase.updateScanInfo");
      const scanInfo = await this.scanInfoRepository.findById(id, ctx);
      if (!scanInfo) {
        return null;
      }
      
      const updateData = {};
      if (data.scan_code !== undefined) updateData.scan_code = data.scan_code;
      if (data.latitude !== undefined) updateData.latitude = data.latitude;
      if (data.longitude !== undefined) updateData.longitude = data.longitude;
      if (data.asset_id !== undefined) updateData.asset_id = data.asset_id;

      const updatedScanInfo = await this.scanInfoRepository.update(id, updateData, ctx);
      return updatedScanInfo;
    } catch (error) {
      ctx.log?.error(
        { id, data, error: error.message },
        "ScanInfoUsecase.updateScanInfo_error"
      );
      throw error;
    }
  }

  async deleteScanInfo(id, ctx) {
    try {
      ctx.log?.info({ id }, "ScanInfoUsecase.deleteScanInfo");
      const scanInfo = await this.scanInfoRepository.findById(id, ctx);
      if (!scanInfo) {
        return null;
      }
      await this.scanInfoRepository.delete(id, ctx);
      return true;
    } catch (error) {
      ctx.log?.error(
        { id, error: error.message },
        "ScanInfoUsecase.deleteScanInfo_error"
      );
      throw error;
    }
  }

  async generateQRCode(id, ctx) {
    try {
      ctx.log?.info({ id }, "ScanInfoUsecase.generateQRCode");
      const scanInfo = await this.scanInfoRepository.findById(id, ctx);
      if (!scanInfo) {
        return null;
      }

      const QRCode = require('qrcode');
      
      // Convert to plain JSON to avoid circular references
      const scanInfoJson = scanInfo.toJSON ? scanInfo.toJSON() : scanInfo;
      
      // Get scan_code from scanInfo
      const scanCode = scanInfoJson.scan_code || scanInfoJson.scanCode;
      if (!scanCode) {
        throw new Error('Scan code not found in scan info');
      }

      // Prepare data object for QR code
      const qrCodeData = {
        code: scanCode,
        latitude: scanInfoJson.latitude || null,
        longitude: scanInfoJson.longitude || null
      };

      // Generate QR code as data URL (base64 image) with JSON data
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 300
      });

      return qrCodeDataUrl;
    } catch (error) {
      ctx.log?.error(
        { id, error: error.message, errorStack: error.stack },
        "ScanInfoUsecase.generateQRCode_error"
      );
      throw error;
    }
  }
}

module.exports = ScanInfoUsecase;

