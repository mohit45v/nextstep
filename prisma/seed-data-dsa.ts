/**
 * The curated DSA sheets, as editorial seed data.
 *
 * These two structures used to live inside the route handlers in
 * `src/app/api/dsa/`, which meant the "database" was a module constant that no
 * student could ever tick a box against. They are now seeded into `DsaTopic` and
 * `DsaProblem`, and this file — like `seed-data.ts` — has exactly one consumer:
 * `prisma/seed.ts`.
 *
 * Two fields are deliberately gone:
 *   * `totalProblems` on a topic — it is a COUNT(*) now, so it cannot drift.
 *   * `solved` on a problem — solving belongs to a student, not to a problem.
 */

/** Branch labels, as a student reads them. Mapped to the enum in `seed.ts`. */
export type DsaBranchLabel =
  | "General"
  | "CS & IT"
  | "AIDS"
  | "Electrical"
  | "Mechanical"
  | "Civil";

export interface SeedDsaTopic {
  id: string;
  name: string;
  /** Kept for the URL-ish identity used by the old API; equal to `id` today. */
  slug: string;
  description: string;
  branch: DsaBranchLabel;
}

export interface SeedDsaProblem {
  id: string;
  topicId: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  link?: string;
  description?: string;
}

export const DSA_TOPICS: SeedDsaTopic[] = [
  {
    id: "arrays-hashing",
    name: "Arrays & Hashing",
    slug: "arrays-hashing",
    description: "Fundamental memory layouts, search algorithms, prefix sums, and hash table lookups.",
    branch: "CS & IT",
  },
  {
    id: "trees-graphs",
    name: "Trees & Graph Traversal",
    slug: "trees-graphs",
    description: "Binary search trees, BFS/DFS, shortest paths, and topological sorting.",
    branch: "CS & IT",
  },
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    slug: "dynamic-programming",
    description: "Memoization, tabulation, optimization problems, and knapsack variants.",
    branch: "CS & IT",
  },
  {
    id: "aids-spatial-trees",
    name: "Kd-Trees & Spatial Indexing",
    slug: "aids-spatial",
    description: "Nearest neighbor search algorithms, Ball Trees, and high-dimensional vector spaces.",
    branch: "AIDS",
  },
  {
    id: "aids-matrix-nn",
    name: "Matrix Decompositions & Graphs",
    slug: "aids-matrix",
    description: "SVD, LU decomposition, PageRank, and Graph Neural Network message passing.",
    branch: "AIDS",
  },
  {
    id: "ee-circuit-graphs",
    name: "Circuit Graph Mesh & Nodal Analysis",
    slug: "ee-mesh",
    description: "Adjacency matrix representation of electrical grids, Kirchhoff equations, and PCB trace routing.",
    branch: "Electrical",
  },
  {
    id: "ee-fft-signal",
    name: "Fast Fourier Transform (FFT)",
    slug: "ee-fft",
    description: "O(N log N) signal decomposition, frequency domain algorithms, and spectral analysis.",
    branch: "Electrical",
  },
  {
    id: "mech-kinematics-dp",
    name: "Kinematics & Motion Path Planning",
    slug: "mech-kinematics",
    description: "A* search and Dynamic Programming for robotic arm trajectory and collision-free path planning.",
    branch: "Mechanical",
  },
  {
    id: "mech-spatial-cad",
    name: "Computational Geometry & B-Rep Trees",
    slug: "mech-cad",
    description: "Octrees, CSG trees, convex hull algorithms, and 3D solid modeling data structures.",
    branch: "Mechanical",
  },
  {
    id: "civil-network-flow",
    name: "Pipe Networks & Traffic Max-Flow",
    slug: "civil-flow",
    description: "Ford-Fulkerson & Edmonds-Karp max-flow algorithms for fluid dynamics and urban traffic bottlenecks.",
    branch: "Civil",
  },
  {
    id: "civil-spatial-gis",
    name: "GIS Spatial Indexing (R-Trees)",
    slug: "civil-gis",
    description: "QuadTrees and R-Trees for land survey mapping, terrain elevation grids, and spatial queries.",
    branch: "Civil",
  },
];

