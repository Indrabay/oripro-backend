const sequelize = require('../models/sequelize');
const { Op } = require('sequelize');
const {
  ComplaintReportStatusIntToStr,
} = require('../models/ComplaintReport');

class DashboardUsecase {
  constructor(
    complaintReportRepository,
    tenantRepository,
    userRepository,
    userTaskRepository,
    attendanceRepository,
    tenantUnitRepository,
    unitRepository,
    assetRepository
  ) {
    this.complaintReportRepository = complaintReportRepository;
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.userTaskRepository = userTaskRepository;
    this.attendanceRepository = attendanceRepository;
    this.tenantUnitRepository = tenantUnitRepository;
    this.unitRepository = unitRepository;
    this.assetRepository = assetRepository;
  }

  async getDashboardStats(ctx) {
    try {
      ctx.log?.info({}, 'DashboardUsecase.getDashboardStats');

      // Get total assets count
      const allAssets = await this.assetRepository.listAll({}, ctx);
      const totalAssets = allAssets.total || 0;

      // Get total units count (not deleted)
      const allUnits = await this.unitRepository.findAll({}, ctx);
      const totalUnits = allUnits.total || 0;

      // Get total tenants count
      const allTenants = await this.tenantRepository.findAll({}, ctx);
      const totalTenants = allTenants.total || 0;

      // Calculate total revenue from active tenants
      // Revenue = sum of rent_price from active tenants
      let totalRevenue = 0;
      if (allTenants.tenants && allTenants.tenants.length > 0) {
        totalRevenue = allTenants.tenants
          .filter(tenant => tenant.status === 1) // active status
          .reduce((sum, tenant) => {
            const rentPrice = tenant.rent_price || 0;
            return sum + rentPrice;
          }, 0);
      }

      // Calculate percentage change (simplified - comparing with previous period)
      // For now, we'll use placeholder values
      const revenueChange = '+2% vs last year';
      const assetChange = '+2% vs last year';
      const unitChange = '+2% vs last year';
      const tenantChange = '-2% vs last year';

      return {
        totalRevenue: {
          value: totalRevenue,
          formatted: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(totalRevenue),
          change: revenueChange,
          changeType: 'positive',
        },
        totalAssets: {
          value: totalAssets,
          formatted: totalAssets.toString(),
          change: assetChange,
          changeType: 'positive',
        },
        totalUnits: {
          value: totalUnits,
          formatted: totalUnits.toString(),
          change: unitChange,
          changeType: 'positive',
        },
        totalTenants: {
          value: totalTenants,
          formatted: totalTenants.toString(),
          change: tenantChange,
          changeType: 'negative',
        },
      };
    } catch (error) {
      ctx.log?.error(
        { error: error.message, stack: error.stack },
        'DashboardUsecase.getDashboardStats_error'
      );
      throw error;
    }
  }

