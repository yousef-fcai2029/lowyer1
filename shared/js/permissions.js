/**
 * permissions.js
 * --------------------------------------
 * مكان مركزي لكل قرارات الصلاحيات في الواجهة.
 * بدل ما تتكرر شروط if (role === ...) في كل صفحة،
 * كل الصفحات تسأل هنا بس: "المستخدم الحالي يقدر يعمل كذا؟"
 *
 * ملاحظة: ده تحقق على مستوى الواجهة فقط (يخفي/يعطل الأزرار).
 * التحقق الحقيقي والملزم لازم يتكرر في الباك إند كمان.
 */

const Permissions = (function () {

    const { ADMIN, LAWYER, SECRETARY } = CONFIG.ROLES;

    // قواعد الصلاحيات لكل قسم
    const RULES = {
        clients: {
            view:   [ADMIN, LAWYER, SECRETARY],
            create: [ADMIN, LAWYER, SECRETARY],
            update: [ADMIN, LAWYER, SECRETARY],
            delete: [ADMIN, LAWYER, SECRETARY]
        },
        cases: {
            view:   [ADMIN, LAWYER, SECRETARY],
            create: [ADMIN, LAWYER, SECRETARY],
            update: [ADMIN, LAWYER, SECRETARY],
            delete: [ADMIN, LAWYER, SECRETARY]
        },
        hearings: {
            view:   [ADMIN, LAWYER, SECRETARY],
            create: [ADMIN, LAWYER, SECRETARY],
            update: [ADMIN, LAWYER, SECRETARY],
            delete: [ADMIN, LAWYER, SECRETARY]
        },
        documents: {
            view:   [ADMIN, LAWYER, SECRETARY],
            create: [ADMIN, LAWYER, SECRETARY],
            update: [ADMIN, LAWYER, SECRETARY],
            delete: [ADMIN, LAWYER, SECRETARY]
        },
        payments: {
            view:   [ADMIN, LAWYER, SECRETARY], // السكرتيرة تشوف بس
            create: [ADMIN, LAWYER],
            update: [ADMIN, LAWYER],
            delete: [ADMIN, LAWYER]
        }
    };

    function can(section, action) {
        const user = Auth.getUser();
        if (!user) return false;

        const sectionRules = RULES[section];
        if (!sectionRules || !sectionRules[action]) return false;

        return sectionRules[action].includes(user.role);
    }

    return { can };
})();
