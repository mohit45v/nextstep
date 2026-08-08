import { NextResponse } from "next/server";

export interface DSAProblem {
  id: string;
  topicId: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  solved: boolean;
  link?: string;
  description?: string;
}

const problemsData: Record<string, DSAProblem[]> = {
  "arrays-hashing": [
    { id: "ah-1", topicId: "arrays-hashing", title: "Two Sum (Hash Map Lookup)", difficulty: "easy", solved: true, link: "https://leetcode.com/problems/two-sum/" },
    { id: "ah-2", topicId: "arrays-hashing", title: "Contains Duplicate", difficulty: "easy", solved: true, link: "https://leetcode.com/problems/contains-duplicate/" },
    { id: "ah-3", topicId: "arrays-hashing", title: "Valid Anagram", difficulty: "easy", solved: true, link: "https://leetcode.com/problems/valid-anagram/" },
    { id: "ah-4", topicId: "arrays-hashing", title: "Group Anagrams", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/group-anagrams/" },
    { id: "ah-5", topicId: "arrays-hashing", title: "Top K Frequent Elements (Min-Heap / Bucket Sort)", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/top-k-frequent-elements/" },
    { id: "ah-6", topicId: "arrays-hashing", title: "Product of Array Except Self", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/product-of-array-except-self/" },
    { id: "ah-7", topicId: "arrays-hashing", title: "Longest Consecutive Sequence (HashSet O(N))", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/longest-consecutive-sequence/" },
    { id: "ah-8", topicId: "arrays-hashing", title: "First Missing Positive", difficulty: "hard", solved: false, link: "https://leetcode.com/problems/first-missing-positive/" },
  ],
  "trees-graphs": [
    { id: "tg-1", topicId: "trees-graphs", title: "Invert Binary Tree", difficulty: "easy", solved: true, link: "https://leetcode.com/problems/invert-binary-tree/" },
    { id: "tg-2", topicId: "trees-graphs", title: "Maximum Depth of Binary Tree", difficulty: "easy", solved: true, link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
    { id: "tg-3", topicId: "trees-graphs", title: "Number of Islands (BFS/DFS Grid)", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/number-of-islands/" },
    { id: "tg-4", topicId: "trees-graphs", title: "Course Schedule (Topological Sort / Kahns)", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/course-schedule/" },
    { id: "tg-5", topicId: "trees-graphs", title: "Network Delay Time (Dijkstra Shortest Path)", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/network-delay-time/" },
    { id: "tg-6", topicId: "trees-graphs", title: "Lowest Common Ancestor of a Binary Tree", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
    { id: "tg-7", topicId: "trees-graphs", title: "Word Ladder (Shortest Path BFS)", difficulty: "hard", solved: false, link: "https://leetcode.com/problems/word-ladder/" },
  ],
  "dynamic-programming": [
    { id: "dp-1", topicId: "dynamic-programming", title: "Climbing Stairs (Fibonacci DP)", difficulty: "easy", solved: true, link: "https://leetcode.com/problems/climbing-stairs/" },
    { id: "dp-2", topicId: "dynamic-programming", title: "House Robber", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/house-robber/" },
    { id: "dp-3", topicId: "dynamic-programming", title: "Coin Change (Unbounded Knapsack)", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/coin-change/" },
    { id: "dp-4", topicId: "dynamic-programming", title: "Longest Increasing Subsequence", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/longest-increasing-subsequence/" },
    { id: "dp-5", topicId: "dynamic-programming", title: "Word Break", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/word-break/" },
    { id: "dp-6", topicId: "dynamic-programming", title: "Edit Distance (Levenshtein DP)", difficulty: "hard", solved: false, link: "https://leetcode.com/problems/edit-distance/" },
  ],
  "aids-spatial-trees": [
    { id: "aids-s1", topicId: "aids-spatial-trees", title: "K-Nearest Neighbors using 2D Kd-Tree", difficulty: "medium", solved: true, link: "https://leetcode.com/problems/k-closest-points-to-origin/" },
    { id: "aids-s2", topicId: "aids-spatial-trees", title: "Range Search in Multi-Dimensional Kd-Trees", difficulty: "medium", solved: true, link: "https://geeksforgeeks.org/k-dimensional-tree/" },
    { id: "aids-s3", topicId: "aids-spatial-trees", title: "Ball Tree Partitioning for High-Dimensional Vectors", difficulty: "medium", solved: false },
    { id: "aids-s4", topicId: "aids-spatial-trees", title: "Hierarchical Navigable Small World (HNSW) Graphs", difficulty: "hard", solved: false },
    { id: "aids-s5", topicId: "aids-spatial-trees", title: "QuadTree Construction for Image Compression", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/construct-quad-tree/" },
  ],
  "aids-matrix-nn": [
    { id: "aids-m1", topicId: "aids-matrix-nn", title: "Sparse Matrix Multiplication (O(N*M) Indexing)", difficulty: "medium", solved: true, link: "https://leetcode.com/problems/sparse-matrix-multiplication/" },
    { id: "aids-m2", topicId: "aids-matrix-nn", title: "PageRank Power Iteration Algorithm", difficulty: "medium", solved: false },
    { id: "aids-m3", topicId: "aids-matrix-nn", title: "Singular Value Decomposition (SVD) Truncation", difficulty: "hard", solved: false },
    { id: "aids-m4", topicId: "aids-matrix-nn", title: "Graph Neural Network Message Passing Aggregator", difficulty: "medium", solved: false },
    { id: "aids-m5", topicId: "aids-matrix-nn", title: "Rotate Image / Matrix Transpose", difficulty: "easy", solved: false, link: "https://leetcode.com/problems/rotate-image/" },
  ],
  "ee-circuit-graphs": [
    { id: "ee-m1", topicId: "ee-circuit-graphs", title: "Circuit Mesh Analysis via Graph Incidence Matrix", difficulty: "medium", solved: true },
    { id: "ee-m2", topicId: "ee-circuit-graphs", title: "PCB Trace Auto-Routing using A* Shortest Path", difficulty: "medium", solved: false },
    { id: "ee-m3", topicId: "ee-circuit-graphs", title: "Min-Cost Spanning Tree for Electrical Substation Grid", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/min-cost-to-connect-all-points/" },
    { id: "ee-m4", topicId: "ee-circuit-graphs", title: "Nodal Voltage Matrix Solver (LU Decomposition)", difficulty: "hard", solved: false },
  ],
  "ee-fft-signal": [
    { id: "ee-f1", topicId: "ee-fft-signal", title: "Cooley-Tukey Radix-2 Fast Fourier Transform Algorithm", difficulty: "hard", solved: false },
    { id: "ee-f2", topicId: "ee-fft-signal", title: "Discrete Signal Convolution via FFT", difficulty: "medium", solved: false },
    { id: "ee-f3", topicId: "ee-fft-signal", title: "High-Pass & Low-Pass Digital Filter Array Pipeline", difficulty: "medium", solved: false },
    { id: "ee-f4", topicId: "ee-fft-signal", title: "Bit-Reversal Permutation for In-Place FFT", difficulty: "medium", solved: false },
  ],
  "mech-kinematics-dp": [
    { id: "mech-k1", topicId: "mech-kinematics-dp", title: "Robotic Arm Path Planning (A* Search on Configuration Space)", difficulty: "medium", solved: true },
    { id: "mech-k2", topicId: "mech-kinematics-dp", title: "Kinematic Chain Angle Optimization via Dynamic Programming", difficulty: "medium", solved: false },
    { id: "mech-k3", topicId: "mech-kinematics-dp", title: "Collision-Free Trajectory Smoothing (B-Splines)", difficulty: "hard", solved: false },
    { id: "mech-k4", topicId: "mech-kinematics-dp", title: "Minimum Energy Gear Ratio Selection (Knapsack DP)", difficulty: "easy", solved: false },
  ],
  "mech-spatial-cad": [
    { id: "mech-c1", topicId: "mech-spatial-cad", title: "3D Octree Ray-Intersection for CAD Surface Rendering", difficulty: "hard", solved: false },
    { id: "mech-c2", topicId: "mech-spatial-cad", title: "2D Convex Hull for Sheet Metal Stamping (Graham Scan)", difficulty: "medium", solved: false, link: "https://leetcode.com/problems/erect-the-fence/" },
    { id: "mech-c3", topicId: "mech-spatial-cad", title: "Constructive Solid Geometry (CSG) Tree Evaluation", difficulty: "medium", solved: false },
    { id: "mech-c4", topicId: "mech-spatial-cad", title: "Finite Element Mesh Quad-Splitting Algorithm", difficulty: "medium", solved: false },
  ],
  "civil-network-flow": [
    { id: "civil-n1", topicId: "civil-network-flow", title: "Water Pipe Network Pressure Max-Flow (Ford-Fulkerson)", difficulty: "hard", solved: true },
    { id: "civil-n2", topicId: "civil-network-flow", title: "Urban Highway Traffic Bottleneck Detection (Min-Cut)", difficulty: "medium", solved: false },
    { id: "civil-n3", topicId: "civil-network-flow", title: "Stormwater Drainage Pipe Diameter Optimization (Greedy)", difficulty: "medium", solved: false },
    { id: "civil-n4", topicId: "civil-network-flow", title: "Bipartite Matching for Construction Equipment Assignment", difficulty: "medium", solved: false },
  ],
  "civil-spatial-gis": [
    { id: "civil-g1", topicId: "civil-spatial-gis", title: "R-Tree Spatial Indexing for Survey Parcels", difficulty: "hard", solved: false },
    { id: "civil-g2", topicId: "civil-spatial-gis", title: "Terrain Elevation Contour Interpolation (Delaunay Triangulation)", difficulty: "medium", solved: false },
    { id: "civil-g3", topicId: "civil-spatial-gis", title: "GPS Waypoint Map Matching (Hidden Markov / BFS)", difficulty: "medium", solved: false },
    { id: "civil-g4", topicId: "civil-spatial-gis", title: "Flood Risk Zone Overlap Polygon Intersection", difficulty: "medium", solved: false },
  ],
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params;
  const problems = problemsData[topicId] || [];
  return NextResponse.json(problems);
}
