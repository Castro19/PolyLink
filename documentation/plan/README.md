# Agile Plan for Onboarding Students

## 1. Objectives and Goals

- **Learning Objectives:**
- **Project Understanding**: Understand the overall architecture of this project.
  - How do frontend --> backend --> databases interact with each other.
  - **Best practices for security:** Ensuring all user input is validated, verifying user authentication, and permissions.
  - **Testing:** Unit Testing, End-to-End (E2E) testing, Debugging
  - **Collaboration:** Working in a team on a project
    - **Agile methodology:** Spring planning, sprint reviews, and logging progress in backlog with Github projects.
- **Frontend**:
  - **FLUX architecture:** in React using Redux
  - **Client side routing in react:** Using React router
  - **Client Side Requests:** How to make API requests to the server
  - **3rd party UI Libraries:** How to use UI libraries (ShadCn UI and Aceternity UI)
  - **Security Practices:** Input validation and secure authentication.
  - **Component testing:** Using Jest and Cypress
- **Backend**:
  - **Node.js/Express:** Understanding how to build a stable backend server.
  - **API development:** Creating and securing API endpoints using Express Router
  - **Database interaction:** Learn how to interact with MongoDB for storing and retrieving data
  - **OpenAI LLM:** Learn how Assistants, threads, and function calling is handled.
  - **Security:** Implementing Middleware for protecting routes
  - **API Route Testing & E2E Testing:** Using Jest and Cypress

## 2. Project Sprints

### Sprint 1: Introduction and Setup

- **Duration:** 1-2 weeks
- **Goals:**
- Understand the project overview and objectives
- Set up the development environment
- Get familiar with the codebase

### Sprint 2: Security Implementation & Testing

- **Duration:** 2-3 weeks
- **Goals:**
- Implement security features to understand the project structure
- Begin testing components to ensure robustness

#### Frontend

- Implement security best practices in React components
- **Unit Testing:** Learn and implement unit testing using a library like Jest or React Testing Library.
- **Security Features:**
  - Verify secure authentication flows with firebase.
- **Resources:**
  - [Jest Documentation](https://jestjs.io/docs/en/getting-started)
  - [Firebase Authentication](https://firebase.google.com/docs/auth/web/start)

#### Backend

- **Authorization Checks:** Implement middleware to verify user tokens and ensure they have the necessary permissions for each route.
  - **Verifying API Routes**: Ensure all API requests are authorized using Firebase Authentication.
- **E2E Testing:** Introduction to end-to-end (E2E) testing using a tool like Cypress.

- **Security Best Practices:**

  - Validate all incoming data to prevent injection attacks.
  - Continue to use environment variables to manage sensitive information.
  - Implement rate limiting to prevent brute force attacks.

- **Resources:**
  - [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
  - [Express Middleware Documentation](https://expressjs.com/en/guide/writing-middleware.html)
  - [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)

### Sprint 3: Choose your Own Feature & Implement it!

- **Description**: In this sprint, students can work on any of the remaining features set out in the **goals** based on their interests.
- **Duration** 2-3 weeks
- **Goals**:
- Have fun implementing something you are interested in and believe will be useful for students in the future.
- Communicate with other teammates and work together in tasks from front-end to back-end
- Give and receive feedback on pull requests based on current changes implemented.

### Sprint 4: Testing, Refactoring, and Debugging

- **Duration**: 1-2 weeks
- **Goals**:
- Create unit test cases for your changes and ensure they behave correctly.
- Refactor code to use existing coding patterns
- Debug any errors you find in test cases.

### Future Sprints

- **Descripting**: Repeat the process from sprints 3 & 4 with **security** in mind.
- **Goals**
- Continue working on implementing new features from the tasks
- Continue testing and using best practices to ensure security in application

## Conclusion

- This project will teach you a lot of useful skills for modern web development!
- This project will also have the potential to help students at Calpoly and be a real resource that can still be used after you graduate.
- Make sure to always do the following:
  - Continue Learning
  - Communciate with each other and collaborate on tasks
  - Take pride in your work
  - Apply best practices in security & testing
  - Document changes/new features implemented.
