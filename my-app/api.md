# PYQDeck API Documentation

**Version:** 1.0.0
**Last Updated:** [Insert Date Here]
**Base URL:** `/api/v1` (Example: `https://your-pyqdeck-domain.com/api/v1`)

---

## 1. Overview / Introduction

*   **Purpose:** This API provides access to university syllabus data, including branches, semesters, subjects, modules, and previous year questions (PYQs) for the PYQDeck application. It allows fetching structured academic data and associated questions for display and user interaction.
*   **Key Concepts:**
    *   **Branch:** A major field of study (e.g., Computer Science, Information Technology). Identified by `branch_code` and MongoDB `_id`.
    *   **Semester:** A specific academic term within a branch (e.g., Semester 3). Identified by `semester_code` and MongoDB `_id`. Linked to a Branch.
    *   **Subject:** A specific course within a semester (e.g., Data Structures). Identified by `subject_code_identifier` and MongoDB `_id`. Linked to a Semester and Branch. Contains Modules.
    *   **Module:** A unit or chapter within a Subject.
    *   **Question:** A previous year question associated with a Subject. Identified by `question_code_identifier` and MongoDB `_id`. Includes details like year, marks, type, text, and optional image.
    *   **User:** Represents a registered user or administrator of the system. Identified by MongoDB `_id`.
