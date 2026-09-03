import { AlgorithmDefinition, AlgorithmCategory } from '@/types/content';

export const ALGORITHM_REGISTRY: AlgorithmDefinition[] = [
  // ==========================================
  // DATA STRUCTURES
  // ==========================================
  {
    id: 'ds-array',
    slug: 'array',
    name: 'Array',
    category: 'data-structures',
    difficulty: 'Beginner',
    description: 'A contiguous sequence of elements stored in memory that allows direct O(1) index access.',
    whatItDoes:
      'An array stores items of similar type consecutively in memory. Because each element has an index (0, 1, 2, ...), you can instantly look up or modify any item if you know where it lives.',
    howItWorks: [
      'Memory is allocated in a single unbroken block.',
      'Accessing an index calculates memory address as: base_address + index * element_size.',
      'Appending to a dynamic array takes amortized O(1) time.',
      'Inserting or deleting elements in the middle requires shifting subsequent elements, taking O(n) time.',
    ],
    pythonCode: `# Dynamic Array Operations
# Observe direct indexing, element mutations, and sequential traversal.

numbers = [10, 25, 40, 55, 70]

# Access by index: O(1)
first_item = numbers[0]
middle_item = numbers[2]

# In-place element update: O(1)
numbers[1] = 99

# Append element: O(1) amortized
numbers.append(85)

# Calculate sum via traversal: O(n)
total = 0
for x in numbers:
    total += x

print("Modified numbers:", numbers)
print("Sum of elements:", total)`,
    timeComplexity: {
      best: 'O(1) access',
      average: 'O(1) access, O(n) insert/delete',
      worst: 'O(n) for arbitrary insert/delete',
      explanation: 'Index lookups are instant arithmetic calculations. Modifying the array size requires shifting elements.',
    },
    spaceComplexity: {
      worst: 'O(n)',
      explanation: 'Requires contiguous space proportional to the number of stored elements.',
    },
    prerequisites: ['Basic variables', 'Loops'],
    visualizationType: '1d_array',
    tags: ['linear', 'contiguous', 'indexing', 'fundamentals'],
    whatToWatch: [
      'Watch how the array visualizer displays each element card with its 0-based index.',
      'Notice the index pointer moving sequentially as the loop executes.',
      'Observe the instant update of the element at index 1 from 25 to 99.',
    ],
    suggestedTutorQuestions: [
      'Why is accessing numbers[2] an O(1) operation?',
      'What happens in memory when an array needs to grow larger?',
      'Why does inserting at the beginning take O(n) time?',
    ],
  },
  {
    id: 'ds-linked-list',
    slug: 'linked-list',
    name: 'Singly Linked List',
    category: 'data-structures',
    difficulty: 'Beginner',
    description: 'A linear chain of node objects where each node stores a value and a pointer reference to the next node.',
    whatItDoes:
      'Unlike arrays, linked list nodes do not need to sit next to each other in memory. Instead, each node contains a value and a pointer (next) pointing to the address of the subsequent node, terminating at None.',
    howItWorks: [
      'Each node is an independent heap object with val and next fields.',
      'The list begins with a head pointer pointing to the first node.',
      'Traversal moves step-by-step by updating curr = curr.next until reaching None.',
      'Prepending a node takes O(1) time because no elements need to be shifted.',
    ],
    pythonCode: `# Singly Linked List Construction & Traversal
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

# Build 3-node linked list: 10 -> 20 -> 30 -> None
head = Node(10)
head.next = Node(20)
head.next.next = Node(30)

# Prepend new head: 5 -> 10 -> 20 -> 30
new_head = Node(5)
new_head.next = head
head = new_head

# Traverse and sum all node values
curr = head
total = 0
while curr:
    total += curr.val
    curr = curr.next

print("Total sum of linked list:", total)`,
    timeComplexity: {
      best: 'O(1) prepend/head insert',
      average: 'O(n) search/access by index',
      worst: 'O(n) traversal to end',
      explanation: 'You cannot jump directly to index k; you must traverse through all preceding nodes from the head.',
    },
    spaceComplexity: {
      worst: 'O(n)',
      explanation: 'Allocates heap memory for each node plus overhead for the pointer reference.',
    },
    prerequisites: ['Classes and Objects', 'References/Pointers'],
    visualizationType: 'singly_linked_list',
    tags: ['pointers', 'nodes', 'dynamic', 'references'],
    whatToWatch: [
      'Observe new heap objects appearing in the visualizer as Node(val) is instantiated.',
      'Notice the next pointer arrows connecting node compartments in React Flow.',
      'Watch the curr pointer badge jump from node to node during the while loop.',
    ],
    suggestedTutorQuestions: [
      'Why does prepending a node take O(1) time in a linked list?',
      'What would happen if we lose reference to head?',
      'How does Python garbage collection clean up nodes?',
    ],
  },
  {
    id: 'ds-binary-tree',
    slug: 'binary-tree',
    name: 'Binary Tree',
    category: 'data-structures',
    difficulty: 'Intermediate',
    description: 'A hierarchical node structure where each node has at most two children: left and right.',
    whatItDoes:
      'A binary tree organizes data hierarchically starting from a single root node. Each node can branch out to up to two child nodes, creating levels and branches ideal for modeling decision trees, expressions, and search spaces.',
    howItWorks: [
      'The topmost node is called the root.',
      'Every node has a value and two child pointers: left and right.',
      'A node with no children is called a leaf node.',
      'Relationships are hierarchical: parents link downward to children.',
    ],
    pythonCode: `# Binary Tree Construction
class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

# Build hierarchical tree:
#        1
#       / \\
#      2   3
#     / \\
#    4   5
root = Node(1)
root.left = Node(2)
root.right = Node(3)
root.left.left = Node(4)
root.left.right = Node(5)

# Count total nodes recursively
def count_nodes(node):
    if not node:
        return 0
    return 1 + count_nodes(node.left) + count_nodes(node.right)

total_nodes = count_nodes(root)
print("Total nodes in tree:", total_nodes)`,
    timeComplexity: {
      best: 'O(1) root access',
      average: 'O(n) traversal of all nodes',
      worst: 'O(n) traversal',
      explanation: 'Visiting every node in an unconstrained binary tree requires visiting each branch, taking O(n) total operations.',
    },
    spaceComplexity: {
      worst: 'O(h)',
      explanation: 'Recursive call stack consumes O(h) space where h is tree height (O(log n) balanced, O(n) degenerate).',
    },
    prerequisites: ['Recursion', 'Classes and Objects', 'Pointers'],
    visualizationType: 'binary_tree',
    tags: ['hierarchical', 'tree', 'recursion', 'branching'],
    whatToWatch: [
      'Notice the planar in-order coordinate layout separating left and right children.',
      'Watch the labeled L and R edges dynamically connect parent nodes to children.',
      'Observe the call stack grow and shrink during recursive node counting.',
    ],
    suggestedTutorQuestions: [
      'What is the difference between tree depth and tree height?',
      'Why is recursion the natural way to traverse binary trees?',
      'What defines a leaf node?',
    ],
  },
  {
    id: 'ds-binary-search-tree',
    slug: 'binary-search-tree',
    name: 'Binary Search Tree (BST)',
    category: 'data-structures',
    difficulty: 'Intermediate',
    description: 'A binary tree where all left descendants are smaller than the node, and all right descendants are greater.',
    whatItDoes:
      'A Binary Search Tree maintains a strict ordering property: for every node, everything in its left subtree has a smaller key, and everything in its right subtree has a larger key. This allows binary search-like speed on dynamic data.',
    howItWorks: [
      'BST Invariant: left.value < node.value < right.value for all subtrees.',
      'To insert or search a value, compare with current node: if smaller go left, if larger go right.',
      'In-order traversal of a BST always yields values in strictly sorted ascending order.',
      'If balanced, search, insert, and delete take O(log n) time.',
    ],
    pythonCode: `# Binary Search Tree Insertion & Search
class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def insert(root, val):
    if not root:
        return Node(val)
    if val < root.value:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

# Insert values: 50, 30, 70, 20, 40
root = Node(50)
insert(root, 30)
insert(root, 70)
insert(root, 20)
insert(root, 40)

# Search for target 40
target = 40
curr = root
found = False
while curr:
    if curr.value == target:
        found = True
        break
    elif target < curr.value:
        curr = curr.left
    else:
        curr = curr.right

print("Target found in BST:", found)`,
    timeComplexity: {
      best: 'O(1) when target is root',
      average: 'O(log n) search/insert when balanced',
      worst: 'O(n) if inserted in sorted order (degenerate line)',
      explanation: 'Each step discards half the remaining subtree when balanced, yielding logarithmic height.',
    },
    spaceComplexity: {
      worst: 'O(n) total nodes, O(h) recursion stack',
      explanation: 'Stores n node heap objects. Search requires O(1) space iteratively or O(h) recursively.',
    },
    prerequisites: ['Binary Tree', 'Recursion', 'Binary Search concept'],
    visualizationType: 'binary_tree',
    tags: ['bst', 'ordered', 'search', 'tree'],
    whatToWatch: [
      'Watch smaller values (20, 30, 40) branch to the left and larger values (70) branch to the right.',
      'Observe the curr pointer badge traverse down the tree during the search loop.',
      'Notice how the search terminates immediately when curr.value == 40.',
    ],
    suggestedTutorQuestions: [
      'What happens to BST performance if items are inserted in sorted order?',
      'Why does in-order traversal of a BST produce a sorted list?',
      'How does a BST compare to a sorted array for inserts and lookups?',
    ],
  },

  // ==========================================
  // ALGORITHMS
  // ==========================================
  {
    id: 'algo-bubble-sort',
    slug: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'algorithms',
    difficulty: 'Beginner',
    description: 'A comparison-based sorting algorithm that repeatedly steps through the list and swaps adjacent out-of-order elements.',
    whatItDoes:
      'Bubble Sort repeatedly compares neighboring pairs of numbers. If the left number is greater than the right number, they swap places. After each full pass, the largest remaining number "bubbles up" to its correct position at the end.',
    howItWorks: [
      'Iterate through the array with outer loop index i from 0 to n-1.',
      'Inner loop index j compares adjacent elements arr[j] and arr[j+1].',
      'If arr[j] > arr[j+1], swap them.',
      'After pass i, the last i elements are guaranteed to be in their final sorted positions.',
    ],
    pythonCode: `# Bubble Sort Algorithm
# Watch adjacent elements compare and swap until sorted.

def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                # Swap adjacent elements
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

numbers = [5, 2, 8, 1, 4]
sorted_arr = bubble_sort(numbers)
print("Sorted array:", sorted_arr)`,
    timeComplexity: {
      best: 'O(n) if already sorted with early termination',
      average: 'O(n²)',
      worst: 'O(n²)',
      explanation: 'Requires nested loops comparing up to n*(n-1)/2 pairs in the worst case.',
    },
    spaceComplexity: {
      worst: 'O(1)',
      explanation: 'Sorts in-place with only a few scalar pointers and temporary swap variables.',
    },
    prerequisites: ['Arrays', 'Nested Loops'],
    visualizationType: '1d_array',
    tags: ['sorting', 'comparison', 'in-place', 'quadratic'],
    whatToWatch: [
      'Watch comparing indicators highlight arr[j] and arr[j+1] on each step.',
      'Observe swap highlights when adjacent elements trade places.',
      'Notice the rightmost elements turning green (sorted) as larger values bubble to the end.',
    ],
    suggestedTutorQuestions: [
      'Why is Bubble Sort called "bubble" sort?',
      'Why does the inner loop run up to n - i - 1 instead of n - 1?',
      'How could we optimize Bubble Sort if the array becomes sorted early?',
    ],
  },
  {
    id: 'algo-selection-sort',
    slug: 'selection-sort',
    name: 'Selection Sort',
    category: 'algorithms',
    difficulty: 'Beginner',
    description: 'An in-place comparison sort that divides the array into sorted and unsorted segments, repeatedly picking the minimum element.',
    whatItDoes:
      'Selection Sort divides the list into two parts: sorted on the left, unsorted on the right. In each round, it scans the entire unsorted portion, finds the smallest number, and swaps it into the beginning of the unsorted segment.',
    howItWorks: [
      'Outer loop i marks the boundary between sorted and unsorted segments.',
      'Assume arr[i] is the minimum, storing min_idx = i.',
      'Inner loop j scans from i+1 to the end, updating min_idx whenever arr[j] < arr[min_idx].',
      'Swap arr[i] with arr[min_idx], growing the sorted prefix by one.',
    ],
    pythonCode: `# Selection Sort Algorithm
# Repeatedly finds the minimum element and places it at the front.

def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        # Swap minimum found with first unsorted element
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

numbers = [29, 10, 14, 37, 13]
sorted_arr = selection_sort(numbers)
print("Sorted array:", sorted_arr)`,
    timeComplexity: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
      explanation: 'Always scans the entire remaining unsorted list to find the minimum, regardless of initial order.',
    },
    spaceComplexity: {
      worst: 'O(1)',
      explanation: 'Sorts strictly in-place with constant auxiliary variables.',
    },
    prerequisites: ['Arrays', 'Nested Loops'],
    visualizationType: '1d_array',
    tags: ['sorting', 'comparison', 'in-place', 'minimum-finding'],
    whatToWatch: [
      'Notice min_idx updating as the inner loop finds smaller values.',
      'Watch exactly one swap occur per outer loop pass.',
      'Observe the sorted boundary advancing from left to right.',
    ],
    suggestedTutorQuestions: [
      'Why does Selection Sort perform O(n²) comparisons even if the list is already sorted?',
      'Why is Selection Sort useful when memory write operations are extremely expensive?',
      'What is the difference between Bubble Sort and Selection Sort swaps?',
    ],
  },
  {
    id: 'algo-insertion-sort',
    slug: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'algorithms',
    difficulty: 'Beginner',
    description: 'Builds the final sorted array one item at a time by inserting each element into its proper position in the sorted prefix.',
    whatItDoes:
      'Like sorting playing cards in your hand, Insertion Sort takes one number at a time from the unsorted section and shifts larger numbers to the right until it finds the correct slot to insert it.',
    howItWorks: [
      'Start with the second element (index 1), assuming index 0 is already sorted.',
      'Store current value in key = arr[i].',
      'Shift elements greater than key one position to the right.',
      'Insert key into the vacated opening.',
      'Highly efficient for small or nearly-sorted datasets.',
    ],
    pythonCode: `# Insertion Sort Algorithm
# Inserts each element into its correct slot in the sorted prefix.

def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        # Shift elements greater than key to the right
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

numbers = [12, 11, 13, 5, 6]
sorted_arr = insertion_sort(numbers)
print("Sorted array:", sorted_arr)`,
    timeComplexity: {
      best: 'O(n) when already sorted',
      average: 'O(n²)',
      worst: 'O(n²) when reverse sorted',
      explanation: 'When already sorted, the inner while condition immediately fails, taking only n-1 comparisons.',
    },
    spaceComplexity: {
      worst: 'O(1)',
      explanation: 'In-place sorting requiring only key and loop index variables.',
    },
    prerequisites: ['Arrays', 'While loops'],
    visualizationType: '1d_array',
    tags: ['sorting', 'incremental', 'in-place', 'adaptive'],
    whatToWatch: [
      'Watch key store the current value to be inserted.',
      'Observe elements sliding to the right to make room.',
      'Notice how fast it completes when elements are already in order.',
    ],
    suggestedTutorQuestions: [
      'Why is Insertion Sort faster on nearly sorted data than Bubble Sort?',
      'How does Insertion Sort compare to Selection Sort in terms of worst-case swaps?',
      'Why is Insertion Sort often used as the base-case sort in hybrid algorithms like Timsort?',
    ],
  },
  {
    id: 'algo-linear-search',
    slug: 'linear-search',
    name: 'Linear Search',
    category: 'algorithms',
    difficulty: 'Beginner',
    description: 'A straightforward search algorithm that checks every element sequentially until a match is found or the list ends.',
    whatItDoes:
      'Linear Search is the simplest search strategy: start at the first item and check each item one by one. It works on any list, whether sorted or unsorted.',
    howItWorks: [
      'Iterate through the array index by index from 0 to len(arr) - 1.',
      'At each index i, compare arr[i] with target.',
      'If match is found, immediately return index i.',
      'If loop completes without match, return -1 (not found).',
    ],
    pythonCode: `# Linear Search Algorithm
# Sequentially checks each index until target is found.

def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

items = [4, 2, 7, 1, 9, 3]
target_val = 1

result_idx = linear_search(items, target_val)
print("Target", target_val, "found at index:", result_idx)`,
    timeComplexity: {
      best: 'O(1) when target is at first index',
      average: 'O(n/2) -> O(n)',
      worst: 'O(n) when target is at end or not present',
      explanation: 'Must examine every element in the worst case when the list has no guaranteed order.',
    },
    spaceComplexity: {
      worst: 'O(1)',
      explanation: 'Requires only loop pointer variable i.',
    },
    prerequisites: ['Arrays', 'Conditionals'],
    visualizationType: '1d_array',
    tags: ['search', 'sequential', 'linear', 'simple'],
    whatToWatch: [
      'Observe index pointer i advancing step-by-step from index 0.',
      'Notice the comparison on each step between arr[i] and target_val.',
      'Watch the loop terminate immediately once arr[3] == 1 evaluates to True.',
    ],
    suggestedTutorQuestions: [
      'When is Linear Search preferred over Binary Search?',
      'What is the worst-case scenario for Linear Search?',
      'Does Linear Search require the input list to be sorted?',
    ],
  },
  {
    id: 'algo-binary-search',
    slug: 'binary-search',
    name: 'Binary Search',
    category: 'algorithms',
    difficulty: 'Beginner',
    description: 'An efficient divide-and-conquer algorithm that searches a sorted list by repeatedly halving the search interval.',
    whatItDoes:
      'If a phone book is sorted alphabetically, you don\'t search page by page from the start. You open it in the middle! If your target name is earlier, you discard the entire right half; if later, you discard the left half. Binary Search does this until the target is found.',
    howItWorks: [
      'Requires the input array to be pre-sorted.',
      'Maintain two pointers: low = 0 and high = len(arr) - 1.',
      'Calculate mid = (low + high) // 2.',
      'If arr[mid] == target: match found, return mid.',
      'If arr[mid] < target: target must be in right half; set low = mid + 1.',
      'If arr[mid] > target: target must be in left half; set high = mid - 1.',
    ],
    pythonCode: `# Binary Search Algorithm
# Halves the search space on each step. Requires sorted array.

def binary_search(arr, target):
    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1

sorted_numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
target = 23

found_index = binary_search(sorted_numbers, target)
print("Target", target, "found at index:", found_index)`,
    timeComplexity: {
      best: 'O(1) when target is exactly at initial mid',
      average: 'O(log n)',
      worst: 'O(log n)',
      explanation: 'Every comparison cuts the remaining search space in half. For 1,000,000 items, at most 20 comparisons are needed.',
    },
    spaceComplexity: {
      worst: 'O(1)',
      explanation: 'Iterative implementation uses only 3 integer pointers (low, high, mid).',
    },
    prerequisites: ['Arrays', 'Sorted order concept', 'Integer division'],
    visualizationType: '1d_array',
    tags: ['search', 'divide-and-conquer', 'logarithmic', 'pointers'],
    whatToWatch: [
      'Watch low, high, and mid pointer tags update in the visualizer.',
      'Observe the active search window shrink by 50% on every loop iteration.',
      'Notice mid pointing directly to target 23 when the match succeeds.',
    ],
    suggestedTutorQuestions: [
      'Why must the array be sorted before using Binary Search?',
      'Why is Binary Search O(log n) instead of O(n)?',
      'What happens when target is not present in the array?',
    ],
  },
  {
    id: 'algo-tree-traversal',
    slug: 'inorder-traversal',
    name: 'In-Order Tree Traversal',
    category: 'algorithms',
    difficulty: 'Intermediate',
    description: 'A depth-first traversal that recursively visits Left subtree, Root node, then Right subtree.',
    whatItDoes:
      'In-order traversal visits binary tree nodes in a specific order: first everything to the left, then the current node, then everything to the right. When performed on a Binary Search Tree, it visits all values in exact ascending numerical order!',
    howItWorks: [
      'Base Case: if current node is None, return.',
      'Recursive Step 1: Traverse left subtree: inorder(node.left).',
      'Process: Visit current node (record node.value).',
      'Recursive Step 2: Traverse right subtree: inorder(node.right).',
      'Call stack tracks backtrack positions automatically.',
    ],
    pythonCode: `# In-Order Tree Traversal (Left -> Root -> Right)
class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

# Build BST:
#        10
#       /  \\
#      5    15
#     / \\
#    2   7
root = Node(10)
root.left = Node(5)
root.right = Node(15)
root.left.left = Node(2)
root.left.right = Node(7)

visited = []

def inorder(node):
    if not node:
        return
    inorder(node.left)
    visited.append(node.value)
    inorder(node.right)

inorder(root)
print("In-order traversal sequence:", visited)`,
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
      explanation: 'Must visit every single node in the tree exactly once.',
    },
    spaceComplexity: {
      worst: 'O(h)',
      explanation: 'Recursive call stack height proportional to tree height h. O(log n) if balanced, O(n) if linear.',
    },
    prerequisites: ['Binary Tree', 'Recursion', 'Call Stack'],
    visualizationType: 'binary_tree',
    tags: ['tree', 'traversal', 'recursion', 'dfs'],
    whatToWatch: [
      'Watch the call stack in the Inspector panel grow as traversal dives deep into node.left.',
      'Notice the root and node pointer tags tracking the active node.',
      'Observe values appended to visited in strictly sorted order: [2, 5, 7, 10, 15].',
    ],
    suggestedTutorQuestions: [
      'Why does In-Order traversal of a BST always produce sorted values?',
      'How does Pre-Order traversal differ from In-Order traversal?',
      'How deep can the recursion stack get on a degenerate tree?',
    ],
  },
];

