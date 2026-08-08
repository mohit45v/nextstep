import { NextResponse } from "next/server";

export interface DSATopic {
  id: string;
  name: string;
  slug: string;
  description: string;
  branch: "General" | "CS & IT" | "AIDS" | "Electrical" | "Mechanical" | "Civil";
  totalProblems: number;
  solvedProblems: number;
}

export const initialTopics: DSATopic[] = [
  {
    id: "arrays-hashing",
    name: "Arrays & Hashing",
    slug: "arrays-hashing",
    description: "Fundamental memory layouts, search algorithms, prefix sums, and hash table lookups.",
    branch: "CS & IT",
    totalProblems: 8,
    solvedProblems: 3,
  },
  {
    id: "trees-graphs",
    name: "Trees & Graph Traversal",
    slug: "trees-graphs",
    description: "Binary search trees, BFS/DFS, shortest paths, and topological sorting.",
    branch: "CS & IT",
    totalProblems: 7,
    solvedProblems: 2,
  },
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    slug: "dynamic-programming",
    description: "Memoization, tabulation, optimization problems, and knapsack variants.",
    branch: "CS & IT",
    totalProblems: 6,
    solvedProblems: 1,
  },
  {
    id: "aids-spatial-trees",
    name: "Kd-Trees & Spatial Indexing",
    slug: "aids-spatial",
    description: "Nearest neighbor search algorithms, Ball Trees, and high-dimensional vector spaces.",
    branch: "AIDS",
    totalProblems: 5,
    solvedProblems: 2,
  },
  {
    id: "aids-matrix-nn",
    name: "Matrix Decompositions & Graphs",
    slug: "aids-matrix",
    description: "SVD, LU decomposition, PageRank, and Graph Neural Network message passing.",
    branch: "AIDS",
    totalProblems: 5,
    solvedProblems: 1,
  },
  {
    id: "ee-circuit-graphs",
    name: "Circuit Graph Mesh & Nodal Analysis",
    slug: "ee-mesh",
    description: "Adjacency matrix representation of electrical grids, Kirchhoff equations, and PCB trace routing.",
    branch: "Electrical",
    totalProblems: 4,
    solvedProblems: 1,
  },
  {
    id: "ee-fft-signal",
    name: "Fast Fourier Transform (FFT)",
    slug: "ee-fft",
    description: "O(N log N) signal decomposition, frequency domain algorithms, and spectral analysis.",
    branch: "Electrical",
    totalProblems: 4,
    solvedProblems: 0,
  },
  {
    id: "mech-kinematics-dp",
    name: "Kinematics & Motion Path Planning",
    slug: "mech-kinematics",
    description: "A* search and Dynamic Programming for robotic arm trajectory and collision-free path planning.",
    branch: "Mechanical",
    totalProblems: 4,
    solvedProblems: 1,
  },
  {
    id: "mech-spatial-cad",
    name: "Computational Geometry & B-Rep Trees",
    slug: "mech-cad",
    description: "Octrees, CSG trees, convex hull algorithms, and 3D solid modeling data structures.",
    branch: "Mechanical",
    totalProblems: 4,
    solvedProblems: 0,
  },
  {
    id: "civil-network-flow",
    name: "Pipe Networks & Traffic Max-Flow",
    slug: "civil-flow",
    description: "Ford-Fulkerson & Edmonds-Karp max-flow algorithms for fluid dynamics and urban traffic bottlenecks.",
    branch: "Civil",
    totalProblems: 4,
    solvedProblems: 1,
  },
  {
    id: "civil-spatial-gis",
    name: "GIS Spatial Indexing (R-Trees)",
    slug: "civil-gis",
    description: "QuadTrees and R-Trees for land survey mapping, terrain elevation grids, and spatial queries.",
    branch: "Civil",
    totalProblems: 4,
    solvedProblems: 0,
  },
];

export async function GET() {
  return NextResponse.json(initialTopics);
}
