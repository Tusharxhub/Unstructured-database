
//!  Establish a cycle relationship between three nodes.




class GraphNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

function createThreeNodeCycle() {
  const nodeA = new GraphNode("A");
  const nodeB = new GraphNode("B");
  const nodeC = new GraphNode("C");

  nodeA.next = nodeB;
  nodeB.next = nodeC;
  nodeC.next = nodeA;

  return { nodeA, nodeB, nodeC };
}

function printCycle(startNode, steps = 6) {
  const values = [];
  let current = startNode;

  for (let i = 0; i < steps; i += 1) {
    values.push(current.value);
    current = current.next;
  }

  console.log(`Traversal (${steps} steps): ${values.join(" -> ")}`);
}

function isThreeNodeCycle(nodeA, nodeB, nodeC) {
  return nodeA.next === nodeB && nodeB.next === nodeC && nodeC.next === nodeA;
}

const { nodeA, nodeB, nodeC } = createThreeNodeCycle();

console.log("Three-node cycle created:", isThreeNodeCycle(nodeA, nodeB, nodeC));
printCycle(nodeA);

