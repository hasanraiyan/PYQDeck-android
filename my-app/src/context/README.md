# PYQDeck Context API

This directory contains React Context providers for managing authentication and application state in the PYQDeck application.

## Available Contexts

### AuthContext

Manages user authentication, registration, and profile data.

```jsx
import { useAuth } from '../context';

function MyComponent() {
  const { currentUser, login, register, logout } = useAuth();
  
  // Use auth methods and state
}
```

#### Available Properties and Methods

- `currentUser` - The currently logged-in user object
- `token` - JWT authentication token
- `loading` - Loading state for auth operations
- `error` - Error message from the last auth operation
- `register(name, email, password)` - Register a new user
- `login(email, password)` - Log in an existing user
- `logout()` - Log out the current user
- `updatePassword(currentPassword, newPassword)` - Update user password
- `forgotPassword(email)` - Initiate password reset process
- `resetPassword(resetToken, newPassword)` - Reset password with token
- `updateProgress(questionId, completed)` - Mark a question as completed/incomplete
- `authAxios` - Axios instance with authentication headers

### AppContext

Manages application data like branches, semesters, subjects, and questions.

```jsx
import { useApp } from '../context';

function MyComponent() {
  const { 
    branches, 
    fetchBranches, 
    selectBranch,
    currentBranch 
  } = useApp();
  
  // Use app methods and state
}
```

#### Available Properties and Methods

- Data properties: `branches`, `semesters`, `subjects`, `questions`
- Selection properties: `currentBranch`, `currentSemester`, `currentSubject`
- Status properties: `loading`, `error`
- Data fetching methods:
  - `fetchBranches()` - Get all branches
  - `fetchSemesters(branchId)` - Get semesters for a branch
  - `fetchSubjects(semesterId)` - Get subjects for a semester
  - `fetchQuestions(subjectId, filters)` - Get questions for a subject
  - `searchQuestions(searchQuery, filters)` - Search questions globally
- Detail methods:
  - `getBranchDetails(branchId)` - Get detailed branch info
  - `getSemesterDetails(semesterId)` - Get detailed semester info
  - `getSubjectDetails(subjectId)` - Get detailed subject info
- Selection methods:
  - `selectBranch(branch)` - Set current branch and fetch its semesters
  - `selectSemester(semester)` - Set current semester and fetch its subjects
  - `selectSubject(subject, filters)` - Set current subject and fetch its questions
  - `clearSelections()` - Clear all selections

## Using the Combined Provider

Wrap your application with the combined provider to access both contexts:

```jsx
import { AppProviders } from './context';

function App() {
  return (
    <AppProviders>
      {/* Your app components */}
    </AppProviders>
  );
}
```

## Implementation Notes

- The AuthContext must be a parent of AppContext since AppContext uses the authenticated axios instance from AuthContext.
- All API calls follow the structure defined in the PYQDeck API documentation.
- Error handling is built into each method with appropriate loading and error states.
- AsyncStorage is used to persist the authentication token between app sessions.