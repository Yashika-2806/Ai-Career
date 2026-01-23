/**
 * Comprehensive DSA problem sheets data
 */

export interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  leetcodeUrl?: string;
  youtubeUrl?: string;
  articleUrl?: string;
}

export const DSA_SHEETS = {
  'striver-a2z': {
    name: 'Striver A2Z DSA Sheet',
    description: 'Complete DSA roadmap from basics to advanced',
    totalProblems: 456,
    problems: [
      // Arrays
      { id: 'arr-1', title: 'Largest Element in Array', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/largest-number/', youtubeUrl: 'https://www.youtube.com/watch?v=37E9ckMDdTk' },
      { id: 'arr-2', title: 'Second Largest Element', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/second-largest-digit-in-a-string/' },
      { id: 'arr-3', title: 'Check if Array is Sorted', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/' },
      { id: 'arr-4', title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/' },
      { id: 'arr-5', title: 'Left Rotate Array by One', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/rotate-array/' },
      { id: 'arr-6', title: 'Left Rotate Array by D places', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/rotate-array/' },
      { id: 'arr-7', title: 'Move Zeros to End', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/move-zeroes/' },
      { id: 'arr-8', title: 'Linear Search', difficulty: 'Easy', topic: 'Arrays' },
      { id: 'arr-9', title: 'Union of Two Sorted Arrays', difficulty: 'Medium', topic: 'Arrays' },
      { id: 'arr-10', title: 'Intersection of Two Sorted Arrays', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/intersection-of-two-arrays-ii/' },
      { id: 'arr-11', title: 'Missing Number', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/missing-number/' },
      { id: 'arr-12', title: 'Maximum Consecutive Ones', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/max-consecutive-ones/' },
      { id: 'arr-13', title: 'Find Number that Appears Once', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/single-number/' },
      { id: 'arr-14', title: 'Longest Subarray with Sum K', difficulty: 'Medium', topic: 'Arrays' },
      { id: 'arr-15', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/two-sum/' },
      { id: 'arr-16', title: 'Sort Array of 0s, 1s and 2s', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/sort-colors/' },
      { id: 'arr-17', title: 'Majority Element', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/majority-element/' },
      { id: 'arr-18', title: 'Kadanes Algorithm - Maximum Subarray Sum', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/' },
      { id: 'arr-19', title: 'Print Subarray with Maximum Sum', difficulty: 'Medium', topic: 'Arrays' },
      { id: 'arr-20', title: 'Stock Buy and Sell', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      
      // Strings
      { id: 'str-1', title: 'Reverse a String', difficulty: 'Easy', topic: 'Strings', leetcodeUrl: 'https://leetcode.com/problems/reverse-string/' },
      { id: 'str-2', title: 'Check Palindrome', difficulty: 'Easy', topic: 'Strings', leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/' },
      { id: 'str-3', title: 'Largest Odd Number in String', difficulty: 'Easy', topic: 'Strings', leetcodeUrl: 'https://leetcode.com/problems/largest-odd-number-in-string/' },
      { id: 'str-4', title: 'Longest Common Prefix', difficulty: 'Easy', topic: 'Strings', leetcodeUrl: 'https://leetcode.com/problems/longest-common-prefix/' },
      { id: 'str-5', title: 'Isomorphic Strings', difficulty: 'Easy', topic: 'Strings', leetcodeUrl: 'https://leetcode.com/problems/isomorphic-strings/' },
      { id: 'str-6', title: 'Rotate String', difficulty: 'Easy', topic: 'Strings', leetcodeUrl: 'https://leetcode.com/problems/rotate-string/' },
      { id: 'str-7', title: 'Valid Anagram', difficulty: 'Easy', topic: 'Strings', leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/' },
      { id: 'str-8', title: 'Sort Characters by Frequency', difficulty: 'Medium', topic: 'Strings', leetcodeUrl: 'https://leetcode.com/problems/sort-characters-by-frequency/' },
      { id: 'str-9', title: 'Maximum Nesting Depth of Parentheses', difficulty: 'Easy', topic: 'Strings', leetcodeUrl: 'https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses/' },
      { id: 'str-10', title: 'Roman to Integer', difficulty: 'Easy', topic: 'Strings', leetcodeUrl: 'https://leetcode.com/problems/roman-to-integer/' },
      
      // Linked List
      { id: 'll-1', title: 'Introduction to Linked List', difficulty: 'Easy', topic: 'Linked List' },
      { id: 'll-2', title: 'Delete Node in Linked List', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/delete-node-in-a-linked-list/' },
      { id: 'll-3', title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/' },
      { id: 'll-4', title: 'Middle of Linked List', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/middle-of-the-linked-list/' },
      { id: 'll-5', title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { id: 'll-6', title: 'Remove Nth Node From End', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
      { id: 'll-7', title: 'Add Two Numbers', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/add-two-numbers/' },
      { id: 'll-8', title: 'Delete Middle Node', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/' },
      { id: 'll-9', title: 'Sort Linked List', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/sort-list/' },
      { id: 'll-10', title: 'Detect Cycle in Linked List', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/' },
    ]
  },
  
  'blind-75': {
    name: 'Blind 75 Must-Do Questions',
    description: 'Top 75 LeetCode questions for interview prep',
    totalProblems: 75,
    problems: [
      // Arrays & Hashing
      { id: 'b75-1', title: 'Two Sum', difficulty: 'Easy', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/two-sum/' },
      { id: 'b75-2', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { id: 'b75-3', title: 'Contains Duplicate', difficulty: 'Easy', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/' },
      { id: 'b75-4', title: 'Product of Array Except Self', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/' },
      { id: 'b75-5', title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/' },
      { id: 'b75-6', title: 'Maximum Product Subarray', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/maximum-product-subarray/' },
      { id: 'b75-7', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
      { id: 'b75-8', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { id: 'b75-9', title: '3Sum', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/3sum/' },
      { id: 'b75-10', title: 'Container With Most Water', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/' },
      
      // Binary
      { id: 'b75-11', title: 'Sum of Two Integers', difficulty: 'Medium', topic: 'Binary', leetcodeUrl: 'https://leetcode.com/problems/sum-of-two-integers/' },
      { id: 'b75-12', title: 'Number of 1 Bits', difficulty: 'Easy', topic: 'Binary', leetcodeUrl: 'https://leetcode.com/problems/number-of-1-bits/' },
      { id: 'b75-13', title: 'Counting Bits', difficulty: 'Easy', topic: 'Binary', leetcodeUrl: 'https://leetcode.com/problems/counting-bits/' },
      { id: 'b75-14', title: 'Missing Number', difficulty: 'Easy', topic: 'Binary', leetcodeUrl: 'https://leetcode.com/problems/missing-number/' },
      { id: 'b75-15', title: 'Reverse Bits', difficulty: 'Easy', topic: 'Binary', leetcodeUrl: 'https://leetcode.com/problems/reverse-bits/' },
      
      // Dynamic Programming
      { id: 'b75-16', title: 'Climbing Stairs', difficulty: 'Easy', topic: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/' },
      { id: 'b75-17', title: 'Coin Change', difficulty: 'Medium', topic: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/coin-change/' },
      { id: 'b75-18', title: 'Longest Increasing Subsequence', difficulty: 'Medium', topic: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
      { id: 'b75-19', title: 'Longest Common Subsequence', difficulty: 'Medium', topic: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/' },
      { id: 'b75-20', title: 'Word Break', difficulty: 'Medium', topic: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/word-break/' },
      { id: 'b75-21', title: 'Combination Sum IV', difficulty: 'Medium', topic: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/combination-sum-iv/' },
      { id: 'b75-22', title: 'House Robber', difficulty: 'Medium', topic: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/house-robber/' },
      { id: 'b75-23', title: 'House Robber II', difficulty: 'Medium', topic: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/house-robber-ii/' },
      { id: 'b75-24', title: 'Decode Ways', difficulty: 'Medium', topic: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/decode-ways/' },
      { id: 'b75-25', title: 'Unique Paths', difficulty: 'Medium', topic: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/unique-paths/' },
      { id: 'b75-26', title: 'Jump Game', difficulty: 'Medium', topic: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/jump-game/' },
      
      // Graph
      { id: 'b75-27', title: 'Clone Graph', difficulty: 'Medium', topic: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/clone-graph/' },
      { id: 'b75-28', title: 'Course Schedule', difficulty: 'Medium', topic: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/course-schedule/' },
      { id: 'b75-29', title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', topic: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
      { id: 'b75-30', title: 'Number of Islands', difficulty: 'Medium', topic: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/' },
      { id: 'b75-31', title: 'Longest Consecutive Sequence', difficulty: 'Medium', topic: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
      { id: 'b75-32', title: 'Alien Dictionary', difficulty: 'Hard', topic: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/alien-dictionary/' },
      { id: 'b75-33', title: 'Graph Valid Tree', difficulty: 'Medium', topic: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/graph-valid-tree/' },
      { id: 'b75-34', title: 'Number of Connected Components', difficulty: 'Medium', topic: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/' },
      
      // Interval
      { id: 'b75-35', title: 'Insert Interval', difficulty: 'Medium', topic: 'Interval', leetcodeUrl: 'https://leetcode.com/problems/insert-interval/' },
      { id: 'b75-36', title: 'Merge Intervals', difficulty: 'Medium', topic: 'Interval', leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/' },
      { id: 'b75-37', title: 'Non-overlapping Intervals', difficulty: 'Medium', topic: 'Interval', leetcodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/' },
      { id: 'b75-38', title: 'Meeting Rooms', difficulty: 'Easy', topic: 'Interval', leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms/' },
      { id: 'b75-39', title: 'Meeting Rooms II', difficulty: 'Medium', topic: 'Interval', leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/' },
      
      // Linked List
      { id: 'b75-40', title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/' },
      { id: 'b75-41', title: 'Detect Cycle in Linked List', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/' },
      { id: 'b75-42', title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { id: 'b75-43', title: 'Merge K Sorted Lists', difficulty: 'Hard', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
      { id: 'b75-44', title: 'Remove Nth Node From End', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
      { id: 'b75-45', title: 'Reorder List', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/reorder-list/' },
      
      // Matrix
      { id: 'b75-46', title: 'Set Matrix Zeroes', difficulty: 'Medium', topic: 'Matrix', leetcodeUrl: 'https://leetcode.com/problems/set-matrix-zeroes/' },
      { id: 'b75-47', title: 'Spiral Matrix', difficulty: 'Medium', topic: 'Matrix', leetcodeUrl: 'https://leetcode.com/problems/spiral-matrix/' },
      { id: 'b75-48', title: 'Rotate Image', difficulty: 'Medium', topic: 'Matrix', leetcodeUrl: 'https://leetcode.com/problems/rotate-image/' },
      { id: 'b75-49', title: 'Word Search', difficulty: 'Medium', topic: 'Matrix', leetcodeUrl: 'https://leetcode.com/problems/word-search/' },
      
      // String
      { id: 'b75-50', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { id: 'b75-51', title: 'Longest Repeating Character Replacement', difficulty: 'Medium', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
      { id: 'b75-52', title: 'Minimum Window Substring', difficulty: 'Hard', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/' },
      { id: 'b75-53', title: 'Valid Anagram', difficulty: 'Easy', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/' },
      { id: 'b75-54', title: 'Group Anagrams', difficulty: 'Medium', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/' },
      { id: 'b75-55', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/' },
      { id: 'b75-56', title: 'Valid Palindrome', difficulty: 'Easy', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/' },
      { id: 'b75-57', title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/' },
      { id: 'b75-58', title: 'Palindromic Substrings', difficulty: 'Medium', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/palindromic-substrings/' },
      { id: 'b75-59', title: 'Encode and Decode Strings', difficulty: 'Medium', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/encode-and-decode-strings/' },
      
      // Tree
      { id: 'b75-60', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
      { id: 'b75-61', title: 'Same Tree', difficulty: 'Easy', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/same-tree/' },
      { id: 'b75-62', title: 'Invert Binary Tree', difficulty: 'Easy', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/' },
      { id: 'b75-63', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
      { id: 'b75-64', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
      { id: 'b75-65', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },
      { id: 'b75-66', title: 'Subtree of Another Tree', difficulty: 'Easy', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/subtree-of-another-tree/' },
      { id: 'b75-67', title: 'Construct Tree from Preorder and Inorder', difficulty: 'Medium', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/' },
      { id: 'b75-68', title: 'Validate Binary Search Tree', difficulty: 'Medium', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/' },
      { id: 'b75-69', title: 'Kth Smallest Element in BST', difficulty: 'Medium', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/' },
      { id: 'b75-70', title: 'Lowest Common Ancestor of BST', difficulty: 'Easy', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
      { id: 'b75-71', title: 'Implement Trie', difficulty: 'Medium', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/' },
      { id: 'b75-72', title: 'Design Add and Search Words Data Structure', difficulty: 'Medium', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/' },
      { id: 'b75-73', title: 'Word Search II', difficulty: 'Hard', topic: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/word-search-ii/' },
      
      // Heap
      { id: 'b75-74', title: 'Merge K Sorted Lists', difficulty: 'Hard', topic: 'Heap', leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
      { id: 'b75-75', title: 'Top K Frequent Elements', difficulty: 'Medium', topic: 'Heap', leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/' },
    ]
  },
  
  'neetcode-150': {
    name: 'NeetCode 150',
    description: 'Curated list of 150 DSA problems',
    totalProblems: 150,
    problems: [
      // Arrays & Hashing
      { id: 'nc-1', title: 'Contains Duplicate', difficulty: 'Easy', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/' },
      { id: 'nc-2', title: 'Valid Anagram', difficulty: 'Easy', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/' },
      { id: 'nc-3', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/two-sum/' },
      { id: 'nc-4', title: 'Group Anagrams', difficulty: 'Medium', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/' },
      { id: 'nc-5', title: 'Top K Frequent Elements', difficulty: 'Medium', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/' },
      { id: 'nc-6', title: 'Encode and Decode Strings', difficulty: 'Medium', topic: 'Arrays & Hashing' },
      { id: 'nc-7', title: 'Product of Array Except Self', difficulty: 'Medium', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/' },
      { id: 'nc-8', title: 'Valid Sudoku', difficulty: 'Medium', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/valid-sudoku/' },
      { id: 'nc-9', title: 'Longest Consecutive Sequence', difficulty: 'Medium', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
      
      // Two Pointers
      { id: 'nc-10', title: 'Valid Palindrome', difficulty: 'Easy', topic: 'Two Pointers', leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/' },
      { id: 'nc-11', title: 'Two Sum II', difficulty: 'Medium', topic: 'Two Pointers', leetcodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
      { id: 'nc-12', title: '3Sum', difficulty: 'Medium', topic: 'Two Pointers', leetcodeUrl: 'https://leetcode.com/problems/3sum/' },
      { id: 'nc-13', title: 'Container With Most Water', difficulty: 'Medium', topic: 'Two Pointers', leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/' },
      { id: 'nc-14', title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Two Pointers', leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/' },
      
      // Sliding Window
      { id: 'nc-15', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topic: 'Sliding Window', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { id: 'nc-16', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Sliding Window', leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { id: 'nc-17', title: 'Longest Repeating Character Replacement', difficulty: 'Medium', topic: 'Sliding Window', leetcodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
      { id: 'nc-18', title: 'Permutation in String', difficulty: 'Medium', topic: 'Sliding Window', leetcodeUrl: 'https://leetcode.com/problems/permutation-in-string/' },
      { id: 'nc-19', title: 'Minimum Window Substring', difficulty: 'Hard', topic: 'Sliding Window', leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/' },
      { id: 'nc-20', title: 'Sliding Window Maximum', difficulty: 'Hard', topic: 'Sliding Window', leetcodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/' },
      
      // Stack
      { id: 'nc-21', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/' },
      { id: 'nc-22', title: 'Min Stack', difficulty: 'Medium', topic: 'Stack', leetcodeUrl: 'https://leetcode.com/problems/min-stack/' },
      { id: 'nc-23', title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', topic: 'Stack', leetcodeUrl: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/' },
      { id: 'nc-24', title: 'Generate Parentheses', difficulty: 'Medium', topic: 'Stack', leetcodeUrl: 'https://leetcode.com/problems/generate-parentheses/' },
      { id: 'nc-25', title: 'Daily Temperatures', difficulty: 'Medium', topic: 'Stack', leetcodeUrl: 'https://leetcode.com/problems/daily-temperatures/' },
      { id: 'nc-26', title: 'Car Fleet', difficulty: 'Medium', topic: 'Stack', leetcodeUrl: 'https://leetcode.com/problems/car-fleet/' },
      { id: 'nc-27', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', topic: 'Stack', leetcodeUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },
      
      // Binary Search
      { id: 'nc-28', title: 'Binary Search', difficulty: 'Easy', topic: 'Binary Search', leetcodeUrl: 'https://leetcode.com/problems/binary-search/' },
      { id: 'nc-29', title: 'Search a 2D Matrix', difficulty: 'Medium', topic: 'Binary Search', leetcodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/' },
      { id: 'nc-30', title: 'Koko Eating Bananas', difficulty: 'Medium', topic: 'Binary Search', leetcodeUrl: 'https://leetcode.com/problems/koko-eating-bananas/' },
      { id: 'nc-31', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', topic: 'Binary Search', leetcodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
      { id: 'nc-32', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topic: 'Binary Search', leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { id: 'nc-33', title: 'Time Based Key-Value Store', difficulty: 'Medium', topic: 'Binary Search', leetcodeUrl: 'https://leetcode.com/problems/time-based-key-value-store/' },
      { id: 'nc-34', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Binary Search', leetcodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
      
      // Linked List
      { id: 'nc-35', title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/' },
      { id: 'nc-36', title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { id: 'nc-37', title: 'Reorder List', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/reorder-list/' },
      { id: 'nc-38', title: 'Remove Nth Node From End', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
      { id: 'nc-39', title: 'Copy List with Random Pointer', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/' },
      { id: 'nc-40', title: 'Add Two Numbers', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/add-two-numbers/' },
      { id: 'nc-41', title: 'Linked List Cycle', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/' },
      { id: 'nc-42', title: 'Find Duplicate Number', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/find-the-duplicate-number/' },
      { id: 'nc-43', title: 'LRU Cache', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/lru-cache/' },
      { id: 'nc-44', title: 'Merge K Sorted Lists', difficulty: 'Hard', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
      { id: 'nc-45', title: 'Reverse Nodes in k-Group', difficulty: 'Hard', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/' },
      
      // Trees
      { id: 'nc-46', title: 'Invert Binary Tree', difficulty: 'Easy', topic: 'Trees', leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/' },
      { id: 'nc-47', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topic: 'Trees', leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
      { id: 'nc-48', title: 'Diameter of Binary Tree', difficulty: 'Easy', topic: 'Trees', leetcodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/' },
      { id: 'nc-49', title: 'Balanced Binary Tree', difficulty: 'Easy', topic: 'Trees', leetcodeUrl: 'https://leetcode.com/problems/balanced-binary-tree/' },
      { id: 'nc-50', title: 'Same Tree', difficulty: 'Easy', topic: 'Trees', leetcodeUrl: 'https://leetcode.com/problems/same-tree/' },
    ]
  },
  
  'love-babbar': {
    name: 'Love Babbar DSA Sheet',
    description: 'Complete 450 questions for DSA mastery',
    totalProblems: 450,
    problems: [
      // Arrays
      { id: 'lb-1', title: 'Reverse the Array', difficulty: 'Easy', topic: 'Array', youtubeUrl: 'https://www.youtube.com/watch?v=rRMGQs8cLKU' },
      { id: 'lb-2', title: 'Find Maximum and Minimum in Array', difficulty: 'Easy', topic: 'Array' },
      { id: 'lb-3', title: 'Kth Smallest Element', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      { id: 'lb-4', title: 'Sort 0s, 1s and 2s', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/sort-colors/' },
      { id: 'lb-5', title: 'Move All Negative to Left', difficulty: 'Easy', topic: 'Array' },
      { id: 'lb-6', title: 'Union of Two Arrays', difficulty: 'Easy', topic: 'Array' },
      { id: 'lb-7', title: 'Cyclically Rotate Array', difficulty: 'Easy', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/rotate-array/' },
      { id: 'lb-8', title: 'Kadanes Algorithm', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/' },
      { id: 'lb-9', title: 'Minimize Height Difference', difficulty: 'Medium', topic: 'Array' },
      { id: 'lb-10', title: 'Minimum Jumps', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/jump-game/' },
      { id: 'lb-11', title: 'Find Duplicate in Array', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/find-the-duplicate-number/' },
      { id: 'lb-12', title: 'Merge Two Sorted Arrays', difficulty: 'Easy', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/merge-sorted-array/' },
      { id: 'lb-13', title: 'Merge Intervals', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/' },
      { id: 'lb-14', title: 'Next Permutation', difficulty: 'Medium', topic: 'Array', leetcodeUrl: 'https://leetcode.com/problems/next-permutation/' },
      { id: 'lb-15', title: 'Count Inversions', difficulty: 'Hard', topic: 'Array' },
      
      // Matrix
      { id: 'lb-16', title: 'Spiral Matrix', difficulty: 'Medium', topic: 'Matrix', leetcodeUrl: 'https://leetcode.com/problems/spiral-matrix/' },
      { id: 'lb-17', title: 'Search in 2D Matrix', difficulty: 'Medium', topic: 'Matrix', leetcodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/' },
      { id: 'lb-18', title: 'Median in Row-wise Sorted Matrix', difficulty: 'Medium', topic: 'Matrix' },
      { id: 'lb-19', title: 'Rotate Matrix by 90', difficulty: 'Medium', topic: 'Matrix', leetcodeUrl: 'https://leetcode.com/problems/rotate-image/' },
      { id: 'lb-20', title: 'Kth Element in Matrix', difficulty: 'Hard', topic: 'Matrix' },
      
      // Strings
      { id: 'lb-21', title: 'Reverse String', difficulty: 'Easy', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/reverse-string/' },
      { id: 'lb-22', title: 'Check Palindrome', difficulty: 'Easy', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/' },
      { id: 'lb-23', title: 'Find Duplicate in String', difficulty: 'Easy', topic: 'String' },
      { id: 'lb-24', title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/' },
      { id: 'lb-25', title: 'Longest Repeating Character', difficulty: 'Medium', topic: 'String', leetcodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
    ]
  },
  
  'striver-sde': {
    name: 'Striver SDE Sheet',
    description: 'Top 191 SDE interview questions',
    totalProblems: 191,
    problems: [
      { id: 'sde-1', title: 'Set Matrix Zeroes', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/set-matrix-zeroes/' },
      { id: 'sde-2', title: 'Pascals Triangle', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/pascals-triangle/' },
      { id: 'sde-3', title: 'Next Permutation', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/next-permutation/' },
      { id: 'sde-4', title: 'Kadanes Algorithm', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/' },
      { id: 'sde-5', title: 'Sort Array of 0s 1s 2s', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/sort-colors/' },
      { id: 'sde-6', title: 'Stock Buy and Sell', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { id: 'sde-7', title: 'Rotate Matrix', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/rotate-image/' },
      { id: 'sde-8', title: 'Merge Overlapping Intervals', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/' },
      { id: 'sde-9', title: 'Merge Two Sorted Arrays', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/merge-sorted-array/' },
      { id: 'sde-10', title: 'Find Duplicate', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/find-the-duplicate-number/' },
      { id: 'sde-11', title: 'Repeat and Missing Number', difficulty: 'Medium', topic: 'Arrays' },
      { id: 'sde-12', title: 'Count Inversions', difficulty: 'Hard', topic: 'Arrays' },
      { id: 'sde-13', title: 'Search in 2D Matrix', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/' },
      { id: 'sde-14', title: 'Pow(x, n)', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/powx-n/' },
      { id: 'sde-15', title: 'Majority Element (>N/2)', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/majority-element/' },
      { id: 'sde-16', title: 'Majority Element (>N/3)', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/majority-element-ii/' },
      { id: 'sde-17', title: 'Grid Unique Paths', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/unique-paths/' },
      { id: 'sde-18', title: 'Reverse Pairs', difficulty: 'Hard', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/reverse-pairs/' },
      { id: 'sde-19', title: '2 Sum Problem', difficulty: 'Easy', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/two-sum/' },
      { id: 'sde-20', title: '4 Sum Problem', difficulty: 'Medium', topic: 'Arrays', leetcodeUrl: 'https://leetcode.com/problems/4sum/' },
    ]
  },
  
  'fraz': {
    name: 'Fraz DSA Sheet',
    description: 'Carefully curated 250 DSA problems',
    totalProblems: 250,
    problems: [
      { id: 'fraz-1', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/two-sum/' },
      { id: 'fraz-2', title: 'Contains Duplicate', difficulty: 'Easy', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/' },
      { id: 'fraz-3', title: 'Best Time to Buy Sell Stock', difficulty: 'Easy', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { id: 'fraz-4', title: 'Valid Anagram', difficulty: 'Easy', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/' },
      { id: 'fraz-5', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/' },
      { id: 'fraz-6', title: 'Product of Array Except Self', difficulty: 'Medium', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/' },
      { id: 'fraz-7', title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/' },
      { id: 'fraz-8', title: '3Sum', difficulty: 'Medium', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/3sum/' },
      { id: 'fraz-9', title: 'Merge Intervals', difficulty: 'Medium', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/' },
      { id: 'fraz-10', title: 'Group Anagrams', difficulty: 'Medium', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/' },
      { id: 'fraz-11', title: 'Maximum Product Subarray', difficulty: 'Medium', topic: 'Arrays & Hashing', leetcodeUrl: 'https://leetcode.com/problems/maximum-product-subarray/' },
      { id: 'fraz-12', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topic: 'Binary Search', leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { id: 'fraz-13', title: 'Container With Most Water', difficulty: 'Medium', topic: 'Two Pointers', leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/' },
      { id: 'fraz-14', title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/' },
      { id: 'fraz-15', title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { id: 'fraz-16', title: 'Linked List Cycle', difficulty: 'Easy', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/' },
      { id: 'fraz-17', title: 'Remove Nth Node From End', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
      { id: 'fraz-18', title: 'Reorder List', difficulty: 'Medium', topic: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/reorder-list/' },
      { id: 'fraz-19', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topic: 'Trees', leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
      { id: 'fraz-20', title: 'Invert Binary Tree', difficulty: 'Easy', topic: 'Trees', leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/' },
    ]
  }
};

export default DSA_SHEETS;
