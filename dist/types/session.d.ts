export declare const SESSION_COOKIE: string;
export declare const ACTIVE_TENANT_COOKIE = "sp_active_tenant";
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
export declare function readSessionToken(): string | null;
export declare function readActiveTenant(): string | null;
export declare function decodeClaims(token: string): SessionClaims | null;
