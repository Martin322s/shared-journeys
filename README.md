# SoftUni JS Back-End Course Exam Preparation

## Cheat Sheet - Creating Skeleton

1. Initialize project
 - [x] `npm init --yes`
 - [x] Change module system
 - [x] Nodemon setup `npm i -D nodemon`
 - [x] Add start script
 - [-] Setup debugging
2. Express
 - [x] Install `npm i express`
 - [x] Setup inital http server
 - [ ] Add public resources (images, css...)
 - [ ] Add static middleware
 - [ ] Add body parser
 - [ ] Add routes modular router
 - [ ] Add home controller
3. Handlebars
 - [ ] Install `npm i express-handlebars`
 - [ ] Config handlebars as view engine
 - [ ] Enable mongo documents to be passed to the view
 - [ ] Change views directory
 - [ ] Add resources to views folder
 - [ ] Add home view
 - [ ] Add layout
 - [ ] Add partials dir
4. Database
 - [ ] Install mongoose `npm i mongoose`
 - [ ] Setup db connection
 - [ ] Add user model
5. Register
 - [ ] Install bcrypt `npm i bcrypt`
 - [ ] Fix navigation links
 - [ ] Add register view
 - [ ] Add authController
 - [ ] Add register page
 - [ ] Fix register form
 - [ ] Add post register action
 - [ ] Add authService with register
 - [ ] Hash password
 - [ ] Check confirmPassword
 - [ ] Check if user exists
6. Login
 - [ ] Add jsonwebtoken `npm i jsonwebtoken`
 - [ ] Add cookie parser middleware
 - [ ] Add login view
 - [ ] Add get login action
 - [ ] Fix login form
 - [ ] Add post login action
 - [ ] Add login to authService
 - [ ] Validate user
 - [ ] Validate password
 - [ ] Generate token
 - [ ] Return token as cookie
 - [ ] Autologin on register
7. Logout
 - [ ] Add get logout action
8. Authentication
 - [ ] Add cookie parser `npm i cookie-parser`
 - [ ] Add auth middleware 
 - [ ] Check if guest
 - [ ] Token verification
 - [ ] Attach user to request
 - [ ] Attach user to handlebars context
9.  Authorization
 - [ ] Add isAuth middleware
 - [ ] Add isGuest middleware
 - [ ] Add route guards authorization
10. Error Handling
 - [ ] Add notifications
 - [ ] Extract error message
 - [ ] Add error handling for register
 - [ ] Add error handling for login
11. Bonus
 - [ ] Dynamic Navigation
 - [ ] Dynamic Titles
 - [ ] Set titles from view
 - [ ] Async jsonwebtoken
 - [ ] Add types for jsonwebtoken lib
12. TempData | Optional
 - [ ] Install express session `npm i express-session`
 - [ ] Config express session
 - [ ] Add temp data middleware
    
## Adapt Skeleton to New Exam
 - [ ] Remove old styles and paste new styles
 - [ ] Copy all html files into views folder
 - [ ] Extract new layout
   - [ ] Add header and fix title
   - [ ] Fix navigation
   - [ ] Fix error notification
   - [ ] Add {{{body}}}
   - [ ] Add footer
 - [ ] Switch home template
 - [ ] Change db name
 - [ ] Modify login page
   - [ ] Add values to fields
 - [ ] Modify register page
   - [ ] Add values to fields
 - [ ] Modify User model
 - [ ] Modify token data
 