export const DSA_PROBLEMS: Record<string, SeedDsaProblem[]> = {
  "arrays-hashing": [
    { id: "ah-1", topicId: "arrays-hashing", title: "Two Sum (Hash Map Lookup)", difficulty: "easy", link: "https://leetcode.com/problems/two-sum/" },
    { id: "ah-2", topicId: "arrays-hashing", title: "Contains Duplicate", difficulty: "easy", link: "https://leetcode.com/problems/contains-duplicate/" },
    { id: "ah-3", topicId: "arrays-hashing", title: "Valid Anagram", difficulty: "easy", link: "https://leetcode.com/problems/valid-anagram/" },
    { id: "ah-4", topicId: "arrays-hashing", title: "Group Anagrams", difficulty: "medium", link: "https://leetcode.com/problems/group-anagrams/" },
    { id: "ah-5", topicId: "arrays-hashing", title: "Top K Frequent Elements (Min-Heap / Bucket Sort)", difficulty: "medium", link: "https://leetcode.com/problems/top-k-frequent-elements/" },
    { id: "ah-6", topicId: "arrays-hashing", title: "Product of Array Except Self", difficulty: "medium", link: "https://leetcode.com/problems/product-of-array-except-self/" },
    { id: "ah-7", topicId: "arrays-hashing", title: "Longest Consecutive Sequence (HashSet O(N))", difficulty: "medium", link: "https://leetcode.com/problems/longest-consecutive-sequence/" },
    { id: "ah-8", topicId: "arrays-hashing", title: "First Missing Positive", difficulty: "hard", link: "https://leetcode.com/problems/first-missing-positive/" },
  ],
  "trees-graphs": [
    { id: "tg-1", topicId: "trees-graphs", title: "Invert Binary Tree", difficulty: "easy", link: "https://leetcode.com/problems/invert-binary-tree/" },
    { id: "tg-2", topicId: "trees-graphs", title: "Maximum Depth of Binary Tree", difficulty: "easy", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
    { id: "tg-3", topicId: "trees-graphs", title: "Number of Islands (BFS/DFS Grid)", difficulty: "medium", link: "https://leetcode.com/problems/number-of-islands/" },
    { id: "tg-4", topicId: "trees-graphs", title: "Course Schedule (Topological Sort / Kahns)", difficulty: "medium", link: "https://leetcode.com/problems/course-schedule/" },
    { id: "tg-5", topicId: "trees-graphs", title: "Network Delay Time (Dijkstra Shortest Path)", difficulty: "medium", link: "https://leetcode.com/problems/network-delay-time/" },
    { id: "tg-6", topicId: "trees-graphs", title: "Lowest Common Ancestor of a Binary Tree", difficulty: "medium", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
    { id: "tg-7", topicId: "trees-graphs", title: "Word Ladder (Shortest Path BFS)", difficulty: "hard", link: "https://leetcode.com/problems/word-ladder/" },
  ],
  "dynamic-programming": [
    { id: "dp-1", topicId: "dynamic-programming", title: "Climbing Stairs (Fibonacci DP)", difficulty: "easy", link: "https://leetcode.com/problems/climbing-stairs/" },
    { id: "dp-2", topicId: "dynamic-programming", title: "House Robber", difficulty: "medium", link: "https://leetcode.com/problems/house-robber/" },
    { id: "dp-3", topicId: "dynamic-programming", title: "Coin Change (Unbounded Knapsack)", difficulty: "medium", link: "https://leetcode.com/problems/coin-change/" },
    { id: "dp-4", topicId: "dynamic-programming", title: "Longest Increasing Subsequence", difficulty: "medium", link: "https://leetcode.com/problems/longest-increasing-subsequence/" },
    { id: "dp-5", topicId: "dynamic-programming", title: "Word Break", difficulty: "medium", link: "https://leetcode.com/problems/word-break/" },
    { id: "dp-6", topicId: "dynamic-programming", title: "Edit Distance (Levenshtein DP)", difficulty: "hard", link: "https://leetcode.com/problems/edit-distance/" },
  ],
  "aids-spatial-trees": [
    { id: "aids-s1", topicId: "aids-spatial-trees", title: "K-Nearest Neighbors using 2D Kd-Tree", difficulty: "medium", link: "https://leetcode.com/problems/k-closest-points-to-origin/" },
    { id: "aids-s2", topicId: "aids-spatial-trees", title: "Range Search in Multi-Dimensional Kd-Trees", difficulty: "medium", link: "https://geeksforgeeks.org/k-dimensional-tree/" },
    { id: "aids-s3", topicId: "aids-spatial-trees", title: "Ball Tree Partitioning for High-Dimensional Vectors", difficulty: "medium"},
    { id: "aids-s4", topicId: "aids-spatial-trees", title: "Hierarchical Navigable Small World (HNSW) Graphs", difficulty: "hard"},
    { id: "aids-s5", topicId: "aids-spatial-trees", title: "QuadTree Construction for Image Compression", difficulty: "medium", link: "https://leetcode.com/problems/construct-quad-tree/" },
  ],
  "aids-matrix-nn": [
    { id: "aids-m1", topicId: "aids-matrix-nn", title: "Sparse Matrix Multiplication (O(N*M) Indexing)", difficulty: "medium", link: "https://leetcode.com/problems/sparse-matrix-multiplication/" },
    { id: "aids-m2", topicId: "aids-matrix-nn", title: "PageRank Power Iteration Algorithm", difficulty: "medium"},
    { id: "aids-m3", topicId: "aids-matrix-nn", title: "Singular Value Decomposition (SVD) Truncation", difficulty: "hard"},
    { id: "aids-m4", topicId: "aids-matrix-nn", title: "Graph Neural Network Message Passing Aggregator", difficulty: "medium"},
    { id: "aids-m5", topicId: "aids-matrix-nn", title: "Rotate Image / Matrix Transpose", difficulty: "easy", link: "https://leetcode.com/problems/rotate-image/" },
  ],
  "ee-circuit-graphs": [
    { id: "ee-m1", topicId: "ee-circuit-graphs", title: "Circuit Mesh Analysis via Graph Incidence Matrix", difficulty: "medium"},
    { id: "ee-m2", topicId: "ee-circuit-graphs", title: "PCB Trace Auto-Routing using A* Shortest Path", difficulty: "medium"},
    { id: "ee-m3", topicId: "ee-circuit-graphs", title: "Min-Cost Spanning Tree for Electrical Substation Grid", difficulty: "medium", link: "https://leetcode.com/problems/min-cost-to-connect-all-points/" },
    { id: "ee-m4", topicId: "ee-circuit-graphs", title: "Nodal Voltage Matrix Solver (LU Decomposition)", difficulty: "hard"},
  ],
  "ee-fft-signal": [
    { id: "ee-f1", topicId: "ee-fft-signal", title: "Cooley-Tukey Radix-2 Fast Fourier Transform Algorithm", difficulty: "hard"},
    { id: "ee-f2", topicId: "ee-fft-signal", title: "Discrete Signal Convolution via FFT", difficulty: "medium"},
    { id: "ee-f3", topicId: "ee-fft-signal", title: "High-Pass & Low-Pass Digital Filter Array Pipeline", difficulty: "medium"},
    { id: "ee-f4", topicId: "ee-fft-signal", title: "Bit-Reversal Permutation for In-Place FFT", difficulty: "medium"},
  ],
  "mech-kinematics-dp": [
    { id: "mech-k1", topicId: "mech-kinematics-dp", title: "Robotic Arm Path Planning (A* Search on Configuration Space)", difficulty: "medium"},
    { id: "mech-k2", topicId: "mech-kinematics-dp", title: "Kinematic Chain Angle Optimization via Dynamic Programming", difficulty: "medium"},
    { id: "mech-k3", topicId: "mech-kinematics-dp", title: "Collision-Free Trajectory Smoothing (B-Splines)", difficulty: "hard"},
    { id: "mech-k4", topicId: "mech-kinematics-dp", title: "Minimum Energy Gear Ratio Selection (Knapsack DP)", difficulty: "easy"},
  ],
  "mech-spatial-cad": [
    { id: "mech-c1", topicId: "mech-spatial-cad", title: "3D Octree Ray-Intersection for CAD Surface Rendering", difficulty: "hard"},
    { id: "mech-c2", topicId: "mech-spatial-cad", title: "2D Convex Hull for Sheet Metal Stamping (Graham Scan)", difficulty: "medium", link: "https://leetcode.com/problems/erect-the-fence/" },
    { id: "mech-c3", topicId: "mech-spatial-cad", title: "Constructive Solid Geometry (CSG) Tree Evaluation", difficulty: "medium"},
    { id: "mech-c4", topicId: "mech-spatial-cad", title: "Finite Element Mesh Quad-Splitting Algorithm", difficulty: "medium"},
  ],
  "civil-network-flow": [
    { id: "civil-n1", topicId: "civil-network-flow", title: "Water Pipe Network Pressure Max-Flow (Ford-Fulkerson)", difficulty: "hard"},
    { id: "civil-n2", topicId: "civil-network-flow", title: "Urban Highway Traffic Bottleneck Detection (Min-Cut)", difficulty: "medium"},
    { id: "civil-n3", topicId: "civil-network-flow", title: "Stormwater Drainage Pipe Diameter Optimization (Greedy)", difficulty: "medium"},
    { id: "civil-n4", topicId: "civil-network-flow", title: "Bipartite Matching for Construction Equipment Assignment", difficulty: "medium"},
  ],
  "civil-spatial-gis": [
    { id: "civil-g1", topicId: "civil-spatial-gis", title: "R-Tree Spatial Indexing for Survey Parcels", difficulty: "hard"},
    { id: "civil-g2", topicId: "civil-spatial-gis", title: "Terrain Elevation Contour Interpolation (Delaunay Triangulation)", difficulty: "medium"},
    { id: "civil-g3", topicId: "civil-spatial-gis", title: "GPS Waypoint Map Matching (Hidden Markov / BFS)", difficulty: "medium"},
    { id: "civil-g4", topicId: "civil-spatial-gis", title: "Flood Risk Zone Overlap Polygon Intersection", difficulty: "medium"},
  ],
};