  async getDashboardData(ctx) {
    try {
      ctx.log?.info({}, 'DashboardUsecase.getDashboardData');

      // Get recent complaints (limit 5)
      const recentComplaints = await this.complaintReportRepository.findAll(
        { limit: 5, offset: 0 },
        ctx
      );

      // Get complaint statistics for chart
      const allComplaints = await this.complaintReportRepository.findAll(
        {},
        ctx
      );

      // Calculate complaint stats
      const complaintStats = {
        total: allComplaints.total || 0,
        pending: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
      };

      (allComplaints.complaintReports || []).forEach((cr) => {
        if (!cr) return;
        const status = ComplaintReportStatusIntToStr[cr.status] || 'pending';
        if (status === 'pending') {
          complaintStats.pending++;
        } else if (status === 'in_progress') {
          complaintStats.in_progress++;
        } else if (status === 'resolved') {
          complaintStats.resolved++;
        } else if (status === 'closed') {
          complaintStats.closed++;
        }
      });

      // Get expiring tenant contracts (contracts ending within 6 months)
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      const now = new Date();

      const allTenants = await this.tenantRepository.findAll({}, ctx);
      const expiringTenants = (allTenants.tenants || [])
        .filter((tenant) => {
          if (!tenant || !tenant.contract_end_at) return false;
          try {
            const endDate = new Date(tenant.contract_end_at);
            return endDate >= now && endDate <= sixMonthsFromNow;
          } catch (error) {
            ctx.log?.warn({ tenant_id: tenant?.id, error: error.message }, 'Failed to parse contract_end_at');
            return false;
          }
        })
        .sort((a, b) => {
          try {
            return new Date(a.contract_end_at) - new Date(b.contract_end_at);
          } catch (error) {
            return 0;
          }
        })
        .slice(0, 4);

      // Get tenant units for expiring tenants
      const expiringTenantsWithUnits = await Promise.all(
        expiringTenants.map(async (tenant) => {
          try {
            const tenantUnits = await this.tenantUnitRepository.getByTenantID(
              tenant.id
            );
            const units = await Promise.all(
              tenantUnits.map(async (tu) => {
                try {
                  const unit = await this.unitRepository.findById(tu.unit_id);
                  return unit;
                } catch (error) {
                  ctx.log?.warn({ unit_id: tu.unit_id, error: error.message }, 'Failed to get unit');
                  return null;
                }
              })
            );
            return {
              ...tenant,
              units: units.filter(u => u !== null),
            };
          } catch (error) {
            ctx.log?.warn({ tenant_id: tenant.id, error: error.message }, 'Failed to get tenant units');
            return {
              ...tenant,
              units: [],
            };
          }
        })
      );

      // Get workers (users with role cleaning or security)
      const allUsers = await this.userRepository.listAll({}, ctx);
      const workers = (allUsers.users || []).filter(
        (user) =>
          user &&
          user.role &&
          user.role.name &&
          typeof user.role.name === 'string' &&
          (user.role.name.toLowerCase() === 'cleaning' ||
            user.role.name.toLowerCase() === 'security')
      );

      // Get worker stats (attendance and task completion)
      const workersWithStats = await Promise.all(
        workers.slice(0, 4).map(async (worker) => {
          // Calculate attendance percentage (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          // Get user tasks for this worker
          const userTasks = await this.userTaskRepository.findByUserId(
            worker.id,
            { limit: 1000, offset: 0 },
            ctx
          );

          // Calculate task completion
          // findByUserId returns an array of user tasks (main tasks with sub_user_task array)
          const allTasks = Array.isArray(userTasks) ? userTasks : [];
          // Flatten main tasks and their child tasks (sub_user_task)
          const flatTasks = allTasks.reduce((acc, mainTask) => {
            acc.push(mainTask);
            if (mainTask.sub_user_task && Array.isArray(mainTask.sub_user_task) && mainTask.sub_user_task.length > 0) {
              acc.push(...mainTask.sub_user_task);
            }
            return acc;
          }, []);
          
          const totalTasks = flatTasks.length;
          const completedTasks = flatTasks.filter(
            (ut) => {
              // Check status field (string) or completed_at field
              const status = ut.status || (ut.completed_at ? 'completed' : 'pending');
              return status === 'completed' || ut.completed_at !== null;
            }
          ).length;
          const taskCompletion =
            totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          // For attendance, we'll use a simplified calculation
          // In a real scenario, you'd query the attendance table
          const attendance = 98; // Placeholder - should be calculated from attendance records

          return {
            id: worker.id,
            name: worker.name,
            email: worker.email,
            role: worker.role?.name || 'Unknown',
            attendance: attendance,
            taskCompletion: taskCompletion,
          };
        })
      );

      // Get daily task completion for last 7 days
      const dailyTaskCompletion = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // Get all user tasks for this day
        const allUserTasksResult = await this.userTaskRepository.findAll(
          {
            limit: 10000,
            offset: 0,
          },
          ctx
        );

        const dayTasks = (allUserTasksResult.rows || []).filter((ut) => {
          if (!ut.created_at) return false;
          const taskDate = new Date(ut.created_at);
          return taskDate >= date && taskDate < nextDate;
        });

        const totalDayTasks = dayTasks.length;
        const completedDayTasks = dayTasks.filter(
          (ut) => {
            const status = ut.status || (ut.completed_at ? 'completed' : 'pending');
            return status === 'completed' || ut.completed_at !== null;
          }
        ).length;
        const completionPercentage =
          totalDayTasks > 0
            ? Math.round((completedDayTasks / totalDayTasks) * 100)
            : 0;

        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        dailyTaskCompletion.push({
          day: dayNames[date.getDay()],
          date: date.toISOString().split('T')[0],
          completion: completionPercentage,
          total: totalDayTasks,
          completed: completedDayTasks,
        });
      }

      // Get units for complaints
      const complaintsWithUnits = await Promise.all(
        (recentComplaints.complaintReports || []).map(async (cr) => {
          if (!cr) {
            return null;
          }
          let unitDisplay = '-';
          if (cr.tenant_id) {
            try {
              const tenant = await this.tenantRepository.findById(cr.tenant_id, ctx);
              if (tenant) {
                const tenantUnits = await this.tenantUnitRepository.getByTenantID(tenant.id);
                if (tenantUnits && tenantUnits.length > 0) {
                  const units = await Promise.all(
                    tenantUnits.slice(0, 1).map(async (tu) => {
                      try {
                        const unit = await this.unitRepository.findById(tu.unit_id);
                        return unit;
                      } catch (error) {
                        ctx.log?.warn({ unit_id: tu.unit_id, error: error.message }, 'Failed to get unit for complaint');
                        return null;
                      }
                    })
                  );
                  const validUnits = units.filter(u => u !== null);
                  if (validUnits.length > 0) {
                    const unit = validUnits[0];
                    unitDisplay = unit.asset?.name || unit.name || '-';
                  }
                }
              }
            } catch (error) {
              ctx.log?.warn({ tenant_id: cr.tenant_id, error: error.message }, 'Failed to get tenant/unit for complaint');
            }
          }
          
          return {
            id: cr.id,
            unit: unitDisplay,
            reporter: cr.reporter?.name || cr.reporter?.email || '-',
            date: cr.created_at,
            status: ComplaintReportStatusIntToStr[cr.status] || 'pending',
          };
        })
      );

      // Filter out null complaints
      const validComplaints = complaintsWithUnits.filter(c => c !== null);

      return {
        complaints: {
          recent: validComplaints,
          stats: complaintStats,
        },
        expiringTenants: expiringTenantsWithUnits.map((tenant) => {
          if (!tenant || !tenant.contract_end_at) {
            return {
              id: tenant?.id || '',
              name: tenant?.name || '-',
              unit: '-',
              monthsRemaining: 0,
              daysRemaining: 0,
              contractEndAt: '',
            };
          }
          
          const endDate = new Date(tenant.contract_end_at);
          const now = new Date();
          const diffTime = endDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const diffMonths = Math.ceil(diffDays / 30);

          // Format unit name: "Unit X - Asset Name"
          let unitDisplay = '-';
          if (tenant.units && tenant.units.length > 0) {
            unitDisplay = tenant.units
              .map((u, idx) => {
                const unitName = u.name || `Unit ${idx + 1}`;
                const assetName = u.asset?.name || '';
                return assetName ? `${unitName} - ${assetName}` : unitName;
              })
              .join(', ');
          }

          return {
            id: tenant.id,
            name: tenant.name,
            unit: unitDisplay,
            monthsRemaining: diffMonths,
            daysRemaining: diffDays,
            contractEndAt: tenant.contract_end_at,
          };
        }),
        workers: workersWithStats,
        dailyTaskCompletion: dailyTaskCompletion,
      };
    } catch (error) {
      ctx.log?.error(
        { error: error.message, stack: error.stack },
        'DashboardUsecase.getDashboardData_error'
      );
      throw error;
    }
  }
}

module.exports = DashboardUsecase;

