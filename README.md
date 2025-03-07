# Blog API

A RESTful Blog API built with **Node.js**, **Express**, and **SQLite**. This API allows users to create, read, update, and delete blog posts, as well as add comments and likes to posts. It also includes features like user authentication, pagination, search, and filtering.

## Features

- **User Authentication**: Signup and login with JWT-based authentication.
- **Blog Post Management**: Create, read, update, and delete blog posts.
- **Comments**: Add and view comments on blog posts.
- **Likes**: Like and view likes on blog posts.
- **Pagination**: Fetch posts with pagination.
- **Search and Filter**: Search posts by title and filter by tags.
- **Deployment**: Deployed on [Render](https://render.com/).

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm (Node Package Manager)

### 1. Clone the Repository

```bash
git clone https://github.com/seshu362/Mark-Anthony-Ventures-Assingment/blog-api.git
cd blog-api
```

### 2. Install Dependencies
```
  npm install
```
### 3. Configure the Database
The SQLite database (blog.db) will be automatically created when you run the server for the first time. The db.serialize() function in server.js will create the necessary tables (users, posts, comments, likes) if they don’t already exist.
### 4. Set Up Environment Variables
Create a .env file in the root directory to store sensitive information:
```env
  JWT_SECRET=your_jwt_secret_key
```
### 5. Run the Server
Start the server in development mode:
```
  node server.js
```
The server will start on http://localhost:5000.

## API Documentation
Base Render Deploy URL
```
  https://mark-anthony-ventures-assingment.onrender.com
```
## API Endpoints 

## 1. User Authentication

### 1.1 Signup a New User
**Path:** `/signup`  
**Method:** `POST`  

#### Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Response Body:
```json
{
  "message": "User created successfully"
}
```

### 1.2 Login a User
**Path:** `/login`  
**Method:** `POST`  

#### Request Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Response Body:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 2. Blog Posts

### 2.1 Create a New Post
**Path:** `/posts`  
**Method:** `POST`  
**Headers:** `Authorization: Bearer <JWT_TOKEN>`  

#### Request Body:
```json
{
  "title": "My First Post",
  "content": "This is the content of my first post.",
  "tags": "blog,post"
}
```

#### Response Body:
```json
{
  "message": "Post created successfully"
}
```

### 2.2 Get All Posts
**Path:** `/posts`  
**Method:** `GET`  

#### Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Number of posts per page (default: 10)
- `search`: Search by title (optional)
- `tag`: Filter by tag (optional)

#### Response Body:
```json
[
  {
    "id": 1,
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "tags": "blog,post",
    "userId": 1,
    "createdAt": "2023-10-01T12:00:00.000Z"
  },
  ...
]
```

### 2.3 Get a Single Post
**Path:** `/posts/:id`  
**Method:** `GET`  

#### Response Body:
```json
{
  "id": 1,
  "title": "My First Post",
  "content": "This is the content of my first post.",
  "tags": "blog,post",
  "userId": 1,
  "createdAt": "2023-10-01T12:00:00.000Z"
}
```

### 2.4 Update a Post
**Path:** `/posts/:id`  
**Method:** `PUT`  
**Headers:** `Authorization: Bearer <JWT_TOKEN>`  

#### Request Body:
```json
{
  "title": "Updated Post Title",
  "content": "This is the updated content.",
  "tags": "blog,update"
}
```

#### Response Body:
```json
{
  "message": "Post updated successfully"
}
```

### 2.5 Delete a Post
**Path:** `/posts/:id`  
**Method:** `DELETE`  
**Headers:** `Authorization: Bearer <JWT_TOKEN>`  

#### Response Body:
```json
{
  "message": "Post deleted successfully"
}
```

## 3. Comments

### 3.1 Add a Comment
**Path:** `/comments`  
**Method:** `POST`  
**Headers:** `Authorization: Bearer <JWT_TOKEN>`  

#### Request Body:
```json
{
  "postId": 1,
  "content": "This is a comment on the post."
}
```

#### Response Body:
```json
{
  "message": "Comment added successfully"
}
```

### 3.2 Get Comments for a Post
**Path:** `/posts/:id/comments`  
**Method:** `GET`  

#### Response Body:
```json
[
  {
    "id": 1,
    "postId": 1,
    "userId": 1,
    "content": "This is a comment on the post.",
    "createdAt": "2023-10-01T12:00:00.000Z"
  }
]
```

## 4. Likes

### 4.1 Like a Post
**Path:** `/likes`  
**Method:** `POST`  
**Headers:** `Authorization: Bearer <JWT_TOKEN>`  

#### Request Body:
```json
{
  "postId": 1
}
```

#### Response Body:
```json
{
  "message": "Post liked successfully"
}
```

### 4.2 Get Likes for a Post
**Path:** `/posts/:id/likes`  
**Method:** `GET`  

#### Response Body:
```json
[
  {
    "id": 1,
    "postId": 1,
    "userId": 1
  }
]
```

## Example Requests
### Signup
```
  POST https://mark-anthony-ventures-assingment.onrender.com/signup
  Content-Type: application/json
  
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
```
### Login
```
  POST https://mark-anthony-ventures-assingment.onrender.com/login
  Content-Type: application/json
  
  {
    "email": "john@example.com",
    "password": "password123"
  }
```
### Create a Post
```
  POST https://mark-anthony-ventures-assingment.onrender.com/posts
  Content-Type: application/json
  Authorization: Bearer <JWT_TOKEN>
  
  {
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "tags": "blog,post"
  }
```
### Get All Posts
```
  GET https://mark-anthony-ventures-assingment.onrender.com/posts?page=1&limit=10
```
### Add a Comment
```
  POST https://mark-anthony-ventures-assingment.onrender.com/comments
  Content-Type: application/json
  Authorization: Bearer <JWT_TOKEN>
  
  {
    "postId": 1,
    "content": "This is a comment on the post."
  }
```
### Like a Post
```
  POST https://mark-anthony-ventures-assingment.onrender.com/likes
  Content-Type: application/json
  Authorization: Bearer <JWT_TOKEN>
  
  {
    "postId": 1
  }
```

## Deployment
The API is deployed on Render:
```
  https://mark-anthony-ventures-assingment.onrender.com
```
## Technologies Used

- **Node.js**: JavaScript runtime.
- **Express**: Web framework for Node.js.
- **SQLite**: Lightweight database.
- **JWT**: JSON Web Tokens for authentication.
- **bcrypt**: Password hashing.
- **express-validator**: Request validation.
