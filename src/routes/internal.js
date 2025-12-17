const { Router } = require('express');
const { query, validationResult } = require('express-validator');
const { basicAuthFromEnv } = require('../middleware/basicAuth');
const { createResponse } = require('../services/response');
const { sendTenantPaymentDueSoonEmail } = require('../services/Mailer');

function daysLeftFromDeadline(deadline, now = new Date()) {
  const dl = deadline ? new Date(deadline) : null;
  if (!dl || Number.isNaN(dl.getTime())) return null;
  const ms = dl.getTime() - now.getTime();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function InitInternalRouter({ tenantRepository, tenantPaymentLogRepository }) {
  const router = Router();

  // Protect everything under /api/internal with basic auth
  router.use(basicAuthFromEnv({ realm: 'Oripro Internal' }));

  /**
   * GET /api/internal/tenant-payments/due-soon?days=7&dryRun=true
   *
   * Scans unpaid tenant payment logs with payment_deadline within N days
   * and sends SMTP reminders to the tenant user email (if present).
   */
  router.get(
    '/tenant-payments/due-soon',
    [
      query('days').optional().isInt({ min: 0, max: 365 }).withMessage('days must be an integer between 0 and 365'),
      query('dryRun').optional().isBoolean().withMessage('dryRun must be boolean'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(createResponse(null, 'bad request', 400, false, {}, errors));
      }

      const days = req.query.days != null ? Number(req.query.days) : 7;
      const dryRun = String(req.query.dryRun || 'false').toLowerCase() === 'true';
      const now = new Date();

      try {
        // Fetch due-soon logs (unpaid + deadline within range)
        const paymentLogs = await tenantPaymentLogRepository.findUnpaidDueSoon({ days, now }, { log: req.log });

        let emailed = 0;
        let skippedNoEmail = 0;

        const items = [];
        for (const pl of paymentLogs) {
          const tenant = pl.tenant || null;
          const userEmail = tenant?.user?.email || null;
          const dl = pl.payment_deadline || null;
          const left = daysLeftFromDeadline(dl, now);

          const item = {
            paymentLogId: pl.id,
            tenantId: tenant?.id || pl.tenant_id,
            tenantName: tenant?.name || null,
            tenantCode: tenant?.code || null,
            email: userEmail,
            deadline: dl,
            daysLeft: left,
            amount: pl.amount,
          };
          items.push(item);

          if (!userEmail) {
            skippedNoEmail += 1;
            continue;
          }

          if (!dryRun) {
            await sendTenantPaymentDueSoonEmail({
              to: userEmail,
              tenantName: tenant?.name,
              tenantCode: tenant?.code,
              paymentId: pl.id,
              amount: pl.amount,
              deadline: dl,
              daysLeft: left,
            });
            await tenantPaymentLogRepository.update(
              pl.id,
              { reminder_sent_at: new Date() },
              { log: req.log }
            );
            emailed += 1;
          }
        }

        // Also expose tenants count for sanity-checking
        const tenantsResult = await tenantRepository.findAll({}, { log: req.log });

        return res.status(200).json(
          createResponse(
            {
              dryRun,
              days,
              now: now.toISOString(),
              tenantsTotal: tenantsResult?.total ?? null,
              dueSoonCount: paymentLogs.length,
              emailed,
              skippedNoEmail,
              items,
            },
            'success',
            200
          )
        );
      } catch (err) {
        req.log?.error({ err: err.message }, 'InternalRouter.tenant-payments.due-soon_error');
        return res.status(500).json(createResponse(null, 'internal server error', 500, false, {}, err));
      }
    }
  );

  return router;
}

module.exports = { InitInternalRouter };


