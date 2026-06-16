# Fintriq Testing Status

*   **Unit Testing:** Active
*   **Integration Testing:** Deferred (Temporarily excluded from active development until a dedicated test database infrastructure is established).
*   **E2E Testing:** Deferred
*   **Known Skipped Tests:**
    *   `CategoryService › createCategory › should throw if category already exists and is active` (Implementation does not throw `AppError` or mock setup is incomplete).
    *   `DashboardService › getDashboardData › should aggregate income and expenses correctly` (`getAggregates` method is called multiple times and mocks are returning incorrect overlapping data. Needs fixing).
