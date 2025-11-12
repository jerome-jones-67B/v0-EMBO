/**
 * Tree Utilities
 *
 * This module provides utility functions for working with hierarchical tree structures,
 * particularly for file trees and folder navigation.
 *
 * @module tree-utils
 */

export interface TreeNode<T = any> {
  id: string
  name: string
  type: 'folder' | 'file' | 'zip'
  children?: TreeNode<T>[]
  data?: T
}

/**
 * Recursively counts all folders in a tree structure
 *
 * @param nodes - Array of tree nodes to count
 * @returns Total number of folders (including nested folders)
 *
 * @example
 * ```typescript
 * const tree = [
 *   { id: '1', name: 'folder1', type: 'folder', children: [
 *     { id: '2', name: 'folder2', type: 'folder' }
 *   ]}
 * ]
 * countFolders(tree) // returns 2
 * ```
 */
export function countFolders<T>(nodes: TreeNode<T>[]): number {
  return nodes.reduce((count, node) => {
    if (node.type === 'folder' || node.type === 'zip') {
      return count + 1 + (node.children ? countFolders(node.children) : 0)
    }
    return count
  }, 0)
}

/**
 * Recursively counts all selectable items (files and zip files) in a tree
 *
 * @param nodes - Array of tree nodes to count
 * @returns Total number of selectable items
 */
export function countSelectableItems<T>(nodes: TreeNode<T>[]): number {
  return nodes.reduce((count, node) => {
    if (node.type === 'file' || node.type === 'zip') {
      return count + 1
    } else if (node.children) {
      return count + countSelectableItems(node.children)
    }
    return count
  }, 0)
}

/**
 * Gets all folder IDs from a tree structure (recursively)
 *
 * @param nodes - Array of tree nodes
 * @returns Array of all folder IDs
 *
 * @example
 * ```typescript
 * const tree = [
 *   { id: 'folder1', name: 'Folder 1', type: 'folder', children: [
 *     { id: 'folder2', name: 'Folder 2', type: 'folder' }
 *   ]}
 * ]
 * getAllFolderIds(tree) // returns ['folder1', 'folder2']
 * ```
 */
export function getAllFolderIds<T>(nodes: TreeNode<T>[]): string[] {
  const folderIds: string[] = []

  function traverse(nodes: TreeNode<T>[]) {
    nodes.forEach(node => {
      if (node.type === 'folder' || node.type === 'zip') {
        folderIds.push(node.id)
        if (node.children) {
          traverse(node.children)
        }
      }
    })
  }

  traverse(nodes)
  return folderIds
}

/**
 * Sorts tree nodes: folders first (alphabetically), then files (alphabetically)
 *
 * @param nodes - Array of tree nodes to sort
 * @param recursive - Whether to recursively sort children
 * @returns Sorted array of tree nodes
 */
export function sortTreeNodes<T>(
  nodes: TreeNode<T>[],
  recursive: boolean = true
): TreeNode<T>[] {
  const sorted = [...nodes].sort((a, b) => {
    // Folders and zips come before files
    if (a.type !== b.type) {
      if (a.type === 'folder' || a.type === 'zip') return -1
      if (b.type === 'folder' || b.type === 'zip') return 1
    }
    // Alphabetical within same type
    return a.name.localeCompare(b.name)
  })

  // Recursively sort children if requested
  if (recursive) {
    return sorted.map(node => ({
      ...node,
      children: node.children ? sortTreeNodes(node.children, true) : undefined
    }))
  }

  return sorted
}

/**
 * Finds a node in the tree by its ID
 *
 * @param nodes - Array of tree nodes to search
 * @param id - ID of the node to find
 * @returns The found node or null
 */
export function findNodeById<T>(
  nodes: TreeNode<T>[],
  id: string
): TreeNode<T> | null {
  for (const node of nodes) {
    if (node.id === id) return node

    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }

  return null
}

/**
 * Gets the path to a node as an array of node names
 *
 * @param nodes - Array of tree nodes to search
 * @param id - ID of the target node
 * @returns Array of node names representing the path, or null if not found
 *
 * @example
 * ```typescript
 * getNodePath(tree, 'file123')
 * // returns ['Root', 'Folder1', 'Subfolder', 'file123']
 * ```
 */
export function getNodePath<T>(
  nodes: TreeNode<T>[],
  id: string,
  currentPath: string[] = []
): string[] | null {
  for (const node of nodes) {
    const newPath = [...currentPath, node.name]

    if (node.id === id) return newPath

    if (node.children) {
      const found = getNodePath(node.children, id, newPath)
      if (found) return found
    }
  }

  return null
}

/**
 * Flattens a tree structure into a flat array
 *
 * @param nodes - Array of tree nodes
 * @param includeHierarchy - Whether to include parent information
 * @returns Flat array of nodes
 */
export function flattenTree<T>(
  nodes: TreeNode<T>[],
  includeHierarchy: boolean = false
): Array<TreeNode<T> & { level?: number, parentId?: string }> {
  const result: Array<TreeNode<T> & { level?: number, parentId?: string }> = []

  function traverse(
    nodes: TreeNode<T>[],
    level: number = 0,
    parentId?: string
  ) {
    nodes.forEach(node => {
      result.push(
        includeHierarchy
          ? { ...node, level, parentId }
          : node
      )

      if (node.children) {
        traverse(node.children, level + 1, node.id)
      }
    })
  }

  traverse(nodes)
  return result
}

/**
 * Filters tree nodes based on a predicate function
 * Preserves parent nodes if any descendant matches
 *
 * @param nodes - Array of tree nodes to filter
 * @param predicate - Function to test each node
 * @returns Filtered tree preserving structure
 */
export function filterTree<T>(
  nodes: TreeNode<T>[],
  predicate: (node: TreeNode<T>) => boolean
): TreeNode<T>[] {
  return nodes.reduce<TreeNode<T>[]>((acc, node) => {
    // Check if node itself matches
    const nodeMatches = predicate(node)

    // Filter children recursively
    const filteredChildren = node.children
      ? filterTree(node.children, predicate)
      : undefined

    // Include node if it matches or has matching children
    if (nodeMatches || (filteredChildren && filteredChildren.length > 0)) {
      acc.push({
        ...node,
        children: filteredChildren
      })
    }

    return acc
  }, [])
}

/**
 * Maps over tree nodes, transforming each node
 *
 * @param nodes - Array of tree nodes to map
 * @param mapper - Function to transform each node
 * @returns Transformed tree
 */
export function mapTree<T, U>(
  nodes: TreeNode<T>[],
  mapper: (node: TreeNode<T>) => TreeNode<U>
): TreeNode<U>[] {
  return nodes.map(node => {
    const mapped = mapper(node)
    return {
      ...mapped,
      children: node.children
        ? mapTree(node.children, mapper)
        : undefined
    }
  })
}
