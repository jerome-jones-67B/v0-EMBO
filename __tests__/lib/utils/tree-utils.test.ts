/**
 * Tests for tree utilities
 */

import {
  TreeNode,
  countFolders,
  countSelectableItems,
  getAllFolderIds,
  sortTreeNodes,
  findNodeById,
  getNodePath,
  flattenTree,
  filterTree,
  mapTree
} from '@/lib/utils/tree-utils'

describe('Tree Utils', () => {
  const sampleTree: TreeNode[] = [
    {
      id: 'folder1',
      name: 'Folder 1',
      type: 'folder',
      children: [
        { id: 'file1', name: 'File 1.txt', type: 'file' },
        { id: 'file2', name: 'File 2.txt', type: 'file' },
        {
          id: 'folder2',
          name: 'Folder 2',
          type: 'folder',
          children: [
            { id: 'file3', name: 'File 3.txt', type: 'file' }
          ]
        }
      ]
    },
    { id: 'zip1', name: 'Archive.zip', type: 'zip', children: [] },
    { id: 'file4', name: 'File 4.txt', type: 'file' }
  ]

  describe('countFolders', () => {
    it('should count all folders including nested ones', () => {
      expect(countFolders(sampleTree)).toBe(3) // folder1, folder2, zip1
    })

    it('should return 0 for empty array', () => {
      expect(countFolders([])).toBe(0)
    })

    it('should count only folders, not files', () => {
      const onlyFiles: TreeNode[] = [
        { id: 'file1', name: 'File 1', type: 'file' },
        { id: 'file2', name: 'File 2', type: 'file' }
      ]
      expect(countFolders(onlyFiles)).toBe(0)
    })
  })

  describe('countSelectableItems', () => {
    it('should count files and zip files', () => {
      expect(countSelectableItems(sampleTree)).toBe(5) // file1-4 + zip1
    })

    it('should not count folders as selectable', () => {
      const onlyFolders: TreeNode[] = [
        { id: 'folder1', name: 'Folder', type: 'folder', children: [] }
      ]
      expect(countSelectableItems(onlyFolders)).toBe(0)
    })
  })

  describe('getAllFolderIds', () => {
    it('should get all folder IDs recursively', () => {
      const ids = getAllFolderIds(sampleTree)
      expect(ids).toContain('folder1')
      expect(ids).toContain('folder2')
      expect(ids).toContain('zip1')
      expect(ids).toHaveLength(3)
    })

    it('should return empty array for tree with no folders', () => {
      const onlyFiles: TreeNode[] = [
        { id: 'file1', name: 'File', type: 'file' }
      ]
      expect(getAllFolderIds(onlyFiles)).toEqual([])
    })
  })

  describe('sortTreeNodes', () => {
    it('should sort folders before files', () => {
      const unsorted: TreeNode[] = [
        { id: 'file1', name: 'File', type: 'file' },
        { id: 'folder1', name: 'Folder', type: 'folder' }
      ]
      const sorted = sortTreeNodes(unsorted)
      expect(sorted[0].type).toBe('folder')
      expect(sorted[1].type).toBe('file')
    })

    it('should sort alphabetically within type', () => {
      const unsorted: TreeNode[] = [
        { id: 'folder2', name: 'Z Folder', type: 'folder' },
        { id: 'folder1', name: 'A Folder', type: 'folder' }
      ]
      const sorted = sortTreeNodes(unsorted)
      expect(sorted[0].name).toBe('A Folder')
      expect(sorted[1].name).toBe('Z Folder')
    })

    it('should sort recursively when requested', () => {
      const unsorted: TreeNode[] = [
        {
          id: 'folder1',
          name: 'Folder',
          type: 'folder',
          children: [
            { id: 'file2', name: 'Z.txt', type: 'file' },
            { id: 'file1', name: 'A.txt', type: 'file' }
          ]
        }
      ]
      const sorted = sortTreeNodes(unsorted, true)
      expect(sorted[0].children![0].name).toBe('A.txt')
      expect(sorted[0].children![1].name).toBe('Z.txt')
    })
  })

  describe('findNodeById', () => {
    it('should find node at root level', () => {
      const found = findNodeById(sampleTree, 'file4')
      expect(found).toBeDefined()
      expect(found?.name).toBe('File 4.txt')
    })

    it('should find nested node', () => {
      const found = findNodeById(sampleTree, 'file3')
      expect(found).toBeDefined()
      expect(found?.name).toBe('File 3.txt')
    })

    it('should return null for non-existent node', () => {
      const found = findNodeById(sampleTree, 'nonexistent')
      expect(found).toBeNull()
    })
  })

  describe('getNodePath', () => {
    it('should get path to root-level node', () => {
      const path = getNodePath(sampleTree, 'file4')
      expect(path).toEqual(['File 4.txt'])
    })

    it('should get path to nested node', () => {
      const path = getNodePath(sampleTree, 'file3')
      expect(path).toEqual(['Folder 1', 'Folder 2', 'File 3.txt'])
    })

    it('should return null for non-existent node', () => {
      const path = getNodePath(sampleTree, 'nonexistent')
      expect(path).toBeNull()
    })
  })

  describe('flattenTree', () => {
    it('should flatten tree to array', () => {
      const flat = flattenTree(sampleTree)
      expect(flat).toHaveLength(7) // All nodes
      expect(flat.some(n => n.id === 'file3')).toBe(true)
    })

    it('should include hierarchy info when requested', () => {
      const flat = flattenTree(sampleTree, true)
      const file3 = flat.find(n => n.id === 'file3')
      expect(file3?.level).toBe(2)
      expect(file3?.parentId).toBe('folder2')
    })
  })

  describe('filterTree', () => {
    it('should filter nodes by predicate', () => {
      const filtered = filterTree(sampleTree, node =>
        node.type === 'file'
      )
      // Should only contain files
      const allFiles = flattenTree(filtered).every(n => n.type === 'file')
      expect(allFiles).toBe(true)
    })

    it('should preserve parent folders if children match', () => {
      const filtered = filterTree(sampleTree, node =>
        node.id === 'file3'
      )
      // Should preserve folder1 and folder2 as ancestors of file3
      expect(findNodeById(filtered, 'folder1')).toBeDefined()
      expect(findNodeById(filtered, 'folder2')).toBeDefined()
      expect(findNodeById(filtered, 'file3')).toBeDefined()
    })
  })

  describe('mapTree', () => {
    it('should transform all nodes', () => {
      const mapped = mapTree(sampleTree, node => ({
        ...node,
        name: node.name.toUpperCase()
      }))

      const allUpperCase = flattenTree(mapped).every(n =>
        n.name === n.name.toUpperCase()
      )
      expect(allUpperCase).toBe(true)
    })

    it('should preserve tree structure', () => {
      const mapped = mapTree(sampleTree, node => node)
      expect(mapped).toHaveLength(sampleTree.length)
      expect(findNodeById(mapped, 'file3')).toBeDefined()
    })
  })
})
