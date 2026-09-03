/**
 * Prism Phase 8C: Challenge Content Registry
 * Centralized definitions for all practice challenges.
 * Challenges are typed, not embedded in React components.
 */

import { Challenge, ChallengeTopic, ChallengeDifficulty, ChallengeType } from '@/types/challenge';

// ---------------------------------------------------------------------------
// ARRAYS
// ---------------------------------------------------------------------------

const arraysChallenges: Challenge[] = [
  {
    id: 'ch-arr-find-max',
    slug: 'find-maximum-value',
    title: 'Find the Maximum Value',
    description: 'Complete a function that finds the largest element in a list.',
    topic: 'arrays',
    difficulty: 'Beginner',
    type: 'code-completion',
    learningPathId: 'path-dsa-foundations',
    lessonId: 'lesson-array-memory',
    instructions: `## Find the Maximum Value

Complete \`find_max(arr)\` that returns the largest number without using Python's built-in \`max()\`.

Watch the trace to see how your variable tracks the current maximum.`,
    starterCode: `def find_max(arr):
    # TODO: Initialize a variable to track the maximum
    # TODO: Iterate through the array
    # TODO: Update max when a larger element is found
    # TODO: Return the maximum
    pass
`,
    hints: [
      { level: 1, text: 'Start by assuming the first element is the maximum.' },
      { level: 2, text: 'Use a variable like current_max = arr[0] and compare each element.' },
      { level: 3, text: 'Inside your loop: if arr[i] > current_max: current_max = arr[i]. Return current_max after the loop.' },
    ],
    solutionExplanation: 'Initialize current_max to the first element, then iterate and update whenever you find a larger value. O(n) time, O(1) space.',
    testCases: [
      { id: 'tc1', description: 'Basic case', inputCode: 'print(find_max([3, 1, 7, 2]))', expectedOutput: '7' },
      { id: 'tc2', description: 'Single element', inputCode: 'print(find_max([5]))', expectedOutput: '5' },
      { id: 'tc3', description: 'Descending', inputCode: 'print(find_max([9, 7, 4, 1]))', expectedOutput: '9' },
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'ch-arr-reverse',
    slug: 'reverse-array-in-place',
    title: 'Reverse an Array In-Place',
    description: 'Complete a function that reverses a list using two-pointer swapping.',
    topic: 'arrays',
    difficulty: 'Beginner',
    type: 'code-completion',
    instructions: `## Reverse an Array In-Place

Complete \`reverse_array(arr)\` using two-pointer swapping (no slicing or built-in reverse).

Watch the visualizer to see the swap operations.`,
    starterCode: `def reverse_array(arr):
    # TODO: Use two pointers, left and right
    # TODO: Swap arr[left] and arr[right]
    # TODO: Move pointers toward each other
    pass
`,
    hints: [
      { level: 1, text: 'Set left = 0 and right = len(arr) - 1.' },
      { level: 2, text: 'Use a while loop: while left < right: and swap the elements.' },
      { level: 3, text: 'Swap with arr[left], arr[right] = arr[right], arr[left], then left += 1; right -= 1.' },
    ],
    solutionExplanation: 'Two-pointer approach: swap the outermost pair, then move inward. O(n) time, O(1) space.',
    testCases: [
      { id: 'tc1', description: 'Odd length', inputCode: 'arr = [1,2,3,4,5]\nreverse_array(arr)\nprint(arr)', expectedOutput: '[5, 4, 3, 2, 1]' },
      { id: 'tc2', description: 'Even length', inputCode: 'arr = [1,2,3,4]\nreverse_array(arr)\nprint(arr)', expectedOutput: '[4, 3, 2, 1]' },
      { id: 'tc3', description: 'Single element', inputCode: 'arr = [42]\nreverse_array(arr)\nprint(arr)', expectedOutput: '[42]' },
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'ch-arr-two-sum',
    slug: 'two-sum-problem',
    title: 'Two Sum',
    description: 'Find two indices in an array whose values add up to a target.',
    topic: 'arrays',
    difficulty: 'Intermediate',
    type: 'code-completion',
    instructions: `## Two Sum

Complete \`two_sum(arr, target)\` that returns \`[i, j]\` where \`arr[i] + arr[j] == target\`. Return \`[-1, -1]\` if no pair exists. A brute-force O(n^2) solution is fine.`,
    starterCode: `def two_sum(arr, target):
    # TODO: Check every pair of indices (i, j) where i < j
    # TODO: Return [i, j] if arr[i] + arr[j] == target
    # TODO: Return [-1, -1] if no pair found
    pass
`,
    hints: [
      { level: 1, text: 'Use two nested for loops: outer i from 0 to n-1, inner j from i+1 to n-1.' },
      { level: 2, text: 'Check if arr[i] + arr[j] == target: return [i, j].' },
      { level: 3, text: 'After both loops finish without finding a pair, return [-1, -1].' },
    ],
    solutionExplanation: 'Nested iteration checks all pairs. O(n^2) time. An O(n) hash-map solution exists but the brute force shows why nested loops are costly.',
    testCases: [
      { id: 'tc1', description: 'Pair exists', inputCode: 'print(two_sum([2, 7, 11, 15], 9))', expectedOutput: '[0, 1]' },
      { id: 'tc2', description: 'No pair', inputCode: 'print(two_sum([1, 2, 3], 10))', expectedOutput: '[-1, -1]' },
      { id: 'tc3', description: 'Pair at end', inputCode: 'print(two_sum([1, 2, 4, 8], 12))', expectedOutput: '[2, 3]' },
    ],
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'ch-arr-rotation-debug',
    slug: 'array-rotation-debug',
    title: 'Debug: Array Rotation',
    description: 'Fix the off-by-one error in a left-rotation function.',
    topic: 'arrays',
    difficulty: 'Intermediate',
    type: 'debugging',
    instructions: `## Debug: Array Rotation

The function should rotate the array left by one position. It contains a bug.

**Expected:** rotate_left([1, 2, 3, 4]) should print [2, 3, 4, 1]

Run it and observe the trace. Fix the bug.`,
    starterCode: `def rotate_left(arr):
    if len(arr) == 0:
        return arr
    first = arr[0]
    for i in range(len(arr)):  # Bug: range boundary is wrong
        arr[i] = arr[i + 1]
    arr[-1] = first
    return arr

result = rotate_left([1, 2, 3, 4])
print(result)
`,
    hints: [
      { level: 1, text: 'Run and look at what happens when i reaches the last index.' },
      { level: 2, text: 'The loop tries to read arr[i + 1] when i is the last index -- out of bounds.' },
      { level: 3, text: 'Change range(len(arr)) to range(len(arr) - 1). The last element is handled by arr[-1] = first.' },
    ],
    solutionExplanation: 'The loop must stop one element early because arr[-1] = first handles the final position. The original code caused an IndexError.',
    testCases: [
      { id: 'tc1', description: 'Basic rotation', inputCode: 'print(rotate_left([1, 2, 3, 4]))', expectedOutput: '[2, 3, 4, 1]' },
      { id: 'tc2', description: 'Two elements', inputCode: 'print(rotate_left([5, 9]))', expectedOutput: '[9, 5]' },
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
];

// ---------------------------------------------------------------------------
// LINKED LISTS
// ---------------------------------------------------------------------------

const linkedListsChallenges: Challenge[] = [
  {
    id: 'ch-ll-length',
    slug: 'linked-list-length',
    title: 'Linked List Length',
    description: 'Complete a function that counts the nodes in a singly linked list.',
    topic: 'linked-lists',
    difficulty: 'Beginner',
    type: 'code-completion',
    learningPathId: 'path-dsa-foundations',
    lessonId: 'lesson-linked-list-pointers',
    instructions: `## Linked List Length

Complete \`list_length(head)\` that counts nodes in the linked list.

- 10 -> 20 -> 30 -> None => 3
- None => 0

Watch the trace to see the pointer advance.`,
    starterCode: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def list_length(head):
    # TODO: Traverse the list and count nodes
    pass
`,
    hints: [
      { level: 1, text: 'Start with count = 0 and curr = head.' },
      { level: 2, text: 'Use a while loop: while curr is not None: increment count and advance curr.' },
      { level: 3, text: 'count += 1 and curr = curr.next inside the loop. Return count after.' },
    ],
    solutionExplanation: 'Traverse the list one node at a time, incrementing a counter. O(n) time, O(1) space.',
    testCases: [
      { id: 'tc1', description: '3-node list', inputCode: 'head = Node(10)\nhead.next = Node(20)\nhead.next.next = Node(30)\nprint(list_length(head))', expectedOutput: '3' },
      { id: 'tc2', description: 'Empty list', inputCode: 'print(list_length(None))', expectedOutput: '0' },
      { id: 'tc3', description: 'Single node', inputCode: 'print(list_length(Node(5)))', expectedOutput: '1' },
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'ch-ll-null-debug',
    slug: 'linked-list-null-pointer-debug',
    title: 'Debug: Null Pointer in Traversal',
    description: 'Fix a traversal that skips the last node.',
    topic: 'linked-lists',
    difficulty: 'Beginner',
    type: 'debugging',
    instructions: `## Debug: Null Pointer in Traversal

The function below skips the last node when printing. Find and fix the bug.

**Expected for 10 -> 20 -> 30:** all three nodes printed.`,
    starterCode: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def print_list(head):
    curr = head
    while curr.next is not None:  # Bug: wrong condition
        print(curr.val)
        curr = curr.next

head = Node(10)
head.next = Node(20)
head.next.next = Node(30)
print_list(head)
`,
    hints: [
      { level: 1, text: 'Run the code. Is the last node printed?' },
      { level: 2, text: 'The loop stops when curr.next is None -- the last node is never printed.' },
      { level: 3, text: 'Change the condition to: while curr is not None:' },
    ],
    solutionExplanation: 'The condition curr.next is not None stops one node early. Correct condition: curr is not None.',
    testCases: [
      { id: 'tc1', description: '3-node list', inputCode: 'head = Node(10)\nhead.next = Node(20)\nhead.next.next = Node(30)\nprint_list(head)', expectedOutput: '10\n20\n30' },
      { id: 'tc2', description: 'Single node', inputCode: 'print_list(Node(42))', expectedOutput: '42' },
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'ch-ll-cycle',
    slug: 'detect-linked-list-cycle',
    title: "Detect a Cycle (Floyd's Algorithm)",
    description: 'Complete the two-pointer cycle detection algorithm.',
    topic: 'linked-lists',
    difficulty: 'Intermediate',
    type: 'code-completion',
    instructions: `## Detect a Cycle (Floyd's Algorithm)

Complete \`has_cycle(head)\` using Floyd's two-pointer algorithm.

- slow moves one node at a time.
- fast moves two nodes at a time.
- If they meet, a cycle exists.

Return True if cycle exists, False otherwise.`,
    starterCode: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def has_cycle(head):
    # TODO: Initialize slow and fast pointers
    # TODO: Advance slow by 1, fast by 2 each iteration
    # TODO: Return True if they meet, False if fast reaches None
    pass
`,
    hints: [
      { level: 1, text: 'Start both slow = head and fast = head.' },
      { level: 2, text: 'Loop: while fast is not None and fast.next is not None:' },
      { level: 3, text: 'slow = slow.next, fast = fast.next.next. If slow is fast: return True. Return False after.' },
    ],
    solutionExplanation: "Floyd's: two pointers at different speeds. In a cycle, fast laps slow. If fast reaches None, no cycle. O(n) time, O(1) space.",
    testCases: [
      { id: 'tc1', description: 'No cycle', inputCode: 'h=Node(1)\nh.next=Node(2)\nh.next.next=Node(3)\nprint(has_cycle(h))', expectedOutput: 'False' },
      { id: 'tc2', description: 'Cycle present', inputCode: 'h=Node(1)\nb=Node(2)\nc=Node(3)\nh.next=b\nb.next=c\nc.next=b\nprint(has_cycle(h))', expectedOutput: 'True' },
      { id: 'tc3', description: 'Single node', inputCode: 'print(has_cycle(Node(1)))', expectedOutput: 'False' },
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
];

// ---------------------------------------------------------------------------
// SEARCHING
// ---------------------------------------------------------------------------

const searchingChallenges: Challenge[] = [
  {
    id: 'ch-search-linear-predict',
    slug: 'linear-search-trace-prediction',
    title: 'Linear Search: Predict the Steps',
    description: 'Predict how many iterations linear search takes before running.',
    topic: 'searching',
    difficulty: 'Beginner',
    type: 'trace-prediction',
    instructions: `## Linear Search: Predict the Steps

The code searches for 7 in [3, 1, 7, 2, 9].

**Before running:** How many times will the loop body execute before finding the value?

Then run and check your prediction against the trace.`,
    starterCode: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

result = linear_search([3, 1, 7, 2, 9], 7)
print('Found at index:', result)
`,
    traceQuestion: 'How many times will the loop body execute before finding 7 in [3, 1, 7, 2, 9]?',
    traceAnswerOptions: ['1', '2', '3', '4', '5'],
    correctTraceAnswer: '3',
    hints: [
      { level: 1, text: 'Linear search checks elements one at a time from left to right.' },
      { level: 2, text: 'Count how many elements appear before 7 in [3, 1, 7, ...].' },
      { level: 3, text: '3 at index 0, 1 at index 1, 7 at index 2. The loop runs 3 times.' },
    ],
    solutionExplanation: '7 is at index 2. Linear search visits indices 0, 1, 2 -- 3 iterations. Worst case is O(n).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'ch-search-binary-complete',
    slug: 'binary-search-completion',
    title: 'Binary Search',
    description: 'Complete a binary search function for a sorted list.',
    topic: 'searching',
    difficulty: 'Beginner',
    type: 'code-completion',
    learningPathId: 'path-dsa-foundations',
    lessonId: 'lesson-binary-search',
    instructions: `## Binary Search

Complete \`binary_search(arr, target)\` for a **sorted** list.

1. Maintain left and right pointers.
2. mid = (left + right) // 2.
3. Return mid if arr[mid] == target.
4. Search right half if arr[mid] < target.
5. Search left half if arr[mid] > target.
6. Return -1 if not found.`,
    starterCode: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = (left + right) // 2
        # TODO: Compare arr[mid] with target
        # TODO: Update left or right or return mid
        pass

    return -1
`,
    hints: [
      { level: 1, text: 'Inside the while loop: if arr[mid] == target: return mid.' },
      { level: 2, text: 'If arr[mid] < target, search right half: left = mid + 1.' },
      { level: 3, text: 'Otherwise: right = mid - 1. After the loop, return -1.' },
    ],
    solutionExplanation: 'Binary search eliminates half the search space each iteration: O(log n). Sorted property lets you discard half based on the middle element.',
    testCases: [
      { id: 'tc1', description: 'Target present', inputCode: 'print(binary_search([1,3,5,7,9,11], 7))', expectedOutput: '3' },
      { id: 'tc2', description: 'Target absent', inputCode: 'print(binary_search([1,3,5,7,9,11], 4))', expectedOutput: '-1' },
      { id: 'tc3', description: 'First element', inputCode: 'print(binary_search([2,4,6,8], 2))', expectedOutput: '0' },
    ],
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'ch-search-binary-debug',
    slug: 'binary-search-debug',
    title: 'Debug: Binary Search Infinite Loop',
    description: 'Fix a binary search that loops forever on some inputs.',
    topic: 'searching',
    difficulty: 'Intermediate',
    type: 'debugging',
    instructions: `## Debug: Binary Search Infinite Loop

The binary search below loops forever on certain inputs. Run it and observe whether left and right ever change. Fix the bug.`,
    starterCode: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid       # Bug: should be mid + 1
        else:
            right = mid      # Bug: should be mid - 1
    return -1

print(binary_search([1, 3, 5, 7, 9], 7))
`,
    hints: [
      { level: 1, text: 'Watch left, right, and mid in the trace. Do they change between iterations?' },
      { level: 2, text: 'When arr[mid] < target, setting left = mid keeps mid the same next iteration.' },
      { level: 3, text: 'Fix: left = mid + 1 and right = mid - 1. This guarantees the search space shrinks.' },
    ],
    solutionExplanation: 'Setting left = mid (without +1) causes infinite loops when left == mid. Adding/subtracting 1 guarantees shrinkage.',
    testCases: [
      { id: 'tc1', description: 'Target present', inputCode: 'print(binary_search([1,3,5,7,9], 7))', expectedOutput: '3' },
      { id: 'tc2', description: 'Target absent', inputCode: 'print(binary_search([1,3,5,7,9], 4))', expectedOutput: '-1' },
    ],
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
  },
];

// ---------------------------------------------------------------------------
// SORTING
// ---------------------------------------------------------------------------

const sortingChallenges: Challenge[] = [
  {
    id: 'ch-sort-bubble-predict',
    slug: 'bubble-sort-trace-prediction',
    title: 'Bubble Sort: Count the Swaps',
    description: 'Predict how many swaps bubble sort makes on a small array.',
    topic: 'sorting',
    difficulty: 'Beginner',
    type: 'trace-prediction',
    instructions: `## Bubble Sort: Count the Swaps

The code runs bubble sort on [5, 3, 1, 4, 2] and counts swaps.

**Before running:** Predict the total number of swap operations.

Then run and compare with the trace stdout.`,
    starterCode: `def bubble_sort(arr):
    n = len(arr)
    swaps = 0
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swaps += 1
    return swaps

arr = [5, 3, 1, 4, 2]
total_swaps = bubble_sort(arr)
print('Swaps:', total_swaps)
print('Sorted:', arr)
`,
    traceQuestion: 'How many swap operations will bubble sort perform on [5, 3, 1, 4, 2]?',
    traceAnswerOptions: ['4', '6', '7', '8', '10'],
    correctTraceAnswer: '7',
    hints: [
      { level: 1, text: 'Bubble sort swaps adjacent elements whenever they are out of order.' },
      { level: 2, text: 'Trace through pass 1 manually and count swaps.' },
      { level: 3, text: 'Run the code and read the Swaps: output from the trace stdout.' },
    ],
    solutionExplanation: 'Running reveals 7 swaps for [5, 3, 1, 4, 2]. The exact count demonstrates O(n^2) worst-case behavior.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'ch-sort-selection-complete',
    slug: 'selection-sort-completion',
    title: 'Selection Sort',
    description: 'Complete the selection sort algorithm.',
    topic: 'sorting',
    difficulty: 'Beginner',
    type: 'code-completion',
    learningPathId: 'path-dsa-foundations',
    lessonId: 'lesson-selection-sort',
    instructions: `## Selection Sort

Complete \`selection_sort(arr)\` in ascending order.

**Algorithm:** For each position i, find the index of the minimum in arr[i:] and swap it into position i.`,
    starterCode: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        # TODO: Scan arr[i+1:] to find a smaller element
        # TODO: Swap arr[i] with arr[min_idx]
        pass
    return arr
`,
    hints: [
      { level: 1, text: 'Inside the outer loop, scan from i+1 to n to find the minimum.' },
      { level: 2, text: 'Inner loop: for j in range(i+1, n): if arr[j] < arr[min_idx]: min_idx = j.' },
      { level: 3, text: 'After the inner loop: arr[i], arr[min_idx] = arr[min_idx], arr[i].' },
    ],
    solutionExplanation: 'Selection sort makes exactly n-1 swaps regardless of input order. Each pass places the minimum of remaining elements in its final position.',
    testCases: [
      { id: 'tc1', description: 'Basic sort', inputCode: 'print(selection_sort([5,2,8,1]))', expectedOutput: '[1, 2, 5, 8]' },
      { id: 'tc2', description: 'Already sorted', inputCode: 'print(selection_sort([1,2,3]))', expectedOutput: '[1, 2, 3]' },
      { id: 'tc3', description: 'Reverse sorted', inputCode: 'print(selection_sort([3,2,1]))', expectedOutput: '[1, 2, 3]' },
    ],
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'ch-sort-merge-complexity',
    slug: 'merge-sort-complexity',
    title: 'Merge Sort: Understand the Complexity',
    description: 'Identify why merge sort is O(n log n) by analyzing the trace.',
    topic: 'sorting',
    difficulty: 'Intermediate',
    type: 'complexity',
    instructions: `## Merge Sort: Understand the Complexity

Run the merge sort and analyze its complexity from the trace.

**Question:** What is the time complexity of merge sort?

Observe: how many recursion levels, and how much work per level?`,
    starterCode: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

arr = [5, 3, 8, 1, 7, 2]
sorted_arr = merge_sort(arr)
print('Sorted:', sorted_arr)
`,
    complexityQuestion: 'What is the time complexity of merge sort?',
    correctComplexityClass: 'O(n log n)',
    hints: [
      { level: 1, text: 'How many levels of recursion for 6 elements?' },
      { level: 2, text: 'Each split halves the array: O(log n) levels. Merging at each level costs O(n).' },
      { level: 3, text: 'O(log n) levels times O(n) work per level = O(n log n).' },
    ],
    solutionExplanation: 'Merge sort divides the array (log n levels) and merges all elements at each level (n work). Total: O(n log n).',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
  },
];

// ---------------------------------------------------------------------------
// TREES
// ---------------------------------------------------------------------------

const treesChallenges: Challenge[] = [
  {
    id: 'ch-tree-inorder-complete',
    slug: 'tree-inorder-traversal',
    title: 'In-Order Tree Traversal',
    description: 'Complete a recursive in-order traversal of a binary tree.',
    topic: 'trees',
    difficulty: 'Beginner',
    type: 'code-completion',
    learningPathId: 'path-dsa-foundations',
    lessonId: 'lesson-inorder-traversal',
    instructions: `## In-Order Tree Traversal

Complete \`inorder(node)\` returning values in Left-Root-Right order.

Watch the call stack to see how recursion unwinds.`,
    starterCode: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def inorder(node):
    # TODO: Base case -- what if node is None?
    # TODO: Recursively traverse left subtree
    # TODO: Visit the current node
    # TODO: Recursively traverse right subtree
    pass

root = Node(4)
root.left = Node(2)
root.right = Node(6)
root.left.left = Node(1)
root.left.right = Node(3)
print(inorder(root))
`,
    hints: [
      { level: 1, text: 'Base case: if node is None: return [].' },
      { level: 2, text: 'In-order: left subtree first, then current node, then right subtree.' },
      { level: 3, text: 'return inorder(node.left) + [node.val] + inorder(node.right)' },
    ],
    solutionExplanation: 'In-order: visit left, root, right. For a BST this produces sorted output. O(n) time, O(h) space.',
    testCases: [
      { id: 'tc1', description: 'Balanced tree', inputCode: 'root=Node(4)\nroot.left=Node(2)\nroot.right=Node(6)\nroot.left.left=Node(1)\nroot.left.right=Node(3)\nprint(inorder(root))', expectedOutput: '[1, 2, 3, 4, 6]' },
      { id: 'tc2', description: 'Single node', inputCode: 'print(inorder(Node(5)))', expectedOutput: '[5]' },
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
  },
  {
    id: 'ch-tree-height-predict',
    slug: 'tree-height-trace-prediction',
    title: 'Binary Tree Height: Trace Prediction',
    description: 'Predict the maximum recursion depth when computing tree height.',
    topic: 'trees',
    difficulty: 'Beginner',
    type: 'trace-prediction',
    instructions: `## Binary Tree Height: Trace Prediction

The code computes the height of this tree:

        1
       / \\
      2   3
     /
    4

**Before running:** What is the maximum call stack depth?`,
    starterCode: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def tree_height(node):
    if node is None:
        return 0
    left_h = tree_height(node.left)
    right_h = tree_height(node.right)
    return 1 + max(left_h, right_h)

root = Node(1)
root.left = Node(2)
root.right = Node(3)
root.left.left = Node(4)

print('Height:', tree_height(root))
`,
    traceQuestion: 'What is the maximum recursion depth (call stack frames) during tree_height on this 4-node tree?',
    traceAnswerOptions: ['2', '3', '4', '5'],
    correctTraceAnswer: '4',
    hints: [
      { level: 1, text: 'Follow the path from root to the deepest leaf: 1 -> 2 -> 4.' },
      { level: 2, text: 'Each node on that path adds one stack frame.' },
      { level: 3, text: 'Path 1->2->4 has 3 nodes, plus the final call on None = 4 total frames.' },
    ],
    solutionExplanation: 'Deepest path: 1->2->4->None = 4 stack frames. Max depth = tree height + 1 (for None base case).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
  },
  {
    id: 'ch-tree-bst-debug',
    slug: 'bst-insert-debug',
    title: 'Debug: BST Insert',
    description: 'Fix the BST insert function that places nodes in wrong positions.',
    topic: 'trees',
    difficulty: 'Intermediate',
    type: 'debugging',
    instructions: `## Debug: BST Insert

The BST insert function has a bug. Run it and check the in-order output -- a correct BST produces sorted output.

**Expected in-order:** [1, 3, 5, 7, 9]

Find and fix the bug.`,
    starterCode: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if root is None:
        return Node(val)
    if val < root.val:
        root.right = insert(root.left, val)  # Bug: wrong side
    else:
        root.left = insert(root.right, val)  # Bug: wrong side
    return root

def inorder(node):
    if node is None:
        return []
    return inorder(node.left) + [node.val] + inorder(node.right)

root = Node(5)
root = insert(root, 3)
root = insert(root, 7)
root = insert(root, 1)
root = insert(root, 9)
print(inorder(root))
`,
    hints: [
      { level: 1, text: 'Run and look at the in-order output. Is it sorted?' },
      { level: 2, text: 'In BST: values less than root go LEFT, values greater go RIGHT.' },
      { level: 3, text: 'Fix: if val < root.val: root.left = insert(root.left, val) else: root.right = insert(root.right, val).' },
    ],
    solutionExplanation: 'The bug swapped left and right: smaller values went right, larger went left. Swapping corrects both branches.',
    testCases: [
      { id: 'tc1', description: 'In-order is sorted', inputCode: 'root=Node(5)\nroot=insert(root,3)\nroot=insert(root,7)\nroot=insert(root,1)\nroot=insert(root,9)\nprint(inorder(root))', expectedOutput: '[1, 3, 5, 7, 9]' },
    ],
    timeComplexity: 'O(h) per insert',
    spaceComplexity: 'O(h)',
  },
];

// ---------------------------------------------------------------------------
// COMPLEXITY
// ---------------------------------------------------------------------------

const complexityChallenges: Challenge[] = [
  {
    id: 'ch-cmplx-loop-single',
    slug: 'single-loop-complexity',
    title: 'Single Loop Complexity',
    description: 'Identify the time complexity of a simple single-pass loop.',
    topic: 'complexity',
    difficulty: 'Beginner',
    type: 'complexity',
    instructions: `## Single Loop Complexity

Run the code and analyze the complexity from the trace.

**Question:** What is the time complexity of count_positives?`,
    starterCode: `def count_positives(arr):
    count = 0
    for x in arr:
        if x > 0:
            count += 1
    return count

arr = [1, -2, 3, -4, 5, -6, 7, -8]
print(count_positives(arr))
`,
    complexityQuestion: 'What is the time complexity of count_positives?',
    correctComplexityClass: 'O(n)',
    hints: [
      { level: 1, text: 'Count how many loop iterations happen relative to array length.' },
      { level: 2, text: '8 elements -> 8 iterations. 100 elements -> 100 iterations.' },
      { level: 3, text: 'Iteration count is proportional to input size -- that is O(n).' },
    ],
    solutionExplanation: 'A single loop visiting each element once is O(n). Iteration count scales linearly with input size.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'ch-cmplx-nested-loops',
    slug: 'nested-loops-complexity',
    title: 'Nested Loops Complexity',
    description: 'Identify the time complexity of nested loops.',
    topic: 'complexity',
    difficulty: 'Beginner',
    type: 'complexity',
    instructions: `## Nested Loops Complexity

Run the code and analyze the complexity from the trace.

**Question:** What is the time complexity of print_pairs?`,
    starterCode: `def print_pairs(arr):
    n = len(arr)
    pairs = 0
    for i in range(n):
        for j in range(n):
            pairs += 1
    return pairs

arr = [1, 2, 3, 4]
print('Total pair operations:', print_pairs(arr))
`,
    complexityQuestion: 'What is the time complexity of print_pairs?',
    correctComplexityClass: 'O(n^2)',
    hints: [
      { level: 1, text: 'Count the total pairs += 1 executions in the trace.' },
      { level: 2, text: 'For 4 elements: outer 4 times, inner 4 times each = 16 total.' },
      { level: 3, text: 'n=4 -> 16 = 4 squared. Growth proportional to n squared -- O(n^2).' },
    ],
    solutionExplanation: 'Two nested loops each running n times: n * n = n^2 total iterations. This is O(n^2).',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'ch-cmplx-recursion',
    slug: 'recursion-complexity',
    title: 'Recursive Factorial: Stack Depth',
    description: 'Analyze the space complexity of recursive factorial from the call stack trace.',
    topic: 'complexity',
    difficulty: 'Intermediate',
    type: 'complexity',
    instructions: `## Recursive Factorial: Stack Depth

Run the recursive factorial and observe the call stack depth.

**Question:** What is the space complexity of recursive factorial?`,
    starterCode: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(6)
print('6! =', result)
`,
    complexityQuestion: 'What is the space complexity of recursive factorial?',
    correctComplexityClass: 'O(n)',
    hints: [
      { level: 1, text: 'Look at the call stack panel. How many frames deep does it go?' },
      { level: 2, text: 'factorial(6) calls factorial(5)...factorial(1). That is 6 frames.' },
      { level: 3, text: 'Call stack depth equals n. Space grows linearly: O(n).' },
    ],
    solutionExplanation: 'Recursive factorial builds n stack frames before unwinding. Space complexity is O(n) due to the call stack.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'ch-cmplx-sequential-loops',
    slug: 'sequential-loops-complexity',
    title: 'Sequential Loops vs Nested Loops',
    description: 'Determine whether two sequential loops give O(n) or O(n^2).',
    topic: 'complexity',
    difficulty: 'Intermediate',
    type: 'complexity',
    instructions: `## Sequential Loops vs Nested Loops

Run the code and count total iterations.

**Question:** What is the time complexity of two_passes?

These loops are **sequential**, not nested.`,
    starterCode: `def two_passes(arr):
    n = len(arr)
    total = 0
    for i in range(n):
        total += arr[i]
    for i in range(n):
        total += arr[i] * 2
    return total

arr = [1, 2, 3, 4, 5]
print(two_passes(arr))
`,
    complexityQuestion: 'What is the time complexity of two_passes?',
    correctComplexityClass: 'O(n)',
    hints: [
      { level: 1, text: 'Count total loop iterations across both loops.' },
      { level: 2, text: 'First loop: n. Second loop: n. Total: 2n.' },
      { level: 3, text: '2n simplifies to O(n). Constants are dropped. Sequential loops add, not multiply.' },
    ],
    solutionExplanation: 'Two sequential loops running n times give 2n iterations. In Big-O: 2n = O(n). Differs from nested loops which give O(n^2).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
];

// ---------------------------------------------------------------------------
// FULL REGISTRY
// ---------------------------------------------------------------------------

export const ALL_CHALLENGES: Challenge[] = [
  ...arraysChallenges,
  ...linkedListsChallenges,
  ...searchingChallenges,
  ...sortingChallenges,
  ...treesChallenges,
  ...complexityChallenges,
];

// ---------------------------------------------------------------------------
// QUERY HELPERS
// ---------------------------------------------------------------------------

export function getAllChallenges(): Challenge[] {
  return ALL_CHALLENGES;
}

export function getChallengeBySlug(slug: string): Challenge | undefined {
  return ALL_CHALLENGES.find((c) => c.slug === slug);
}

export function getChallengeById(id: string): Challenge | undefined {
  return ALL_CHALLENGES.find((c) => c.id === id);
}

export function getChallengesByTopic(topic: ChallengeTopic): Challenge[] {
  return ALL_CHALLENGES.filter((c) => c.topic === topic);
}

export function getChallengesByDifficulty(difficulty: ChallengeDifficulty): Challenge[] {
  return ALL_CHALLENGES.filter((c) => c.difficulty === difficulty);
}

export function getChallengesByType(type: ChallengeType): Challenge[] {
  return ALL_CHALLENGES.filter((c) => c.type === type);
}

export function getChallengesForLesson(lessonId: string): Challenge[] {
  return ALL_CHALLENGES.filter((c) => c.lessonId === lessonId);
}

export function getChallengesForPath(learningPathId: string): Challenge[] {
  return ALL_CHALLENGES.filter((c) => c.learningPathId === learningPathId);
}

export function searchChallenges(
  query: string,
  topic?: ChallengeTopic | 'all',
  difficulty?: ChallengeDifficulty | 'all',
  type?: ChallengeType | 'all'
): Challenge[] {
  const q = query.toLowerCase().trim();
  return ALL_CHALLENGES.filter((c) => {
    const matchesTopic = !topic || topic === 'all' || c.topic === topic;
    const matchesDiff = !difficulty || difficulty === 'all' || c.difficulty === difficulty;
    const matchesType = !type || type === 'all' || c.type === type;
    const matchesQuery =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.topic.includes(q);
    return matchesTopic && matchesDiff && matchesType && matchesQuery;
  });
}
