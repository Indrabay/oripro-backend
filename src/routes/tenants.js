const { Router } = require('express');
const { body, validationResult, param, query } = require('express-validator');
const { authMiddleware, ensureRole } = require('../middleware/auth');
const { createResponse } = require('../services/response');

function InitTenantRouter(TenantUseCase, TenantPaymentLogUsecase) {
  const router = Router();

  router.use(authMiddleware, ensureRole);

  router.post(
    '/', 
    [
      body('name').isString().notEmpty(),
      body('tenant_identifications').notEmpty().isArray(),
      body('contract_documents').notEmpty().isArray(),
      body('unit_ids').notEmpty().isArray(),
      body('contract_begin_at').notEmpty(),
      body('rent_duration').isNumeric(),
      body('rent_duration_unit').notEmpty().isInt({ min: 0, max: 1 }).withMessage('rent_duration_unit must be 0 (year) or 1 (month)'),
      body('payment_term').optional().isInt({ min: 0, max: 1 }).withMessage('payment_term must be 0 (year) or 1 (month)'),
      body('rent_price').optional().isFloat(),
      body('down_payment').optional().isFloat(),
      body('deposit').optional().isFloat(),
      // user_id boleh kosong jika new_user disediakan
      body('user_id').optional().isString(),
      body('new_user').optional().isObject(),
      body('new_user.email').optional().isEmail(),
      body('new_user.password').optional().isString().notEmpty(),
      body('new_user.name').optional().isString().notEmpty(),
      body('new_user.roleId').optional(),
      body('new_user.role_id').optional(),
      body('new_user.phone').optional(),
      body('new_user.gender').optional(),
      body('category_id').isInt().withMessage('category_id must be a valid integer'),
      body('status').optional().isIn(['inactive', 'active', 'pending', 'expired', 'terminated', 'blacklisted', '0', '1', '2', '3', '4', '5']).withMessage('status must be one of: inactive, active, pending, expired, terminated, blacklisted, or 0, 1, 2, 3, 4, 5'),
    ],
    async (req, res) => {
    try {
      req.log?.info({ body: req.body }, "TenantRouter.createTenant");
      console.log("TenantRouter.createTenant - received body:", JSON.stringify(req.body, null, 2));
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json(createResponse(null, "bad request", 400, false, {}, errors));
      // Normalisasi: treat empty string as undefined sehingga ditangani di usecase
      if (req.body && typeof req.body.user_id === 'string' && req.body.user_id.trim() === '') {
        delete req.body.user_id;
      }
      const {
        name,
        tenant_identifications,
        contract_documents,
        unit_ids,
        contract_begin_at,
        rent_duration,
        rent_duration_unit,
        payment_term,
        rent_price,
        down_payment,
        deposit,
        category_id,
        user_id,
        new_user,
        status,
      } = req.body;
      
      console.log("TenantRouter.createTenant - extracted user_id:", user_id);
      console.log("TenantRouter.createTenant - extracted new_user:", new_user);

      const tenant = await TenantUseCase.createTenant({
        name, tenant_identifications, contract_documents, contract_begin_at, unit_ids, rent_duration, rent_duration_unit, payment_term, rent_price, down_payment, deposit, user_id, new_user, category_id, status, createdBy: req.auth.userId
      }, {userId: req.auth.userId, log: req.log});
      res.status(201).json(createResponse(tenant, "success", 201));
    } catch (err) {
      console.error("TenantRouter.createTenant_error: " + err.message);
      req.log?.error({}, "TenantRouter.createTenant_error");
      res.status(400).json(createResponse(null, "failed", 400, false, {}, err));
    }
  });

  router.get('/', async (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 10
    let offset = req.query.offset ? parseInt(req.query.offset) : 0

    req.query.limit = limit
    req.query.offset = offset
    try {
      req.log?.info(req.query, "TenantRouter.getTenants");
      const data = await TenantUseCase.getAllTenants(req.query, {log: req.log, userId: req.auth.userId});
      
      res.status(200).json(createResponse(data.tenants, "success", 200, true, {
        total: data.total,
        limit: limit,
        offset: offset
      }));
    } catch (err) {
      req.log?.error(req.query, `TenantRouter.getTenants_error: ${err.message}`);
      res.status(500).json(createResponse(null, "internal server error", 500, false, {}, err));
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      req.log?.info({tenant_id: req.params.id}, "TenantRouter.getTenant");
      const tenant = await TenantUseCase.getTenantById(req.params.id, {log: req.log, userId: req.auth.userId});
      if (!tenant) {
        return res.status(404).json(createResponse(null, "not found", 404));
      }
      res.status(200).json(createResponse(tenant, "success", 200));
    } catch (err) {
      req.log?.error({tenant_id: req.params.id}, `TenantRouter.getTenant_error: ${err.message}`);
      res.status(500).json(createResponse(null, "internal server error", 500));
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      req.log?.info({ tenant_id: req.params.id, update_data: req.body }, "TenantRouter.updateTenant");
      const updated = await TenantUseCase.updateTenant(req.params.id, req.body, {log: req.log, userId: req.auth.userId});
      res.status(202).json(createResponse(updated, "success", 202));
    } catch (err) {
      req.log?.error({ tenant_id: req.params.id, update_data: req.body }, `TenantRouter.updateTenant_error: ${err.message}`);
      res.status(500).json(createResponse(null, "internal server error", 500));
    }
  });

  router.delete('/:id', [
    param('id').isUUID().withMessage('ID must be a valid UUID')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createResponse(null, "bad request", 400, false, {}, errors));
    }
    
    try {
      req.log?.info({ tenant_id: req.params.id }, "TenantRouter.deleteTenant");
      await TenantUseCase.deleteTenant(req.params.id, {log: req.log, userId: req.auth.userId});
      res.status(204).send();
    } catch (err) {
      req.log?.error({ tenant_id: req.params.id }, `TenantRouter.deleteTenant_error: ${err.message}`);
      if (err.message === 'Tenant not found') {
        res.status(404).json(createResponse(null, "Tenant not found", 404));
      } else {
        res.status(500).json(createResponse(null, "Internal server error", 500));
      }
    }
  });

  router.get('/:id/logs', async (req, res) => {
    try {
      req.log?.info({ tenant_id: req.params.id }, "TenantRouter.getTenantLogs");
      const tenantLogs = await TenantUseCase.getTenantLogs(req.params.id, {
        userId: req.auth.userId,
        log: req.log
      })

      res.status(200).json(createResponse(tenantLogs, "success", 200, true, {
        total: tenantLogs.length,
        limit: tenantLogs.length,
        offset: 0
      }));
    } catch (err) {
      req.log?.error({ tenant_id: req.params.id }, `TenantRouter.getTenantLogs_error: ${err.message}`);
      res.status(500).json(createResponse(null, "internal server error", 500))
    }
  });

  router.get('/:id/deposito-logs', [
    param('id').isUUID().withMessage('ID must be a valid UUID')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createResponse(null, "bad request", 400, false, {}, errors));
    }
    
    try {
      req.log?.info({ tenant_id: req.params.id }, "TenantRouter.getDepositoLogs");
      const depositoLogs = await TenantUseCase.getDepositoLogs(req.params.id, {
        userId: req.auth.userId,
        log: req.log
      });

      res.status(200).json(createResponse(depositoLogs, "success", 200, true, {
        total: depositoLogs.length,
        limit: depositoLogs.length,
        offset: 0
      }));
    } catch (err) {
      req.log?.error({ tenant_id: req.params.id }, `TenantRouter.getDepositoLogs_error: ${err.message}`);
      res.status(500).json(createResponse(null, "internal server error", 500));
    }
  });

  // Payment Log endpoints
  router.post('/:id/payments', [
    param('id').isUUID().withMessage('ID must be a valid UUID'),
    body('amount').isFloat({ min: 0 }).withMessage('amount must be a positive number'),
    body('payment_date').optional().isISO8601().withMessage('payment_date must be a valid date'),
    body('payment_deadline').optional().isISO8601().withMessage('payment_deadline must be a valid date'),
    body('payment_method').isIn(['cash', 'bank_transfer', 'qris','other']).withMessage('payment_method must be one of: cash, bank_transfer, credit_card, debit_card, e_wallet, check, other'),
    body('notes').optional().isString(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createResponse(null, "bad request", 400, false, {}, errors));
    }
    
    try {
      req.log?.info({ tenant_id: req.params.id, body: req.body }, "TenantRouter.createPaymentLog");
      const paymentLog = await TenantPaymentLogUsecase.createPaymentLog({
        tenant_id: req.params.id,
        amount: req.body.amount,
        payment_date: req.body.payment_date,
        payment_deadline: req.body.payment_deadline,
        payment_method: req.body.payment_method,
        notes: req.body.notes,
      }, {
        userId: req.auth.userId,
        log: req.log
      });

      res.status(201).json(createResponse(paymentLog, "Payment log created successfully", 201));
    } catch (err) {
      req.log?.error({ tenant_id: req.params.id }, `TenantRouter.createPaymentLog_error: ${err.message}`);
      if (err.message === 'Tenant not found') {
        res.status(404).json(createResponse(null, "Tenant not found", 404));
      } else {
        res.status(500).json(createResponse(null, "internal server error", 500));
      }
    }
  });

  router.get('/:id/payments', [
    param('id').isUUID().withMessage('ID must be a valid UUID'),
    query('status').optional().isIn(['unpaid', 'paid', 'expired', '0', '1', '2']).withMessage('status must be unpaid, paid, expired, or 0, 1, 2'),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createResponse(null, "bad request", 400, false, {}, errors));
    }
    
    try {
      req.log?.info({ tenant_id: req.params.id, query: req.query }, "TenantRouter.getPaymentLogs");
      const result = await TenantPaymentLogUsecase.getPaymentLogsByTenantId(req.params.id, {
        limit: req.query.limit || 10,
        offset: req.query.offset || 0,
        orderBy: req.query.orderBy || 'payment_date',
        order: req.query.order || 'DESC',
        status: req.query.status, // Filter by status (unpaid, paid, expired, or 0, 1, 2)
      }, {
        userId: req.auth.userId,
        log: req.log
      });

      res.status(200).json(createResponse(result.rows, "success", 200, true, {
        total: result.count,
        limit: result.limit,
        offset: result.offset
      }));
    } catch (err) {
      req.log?.error({ tenant_id: req.params.id }, `TenantRouter.getPaymentLogs_error: ${err.message}`);
      if (err.message === 'Tenant not found') {
        res.status(404).json(createResponse(null, "Tenant not found", 404));
      } else {
        res.status(500).json(createResponse(null, "internal server error", 500));
      }
    }
  });

  router.put('/:id/payments/:paymentId', [
    param('id').isUUID().withMessage('Tenant ID must be a valid UUID'),
    param('paymentId').isInt({ min: 1 }).withMessage('Payment ID must be a valid integer'),
    body('payment_method').optional().isIn(['cash', 'bank_transfer', 'qris', 'other']).withMessage('payment_method must be one of: cash, bank_transfer, qris, other'),
    body('payment_date').optional().isISO8601().withMessage('payment_date must be a valid date'),
    body('paid_amount').optional().isFloat({ min: 0 }).withMessage('paid_amount must be a valid number (>= 0)'),
    body('notes').optional().isString(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createResponse(null, "bad request", 400, false, {}, errors));
    }
    
    try {
      req.log?.info({ 
        tenant_id: req.params.id, 
        payment_id: req.params.paymentId, 
        body: req.body 
      }, "TenantRouter.updatePaymentLog");
      
      const updatedPaymentLog = await TenantPaymentLogUsecase.updatePaymentLog(
        req.params.paymentId,
        {
          ...req.body,
          status: 'paid', // Automatically set status to paid when updating payment
        },
        {
          userId: req.auth.userId,
          log: req.log
        }
      );

      res.status(200).json(createResponse(updatedPaymentLog, "Payment log updated successfully", 200));
    } catch (err) {
      req.log?.error({ 
        tenant_id: req.params.id, 
        payment_id: req.params.paymentId 
      }, `TenantRouter.updatePaymentLog_error: ${err.message}`);
      
      if (err.message === 'Payment log not found') {
        res.status(404).json(createResponse(null, "Payment log not found", 404));
      } else {
        res.status(500).json(createResponse(null, "internal server error", 500));
      }
    }
  });

  return router;
}

module.exports = {InitTenantRouter};