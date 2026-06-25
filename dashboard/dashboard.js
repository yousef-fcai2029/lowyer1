/**
 * dashboard.js
 * --------------------------------------
 * منطق صفحة الرئيسية (Dashboard).
 */

$(function () {

    const user = Auth.getUser();

    loadStats();
    loadRecentCases();
    loadNotifications();

    async function loadStats() {
        try {
            const stats = await Api.getDashboardStats();

            const cards = [
                { label: "العملاء", value: stats.clientsCount, icon: "bi-people", cls: "bg-clients" },
                { label: "القضايا", value: stats.casesCount, icon: "bi-briefcase", cls: "bg-cases" },
                { label: "القضايا النشطة", value: stats.activeCasesCount, icon: "bi-lightning-charge", cls: "bg-cases" },
                { label: "الجلسات", value: stats.hearingsCount, icon: "bi-calendar-event", cls: "bg-hearings" }
            ];

            // المدفوعات تظهر فقط لمن يملك صلاحية الإطلاع عليها فعلياً
            if (Permissions.can("payments", "view")) {
                cards.push({
                    label: "إجمالي المدفوعات",
                    value: stats.totalPayments.toLocaleString("ar-EG") + " ج.م",
                    icon: "bi-cash-coin",
                    cls: "bg-payments"
                });
            }

            const $statsRow = $("#statsRow");
            $("#statsLoading").remove();

            cards.forEach(card => {
                $statsRow.append(`
                    <div class="col-md-3 col-sm-6">
                        <div class="card stat-card ${card.cls} p-3 h-100">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="small opacity-75">${card.label}</div>
                                    <div class="fs-4 fw-bold">${card.value}</div>
                                </div>
                                <i class="bi ${card.icon} stat-icon"></i>
                            </div>
                        </div>
                    </div>
                `);
            });

        } catch (err) {
            console.error(err);
            $("#statsRow").html(`<div class="col-12 text-danger">حدث خطأ في تحميل الإحصائيات</div>`);
        }
    }

    async function loadRecentCases() {
        try {
            const cases = await Api.getCases();
            const $list = $("#recentCasesList").empty();

            if (!cases.length) {
                $list.append(`<li class="list-group-item text-muted">لا توجد قضايا حالياً</li>`);
                return;
            }

            const statusLabels = {
                active: '<span class="badge bg-success">نشطة</span>',
                pending: '<span class="badge bg-warning text-dark">معلقة</span>',
                closed: '<span class="badge bg-secondary">مغلقة</span>'
            };

            cases.slice(0, 5).forEach(c => {
                $list.append(`
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>#${c.case_number}</strong> - ${c.title}
                        </div>
                        ${statusLabels[c.status] || ""}
                    </li>
                `);
            });

        } catch (err) {
            console.error(err);
            $("#recentCasesList").html(`<li class="list-group-item text-danger">حدث خطأ في تحميل القضايا</li>`);
        }
    }

    async function loadNotifications() {
        try {
            const notifications = await Api.getNotifications();
            const $list = $("#notificationsList").empty();

            if (!notifications.length) {
                $list.append(`<li class="list-group-item text-muted">لا توجد إشعارات</li>`);
                return;
            }

            notifications.forEach(n => {
                const unreadClass = n.is_read ? "" : "fw-bold";
                $list.append(`
                    <li class="list-group-item ${unreadClass}">
                        <div>${n.title}</div>
                        <div class="small text-muted">${n.message}</div>
                    </li>
                `);
            });

        } catch (err) {
            console.error(err);
            $("#notificationsList").html(`<li class="list-group-item text-danger">حدث خطأ في تحميل الإشعارات</li>`);
        }
    }

});
