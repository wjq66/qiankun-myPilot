// src/utils/tree.ts - 树形结构工具函数

import type { Department } from '@/types/department'

export interface TreeNode {
  id: number
  label: string
  children?: TreeNode[]
  data: Department
}

/**
 * 将扁平的部门数组转换为树形结构
 */
export function buildDepartmentTree(departments: Department[]): TreeNode[] {
  const departmentMap = new Map<number, Department>()
  const rootNodes: TreeNode[] = []

  // 创建映射
  departments.forEach(dept => {
    departmentMap.set(dept.id, dept)
  })

  // 构建树
  departments.forEach(dept => {
    const treeNode: TreeNode = {
      id: dept.id,
      label: dept.name,
      children: [],
      data: dept
    }

    if (dept.parentId === null || dept.parentId === 0) {
      // 根节点
      rootNodes.push(treeNode)
    } else {
      // 子节点，需要找到父节点
      const parentDept = departmentMap.get(dept.parentId)
      if (parentDept) {
        // 如果父节点已经在树中，添加到其children
        const parentNode = findNodeInTree(rootNodes, dept.parentId)
        if (parentNode) {
          if (!parentNode.children) {
            parentNode.children = []
          }
          parentNode.children.push(treeNode)
        }
      }
    }
  })

  return rootNodes
}

/**
 * 在树中查找节点
 */
function findNodeInTree(nodes: TreeNode[], id: number): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }
    if (node.children) {
      const found = findNodeInTree(node.children, id)
      if (found) return found
    }
  }
  return null
}

/**
 * 获取树中所有节点的ID
 */
export function getAllNodeIds(nodes: TreeNode[]): number[] {
  const ids: number[] = []
  
  function traverse(node: TreeNode) {
    ids.push(node.id)
    if (node.children) {
      node.children.forEach(traverse)
    }
  }
  
  nodes.forEach(traverse)
  return ids
}

/**
 * 查找节点的所有子节点ID
 */
export function getChildrenIds(node: TreeNode): number[] {
  const ids: number[] = []
  
  function traverse(node: TreeNode) {
    if (node.children) {
      node.children.forEach(child => {
        ids.push(child.id)
        traverse(child)
      })
    }
  }
  
  traverse(node)
  return ids
}
