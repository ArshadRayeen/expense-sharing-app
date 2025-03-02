# System Design: Expense-Sharing App (Splitwise-like)

This document outlines the system design for an expense-sharing mobile application similar to Splitwise. The app allows users to manage shared expenses, track debts, settle payments, and simplify group debts to reduce transactions. The design includes example scenarios with four flatmates (User1, User2, User3, User4) and a "Simplify Group Debts" feature.

---

## Technology Stack

- **Frontend**: React Native with TypeScript, Expo, Expo Router
- **Backend/Database**: SQLite (local storage)
- **UI Framework**: React Native Paper
- **Application State Management**: Redux Toolkit
- **Project Structure**: Modern with reusable components

---

## Project Structure
the project follows a modern modular structure to ensure scalability and reusability:

/expense-sharing-app
├── /src
│   ├── /assets             # Images, fonts, static resources
│   │   └── logo.png        # App logo
│   ├── /components         # Reusable UI components
│   │   ├── /common         # Buttons, TextInputs, Cards, etc.
│   │   ├── /dashboard      # Dashboard components (e.g., BottomTab)
│   │   └── /expense        # Expense components (e.g., ExpenseCard)
│   ├── /screens            # Screen components
│   │   ├── WelcomeScreen.tsx
│   │   ├── LandingScreen.tsx
│   │   ├── RecentActivityScreen.tsx
│   │   ├── FriendsScreen.tsx
│   │   ├── GroupScreen.tsx
│   │   └── AccountScreen.tsx
│   ├── /navigation         # Expo Router config
│   │   └── BottomTabNavigator.tsx
│   ├── /redux              # Redux Toolkit
│   │   ├── store.ts
│   │   ├── /slices         # Slices (user, expense, group, etc.)
│   ├── /services           # SQLite helpers
│   │   └── db.ts           # Database queries
│   ├── /types              # TypeScript types
│   └── /utils              # Utilities (split calculations, simplify debts, validation)
├── App.tsx                 # Entry point
├── package.json
└── README.md

---

## UX/UI Design

### Welcome Screen
- **Purpose**: Introduce the app.
- **Design**: Centered logo, tagline (“Split Smarter, Settle Easier”), fade-in animation.
- **UX**: Auto-transitions to Landing Screen after 2-3 seconds or on tap; skips for logged-in users.

### Landing Screen
- **Purpose**: Authentication.
- **Design**: Logo, `TextInput` for email/password, `Sign Up`/`Log In` buttons.
- **UX**: Smooth transition from Welcome Screen.
- **Validation**:
  - **Email**: Required, valid format, max 255 chars (e.g., “user1@flat.com”).
  - **Password**: Min 8 chars, 1 letter, 1 number.
  - **Sign Up**: Email unique in `users`.
  - **Log In**: Matches SQLite record.

### Dashboard
- **Purpose**: Navigation hub.
- **Design**: Bottom tabs (Recent Activity, Friends, Groups, Account), “Add Expenses” FAB with animation.
- **UX**: Swipeable tabs, pulsing button.

#### 1. Recent Activity Screen
- **Purpose**: List expenses/settlements.
- **Design**: `ExpenseCard` list (e.g., “Electricity bill, Rs. 1000, User1 paid”).
  - **Right Swipe**: Edit/Delete buttons.
- **UX**: Infinite scroll, haptic feedback.
- **CRUD Validation**:
  - **Read**: Fetch latest from `expenses`/`settlements`.
  - **Update**: Amount (positive, ≤999999.99), valid splits.
  - **Delete**: Confirmation required.

#### 2. Friends Screen
- **Purpose**: Manage debts (e.g., User2 owes User1 Rs. 620).
- **Design**: `UserCard` list (name, balance: red for owes, green for owed).
- **UX**: Search bar, tap for history.
- **CRUD Validation**:
  - **Read**: Net balances from `expense_splits`.
  - **Update**: Via expenses/settlements.
  - **Delete**: Remove debts with confirmation.

