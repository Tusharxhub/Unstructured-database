// !  Create three nodes called author, book, readerand program the curd opertions to insert data establish  relationship update data , delete relationship and delete relationship and delete node.








class Node {
  constructor(id, type, data) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.rel = {};
  }
  addRel(type, id) {
    (this.rel[type] ??= new Set()).add(id);
  }
  removeRel(type, id) {
    if (!this.rel[type]) return;
    this.rel[type].delete(id);
    if (!this.rel[type].size) delete this.rel[type];
  }
}

class GraphDB {
  constructor() {
    this.nodes = {};
    this.nextId = 1;
  }

  insert(type, data) {
    const id = `${type}-${this.nextId++}`;
    this.nodes[id] = new Node(id, type, data);
    return id;
  }

  link(from, rel, to) {
    if (!this.nodes[from] || !this.nodes[to]) return false;
    this.nodes[from].addRel(rel, to);
    this.nodes[to].addRel(`${rel}_by`, from);
    return true;
  }

  get(id) {
    return this.nodes[id] || null;
  }

  update(id, patch) {
    if (!this.nodes[id]) return false;
    this.nodes[id].data = { ...this.nodes[id].data, ...patch };
    return true;
  }

  unlink(from, rel, to) {
    if (!this.nodes[from] || !this.nodes[to]) return false;
    this.nodes[from].removeRel(rel, to);
    this.nodes[to].removeRel(`${rel}_by`, from);
    return true;
  }

  deleteNode(id) {
    if (!this.nodes[id]) return false;
    for (const n of Object.values(this.nodes)) {
      for (const r of Object.keys(n.rel)) n.removeRel(r, id);
    }
    delete this.nodes[id];
    return true;
  }

  print() {
    console.log(
      JSON.stringify(
        Object.values(this.nodes).map((n) => ({
          id: n.id,
          type: n.type,
          data: n.data,
          rel: Object.fromEntries(
            Object.entries(n.rel).map(([k, v]) => [k, [...v]])
          ),
        })),
        null,
        2
      )
    );
  }
}

// Demo
const db = new GraphDB();
const a1 = db.insert("author", { name: "J.K. Rowling" });
const b1 = db.insert("book", { title: "Harry Potter" });
const r1 = db.insert("reader", { name: "Alice" });

db.link(a1, "written", b1);
db.link(r1, "reads", b1);
db.update(r1, { age: 26 });
db.unlink(r1, "reads", b1);
db.deleteNode(b1);
db.print();
