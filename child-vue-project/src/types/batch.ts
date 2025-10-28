export interface BatchAssignRequest {
    userIds: number[]
  jobIds?: number[]
  departmentIds?: number[]
  roleIds?: number[]
}

export interface BatchOperationResult {
    success: number
    failed: number
    errors: Array<{ userId: number; message: string }>
  }