#### 3. Group Screen
- **Purpose**: Manage group expenses and simplify debts (e.g., “Flatmates” group).
- **Design**: 
  - Group list: Name, total balance, “Simplify Debts” button.
  - Tap shows expenses and simplified debt summary (e.g., “u1 owes u4 Rs. 230” simplified further). 
- **UX**: 
  - Swipe for edit/delete on expenses.
  - “Simplify Debts” triggers a modal with before/after states (e.g., “u1 owes u2 500, u2 owes Fahad 300 → u1 owes Fahad 200”).
- **CRUD Validation**:
  - **Create**: Name (unique, ≤50 chars), ≥2 members.
  - **Update**: Same as Create.
  - **Delete**: Deletes related data.
  - **Simplify**: Ensures net balances remain consistent post-simplification.

#### 4. Account Screen
- **Purpose**: Profile/settings.
- **Design**: Name (e.g., User1), email, logout.
- **UX**: Form validation, logout confirmation.
- **CRUD Validation**:
  - **Update**: Name (≤50 chars), Email (unique).

### Add Expenses Screen
- **Purpose**: Input expenses (e.g., electricity bill).
- **Design**: Modal form:
  - `TextInput`: Amount (e.g., Rs. 1000), Description (e.g., “Electricity”).
  - `Picker`: Payer (e.g., u1).
  - `Checkbox`: Participants (e.g., u1, u2, u3, u4).
  - `RadioButton.Group`: Split type (Equal, Exact, Percent).
  - Conditional inputs (e.g., exact: 370, 880; percent: 40, 20, 20, 20).
- **UX**: Real-time validation.
- **Validation**:
  - **Amount**: Positive, ≤999999.99.
  - **Participants**: ≥1, valid user IDs.
  - **Split Type**:
    - **Equal**: Amount ÷ participants (e.g., 1000 ÷ 4 = 250).
    - **Exact**: Sums to total (e.g., 370 + 880 = 1250).
    - **Percent**: Sums to 100%, amounts calculated (e.g., 1200 × 40% = 480).

### Settlement Confirmation
- **Purpose**: Record settlements.
- **Design**: Full-screen summary (e.g., “User2 paid User1 Rs. 620”), “Review Balances” button.
- **UX**: No exit until acknowledged, confetti animation.
- **Validation**: Amount ≤ debt (e.g., ≤620).

---

## Feature Workflow

### 1. User Registration/Login
- **Flow**: Sign up/log in (e.g., User1: u1).
- **CRUD**: Create (Sign Up), Read (Log In).
- **Storage**: SQLite `users`.

### 2. Creating Groups
- **Flow**: Create “Flatmates” group (u1, u2, u3, u4).
- **CRUD**: Create, Read, Update, Delete.
- **Storage**: `groups`, `group_members`.

### 3. Adding Expenses
- **Flow**: Input expense (e.g., u1, 1000, 4, u1 u2 u3 u4, EQUAL).
- **CRUD**: Create.
- **Storage**: `expenses`, `expense_splits`.

### 4. Splitting Expenses
- **Flow**: Calculate splits (e.g., 1000 ÷ 4 = 250).
- **CRUD**: Create.
- **Storage**: `expense_splits`.

### 5. Settlement
- **Flow**: Record payment (e.g., u2 pays u1 Rs. 620).
- **CRUD**: Create.
- **Storage**: `settlements`.

### 6. Simplify Group Debts
- **Flow**: Optimize debts.
  - Example: u1 owes u2 Rs. 500, u2 owes Fahad Rs. 300 → u1 owes Fahad Rs. 200 (500 - 300).
  - In flatmates: Adjusts balances (e.g., u2 owes u1 620, u1 owes u4 230 → simplifies transactions).
