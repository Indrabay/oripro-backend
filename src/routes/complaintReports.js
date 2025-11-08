const { Router } = require('express');
const { body, validationResult, param, query } = require('express-validator');
const { authMiddleware, ensureRole } = require('../middleware/auth');
const { createResponse } = require('../services/response');

function InitComplaintReportRouter(complaintReportUsecase) {
  const router = Router();

  router.use(authMiddleware, ensureRole);

  const createComplaintReportParam = [
    body('title').isString().notEmpty().withMessage('title is required'),
    body('description').isString().notEmpty().withMessage('description is required'),
    body('reporter_id').isUUID().notEmpty().withMessage('reporter_id must be a valid UUID'),
    body('status').optional().isIn(['pending', 'in_progress', 'resolved', 'closed']).withMessage('status must be one of: pending, in_progress, resolved, closed'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('priority must be one of: low, medium, high, urgent'),
  ];

  async function createComplaintReport(req, res) {
    try {
      req.log?.info({ body: req.body }, 'ComplaintReportRouter.createComplaintReport');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(createResponse(null, 'validation error', 400, errors.array()));
      }

      const complaintReport = await complaintReportUsecase.createComplaintReport(req.body, {
        userId: req.auth?.userId,
        log: req.log,
      });

      return res.status(201).json(createResponse(complaintReport, 'Complaint/Report created successfully', 201));
    } catch (error) {
      req.log?.error({ error: error.message, errorStack: error.stack }, 'ComplaintReportRouter.createComplaintReport_error');
      return res.status(500).json(createResponse(null, 'internal server error', 500));
    }
  }

  const getComplaintReportParam = [
    param('id').isInt().notEmpty().withMessage('id must be an integer'),
  ];

  async function getComplaintReportById(req, res) {
    try {
      req.log?.info({ id: req.params.id }, 'ComplaintReportRouter.getComplaintReportById');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(createResponse(null, 'validation error', 400, errors.array()));
      }

      const complaintReport = await complaintReportUsecase.getComplaintReportById(req.params.id, {
        userId: req.auth?.userId,
        log: req.log,
      });

      if (!complaintReport) {
        return res.status(404).json(createResponse(null, 'Complaint/Report not found', 404));
      }

      return res.status(200).json(createResponse(complaintReport, 'success', 200));
    } catch (error) {
      req.log?.error({ error: error.message }, 'ComplaintReportRouter.getComplaintReportById_error');
      return res.status(500).json(createResponse(null, 'internal server error', 500));
    }
  }

  const getAllComplaintReportsParam = [
    query('type').optional().isIn(['complaint', 'report']).withMessage('type must be complaint or report'),
    query('status').optional().isIn(['pending', 'in_progress', 'resolved', 'closed']).withMessage('status must be one of: pending, in_progress, resolved, closed'),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('priority must be one of: low, medium, high, urgent'),
    query('reporter_id').optional().isUUID().withMessage('reporter_id must be a valid UUID'),
    query('tenant_id').optional().isUUID().withMessage('tenant_id must be a valid UUID'),
    query('title').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('offset must be a non-negative integer'),
  ];

  async function getAllComplaintReports(req, res) {
    try {
      req.log?.info({ query: req.query }, 'ComplaintReportRouter.getAllComplaintReports');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(createResponse(null, 'validation error', 400, errors.array()));
      }

      // Disable caching
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      const filters = {};
      if (req.query.type) filters.type = req.query.type;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.priority) filters.priority = req.query.priority;
      if (req.query.reporter_id) filters.reporter_id = req.query.reporter_id;
      if (req.query.tenant_id) filters.tenant_id = req.query.tenant_id;
      if (req.query.title) filters.title = req.query.title;
      if (req.query.limit) filters.limit = parseInt(req.query.limit);
      if (req.query.offset) filters.offset = parseInt(req.query.offset);

      const result = await complaintReportUsecase.getAllComplaintReports(filters, {
        userId: req.auth?.userId,
        log: req.log,
      });

      return res.status(200).json(createResponse(result.complaintReports, 'success', 200, true, {
        total: result.total,
        limit: filters.limit || result.total,
        offset: filters.offset || 0
      }));
    } catch (error) {
      req.log?.error({ error: error.message }, 'ComplaintReportRouter.getAllComplaintReports_error');
      return res.status(500).json(createResponse(null, 'internal server error', 500));
    }
  }

  const updateComplaintReportParam = [
    param('id').isInt().notEmpty().withMessage('id must be an integer'),
    body('title').optional().isString().notEmpty(),
    body('description').optional().isString().notEmpty(),
    body('status').optional().isIn(['pending', 'in_progress', 'resolved', 'closed']).withMessage('status must be one of: pending, in_progress, resolved, closed'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('priority must be one of: low, medium, high, urgent'),
  ];

  async function updateComplaintReport(req, res) {
    try {
      req.log?.info({ id: req.params.id, body: req.body }, 'ComplaintReportRouter.updateComplaintReport');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(createResponse(null, 'validation error', 400, errors.array()));
      }

      const updated = await complaintReportUsecase.updateComplaintReport(req.params.id, req.body, {
        userId: req.auth?.userId,
        log: req.log,
      });

      return res.status(200).json(createResponse(updated, 'Complaint/Report updated successfully', 200));
    } catch (error) {
      req.log?.error({ error: error.message }, 'ComplaintReportRouter.updateComplaintReport_error');
      if (error.message === 'Complaint/Report not found') {
        return res.status(404).json(createResponse(null, 'Complaint/Report not found', 404));
      }
      return res.status(500).json(createResponse(null, 'internal server error', 500));
    }
  }

  const deleteComplaintReportParam = [
    param('id').isInt().notEmpty().withMessage('id must be an integer'),
  ];

  async function deleteComplaintReport(req, res) {
    try {
      req.log?.info({ id: req.params.id }, 'ComplaintReportRouter.deleteComplaintReport');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(createResponse(null, 'validation error', 400, errors.array()));
      }

      await complaintReportUsecase.deleteComplaintReport(req.params.id, {
        userId: req.auth?.userId,
        log: req.log,
      });

      return res.status(200).json(createResponse(null, 'Complaint/Report deleted successfully', 200));
    } catch (error) {
      req.log?.error({ error: error.message }, 'ComplaintReportRouter.deleteComplaintReport_error');
      return res.status(500).json(createResponse(null, 'internal server error', 500));
    }
  }

  router.post('/', createComplaintReportParam, createComplaintReport);
  router.get('/', getAllComplaintReportsParam, getAllComplaintReports);
  router.get('/:id', getComplaintReportParam, getComplaintReportById);
  router.put('/:id', updateComplaintReportParam, updateComplaintReport);
  router.delete('/:id', deleteComplaintReportParam, deleteComplaintReport);

  return router;
}

module.exports = { InitComplaintReportRouter };

