export interface Vector2D {
    x: number;
    y: number;
}
export interface EmotionalDNA {
    joy: number;
    nostalgia: number;
    curiosity: number;
    serenity: number;
    ecstasy: number;
    mystery: number;
    power: number;
}
export type EmotionalAffect = keyof EmotionalDNA;
export interface EmotionalAnalysisRequest {
    currentState?: EmotionalDNA;
    mousePosition?: Vector2D;
    sessionDuration?: number;
    userId?: string;
    text?: string;
    metadata?: any;
}
export interface EmotionalAnalysisResponse {
    intensity?: number;
    dominantAffect?: keyof EmotionalDNA;
    timestamp?: string;
    success?: boolean;
    confidence?: number;
    recommendation?: string;
    error?: unknown;
    emotionalShift?: unknown;
    morphogenicSuggestion?: unknown;
}
export interface SystemStatus {
    status: string;
    service: string;
    version: string;
    environment: string;
    timestamp: string;
    uptime_seconds: number;
    memory_mb: {
        rss: number;
        heapUsed: number;
        heapTotal: number;
    };
    claude_api_key: 'configured' | 'missing';
}
//# sourceMappingURL=api.d.ts.map