// ==========================================
// REGISTRY QUERY HELPERS
// ==========================================

export function getAllAlgorithms(): AlgorithmDefinition[] {
  return ALGORITHM_REGISTRY;
}

export function getAlgorithmBySlug(slug: string): AlgorithmDefinition | undefined {
  return ALGORITHM_REGISTRY.find((a) => a.slug === slug);
}

export function getAlgorithmById(id: string): AlgorithmDefinition | undefined {
  return ALGORITHM_REGISTRY.find((a) => a.id === id);
}

export function getAlgorithmsByCategory(category: AlgorithmCategory): AlgorithmDefinition[] {
  return ALGORITHM_REGISTRY.filter((a) => a.category === category);
}

export function searchAlgorithms(
  query: string,
  categoryFilter?: string,
  difficultyFilter?: string
): AlgorithmDefinition[] {
  const q = query.trim().toLowerCase();

  return ALGORITHM_REGISTRY.filter((algo) => {
    // Category filter
    if (categoryFilter && categoryFilter !== 'all' && algo.category !== categoryFilter) {
      return false;
    }

    // Difficulty filter
    if (
      difficultyFilter &&
      difficultyFilter !== 'all' &&
      algo.difficulty.toLowerCase() !== difficultyFilter.toLowerCase()
    ) {
      return false;
    }

    // Text search
    if (!q) return true;

    return (
      algo.name.toLowerCase().includes(q) ||
      algo.description.toLowerCase().includes(q) ||
      algo.whatItDoes.toLowerCase().includes(q) ||
      algo.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}
