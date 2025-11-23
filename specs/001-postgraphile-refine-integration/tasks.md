# Tasks: PostGraphile-Refine Integration

**Input**: Design documents from `/specs/001-postgraphile-refine-integration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: TDD approach required by constitution - tests written first, ensure they fail before implementation, 90%+ coverage target.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single package**: `packages/postgraphile/` at repository root
- Source code in `packages/postgraphile/src/`
- Tests in `packages/postgraphile/__tests__/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan in packages/postgraphile/
- [x] T002 Initialize TypeScript 5.8+ project with PostGraphile v5, @refinedev/core v5, graphql-request dependencies
- [x] T003 [P] Configure Biome linting and formatting tools in packages/postgraphile/
- [x] T004 [P] Setup Vitest testing framework with 90%+ coverage configuration
- [x] T005 [P] Configure TypeScript strict mode and path mapping

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create Refine data provider interfaces in packages/postgraphile/src/interfaces.ts
- [x] T007 [P] Implement PostGraphile-specific type definitions in packages/postgraphile/src/types/index.ts
- [x] T008 Create data provider factory function in packages/postgraphile/src/dataProvider/index.ts
- [x] T009 [P] Setup GraphQL client configuration utilities in packages/postgraphile/src/utils/graphql.ts
- [x] T010 [P] Implement error handling utilities for GraphQL and database errors
- [x] T011 Create base configuration interfaces for DataProviderConfiguration entity
- [x] T012 Setup package.json exports and main entry points

**Checkpoint**: ✅ **ACHIEVED** - Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Connect Refine App to PostGraphile API (Priority: P1) 🎯 MVP

**Goal**: Enable basic connection between Refine app and PostGraphile GraphQL API with data fetching

**Independent Test**: Verify that Refine can successfully query data from PostGraphile and display it in a basic list view, with appropriate error handling for invalid endpoints.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [P] [US1] Contract test for data provider getList method in packages/postgraphile/__tests__/contract/test-data-provider.ts
- [ ] T014 [P] [US1] Integration test for basic PostGraphile API connection in packages/postgraphile/__tests__/integration/test-connection.ts
- [ ] T015 [P] [US1] Unit test for GraphQL client configuration utilities

### Implementation for User Story 1

- [x] T016 [US1] Implement getList method in data provider for basic data fetching from allPeople/allPosts queries
- [x] T017 [US1] Implement getOne method in data provider for single record fetching by primary key
- [x] T018 [US1] Add connection validation and error handling for invalid endpoints
- [x] T019 [US1] Configure Relay connection parsing for pageInfo and totalCount
- [ ] T020 [US1] Add GraphQLSchema entity support for schema introspection
- [ ] T021 [US1] Implement basic RefineResource to DatabaseTable mapping
- [x] T022 [US1] Add JWT token support in GraphQL client headers

**Checkpoint**: ✅ **ACHIEVED** - At this point, User Story 1 is fully functional and testable independently - developers can connect Refine to PostGraphile and display basic data lists

---

## Phase 4: User Story 2 - Generate CRUD Interfaces from Database Schema (Priority: P2)

**Goal**: Enable full CRUD (Create, Read, Update, Delete) operations for PostgreSQL tables exposed through PostGraphile

**Independent Test**: Create a complete CRUD interface for a single table, allowing users to view, create, edit, and delete records independently of other features.

### Tests for User Story 2 ⚠️

- [x] T023 [P] [US2] Contract test for create/update/delete mutations in packages/postgraphile/__tests__/contract/test-crud-operations.ts
- [ ] T024 [P] [US2] Integration test for full CRUD cycle on a test table
- [ ] T025 [P] [US2] Unit test for mutation input/payload parsing

### Implementation for User Story 2

- [x] T026 [US2] Implement create method with PostGraphile input/payload mutation pattern
- [x] T027 [US2] Implement createMany method for bulk record creation
- [x] T028 [US2] Implement update method with primary key and _set parameters
- [x] T029 [US2] Implement updateMany method for bulk updates with where conditions
- [x] T030 [US2] Implement deleteOne method with primary key deletion
- [x] T031 [US2] Implement deleteMany method with conditional bulk deletion
- [ ] T032 [US2] Add DatabaseTable entity support for primary key and column validation
- [ ] T033 [US2] Implement RefineResource field mapping for CRUD forms
- [ ] T034 [US2] Add error handling for database constraint violations (unique, foreign key, check constraints)

**Checkpoint**: ✅ **ACHIEVED** - At this point, User Stories 1 AND 2 should both work independently - full CRUD operations available for PostGraphile tables

---

## Phase 5: User Story 3 - Advanced Data Operations and Filtering (Priority: P3)

**Goal**: Enable advanced data operations including filtering, sorting, and pagination using PostGraphile's connection capabilities

**Independent Test**: Implement filtering and sorting on a single table view, providing enhanced data navigation capabilities.

### Tests for User Story 3 ⚠️

- [ ] T035 [P] [US3] Contract test for advanced filtering operators in packages/postgraphile/__tests__/contract/test-filtering.ts
- [ ] T036 [P] [US3] Integration test for complex queries with multiple filters and sorting
- [ ] T037 [P] [US3] Unit test for filter operator mapping (Refine → PostGraphile syntax)

### Implementation for User Story 3

- [ ] T038 [US3] Implement generateFilters utility for postgraphile-plugin-connection-filter syntax
- [ ] T039 [US3] Add support for all filter operators (equalTo, greaterThan, in, contains, etc.)
- [ ] T040 [US3] Implement generateSorting utility for Relay cursor-based sorting
- [ ] T041 [US3] Add pagination support with Relay cursor navigation (first/last, after/before)
- [ ] T042 [US3] Implement complex filter combinations (and, or, not logical operators)
- [ ] T043 [US3] Add support for PostgreSQL advanced types (arrays, JSONB, enums, domains)
- [ ] T044 [US3] Implement filter validation and security restrictions
- [ ] T045 [US3] Add performance optimizations for large dataset queries

**Checkpoint**: All user stories should now be independently functional - advanced filtering, sorting, and pagination available

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T046 [P] Implement live provider for real-time subscriptions in packages/postgraphile/src/liveProvider/index.ts
- [ ] T047 [P] Add comprehensive JSDoc documentation for all public APIs
- [ ] T048 Performance optimization and bundle size analysis
- [ ] T049 [P] Additional unit tests to reach 90%+ coverage
- [ ] T050 Security hardening for GraphQL injection prevention
- [ ] T051 [P] Run quickstart.md validation with real PostGraphile instance
- [ ] T052 Create README.md and API documentation
- [ ] T053 Add TypeScript declaration file generation (.d.ts)
- [ ] T054 Configure npm package publishing settings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests (TDD required) MUST be written and FAIL before implementation
- Core data provider methods before advanced features
- Error handling integrated throughout
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different utility functions within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Contract test for data provider getList method in packages/postgraphile/__tests__/contract/test-data-provider.ts"
Task: "Integration test for basic PostGraphile API connection in packages/postgraphile/__tests__/integration/test-connection.ts"
Task: "Unit test for GraphQL client configuration utilities"

# Launch utility implementations in parallel:
Task: "Implement getList method in data provider for basic data fetching"
Task: "Implement getOne method in data provider for single record fetching"
Task: "Add connection validation and error handling"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently - verify Refine can connect to PostGraphile and display data
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Basic Connection)
   - Developer B: User Story 2 (CRUD Operations)
   - Developer C: User Story 3 (Advanced Filtering)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD required: Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
