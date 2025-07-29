export const ROUTERS = {
    AUTH: {
        LOGIN: "/login",
        UNAUTHOR: "/unauthorized"
    },
    USER: {
        HOME: "/",
        PROFILE: "/User/profile",
        QUITPLAN: "/User/quitplan",
        MILESTONES: "/User/milestones",
        COACH: "/User/coachList",
        PACKAGE: "/User/package",
        BLOG: "/User/blog",
        RANKING: "/User/ranking",
        PROGRESS: "/User/progress",
        PROFILECOACH: "/User/coach/profile/:id",
        PLANOVERVIEW: "/User/PlanOverviewPage",
        CHALENGE: "/User/Challenges",
        MYCONSUL: "/User/MyConsultations",
        ACHIVE: "/User/AchievementGallery"
    },
    COACH: {
        DASHBOARD: "/coach/dashboard",
        BOOKING: "/coach/managementBooking",
        MEMBER: "/coach/managementMember",
        PROFILE: "/coach/profile",

    },

    ADMIN: {
        DASHBOARD: "/admin",
        USER: "users",
        BLOG: "ManagementBlog",
        PACKAGE: "ManagementPackage",
        ACHIVE: "ManagementPerformance",
        PLAN: "ManagementPlan",
        NOTIFICATION: "ManagementNotification",
        CHANGECOACH: "ManagementChangCoach",
    },
};
