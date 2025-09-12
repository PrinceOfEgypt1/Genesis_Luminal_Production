"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionStatus = exports.DistributionType = void 0;
var DistributionType;
(function (DistributionType) {
    DistributionType["FIBONACCI"] = "fibonacci";
    DistributionType["SPIRAL"] = "spiral";
    DistributionType["ORGANIC"] = "organic";
    DistributionType["RANDOM"] = "random";
})(DistributionType || (exports.DistributionType = DistributionType = {}));
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["DISCONNECTED"] = "disconnected";
    ConnectionStatus["CONNECTING"] = "connecting";
    ConnectionStatus["CONNECTED"] = "connected";
})(ConnectionStatus || (exports.ConnectionStatus = ConnectionStatus = {}));
//# sourceMappingURL=api.js.map