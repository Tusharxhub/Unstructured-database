// !  Create three nodes called author, book, readerand program the curd opertions to insert data establish  relationship update data , delete relationship and delete relationship and delete node.








class DB {
  constructor() {
    this.nodes = {};
    this.i = 1;
  }
  insert(type, data) {
    const id = `${type}-${this.i++}`;
    this.nodes[id] = { id, type, data, rel: {} };
    return id;
  }
  addRel(a, r, b) {
    if (!this.nodes[a] || !this.nodes[b]) return false;
    (this.nodes[a].rel[r] ??= new Set()).add(b);
    (this.nodes[b].rel[`${r}_by`] ??= new Set()).add(a);
    return true;
  }
  update(id, patch) {
    if (!this.nodes[id]) return false;
    this.nodes[id].data = { ...this.nodes[id].data, ...patch };
    return true;
  }
  delRel(a, r, b) {
    if (!this.nodes[a] || !this.nodes[b]) return false;
    this.nodes[a].rel[r]?.delete(b);
    this.nodes[b].rel[`${r}_by`]?.delete(a);
    return true;
  }
  delNode(id) {
    if (!this.nodes[id]) return false;
    for (const n of Object.values(this.nodes))
      for (const k in n.rel) n.rel[k].delete(id);
    delete this.nodes[id];
    return true;
  }
  print() {
    console.log(
      JSON.stringify(
        Object.values(this.nodes).map((n) => ({
          ...n,
          rel: Object.fromEntries(Object.entries(n.rel).map(([k, v]) => [k, [...v]])),
        })),
        null,
        2
      )
    );
  }
}

const db = new DB();
const a = db.insert("author", { name: "J.K. Rowling" });
const b = db.insert("book", { title: "Harry Potter" });
const r = db.insert("reader", { name: "Alice" });

db.addRel(a, "written", b);
db.addRel(r, "reads", b);
db.update(r, { age: 26 });
db.delRel(r, "reads", b);
db.delNode(b);
db.print();