*   **Audience:** Frontend developers building the PYQDeck web or mobile application.
*   **Getting Help:** [Specify channel/contact, e.g., #pyqdeck-dev Slack channel, project issue tracker]

---

## 2. Authentication

*   **Method:** JSON Web Tokens (JWT). The API uses Bearer token authentication for protected routes. Tokens are issued upon successful login.
*   **How to Obtain Credentials:**
    1.  Use the `POST /auth/register` endpoint (if enabled for the desired role) or receive credentials from an administrator.
    2.  Use the `POST /auth/login` endpoint with valid email and password.
*   **How to Use Credentials:**
    *   The `login` endpoint responds with a JWT token in the JSON body and may also set an `httpOnly` cookie named `token`.
    *   For client-side requests (e.g., from a SPA), include the token in the `Authorization` header as a Bearer token:
        ```
        Authorization: Bearer <YOUR_JWT_TOKEN>
        ```
    *   If requests are made from a browser context where the cookie was set, the browser might automatically include the cookie. However, relying on the `Authorization` header is generally more explicit for API interactions.
*   **Roles:**
    *   `user`: Standard user, can view public data and manage their own profile/progress.
    *   `admin`: Can manage most data (Branches, Semesters, Subjects, Questions they created, Users). Specific creation/deletion might be restricted based on superadmin status.
    *   `superadmin`: Has full administrative privileges, including creating other admins.
*   **Protected Routes:** Endpoints requiring authentication are marked in the reference section. Most `/admin/*` routes and user-specific `/auth/*` routes (`/me`, `/updatepassword`, `/progress`) are protected.

---

## 3. Quick Start Guide

Get familiar with the API by fetching some basic data.

1.  **(Optional) Login:** If you need to access protected routes later, log in first.
    ```bash
    curl -X POST https://your-pyqdeck-domain.com/api/v1/auth/login \
         -H "Content-Type: application/json" \
         -d '{
               "email": "user@example.com",
               "password": "yourpassword"
             }'
    # Response will contain a token
    # { "success": true, "token": "eyJhbGciOi..." }
    # Store this token for subsequent authenticated requests.
    ```

2.  **Get All Branches:** Fetch the list of available academic branches.
    ```bash
    curl https://your-pyqdeck-domain.com/api/v1/branches
    ```
    **Expected Response (200 OK):**
    ```json
    {
      "success": true,
      "count": 2,
      "data": [
        {
          "_id": "60f...",
          "branch_code": "it",
          "name": "INFORMATION TECHNOLOGY",
          "icon": { "set": "Ionicons", "name": "laptop-outline" }
        },
        {
          "_id": "60f...",
          "branch_code": "cse",
          "name": "COMPUTER SCIENCE & ENGINEERING",
          "icon": { "set": "Ionicons", "name": "code-slash-outline" }
        }
        // ... other branches
      ]
    }
    ```

3.  **Get Semesters for a Branch (e.g., IT branch with _id '60f...')**
    ```bash
    curl https://your-pyqdeck-domain.com/api/v1/branches/60f.../semesters
    ```
    **Expected Response (200 OK):**
    ```json
    {
        "success": true,
        "count": 1,
        "data": [
            {
                "_id": "610...",
                "semester_code": "it_sem3",
                "number": 3
            }
            // ... other semesters for this branch
        ]
    }
    ```

4.  **Get Subjects for a Semester (e.g., IT Sem 3 with _id '610...')**
    ```bash
    curl https://your-pyqdeck-domain.com/api/v1/semesters/610.../subjects
    ```
     **Expected Response (200 OK):**
    ```json
    {
        "success": true,
        "count": 3,
        "data": [
             {
                "_id": "611...",
                "subject_code_identifier": "it_100304",
                "name": "DATA STRUCTURE & ALGORITHMS",
                "code": "100304"
            },
            // ... other subjects
        ]
    }
    ```

5.  **Search Questions (e.g., for Subject 'it_100304' _id '611...')**
    ```bash
    # Search all questions for this subject
    curl "https://your-pyqdeck-domain.com/api/v1/subjects/611.../questions?limit=5"

    # Or Search globally for questions containing "linked list"
    curl "https://your-pyqdeck-domain.com/api/v1/questions?q=linked%20list&limit=5"
    ```
    **Expected Response (200 OK):** (Structure for `/subjects/{id}/questions`)
    ```json
    {
        "success": true,
        "count": 5, // Number of results on this page
        "totalPages": 10, // Example: Total pages available
        "currentPage": 1,
        "data": [
            {
                "_id": "612...",
                "question_code_identifier": "it_100304_2019_Q1a",
                "year": 2019,
                "qNumber": "Q1a",
                "chapter_module_name": "Module 3: Linked Lists",
                "text": "Which of the following points is/are true about linked list...",
                "type": "MCQ",
                "marks": 2,
                "image_url": null,
                "createdAt": "...",
                "updatedAt": "..."
            }
            // ... other questions
        ]
    }
    ```

---

## 4. Endpoints Reference

All endpoints are relative to the **Base URL:** `/api/v1`

### 4.1 Authentication (`/auth`)

#### `POST /auth/register`

*   **Description:** Registers a new user. Role assignment ('admin', 'superadmin') has specific constraints (see `authController.js` logic - typically only superadmin can create admins, and only if no superadmin exists can one be created initially). Regular users can usually self-register.
*   **Access:** Public (with role restrictions)
*   **Request Body:** (`application/json`)
    ```json
    {
      "name": "Test User",
      "email": "user@example.com",
      "password": "password123",
      "role": "user" // Optional, defaults to 'user'. 'admin'/'superadmin' require specific conditions.
    }
    ```
*   **Responses:**
    *   `200 OK`: Registration successful. Includes token and sets cookie.
        ```json
        { "success": true, "token": "JWT_TOKEN_HERE" }
        ```
    *   `400 Bad Request`: Validation error (e.g., missing fields, invalid email). (See Error Handling)
    *   `400 Bad Request`: Duplicate email. (See Error Handling)
    *   `403 Forbidden`: Attempting to create admin/superadmin without permission. (See Error Handling)

#### `POST /auth/login`

*   **Description:** Authenticates a user and returns a JWT token.
*   **Access:** Public
*   **Request Body:** (`application/json`)
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
*   **Responses:**
    *   `200 OK`: Login successful. Includes token and sets cookie.
        ```json
        { "success": true, "token": "JWT_TOKEN_HERE" }
        ```
    *   `400 Bad Request`: Missing email or password.
    *   `401 Unauthorized`: Invalid credentials.

#### `GET /auth/me`

*   **Description:** Retrieves the profile of the currently logged-in user.
*   **Access:** Private (Requires valid token)
*   **Responses:**
    *   `200 OK`: User details retrieved.
        ```json
        {
          "success": true,
          "data": { // User Object (see Data Models)
            "_id": "...",
            "name": "Test User",
            "email": "user@example.com",
            "role": "user",
            "createdAt": "...",
            "completedQuestions": ["q_id_1", "q_id_5"],
            "progress": 2
            // password, isSuperAdmin etc. are typically excluded
          }
        }
        ```
    *   `401 Unauthorized`: Invalid or missing token.

#### `PUT /auth/updatepassword`

*   **Description:** Allows a logged-in user to update their own password.
*   **Access:** Private (Requires valid token)
*   **Request Body:** (`application/json`)
    ```json
    {
      "currentPassword": "oldpassword123",
      "newPassword": "newpassword456"
    }
    ```
*   **Responses:**
    *   `200 OK`: Password updated successfully. Returns a new token.
        ```json
        { "success": true, "token": "NEW_JWT_TOKEN_HERE" }
        ```
    *   `401 Unauthorized`: Invalid or missing token OR `currentPassword` is incorrect.
    *   `400 Bad Request`: Validation error (e.g., new password too short).

#### `POST /auth/forgotpassword`

*   **Description:** Initiates the password reset process for a given email. In development, logs the reset URL; in production, it should send an email (currently returns "Email sent").
*   **Access:** Public
*   **Request Body:** (`application/json`)
    ```json
    { "email": "user@example.com" }
    ```
*   **Responses:**
    *   `200 OK`: Process initiated.
        ```json
        // Dev Mode:
        { "success": true, "data": "Reset link logged (development mode)" }
        // Prod Mode (Placeholder):
        { "success": true, "data": "Email sent" }
        ```
    *   `404 Not Found`: No user found with that email.

#### `PUT /auth/resetpassword/:resettoken`

*   **Description:** Resets the user's password using the token received via the forgot password process.
*   **Access:** Public
*   **Path Parameters:**
    *   `resettoken`: The password reset token from the reset URL.
*   **Request Body:** (`application/json`)
    ```json
    { "password": "newpassword456" }
    ```
*   **Responses:**
    *   `200 OK`: Password reset successful. Returns a new login token.
        ```json
        { "success": true, "token": "NEW_JWT_TOKEN_HERE" }
        ```
    *   `400 Bad Request`: Invalid or expired token.

#### `PUT /auth/progress`

*   **Description:** Updates the logged-in user's progress by marking a question as completed or incomplete.
*   **Access:** Private (Requires valid token)
*   **Request Body:** (`application/json`)
    ```json
    {
        "questionId": "question_code_identifier_here", // The question_code_identifier (e.g., "it_100304_2019_Q1a")
        "completed": true // or false to mark as incomplete
    }
    ```
*   **Responses:**
    *   `200 OK`: User progress updated. Returns the updated User object.
        ```json
        {
            "success": true,
            "data": { // Updated User Object
                "_id": "...",
                "name": "Test User",
                "email": "user@example.com",
                "role": "user",
                "createdAt": "...",
                "completedQuestions": ["q_id_1", "q_id_5", "question_code_identifier_here"], // Example
                "progress": 3 // Example
            }
        }
        ```
    *   `400 Bad Request`: Missing `questionId` or `completed` flag.
    *   `401 Unauthorized`: Invalid or missing token.

---

### 4.2 Branches (`/branches`)

#### `GET /branches`

*   **Description:** Retrieves a list of all available academic branches.
*   **Access:** Public
*   **Responses:**
    *   `200 OK`: List of branches retrieved.
        ```json
        {
          "success": true,
          "count": 2, // Total number of branches
          "data": [ // Array of Branch Objects (condensed view)
            {
              "_id": "60f...",
              "branch_code": "it",
              "name": "INFORMATION TECHNOLOGY",
              "icon": { "set": "Ionicons", "name": "laptop-outline" }
            },
            {
              "_id": "60f...",
              "branch_code": "cse",
              "name": "COMPUTER SCIENCE & ENGINEERING",
              "icon": { "set": "Ionicons", "name": "code-slash-outline" }
            }
            // ...
          ]
        }
        ```

#### `GET /branches/:id`

*   **Description:** Retrieves details for a specific branch using its MongoDB `_id`.
*   **Access:** Public
*   **Path Parameters:**
    *   `id`: The MongoDB `_id` of the branch.
*   **Responses:**
    *   `200 OK`: Branch details retrieved.
        ```json
        {
          "success": true,
          "data": { // Full Branch Object (see Data Models)
            "_id": "60f...",
            "branch_code": "it",
            "name": "INFORMATION TECHNOLOGY",
            "icon": { "set": "Ionicons", "name": "laptop-outline" },
            "createdAt": "...",
            "updatedAt": "..."
          }
        }
        ```
    *   `400 Bad Request`: Invalid MongoDB `_id` format.
    *   `404 Not Found`: Branch with the specified `_id` not found.

#### `GET /branches/:id/semesters`

*   **Description:** Retrieves a list of semesters associated with a specific branch `_id`.
*   **Access:** Public
*   **Path Parameters:**
    *   `id`: The MongoDB `_id` of the branch.
*   **Responses:**
    *   `200 OK`: List of semesters retrieved.
        ```json
        {
          "success": true,
          "count": 1, // Number of semesters for this branch
          "data": [ // Array of Semester Objects (condensed view)
            {
              "_id": "610...",
              "semester_code": "it_sem3",
              "number": 3
            }
            // ...
          ]
        }
        ```
    *   `400 Bad Request`: Invalid MongoDB `_id` format for the branch.
    *   `404 Not Found`: Branch with the specified `_id` not found. (Response might be 200 OK with count 0 if branch exists but has no semesters).

---

### 4.3 Semesters (`/semesters`)

#### `GET /semesters/:id`

*   **Description:** Retrieves details for a specific semester using its MongoDB `_id`. Includes populated branch details.
*   **Access:** Public
*   **Path Parameters:**
    *   `id`: The MongoDB `_id` of the semester.
*   **Responses:**
    *   `200 OK`: Semester details retrieved.
        ```json
        {
          "success": true,
          "data": { // Full Semester Object (see Data Models, with populated branch)
            "_id": "610...",
            "semester_code": "it_sem3",
            "number": 3,
            "branch": {
                 "_id": "60f...",
                 "name": "INFORMATION TECHNOLOGY",
                 "branch_code": "it"
             },
            "createdAt": "...",
            "updatedAt": "..."
          }
        }
        ```
    *   `400 Bad Request`: Invalid MongoDB `_id` format.
    *   `404 Not Found`: Semester with the specified `_id` not found.

#### `GET /semesters/:id/subjects`

*   **Description:** Retrieves a list of subjects associated with a specific semester `_id`.
*   **Access:** Public
*   **Path Parameters:**
    *   `id`: The MongoDB `_id` of the semester.
*   **Responses:**
    *   `200 OK`: List of subjects retrieved.
        ```json
        {
          "success": true,
          "count": 3, // Number of subjects for this semester
          "data": [ // Array of Subject Objects (condensed view)
            {
              "_id": "611...",
              "subject_code_identifier": "it_100304",
              "name": "DATA STRUCTURE & ALGORITHMS",
              "code": "100304"
            },
            // ...
          ]
        }
        ```
    *   `400 Bad Request`: Invalid MongoDB `_id` format for the semester.
    *   `404 Not Found`: Semester with the specified `_id` not found. (Response might be 200 OK with count 0 if semester exists but has no subjects).

---

### 4.4 Subjects (`/subjects`)

#### `GET /subjects/:id`

*   **Description:** Retrieves details for a specific subject using its MongoDB `_id`. Includes populated semester and branch details, and the list of modules.
*   **Access:** Public
*   **Path Parameters:**
    *   `id`: The MongoDB `_id` of the subject.
*   **Responses:**
    *   `200 OK`: Subject details retrieved.
        ```json
        {
          "success": true,
          "data": { // Full Subject Object (see Data Models, with populated refs)
            "_id": "611...",
            "subject_code_identifier": "it_100304",
            "name": "DATA STRUCTURE & ALGORITHMS",
            "code": "100304",
            "semester": {
                "_id": "610...",
                "number": 3,
                "semester_code": "it_sem3"
            },
            "branch": {
                "_id": "60f...",
                "name": "INFORMATION TECHNOLOGY",
                "branch_code": "it"
            },
            "modules": [ // Array of Module Objects
                 {
                    "module_code": "m1",
                    "name": "Module 1: Introduction",
                    "description": "Basic Terminologies...",
                    "lectures": 4
                 }
                 // ...
            ],
            "createdAt": "...",
            "updatedAt": "..."
          }
        }
        ```
    *   `400 Bad Request`: Invalid MongoDB `_id` format.
    *   `404 Not Found`: Subject with the specified `_id` not found.

#### `GET /subjects/:id/questions`

*   **Description:** Retrieves questions associated with a specific subject `_id`. Supports filtering and pagination.
*   **Access:** Public
*   **Path Parameters:**
    *   `id`: The MongoDB `_id` of the subject.
*   **Query Parameters:**
    *   `year` (integer, optional): Filter questions by year (e.g., `?year=2022`).
    *   `type` (string, optional): Filter by question type (e.g., `?type=MCQ`).
    *   `chapter` (string, optional): Filter by the original chapter/module name (exact match, case-sensitive) (e.g., `?chapter=Module%203%3A%20Linked%20Lists`).
    *   `page` (integer, optional, default: 1): Page number for pagination.
    *   `limit` (integer, optional, default: 20): Number of questions per page.
*   **Responses:**
    *   `200 OK`: List of questions retrieved.
        ```json
        {
          "success": true,
          "count": 5, // Questions on this page
          "totalPages": 10, // Total pages available based on filter/limit
          "currentPage": 1,
          "data": [ // Array of Question Objects (subject ref excluded)
            {
              "_id": "612...",
              "question_code_identifier": "it_100304_2019_Q1a",
              "year": 2019,
              "qNumber": "Q1a",
              "chapter_module_name": "Module 3: Linked Lists",
              "text": "Which of the following points...",
              "type": "MCQ",
              "marks": 2,
              "image_url": null,
              "createdAt": "...",
              "updatedAt": "...",
               "createdBy": "user_id_ref" // Included here
            }
            // ...
          ]
        }
        ```
    *   `400 Bad Request`: Invalid MongoDB `_id` format for the subject OR invalid query parameter format (e.g., non-integer year).
    *   `404 Not Found`: Subject with the specified `_id` not found. (Response might be 200 OK with count 0 if subject exists but has no matching questions).

---

### 4.5 Questions (`/questions`)

#### `GET /questions`

*   **Description:** Searches/filters questions across *all* subjects. Supports text search, filtering, and pagination.
*   **Access:** Public
*   **Query Parameters:**
    *   `q` (string, optional): Performs a text search across question `text` and `chapter_module_name`. Requires a text index on the model. (e.g., `?q=binary%20search`)
    *   `year` (integer, optional): Filter by year.
    *   `type` (string, optional): Filter by question type.
    *   `chapter` (string, optional): Filter by chapter/module name (uses regex, case-insensitive). (e.g., `?chapter=linked%20list`)
    *   `subjectId` (string, optional): Filter by specific subject MongoDB `_id`.
    *   `branchId` (string, optional): Filter by specific branch MongoDB `_id` (will find questions in all subjects belonging to that branch). *Note: If both `subjectId` and `branchId` are provided, `subjectId` takes precedence.*
    *   `page` (integer, optional, default: 1): Page number.
    *   `limit` (integer, optional, default: 20): Results per page.
*   **Responses:**
    *   `200 OK`: List of matching questions retrieved. Includes populated subject `name` and `code`. Results sorted by relevance (`textScore`) if `q` is used, otherwise by `createdAt` descending.
        ```json
        {
          "success": true,
          "count": 3, // Questions on this page
          "totalPages": 1,
          "currentPage": 1,
          "data": [ // Array of Question Objects (with populated subject info)
            {
               "_id": "612...",
               "question_code_identifier": "cse_100304_2021_Q1c",
               "year": 2021,
               "qNumber": "Q1c",
               "chapter_module_name": "Module 5: Trees and Graphs",
               "text": "Binary search tree has average case run-time...",
               "type": "MCQ",
               "marks": 2,
               "image_url": null,
               "subject": { // Populated subject info
                   "_id": "611...",
                   "name": "DATA STRUCTURE & ALGORITHMS",
                   "code": "100304"
               },
               "createdAt": "...",
               "updatedAt": "...",
                "createdBy": "user_id_ref"
            }
            // ...
          ]
        }
        ```
     *  `400 Bad Request`: Invalid query parameter format (e.g., invalid `subjectId` or `branchId` format).

#### `GET /questions/:id`

*   **Description:** Retrieves details for a specific question using its MongoDB `_id`. Includes populated subject, semester, and branch details.
*   **Access:** Public
*   **Path Parameters:**
    *   `id`: The MongoDB `_id` of the question.
*   **Responses:**
    *   `200 OK`: Question details retrieved.
        ```json
        {
          "success": true,
          "data": { // Full Question Object (see Data Models, with populated refs)
            "_id": "612...",
            "question_code_identifier": "it_100304_2019_Q1a",
            "year": 2019,
            "qNumber": "Q1a",
            "chapter_module_name": "Module 3: Linked Lists",
            "text": "Which of the following points...",
            "type": "MCQ",
            "marks": 2,
            "image_url": null,
            "subject": {
                "_id": "611...",
                "name": "DATA STRUCTURE & ALGORITHMS",
                "code": "100304",
                "subject_code_identifier": "it_100304",
                 "semester": { "_id": "610...", "number": 3, "semester_code": "it_sem3" },
                 "branch": { "_id": "60f...", "name": "INFORMATION TECHNOLOGY", "branch_code": "it" }
            },
            "createdAt": "...",
            "updatedAt": "...",
             "createdBy": "user_id_ref"
          }
        }
        ```
    *   `400 Bad Request`: Invalid MongoDB `_id` format.
    *   `404 Not Found`: Question with the specified `_id` not found.

---

### 4.6 Admin (`/admin`)

**Note:** All `/admin` routes require authentication (`protect`) and authorization (`authorize('admin')` or `superAdminOnly`). Superadmins generally have access even if only 'admin' is specified by `authorize`.

#### Branches (`/admin/branches`)

*   `GET /admin/branches`: Get all branches (full details).
*   `POST /admin/branches`: Create a new branch.
    *   Request Body: Branch Object (see Data Models)
    *   Response: `201 Created` with the new Branch Object.
*   `GET /admin/branches/:id`: Get a single branch by `_id`.
*   `PUT /admin/branches/:id`: Update a branch by `_id`.
    *   Request Body: Fields to update in Branch Object.
    *   Response: `200 OK` with the updated Branch Object.
*   `DELETE /admin/branches/:id`: Delete a branch by `_id`.
    *   Response: `200 OK` with `{ success: true, data: {} }`.

#### Semesters (`/admin/semesters`)

*   `GET /admin/semesters`: Get all semesters (populates `branch` name/code).
*   `POST /admin/semesters`: Create a new semester.
    *   Request Body: Semester Object (requires `branch` _id).
    *   Response: `201 Created` with the new Semester Object.
*   `GET /admin/semesters/:id`: Get a single semester by `_id`.
*   `PUT /admin/semesters/:id`: Update a semester by `_id`.
    *   Request Body: Fields to update in Semester Object.
    *   Response: `200 OK` with the updated Semester Object.
*   `DELETE /admin/semesters/:id`: Delete a semester by `_id`.
    *   Response: `200 OK` with `{ success: true, data: {} }`.

#### Subjects (`/admin/subjects`)

*   `GET /admin/subjects`: Get all subjects (populates `branch` and `semester`).
*   `POST /admin/subjects`: Create a new subject.
    *   Request Body: Subject Object (requires `semester` _id, `branch` _id, `modules` array).
    *   Response: `201 Created` with the new Subject Object.
*   `GET /admin/subjects/:id`: Get a single subject by `_id` (populates refs).
*   `PUT /admin/subjects/:id`: Update a subject by `_id`.
    *   Request Body: Fields to update in Subject Object.
    *   Response: `200 OK` with the updated Subject Object (populates refs).
*   `DELETE /admin/subjects/:id`: Delete a subject by `_id`.
    *   Response: `200 OK` with `{ success: true, data: {} }`.

#### Questions (`/admin/questions`)

*   `GET /admin/questions`: Get questions. Filters by creator (`req.user.id`) unless the user is a superadmin. Populates `subject`.
*   `POST /admin/questions`: Create a new question. Automatically links `createdBy` to the logged-in admin's `_id`.
    *   Request Body: Question Object (requires `subject` _id, and all question fields).
    *   Response: `201 Created` with the new Question Object.
*   `GET /admin/questions/:id`: Get a single question by `_id` (populates `subject`).
*   `PUT /admin/questions/:id`: Update a question by `_id`. Requires ownership (`checkQuestionOwnership` middleware: must be creator or superadmin).
    *   Request Body: Fields to update in Question Object.
    *   Response: `200 OK` with the updated Question Object (populates `subject`).
    *   Error: `403 Forbidden` if not owner/superadmin.
*   `DELETE /admin/questions/:id`: Delete a question by `_id`. Requires ownership (`checkQuestionOwnership` middleware).
    *   Response: `200 OK` with `{ success: true, data: {} }`.
    *   Error: `403 Forbidden` if not owner/superadmin.

#### Users (`/admin/users`)

*   `GET /admin/users`: Get all users (excludes password).
*   `GET /admin/users/:id`: Get a single user by `_id` (excludes password).
*   `PUT /admin/users/:id`: Update a user by `_id`. Can update `name`, `email`, `role`. **Caution:** Password updates should likely go through dedicated auth routes. Updating `isSuperAdmin` should be heavily restricted (likely superadmin only).
    *   Request Body: Fields to update in User Object.
    *   Response: `200 OK` with the updated User Object (password excluded).
*   `DELETE /admin/users/:id`: Delete a user by `_id`.
    *   Response: `200 OK` with `{ success: true, data: {} }`.

#### Dashboard (`/admin/dashboard`)

*   `GET /admin/dashboard/stats`: Get counts of various collections.
    *   Response: `200 OK`
        ```json
        {
          "success": true,
          "data": {
            "totalUsers": 5,
            "totalBranches": 8,
            "totalSemesters": 24,
            "totalSubjects": 150,
            "totalQuestions": 2500
          }
        }
        ```

---

### 4.7 API Documentation (`/docs`)

#### `GET /docs`

*   **Description:** Serves this API documentation rendered as an interactive HTML page using Tailwind CSS and Prism.js for styling and syntax highlighting. Includes a Table of Contents, dark mode toggle, and code copy buttons.
*   **Access:** Public
*   **Response:** `200 OK` with `Content-Type: text/html`.

---

### 4.8 Health Check (`/health`)

#### `GET /health`

*   **Description:** Provides a basic health check of the server and database connection state. Useful for monitoring and load balancers.
*   **Access:** Public
*   **Response:**
    *   `200 OK`: Server is running.
        ```json
        {
            "status": "healthy",
            "timestamp": "2023-10-27T12:00:00.000Z",
            "environment": "development", // or 'production', etc.
            "database": "connected" // or 'disconnected'
        }
        ```
---

## 5. Data Models

*(MongoDB ObjectIDs (`_id`) and timestamps (`createdAt`, `updatedAt`) are present on all primary models unless noted otherwise)*

**Branch Object:**

| Field         | Type        | Required | Description                             | Example                               |
| :------------ | :---------- | :------- | :-------------------------------------- | :------------------------------------ |
| `_id`         | ObjectId    | Yes (Auto)| Unique MongoDB identifier.              | `"60f..."`                            |
| `branch_code` | String      | Yes      | Unique short code (e.g., 'it', 'cse'). | `"it"`                                |
| `name`        | String      | Yes      | Full name of the branch.                | `"INFORMATION TECHNOLOGY"`            |
| `icon`        | Icon Object | Yes      | Icon details for frontend use.        | `{ "set": "Ionicons", "name": "laptop-outline" }` |
| `createdAt`   | Date        | Yes (Auto)| Timestamp of creation.                  | `"2023-..."`                          |
| `updatedAt`   | Date        | Yes (Auto)| Timestamp of last update.               | `"2023-..."`                          |

**Icon Object (Nested):**

| Field | Type   | Required | Description             | Example     |
| :---- | :----- | :------- | :---------------------- | :---------- |
| `set` | String | Yes      | Icon library/set name.  | `"Ionicons"`|
| `name`| String | Yes      | Specific icon name.     | `"laptop-outline"` |

**Semester Object:**

| Field          | Type     | Required | Description                      | Example     |
| :------------- | :------- | :------- | :------------------------------- | :---------- |
| `_id`          | ObjectId | Yes (Auto)| Unique MongoDB identifier.       | `"610..."`  |
| `semester_code`| String   | Yes      | Unique code (e.g., 'it_sem3'). | `"it_sem3"` |
| `number`       | Number   | Yes      | Semester number (e.g., 3).     | `3`         |
| `branch`       | ObjectId | Yes      | Refers to the Branch `_id`.      | `"60f..."`  |

**Subject Object:**

| Field                   | Type            | Required | Description                               | Example                    |
| :---------------------- | :-------------- | :------- | :---------------------------------------- | :------------------------- |
| `_id`                   | ObjectId        | Yes (Auto)| Unique MongoDB identifier.              | `"611..."`                 |
| `subject_code_identifier`| String         | Yes      | Unique identifier (e.g., 'it_100304').  | `"it_100304"`            |
| `name`                  | String          | Yes      | Full name of the subject.               | `"DATA STRUCTURE..."`      |
| `code`                  | String          | Yes      | Official subject code.                  | `"100304"`                 |
| `semester`              | ObjectId        | Yes      | Refers to the Semester `_id`.           | `"610..."`                 |
| `branch`                | ObjectId        | Yes      | Refers to the Branch `_id` (denormalized).| `"60f..."`                 |
| `modules`               | [Module Object] | Yes      | Array of modules/chapters.              | `[ { "module_code": "m1", ... } ]` |

**Module Object (Nested in Subject):**

| Field         | Type   | Required | Description                 | Example                  |
| :------------ | :----- | :------- | :-------------------------- | :----------------------- |
| `module_code` | String | Yes      | Module identifier (e.g., 'm1'). | `"m1"`                   |
| `name`        | String | Yes      | Name of the module.         | `"Module 1: Introduction"` |
| `description` | String | No       | Description of the module.  | `"Basic Terminologies..."` |
| `lectures`    | Number | No       | Estimated lecture count.    | `4`                      |

**Question Object:**

| Field                   | Type      | Required | Description                                       | Example                           |
| :---------------------- | :-------- | :------- | :------------------------------------------------ | :-------------------------------- |
| `_id`                   | ObjectId  | Yes (Auto)| Unique MongoDB identifier.                      | `"612..."`                        |
| `question_code_identifier`| String   | Yes      | Unique identifier (e.g., 'it_100304_2019_Q1a'). | `"it_100304_2019_Q1a"`          |
| `year`                  | Number    | Yes      | Year the question appeared.                     | `2019`                            |
| `qNumber`               | String    | Yes      | Question number (e.g., 'Q1a', 'Q5').            | `"Q1a"`                           |
| `chapter_module_name`   | String    | Yes      | Name of the chapter/module it belongs to.       | `"Module 3: Linked Lists"`        |
| `text`                  | String    | Yes      | The full text of the question.                  | `"Which of the following..."`     |
| `type`                  | String    | Yes      | Type of question (e.g., 'MCQ', 'Problem').      | `"MCQ"`                           |
| `marks`                 | Number    | Yes      | Marks allocated to the question.                | `2`                               |
| `image_url`             | String    | No       | URL to an associated image (if any).            | `"https://.../image.png"` or `null` |
| `subject`               | ObjectId  | Yes      | Refers to the Subject `_id`.                    | `"611..."`                        |
| `createdBy`             | ObjectId  | Yes      | Refers to the User `_id` who added the question.| `"user_id_ref"`                   |

**User Object:**

| Field                 | Type              | Required      | Description                                       | Example                   | Notes                 |
| :-------------------- | :---------------- | :------------ | :------------------------------------------------ | :------------------------ | :-------------------- |
| `_id`                 | ObjectId          | Yes (Auto)    | Unique MongoDB identifier.                        | `"..."`                   |                       |
| `name`                | String            | Yes           | User's full name.                                 | `"Test User"`             |                       |
| `email`               | String            | Yes           | User's unique email address.                      | `"user@example.com"`      | Must be valid format. |
| `password`            | String            | Yes           | Hashed password.                                  | `"$2a$..."`               | Not returned by API.  |
| `role`                | String            | Yes (Default) | User role ('user', 'admin', 'superadmin').      | `"user"`                  | Default is 'user'.    |
| `isSuperAdmin`        | Boolean           | Yes (Default) | Flag indicating superadmin status.              | `false`                   | Not returned by API.  |
| `resetPasswordToken`  | String            | No            | Hashed token for password reset.                | `null` or hash            | Internal use.         |
| `resetPasswordExpire` | Date              | No            | Expiry date for reset token.                    | `null` or Date            | Internal use.         |
| `completedQuestions`  | [String]          | Yes (Default) | Array of `question_code_identifier`s completed. | `["q_id_1", "q_id_5"]`    |                       |
| `progress`            | Number            | Yes (Default) | Count of completed questions.                     | `2`                       | Auto-calculated.      |

**Standard Error Response Object:**

| Field   | Type   | Description                       | Example                      |
| :------ | :----- | :-------------------------------- | :--------------------------- |
| `success` | Boolean| Always `false` for errors.        | `false`                      |
| `error` | String | Human-readable error message.   | `"Resource not found..."`    |

*(Note: The actual error object might be slightly different based on `ErrorResponse` class usage, potentially including a `statusCode` field internally, but the JSON response adheres to the above structure)*

---

## 6. Error Handling

*   **General Philosophy:** The API uses standard HTTP status codes to indicate the success or failure of a request. Errors are returned in a consistent JSON format.
*   **Standard Error Response:**
    ```json
    {
      "success": false,
      "error": "A descriptive error message here."
    }
    ```
*   **Common HTTP Status Codes:**
    *   `200 OK`: Request successful.
    *   `201 Created`: Resource created successfully (used in `POST` requests).
    *   `400 Bad Request`: The request was malformed or contained invalid data (e.g., missing required fields, invalid data types, validation errors). The `error` message provides specifics.
    *   `401 Unauthorized`: Authentication failed. Missing, invalid, or expired JWT token. Or incorrect password during login/password update.
    *   `403 Forbidden`: Authentication succeeded, but the user does not have the necessary permissions (role) to access the resource or perform the action.
    *   `404 Not Found`: The requested resource (e.g., branch, semester, question with a specific ID) could not be found.
    *   `500 Internal Server Error`: An unexpected error occurred on the server. Please report this if encountered consistently.
*   **Specific Mongoose Errors Handled:**
    *   **CastError (Invalid ObjectId):** Typically results in a `404 Not Found` with a message like `"Resource not found with id of ..."`. Sometimes might return `400 Bad Request` depending on context.
    *   **Duplicate Key (Code 11000):** Results in a `400 Bad Request` with a message like `"Duplicate field value entered for 'field': value. Must be unique."`.
    *   **ValidationError:** Results in a `400 Bad Request` with a message combining the specific validation failures (e.g., `"Please add a name, Please add an email"`).

---

## 7. Rate Limiting

*   **Status:** Rate limiting is not explicitly implemented in the current version (v1.0.0).
*   **Recommendation:** For production deployment, implementing rate limiting (e.g., using `express-rate-limit`) is highly recommended to prevent abuse and ensure API stability. Define clear limits (e.g., requests per minute per IP or API key) and communicate them here when implemented. Standard practice involves returning a `429 Too Many Requests` status code and appropriate `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers.

---

## 8. Versioning

*   **Strategy:** The API uses URL path versioning. The current version is `v1`.
*   **Base Path:** All requests should be prefixed with `/api/v1/`.
*   **Future Versions:** Significant breaking changes will be introduced under a new version path (e.g., `/api/v2/`).
*   **Deprecation Policy:** [Define policy if applicable, e.g., Older versions will be supported for X months after a new version release, with advance notice.]

---

## 9. Changelog

**v1.0.0 - [Insert Date Here]**
*   Initial release of the PYQDeck API.
*   Endpoints for Authentication, Branches, Semesters, Subjects, Questions.
*   Admin endpoints for CRUD operations.
*   Public endpoints for fetching syllabus data and questions.
*   Basic health check endpoint.
*   API documentation endpoint (`/api/v1/docs`).

---