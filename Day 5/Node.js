// !  Create three nodes called author, book, readerand program the curd opertions to insert data establish  relationship update data , delete relationship and delete relationship and delete node.








class Node {
  constructor(id, type, data) {
    this.id = id;
    this.type = type; // 'author' | 'book' | 'reader'
    this.data = data;
    this.relationships = {}; // { relationType: [nodeId1, nodeId2, ...] }
  }

  addRelationship(relationType, targetNodeId) {
    if (!this.relationships[relationType]) {
      this.relationships[relationType] = [];
    }
    if (!this.relationships[relationType].includes(targetNodeId)) {
      this.relationships[relationType].push(targetNodeId);
    }
  }

  removeRelationship(relationType, targetNodeId) {
    if (this.relationships[relationType]) {
      this.relationships[relationType] = this.relationships[relationType].filter(
        (id) => id !== targetNodeId
      );
      if (this.relationships[relationType].length === 0) {
        delete this.relationships[relationType];
      }
    }
  }

  updateData(newData) {
    this.data = { ...this.data, ...newData };
  }

  toString() {
    return `Node(id=${this.id}, type=${this.type}, data=${JSON.stringify(this.data)})`;
  }
}

class GraphDatabase {
  constructor() {
    this.nodes = {}; // { nodeId: Node }
    this.nextId = 1;
  }

  // CREATE: Insert a new node
  insertNode(type, data) {
    const id = `${type}-${this.nextId++}`;
    const node = new Node(id, type, data);
    this.nodes[id] = node;
    console.log(`✓ Inserted: ${node.toString()}`);
    return id;
  }

  // CREATE: Establish relationship between two nodes
  establishRelationship(fromNodeId, relationType, toNodeId) {
    const fromNode = this.nodes[fromNodeId];
    const toNode = this.nodes[toNodeId];

    if (!fromNode || !toNode) {
      console.error(
        `✗ Error: Node not found. From: ${fromNodeId}, To: ${toNodeId}`
      );
      return false;
    }

    fromNode.addRelationship(relationType, toNodeId);
    toNode.addRelationship(`${relationType}_reverse`, fromNodeId);
    console.log(
      `✓ Relationship established: ${fromNodeId} --[${relationType}]--> ${toNodeId}`
    );
    return true;
  }

  // READ: Retrieve node by ID
  getNode(nodeId) {
    return this.nodes[nodeId];
  }

  // UPDATE: Modify node data
  updateNode(nodeId, newData) {
    const node = this.nodes[nodeId];
    if (!node) {
      console.error(`✗ Error: Node ${nodeId} not found`);
      return false;
    }
    node.updateData(newData);
    console.log(`✓ Updated: ${node.toString()}`);
    return true;
  }

  // DELETE: Remove relationship between two nodes
  deleteRelationship(fromNodeId, relationType, toNodeId) {
    const fromNode = this.nodes[fromNodeId];
    const toNode = this.nodes[toNodeId];

    if (!fromNode || !toNode) {
      console.error(
        `✗ Error: Node not found. From: ${fromNodeId}, To: ${toNodeId}`
      );
      return false;
    }

    fromNode.removeRelationship(relationType, toNodeId);
    toNode.removeRelationship(`${relationType}_reverse`, fromNodeId);
    console.log(
      `✓ Relationship deleted: ${fromNodeId} --[${relationType}]--> ${toNodeId}`
    );
    return true;
  }

  // DELETE: Remove a node and its relationships
  deleteNode(nodeId) {
    const node = this.nodes[nodeId];
    if (!node) {
      console.error(`✗ Error: Node ${nodeId} not found`);
      return false;
    }

    // Remove all relationships pointing to this node
    Object.values(this.nodes).forEach((otherNode) => {
      Object.keys(otherNode.relationships).forEach((relationType) => {
        otherNode.removeRelationship(relationType, nodeId);
      });
    });

    delete this.nodes[nodeId];
    console.log(`✓ Node deleted: ${nodeId}`);
    return true;
  }

  printGraph() {
    console.log("\n=== Graph State ===");
    Object.values(this.nodes).forEach((node) => {
      console.log(`${node.toString()}`);
      if (Object.keys(node.relationships).length > 0) {
        console.log(
          `  Relationships: ${JSON.stringify(node.relationships)}`
        );
      }
    });
  }
}

// Example usage
console.log("=== Graph Database CRUD Operations ===\n");

const db = new GraphDatabase();

// CREATE: Insert nodes
const author1 = db.insertNode("author", { name: "J.K. Rowling", born: 1965 });
const author2 = db.insertNode("author", { name: "George R.R. Martin", born: 1948 });
const book1 = db.insertNode("book", { title: "Harry Potter", year: 1997 });
const book2 = db.insertNode("book", { title: "Game of Thrones", year: 1996 });
const reader1 = db.insertNode("reader", { name: "Alice", age: 25 });

// CREATE: Establish relationships
db.establishRelationship(author1, "written", book1);
db.establishRelationship(author2, "written", book2);
db.establishRelationship(reader1, "reads", book1);
db.establishRelationship(reader1, "reads", book2);

db.printGraph();

// UPDATE: Modify node data
console.log("\n=== UPDATE Operations ===");
db.updateNode(reader1, { age: 26, premium: true });

// DELETE: Remove a relationship
console.log("\n=== DELETE Relationship ===");
db.deleteRelationship(reader1, "reads", book2);

db.printGraph();

// DELETE: Remove a node
console.log("\n=== DELETE Node ===");
db.deleteNode(book2);

db.printGraph();




