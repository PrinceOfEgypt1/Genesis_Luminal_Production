/**
 * TRILHO B AÇÃO 6 - Interface para Security Middleware
 * 
 * Interface para configuração centralizada de middleware de segurança
 */

export interface ICorsConfig {
  origin: string | string[] | boolean;
  credentials?: boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  maxAge?: number;
}

export interface IHelmetConfig {
  contentSecurityPolicy?: boolean | object;
  crossOriginEmbedderPolicy?: boolean;
  crossOriginOpenerPolicy?: boolean;
  crossOriginResourcePolicy?: boolean;
  dnsPrefetchControl?: boolean;
  frameguard?: boolean | object;
  hidePoweredBy?: boolean;
  hsts?: boolean | object;
  ieNoOpen?: boolean;
  noSniff?: boolean;
  originAgentCluster?: boolean;
  permittedCrossDomainPolicies?: boolean;
  referrerPolicy?: boolean | object;
  xssFilter?: boolean;
}

export interface ISecurityConfig {
  cors: ICorsConfig;
  helmet: IHelmetConfig;
  trustProxy?: boolean;
  requestSizeLimit?: string;
  requestTimeout?: number;
}

export interface ISecurityMiddleware {
  /**
   * Configura middleware de segurança
   */
  configure(config: ISecurityConfig): any[];
  
  /**
   * Obtém configuração CORS
   */
  getCorsMiddleware(config?: ICorsConfig): any;
  
  /**
   * Obtém configuração Helmet
   */
  getHelmetMiddleware(config?: IHelmetConfig): any;
  
  /**
   * Verifica se configuração é válida
   */
  validateConfig(config: ISecurityConfig): boolean;
}