- **CRUD**: Read (fetch debts), Update (adjust `expense_splits`/`settlements`).
- **Storage**: `expense_splits`, `settlements`.
- **Logic**: 
  - Fetch all debts in group.
  - Calculate net balances.
  - Minimize transactions by redirecting debts (e.g., skipping u2).

---

## Database Schema (SQLite)

### Tables
1. **users**: `id` (e.g., u1), `email` (e.g., “user1@flat.com”), `name` (e.g., User1)
2. **groups**: `id` (e.g., g1), `name` (e.g., “Flatmates”)
3. **group_members**: `group_id` (g1), `user_id` (u1, u2, u3, u4)
4. **expenses**: `id`, `group_id` (g1), `amount` (e.g., 1000), `description` (e.g., “Electricity”), `payer_id` (u1), `date`
5. **expense_splits**: `expense_id`, `user_id`, `amount_owed` (e.g., u2, 250)
6. **settlements**: `id`, `payer_id` (e.g., u2), `payee_id` (u1), `amount` (e.g., 620), `date`

---

## Example Scenario

### Setup
- Users: User1 (u1), User2 (u2), User3 (u3), User4 (u4) in “Flatmates” group (g1).
- Initial balances: All 0.

#### Transaction 1: Electricity Bill
- **Input**: u1, 1000, 4, u1 u2 u3 u4, EQUAL
- **Result**: Split = 1000 ÷ 4 = 250
  - u2 owes u1: 250
  - u3 owes u1: 250
  - u4 owes u1: 250

#### Transaction 2: Flipkart Sale
- **Input**: u1, 1250, 2, u2 u3, EXACT, 370, 880
- **Result**: 
  - u2 owes u1: 620 (250 + 370)
  - u3 owes u1: 1130 (250 + 880)
  - u4 owes u1: 250

#### Transaction 3: Group Outing
- **Input**: u4, 1200, 4, u1 u2 u3 u4, PERCENT, 40, 20, 20, 20
- **Result**: 
  - u1 owes u4: 480 (1200 × 40%)
  - u2 owes u4: 240 (1200 × 20%)
  - u3 owes u4: 240 (1200 × 20%)
- **Updated Balances**:
  - u1 owes u4: 230 (250 - 480, net adjustment)
  - u2 owes u1: 620
  - u2 owes u4: 240
  - u3 owes u1: 1130
  - u3 owes u4: 240

#### Simplify Group Debts Example
- **Pre-Simplification** (external example):
  - u1 owes u2: 500
  - u2 owes Fahad: 300
- **Post-Simplification**: 
  - u1 owes Fahad: 200 (500 - 300), u2 skipped.
- **Flatmates Context**:
  - Before: u2 owes u1 620, u1 owes u4 230.
  - After: u2 owes u1 390 (620 - 230), u2 owes u4 230 (direct debt), reducing u1’s involvement.

---

## Future Enhancements

- **Notifications**: Push for due settlements.
- **Scalability**: Cloud sync.

---

## Happy Flow for the App

1. User1 sees **Welcome Screen**.
2. Logs in via **Landing Screen**.
3. Adds electricity bill (1000, equal split).
4. Adds Flipkart expense (1250, exact split).
5. User4 adds outing expense (1200, percent split).
6. In “Groups,” simplifies debts (e.g., u2 owes u1 390, u2 owes u4 230).
7. Settles debt, reviews balances.

---

## Reusable Components

- **ExpenseCard**: Displays expense (e.g., “Electricity, Rs. 1000”).
- **UserCard**: Shows balance (e.g., “u2 owes u1 Rs. 620”).
- **SplitInput**: Handles split types.
- **AnimatedButton**: “Add Expenses”.
- **DebtSimplifier**: Shows simplified debts (e.g., before/after modal).
- **SettlementConfirmation**: No-exit summary.
- **WelcomeBanner**: Logo and tagline.

---

This design integrates the "Simplify Group Debts" feature with a clear example, enhancing the flatmates scenario.