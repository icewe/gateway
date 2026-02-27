# GraphQL 指南

## 基础 schema

```graphql
type User {
  id: ID!
  email: String!
  name: String
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  createdAt: DateTime!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  posts: [Post!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User
  deleteUser(id: ID!): Boolean!
}
```

## Resolver

```javascript
const resolvers = {
  Query: {
    users: () => db.users.findAll(),
    user: (_, { id }) => db.users.findById(id)
  },
  
  User: {
    posts: (user) => db.posts.findByUserId(user.id)
  },
  
  Mutation: {
    createUser: (_, { input }) => db.users.create(input)
  }
};
```

## N+1 优化

```javascript
// 数据加载器
const DataLoader = require('dataloader');

const userLoader = new DataLoader(async (ids) => {
  const users = await db.users.findByIds(ids);
  return ids.map(id => users.find(u => u.id === id));
});

const resolvers = {
  Post: {
    author: (post) => userLoader.load(post.authorId)
  }
};
```

---

*GraphQL v1.0*
