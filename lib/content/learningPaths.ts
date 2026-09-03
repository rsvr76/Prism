/**
 * Prism Phase 8B: Guided Learning Paths Content Registry
 * Centralized curriculum for structured DSA learning journeys.
 */

import { LearningPath, LearningStage, LearningLesson } from '@/types/learningPath';

export const DSA_FOUNDATIONS_PATH: LearningPath = {
  id: 'path-dsa-foundations',
  slug: 'dsa-foundations',
  title: 'DSA Foundations',
  tagline: 'Master core computer science data structures and algorithms from first principles.',
  description:
    'A carefully sequenced, beginner-friendly curriculum designed to build your algorithmic intuition. Learn contiguous memory, pointer-based structures, search mechanics, comparison sorting, and hierarchical binary trees with real step-by-step execution visualization.',
  difficulty: 'Beginner',
  estimatedTime: '3–4 hours',
  prerequisites: ['Basic Python syntax (variables, if-else, while/for loops)', 'Basic function definitions'],
  stages: [
    {
      id: 'stage-arrays',
      title: 'Stage 1: Contiguous Memory & Arrays',
      description: 'Understand how computers allocate memory in unbroken blocks and why arrays enable instant O(1) lookups.',
      order: 1,
      lessons: [
        {
          id: 'lesson-array-memory',
          slug: 'arrays-memory-access',
          stageId: 'stage-arrays',
          title: 'Dynamic Arrays & Direct Indexing',
          subtitle: 'Explore contiguous memory layout, instant O(1) index lookups, and insertion costs.',
          whyItMatters:
            'Almost every high-level data structure is built on arrays. Understanding how index numbers calculate physical RAM memory offsets is foundational to writing high-performance software.',
          learningObjectives: [
            'Understand contiguous memory allocation and the base-address pointer calculation',
            'Observe instant O(1) read and write operations by index',
            'Visualize the performance penalty of shifting elements during insertions',
          ],
          prerequisites: ['Basic Python variables', 'Loops'],
          conceptExplanation:
            'An array stores items consecutively in physical memory. Because elements sit right next to each other, accessing any index is a simple arithmetic formula: address = base_address + index * element_size. However, inserting in the middle requires sliding all subsequent items to make room, which takes O(n) time.',
          mentalModel:
            'Think of an array like a row of numbered lockers side-by-side. If you have locker number 3, you walk straight to it without opening lockers 0, 1, or 2.',
          algorithmSlug: 'array',
          order: 1,
        },
      ],
    },
    {
      id: 'stage-linked-lists',
      title: 'Stage 2: Pointer-Based Structures',
      description: 'Break free from fixed contiguous blocks by chaining independent node objects with memory pointers.',
      order: 2,
      lessons: [
        {
          id: 'lesson-linked-list-pointers',
          slug: 'linked-lists-pointers',
          stageId: 'stage-linked-lists',
          title: 'Singly Linked Lists & Node Chaining',
          subtitle: 'Chain independent heap objects with pointer references and explore sequential traversal.',
          whyItMatters:
            'When data size is unpredictable or memory is fragmented, linked lists allow instant O(1) head insertion without reserving large contiguous memory chunks.',
          learningObjectives: [
            'Understand node objects containing a value and a next pointer reference',
            'Trace pointer rewiring step-by-step during node prepending and traversal',
            'Contrast sequential pointer traversal with direct array indexing',
          ],
          prerequisites: ['Arrays', 'Python classes and object references'],
          conceptExplanation:
            'Instead of sitting together in memory, linked list nodes can be scattered anywhere in the heap. Each node holds its data and a memory reference to the next node. To find the 5th item, you must start at the head pointer and follow the pointer chain 4 times.',
          mentalModel:
            'A linked list is like a scavenger hunt: each clue (node) tells you where to find the next clue, ending when a clue points to nowhere (None).',
          algorithmSlug: 'linked-list',
          order: 2,
        },
      ],
    },
    {
      id: 'stage-searching',
      title: 'Stage 3: Search Algorithms',
      description: 'Compare linear scanning across arbitrary lists against divide-and-conquer on sorted collections.',
      order: 3,
      lessons: [
        {
          id: 'lesson-linear-search',
          slug: 'linear-search',
          stageId: 'stage-searching',
          title: 'Linear Search & Sequential Scanning',
          subtitle: 'The fundamental search strategy for unsorted collections.',
          whyItMatters:
            'When data has no guaranteed order or structure, checking every item one-by-one is the only reliable way to find a target.',
          learningObjectives: [
            'Implement sequential element inspection with immediate termination upon match',
            'Understand best-case O(1) vs worst-case O(n) performance',
            'Recognize when linear scanning is the only feasible search option',
          ],
          prerequisites: ['Arrays', 'Conditionals'],
          conceptExplanation:
            'Linear search starts at index 0 and inspects each item sequentially until either a match is found or the collection ends. Because it makes no assumptions about element ordering, it works on any iterable collection.',
          mentalModel:
            'Looking for your name on a shuffled sign-up sheet by reading from top to bottom until you spot it.',
          algorithmSlug: 'linear-search',
          order: 3,
        },
        {
          id: 'lesson-binary-search',
          slug: 'binary-search-divide-conquer',
          stageId: 'stage-searching',
          title: 'Binary Search & Divide-and-Conquer',
          subtitle: 'Cut the search space in half with every single comparison.',
          whyItMatters:
            'Searching 1,000,000,000 items takes up to 1,000,000,000 steps linearly, but fewer than 30 comparisons with binary search. It is the cornerstone of logarithmic efficiency.',
          learningObjectives: [
            'Maintain low, high, and mid index pointers simultaneously',
            'Recognize that sorted order is a strict prerequisite for binary search',
            'Understand why halving the remaining space yields O(log n) time complexity',
          ],
          prerequisites: ['Linear Search', 'Arrays', 'Sorted order concept'],
          conceptExplanation:
            'Binary search requires a sorted array. It checks the middle element: if the target is smaller, the entire right half is impossible, so high is updated to mid - 1. If larger, low becomes mid + 1. Each step discards 50% of the remaining search universe.',
          mentalModel:
            'Opening a dictionary right in the middle: if your target word is alphabetically later, you immediately ignore the entire left half of the book.',
          algorithmSlug: 'binary-search',
          order: 4,
        },
      ],
    },
    {
      id: 'stage-sorting',
      title: 'Stage 4: Comparison Sorting',
      description: 'Explore the mechanics of ordering collections through adjacent swaps, minimum selection, and adaptive insertion.',
      order: 4,
      lessons: [
        {
          id: 'lesson-bubble-sort',
          slug: 'bubble-sort-swapping',
          stageId: 'stage-sorting',
          title: 'Bubble Sort & Element Swapping',
          subtitle: 'Observe adjacent inversions bubble up to the end of the array.',
          whyItMatters:
            'Bubble sort is the simplest comparison sort. It clearly illustrates how comparing adjacent elements and swapping out-of-order pairs gradually produces sorted order.',
          learningObjectives: [
            'Track nested loop boundaries (n - i - 1) as sorted elements accumulate',
            'Observe pairwise adjacent comparisons and in-place swaps',
            'Understand why nested iterations yield quadratic O(n²) time complexity',
          ],
          prerequisites: ['Arrays', 'Nested loops'],
          conceptExplanation:
            'Bubble sort repeatedly passes through the list. If arr[j] > arr[j+1], they swap places. After each pass, the largest unsorted element has "bubbled up" to its permanent position at the end of the array.',
          mentalModel:
            'Heavy rocks sink to the bottom while light air bubbles float to the top on each pass.',
          algorithmSlug: 'bubble-sort',
          order: 5,
        },
        {
          id: 'lesson-selection-sort',
          slug: 'selection-sort-partitioning',
          stageId: 'stage-sorting',
          title: 'Selection Sort & Boundary Partitioning',
          subtitle: 'Repeatedly select the minimum element and grow the sorted prefix.',
          whyItMatters:
            'Selection sort minimizes the number of memory writes to at most n-1 swaps, making it valuable in systems where writing to memory is expensive (such as flash memory).',
          learningObjectives: [
            'Maintain a clear partition boundary between sorted and unsorted segments',
            'Track the min_idx pointer throughout the unsorted scan',
            'Recognize that comparisons remain O(n²) regardless of initial order',
          ],
          prerequisites: ['Bubble Sort', 'Nested loops'],
          conceptExplanation:
            'Selection sort divides the array into a sorted left section and an unsorted right section. It scans the entire unsorted section to find the minimum value, then performs exactly one swap to place it at the boundary.',
          mentalModel:
            'Scanning a pile of playing cards to find the lowest card, placing it on the table, then repeating for the second lowest.',
          algorithmSlug: 'selection-sort',
          order: 6,
        },
        {
          id: 'lesson-insertion-sort',
          slug: 'insertion-sort-adaptive',
          stageId: 'stage-sorting',
          title: 'Insertion Sort & Adaptive Shifting',
          subtitle: 'Slide elements into their proper position in an expanding sorted prefix.',
          whyItMatters:
            'Insertion sort is adaptive: on nearly-sorted data it runs in lightning-fast O(n) time, which is why it is used as the base-case sort in production hybrid algorithms like Python\'s Timsort.',
          learningObjectives: [
            'Shift larger elements to the right to open a slot for the key element',
            'Insert the key into the vacated opening',
            'Understand why the inner while loop terminates early on already-sorted prefixes',
          ],
          prerequisites: ['Bubble Sort', 'Selection Sort'],
          conceptExplanation:
            'Insertion sort inspects elements one-by-one. It picks up the current item (key), shifts all larger items in the sorted prefix to the right, and drops the key into the opening.',
          mentalModel:
            'Sorting cards in your hand: take one new card at a time and slide it into the right spot among the cards you are already holding.',
          algorithmSlug: 'insertion-sort',
          order: 7,
        },
      ],
    },
    {
      id: 'stage-trees',
      title: 'Stage 5: Hierarchical Structures',
      description: 'Step beyond linear sequences into multi-branching tree structures that model real-world hierarchies.',
      order: 5,
      lessons: [
        {
          id: 'lesson-binary-tree-hierarchy',
          slug: 'binary-trees-hierarchies',
          stageId: 'stage-trees',
          title: 'Binary Trees & Hierarchical Branching',
          subtitle: 'Model parent-child relationships where each node links to left and right children.',
          whyItMatters:
            'Hierarchical data—such as file directories, HTML DOM trees, and decision models—cannot be naturally represented in a 1D sequence without losing parent-child relationships.',
          learningObjectives: [
            'Master tree terminology: root, parent, child, leaf, depth, and height',
            'Visualize planar tree coordinates with left and right labeled edges',
            'Trace recursive node counting on the call stack',
          ],
          prerequisites: ['Linked Lists', 'Recursion'],
          conceptExplanation:
            'A binary tree starts with a single root node. Each node has at most two child pointers: left and right. Nodes with no children are called leaves. Traversal is naturally recursive because each child node is itself the root of a smaller subtree.',
          mentalModel:
            'An organizational chart or family tree branching downwards from the founder at the top.',
          algorithmSlug: 'binary-tree',
          order: 8,
        },
      ],
    },
    {
      id: 'stage-bst-traversal',
      title: 'Stage 6: Ordered Search & Traversal',
      description: 'Combine the speed of binary search with the dynamic allocation of trees, and extract sorted sequences with recursion.',
      order: 6,
      lessons: [
        {
          id: 'lesson-bst-property',
          slug: 'binary-search-tree-property',
          stageId: 'stage-bst-traversal',
          title: 'Binary Search Tree Invariants',
          subtitle: 'Enforce the ordering rule: left subtree < node < right subtree.',
          whyItMatters:
            'A Binary Search Tree gives you logarithmic O(log n) searches and insertions without having to shift memory like a sorted array.',
          learningObjectives: [
            'Enforce the BST invariant (left.value < node.value < right.value) on every node',
            'Trace branch selection (go left if smaller, go right if larger)',
            'Recognize degenerate unbalanced chains and why balanced height matters',
          ],
          prerequisites: ['Binary Trees', 'Binary Search'],
          conceptExplanation:
            'The BST invariant guarantees that for any node, all values in its left subtree are strictly smaller, and all values in its right subtree are strictly greater. Searching for a value follows a binary search path down the tree.',
          mentalModel:
            'A fork in the road at every step: smaller numbers always take the left path, larger numbers always take the right path.',
          algorithmSlug: 'binary-search-tree',
          order: 9,
        },
        {
          id: 'lesson-inorder-traversal',
          slug: 'inorder-tree-traversal',
          stageId: 'stage-bst-traversal',
          title: 'In-Order Traversal & Call Stack Recursion',
          subtitle: 'Visit Left, Root, Right recursively to extract perfectly sorted sequences.',
          whyItMatters:
            'In-order traversal demonstrates the deep connection between tree invariants and recursion: traversing a BST in-order magically produces values in exact sorted order.',
          learningObjectives: [
            'Follow the recursive Left -> Root -> Right visiting pattern',
            'Observe call stack frames pushing and popping as recursion backtracks',
            'Understand why in-order traversal of a BST always yields sorted output',
          ],
          prerequisites: ['Binary Search Trees', 'Recursion'],
          conceptExplanation:
            'In-order traversal recursively visits the left subtree, processes the current node, then recursively visits the right subtree. On a BST, this guarantees that all smaller elements are visited before the root, and the root before all larger elements.',
          mentalModel:
            'Exploring a mansion: thoroughly search every room in the left wing first, note the central hall, then search every room in the right wing.',
          algorithmSlug: 'inorder-traversal',
          order: 10,
        },
      ],
    },
  ],
};

