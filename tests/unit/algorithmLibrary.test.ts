import { describe, it, expect } from 'vitest';
import {
  ALGORITHM_REGISTRY,
  getAllAlgorithms,
  getAlgorithmBySlug,
  getAlgorithmById,
  getAlgorithmsByCategory,
  searchAlgorithms,
} from '@/lib/content/algorithms';
import { validateCodePreflight } from '@/lib/execution/astValidator';
import { DEFAULT_EXECUTION_LIMITS } from '@/lib/config/executionLimits';
import { runRealPythonTrace } from '../helpers/realPythonRunner';
import { detectStructures } from '@/lib/visualization/structureDetector';

describe('Phase 8A: Algorithm Library Content & Architecture', () => {

  describe('1. Content Model & Invariant Integrity', () => {
    it('contains all required initial topics across Data Structures and Algorithms', () => {
      const all = getAllAlgorithms();
      expect(all.length).toBeGreaterThanOrEqual(10);

      const dataStructures = getAlgorithmsByCategory('data-structures');
      const algorithms = getAlgorithmsByCategory('algorithms');

      expect(dataStructures.length).toBeGreaterThanOrEqual(4);
      expect(algorithms.length).toBeGreaterThanOrEqual(6);

      // Verify specific required topics
      const requiredSlugs = [
        'array',
        'linked-list',
        'binary-tree',
        'binary-search-tree',
        'bubble-sort',
        'selection-sort',
        'insertion-sort',
        'linear-search',
        'binary-search',
        'inorder-traversal',
      ];

      for (const slug of requiredSlugs) {
        const found = getAlgorithmBySlug(slug);
        expect(found, `Missing required topic: ${slug}`).toBeDefined();
      }
    });

    it('enforces unique IDs and unique slugs across all algorithm definitions', () => {
      const all = getAllAlgorithms();
      const ids = new Set<string>();
      const slugs = new Set<string>();

      for (const algo of all) {
        expect(ids.has(algo.id), `Duplicate id found: ${algo.id}`).toBe(false);
        expect(slugs.has(algo.slug), `Duplicate slug found: ${algo.slug}`).toBe(false);
        ids.add(algo.id);
        slugs.add(algo.slug);
      }
    });

    it('enforces all required fields are present, valid, and non-empty', () => {
      const all = getAllAlgorithms();

      for (const algo of all) {
        expect(algo.id.trim().length).toBeGreaterThan(0);
        expect(algo.slug.trim().length).toBeGreaterThan(0);
        expect(algo.name.trim().length).toBeGreaterThan(0);
        expect(['data-structures', 'algorithms']).toContain(algo.category);
        expect(['Beginner', 'Intermediate', 'Advanced']).toContain(algo.difficulty);
        expect(algo.description.trim().length).toBeGreaterThan(15);
        expect(algo.whatItDoes.trim().length).toBeGreaterThan(20);
        expect(algo.howItWorks.length).toBeGreaterThanOrEqual(3);
        expect(algo.pythonCode.trim().length).toBeGreaterThan(30);

        // Time complexity fields
        expect(algo.timeComplexity.best.trim().length).toBeGreaterThan(0);
        expect(algo.timeComplexity.average.trim().length).toBeGreaterThan(0);
        expect(algo.timeComplexity.worst.trim().length).toBeGreaterThan(0);

        // Space complexity fields
        expect(algo.spaceComplexity.worst.trim().length).toBeGreaterThan(0);

        // Visualizer target
        expect(['1d_array', 'singly_linked_list', 'binary_tree']).toContain(algo.visualizationType);

        // Tags & Educational prompts
        expect(algo.tags.length).toBeGreaterThanOrEqual(2);
        expect(algo.whatToWatch.length).toBeGreaterThanOrEqual(2);
        expect(algo.suggestedTutorQuestions.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('returns undefined for non-existent slugs and IDs', () => {
      expect(getAlgorithmBySlug('non-existent-algo')).toBeUndefined();
      expect(getAlgorithmById('fake-id-12345')).toBeUndefined();
    });
  });

  describe('2. Python Example Safety & AST Preflight Compliance', () => {
    it('validates that EVERY algorithm example passes AST preflight checks', () => {
      const all = getAllAlgorithms();

      for (const algo of all) {
        const preflight = validateCodePreflight(algo.pythonCode, DEFAULT_EXECUTION_LIMITS);
        expect(
          preflight.isValid,
          `Python preflight failed for ${algo.name}: ${preflight.errorMessage}`
        ).toBe(true);
        expect(preflight.status).toBe('SUCCESS');
      }
    });

    it('confirms every Python example contains fewer than 100 source lines', () => {
      const all = getAllAlgorithms();

      for (const algo of all) {
        const lineCount = algo.pythonCode.split('\n').length;
        expect(
          lineCount,
          `${algo.name} code exceeds 100 lines (${lineCount} lines)`
        ).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('3. Search and Filtering Logic', () => {
    it('filters accurately by category', () => {
      const dsOnly = searchAlgorithms('', 'data-structures');
      expect(dsOnly.every((a) => a.category === 'data-structures')).toBe(true);
      expect(dsOnly.length).toBe(4);

      const algoOnly = searchAlgorithms('', 'algorithms');
      expect(algoOnly.every((a) => a.category === 'algorithms')).toBe(true);
      expect(algoOnly.length).toBe(6);
    });

    it('filters accurately by difficulty', () => {
      const beginnerOnly = searchAlgorithms('', 'all', 'beginner');
      expect(beginnerOnly.every((a) => a.difficulty === 'Beginner')).toBe(true);
      expect(beginnerOnly.length).toBeGreaterThanOrEqual(6);

      const intermediateOnly = searchAlgorithms('', 'all', 'intermediate');
      expect(intermediateOnly.every((a) => a.difficulty === 'Intermediate')).toBe(true);
      expect(intermediateOnly.length).toBeGreaterThanOrEqual(3);
    });

    it('searches text query across name, description, and tags case-insensitively', () => {
      // By name
      const bubbleResults = searchAlgorithms('bubble');
      expect(bubbleResults.some((a) => a.slug === 'bubble-sort')).toBe(true);

      // By tag
      const pointerResults = searchAlgorithms('pointers');
      expect(pointerResults.length).toBeGreaterThan(0);

      // By keyword in description
      const searchResults = searchAlgorithms('divide-and-conquer');
      expect(searchResults.some((a) => a.slug === 'binary-search')).toBe(true);

      // Empty query returns all
      const allResults = searchAlgorithms('');
      expect(allResults.length).toBe(ALGORITHM_REGISTRY.length);

      // Bogus query returns empty array
      const noResults = searchAlgorithms('zyxwvutsrqp-nonexistent');
      expect(noResults).toHaveLength(0);
    });
  });

  describe('4. Real Python Execution Engine Verification (Representative Examples)', () => {
    it('executes Bubble Sort Python example and generates valid 1D Array trace', () => {
      const bubbleSort = getAlgorithmBySlug('bubble-sort');
      expect(bubbleSort).toBeDefined();

      const trace = runRealPythonTrace(bubbleSort!.pythonCode);
      expect(trace.status).toBe('SUCCESS');
      expect(trace.totalSteps).toBeGreaterThan(15);

      // Check that a 1d_array structure is detected
      let arrayDetected = false;
      for (const frame of trace.frames) {
        const structures = detectStructures(frame);
        if (structures.some((s) => s.structureType === '1d_array')) {
          arrayDetected = true;
          break;
        }
      }
      expect(arrayDetected).toBe(true);
    }, 15000);

    it('executes Binary Search Python example and verifies pointer states', () => {
      const binarySearch = getAlgorithmBySlug('binary-search');
      expect(binarySearch).toBeDefined();

      const trace = runRealPythonTrace(binarySearch!.pythonCode);
      expect(trace.status).toBe('SUCCESS');
      expect(trace.totalSteps).toBeGreaterThan(10);

      // Verify stdout contains the result
      const lastFrame = trace.frames[trace.frames.length - 1];
      expect(lastFrame.stdout.some((line) => line.includes('Target 23 found at index: 5'))).toBe(true);
    });

    it('executes Singly Linked List Python example and verifies pointer chain detection', () => {
      const linkedList = getAlgorithmBySlug('linked-list');
      expect(linkedList).toBeDefined();

      const trace = runRealPythonTrace(linkedList!.pythonCode);
      expect(trace.status).toBe('SUCCESS');
      expect(trace.totalSteps).toBeGreaterThan(15);

      // Verify singly_linked_list is detected in the frames
      let listDetected = false;
      for (const frame of trace.frames) {
        const structures = detectStructures(frame);
        if (structures.some((s) => s.structureType === 'singly_linked_list')) {
          listDetected = true;
          break;
        }
      }
      expect(listDetected).toBe(true);
      const lastFrame = trace.frames[trace.frames.length - 1];
      expect(lastFrame.stdout.some((line) => line.includes('Total sum of linked list: 65'))).toBe(true);
    });

    it('executes In-Order Tree Traversal Python example and verifies binary tree detection', () => {
      const treeTraversal = getAlgorithmBySlug('inorder-traversal');
      expect(treeTraversal).toBeDefined();

      const trace = runRealPythonTrace(treeTraversal!.pythonCode);
      expect(trace.status).toBe('SUCCESS');
      expect(trace.totalSteps).toBeGreaterThan(15);

      let treeDetected = false;
      for (const frame of trace.frames) {
        const structures = detectStructures(frame);
        if (structures.some((s) => s.structureType === 'binary_tree')) {
          treeDetected = true;
          break;
        }
      }
      expect(treeDetected).toBe(true);
      const lastFrame = trace.frames[trace.frames.length - 1];
      expect(lastFrame.stdout.some((line) => line.includes('[2, 5, 7, 10, 15]'))).toBe(true);
    });
  });
});
