import type { EntityId, PageQuery } from './api'

export interface AuditFields { createTime?: string; updateTime?: string; createBy?: string; updateBy?: string }
export interface EntityRef { id: EntityId }
export type BooleanInput = boolean | 'true' | 'false'
export interface Department extends AuditFields {
  id: EntityId; name: string; enabled: boolean; deptSort: number; pid: EntityId | null
  subCount?: number; hasChildren?: boolean; leaf?: boolean; label?: string; children?: Department[] | null
}
export interface DepartmentForm { id: EntityId | null; name: string | null; enabled: BooleanInput; deptSort: number; pid: EntityId | null; isTop?: string; subCount?: number }
export interface DepartmentQuery extends PageQuery { name?: string; enabled?: BooleanInput; pid?: EntityId; createTime?: string[] }
export interface Menu extends AuditFields {
  id: EntityId; title: string; componentName?: string; component?: string; path: string; type: number
  permission?: string; icon?: string; cache: boolean; hidden: boolean; iFrame: boolean; pid: EntityId | null
  menuSort: number; subCount?: number; hasChildren?: boolean; leaf?: boolean; label?: string; children?: Menu[] | null
}
export interface MenuForm { id: EntityId | null; title: string; menuSort: number; path: string; component: string; componentName: string; iFrame: boolean; roles: EntityRef[]; pid: EntityId | null; icon: string; cache: boolean; hidden: boolean; type: number; permission: string }
export interface MenuQuery extends PageQuery { blurry?: string; pid?: EntityId; type?: number }
export interface Role extends AuditFields { id: EntityId; name: string; level: number; description?: string; dataScope: string; menus: Menu[]; depts: Department[] }
export interface RoleForm { id: EntityId | null; name: string | null; level: number; description: string | null; dataScope: string; menus?: EntityRef[] | null; depts: EntityRef[] }
export interface UserRecord extends AuditFields {
  id: EntityId; username: string; nickName: string; email: string; phone: string; gender: string
  enabled: boolean; isAdmin?: boolean; avatarName?: string; avatarPath?: string; pwdResetTime?: string
  dept: Department; roles: Role[]; jobs: Array<EntityRef & { name: string }>
}
export interface UserForm {
  id: EntityId | null; username: string | null; nickName: string | null; email: string | null
  phone: string | number | null; gender: string; enabled: BooleanInput; dept: { id: EntityId | null }
  roles: EntityRef[]; jobs: EntityRef[]
}
export interface UserProfile { id: EntityId; nickName: string; phone: string; gender: string }
export interface PasswordForm { oldPass: string; newPass: string }
export interface EmailChangeForm { pass: string; email: string; code: string }
export interface Dictionary extends AuditFields { id: EntityId; name: string; description?: string; dictDetails?: Array<{ id: EntityId; label: string; value: string; dictSort: number }> }
export interface DictionaryForm { id: EntityId | null; name: string | null; description: string | null; dictDetails?: null }
export interface ScheduledJob extends AuditFields {
  id: EntityId; jobName: string; beanName: string; methodName: string; params: string | null
  cronExpression: string; isPause: boolean; personInCharge: string; email: string | null
  subTask: string | null; pauseAfterFailure: boolean; description: string | null
}
export type ScheduledJobForm = Omit<ScheduledJob, 'id'> & { id: EntityId | null }
export interface DeploymentApp extends AuditFields { id: EntityId; name: string; port: number; uploadPath: string; deployPath: string; backupPath: string; startScript: string; deployScript: string }
export type DeploymentAppForm = Omit<DeploymentApp, 'id'> & { id: EntityId | null }
export interface DeploymentServer extends AuditFields { id: EntityId; name: string; ip: string; port: number; account: string; password?: string }
export type DeploymentServerForm = Omit<DeploymentServer, 'id'> & { id: EntityId | null }
export interface DatabaseConnection extends AuditFields { id: EntityId; name: string; jdbcUrl: string; userName: string; pwd: string }
export type DatabaseForm = Omit<DatabaseConnection, 'id'> & { id: EntityId | null }
export interface Deployment extends AuditFields { id: EntityId; app: DeploymentApp; deploys: DeploymentServer[] }
export interface DeploymentForm { id: EntityId | null; app: { id: EntityId | null }; deploys: EntityRef[] }
export interface DeploymentHistory extends AuditFields { id: EntityId; appName: string; ip: string; deployDate: string; deployUser: string; deployId: EntityId }
export interface EmailConfig { id: EntityId | null; host: string; port: string; user: string; pass: string; fromUser: string; sslEnable: string }
export interface EmailMessage { tos: string[]; subject: string; content: string }
export interface AlipayConfig { id?: EntityId | null; appId: string; privateKey: string; publicKey: string; signType?: string; gatewayUrl?: string; charset?: string; notifyUrl: string; returnUrl: string; format?: string; sysServiceProviderId: string }
export interface PaymentRequest { subject: string; body: string; totalAmount: string | number; outTradeNo?: string }
export interface LocalFile extends AuditFields { id: EntityId; realName: string; name: string; suffix: string; path: string; type: string; size: string }
export interface LocalFileForm { id: EntityId | null; name: string }
export interface GeneratorConfig { id: EntityId | null; tableName: string; apiAlias: string | null; pack: string; moduleName: string; path: string; apiPath: string; author: string; prefix: string; cover: BooleanInput }
export interface GeneratorColumn { id: EntityId; tableName: string; columnName: string; columnType: string; keyType: string; extra: string; remark: string; notNull: boolean; listShow: boolean; formShow: boolean; formType: string; queryType: string; dictName: string | null; dateAnnotation: string | null }
export interface GeneratorTable { tableName: string; createTime: string; engine: string; coding: string; remark: string }
export interface GeneratedFile { name: string; content: string }

export interface MemoryUsage { total: string; used: string; available: string; usageRate: string }
export interface ServerMonitor {
  time: string
  sys: { os: string; ip: string; day: string }
  cpu: { name: string; package: number; core: number; logic: number; used: string; coreNumber: number }
  memory: MemoryUsage
  swap: MemoryUsage
  disk: MemoryUsage
}

export interface AuditLog { id: EntityId; username: string; description: string; requestIp: string; address: string; browser: string; time: number; createTime: string; exception?: string }
export interface OnlineUser { key: string; userName: string; nickName: string; dept: string; ip: string; address: string; browser: string; loginTime: string }
export interface JobLog { id: EntityId; jobName: string; beanName: string; methodName: string; params: string; cronExpression: string; isSuccess: boolean; exception: string; time: number; createTime: string }
export interface StorageObject { id: EntityId; key: string; name: string; suffix: string; type: string; size: string; url: string; updateTime: string }
export interface DictDetailForm { id: EntityId | null; label: string; value: string; dictSort: number; dict?: { id: EntityId | null } }
export interface TreeLoadOptions<T> { action: string; parentNode: T; callback: (error?: Error) => void }
export interface LazyNode<T> { level: number; data: T }