export const LEARNING_PATHS_REGISTRY: LearningPath[] = [DSA_FOUNDATIONS_PATH];

// ==========================================
// QUERY & TRAVERSAL HELPERS
// ==========================================

export function getAllLearningPaths(): LearningPath[] {
  return LEARNING_PATHS_REGISTRY;
}

export function getLearningPathBySlug(slug: string): LearningPath | undefined {
  return LEARNING_PATHS_REGISTRY.find((p) => p.slug === slug);
}

export function getAllLessonsForPath(path: LearningPath): LearningLesson[] {
  const lessons: LearningLesson[] = [];
  for (const stage of path.stages) {
    for (const lesson of stage.lessons) {
      lessons.push(lesson);
    }
  }
  return lessons.sort((a, b) => a.order - b.order);
}

export function getLessonBySlug(
  pathSlug: string,
  lessonSlug: string
): {
  path: LearningPath;
  stage: LearningStage;
  lesson: LearningLesson;
  prevLesson?: LearningLesson;
  nextLesson?: LearningLesson;
} | undefined {
  const path = getLearningPathBySlug(pathSlug);
  if (!path) return undefined;

  const allLessons = getAllLessonsForPath(path);
  const lessonIndex = allLessons.findIndex((l) => l.slug === lessonSlug);
  if (lessonIndex === -1) return undefined;

  const lesson = allLessons[lessonIndex];
  const stage = path.stages.find((s) => s.id === lesson.stageId);
  if (!stage) return undefined;

  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : undefined;
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : undefined;

  return {
    path,
    stage,
    lesson,
    prevLesson,
    nextLesson,
  };
}
