/**
 * JWT decode (no verification — server already verified upstream).
 * We just need to read claims for display.
 */
export interface SessionClaims {
    userId: string;
    email: string;
    displayName: string;
    companyId: string | null;
    companyName: string | null;
    workspaceId: string | null;
    workspaceName: string | null;
    roles: Array<{
        layer: string;
        scopeId: string | null;
        role: string;
    }>;
    operator?: {
        operatorId: string;
        reason: string;
    } | null;
    exp?: number;
    iat?: number;
}
export declare function decodeJwt(token: string): SessionClaims | null;
