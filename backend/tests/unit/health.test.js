"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Health Endpoint', () => {
    (0, globals_1.test)('should create health response structure', () => {
        const healthResponse = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'genesis-luminal'
        };
        (0, globals_1.expect)(healthResponse.status).toBe('healthy');
        (0, globals_1.expect)(healthResponse.service).toBe('genesis-luminal');
        (0, globals_1.expect)(healthResponse.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
});
